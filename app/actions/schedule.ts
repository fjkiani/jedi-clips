'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, scheduledPosts, highlights, videos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createPost, uploadMedia } from '@/lib/ayrshare';
import { getPresignedDownloadUrl } from '@/lib/r2';

/**
 * Schedule a post for a rendered highlight clip.
 */
export async function schedulePost(params: {
  highlightId: string;
  platforms: string[];
  postTitle: string;
  postDescription: string;
  scheduledAt: Date;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: 'Not authenticated' };
  }

  // Resolve internal user ID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Verify the highlight belongs to the user
  const [highlight] = await db
    .select()
    .from(highlights)
    .where(eq(highlights.id, params.highlightId))
    .limit(1);

  if (!highlight) {
    return { success: false, error: 'Highlight not found' };
  }

  // Verify the video belongs to the user
  const [video] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, highlight.videoId), eq(videos.clerkUserId, clerkUserId)))
    .limit(1);

  if (!video) {
    return { success: false, error: 'Not authorized' };
  }

  if (highlight.renderStatus !== 'completed' || !highlight.renderedVideoR2Url) {
    return { success: false, error: 'Highlight must be rendered before scheduling' };
  }

  // Create the scheduled post record
  const [post] = await db
    .insert(scheduledPosts)
    .values({
      userId: user.id,
      highlightId: params.highlightId,
      platforms: params.platforms,
      postTitle: params.postTitle,
      postDescription: params.postDescription,
      scheduledAt: params.scheduledAt,
      status: 'pending',
    })
    .returning();

  return { success: true, post };
}

/**
 * Get all scheduled posts for the current user.
 */
export async function getScheduledPosts() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return [];
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    return [];
  }

  const posts = await db
    .select({
      post: scheduledPosts,
      highlight: highlights,
      video: videos,
    })
    .from(scheduledPosts)
    .innerJoin(highlights, eq(scheduledPosts.highlightId, highlights.id))
    .innerJoin(videos, eq(highlights.videoId, videos.id))
    .where(eq(scheduledPosts.userId, user.id))
    .orderBy(scheduledPosts.scheduledAt);

  return posts;
}

/**
 * Cancel a scheduled post.
 */
export async function cancelScheduledPost(postId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: 'Not authenticated' };
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Verify ownership
  const [post] = await db
    .select()
    .from(scheduledPosts)
    .where(and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, user.id)))
    .limit(1);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  if (post.status !== 'pending') {
    return { success: false, error: 'Can only cancel pending posts' };
  }

  await db.delete(scheduledPosts).where(eq(scheduledPosts.id, postId));

  return { success: true };
}

/**
 * Publish a scheduled post now via Ayrshare.
 * Called by the Inngest schedulePostCron function.
 */
export async function publishScheduledPost(postId: string) {
  const [post] = await db
    .select()
    .from(scheduledPosts)
    .where(eq(scheduledPosts.id, postId))
    .limit(1);

  if (!post || post.status !== 'pending') {
    return { success: false, error: 'Post not found or already published' };
  }

  try {
    // Get the rendered video download URL
    const [highlight] = await db
      .select()
      .from(highlights)
      .where(eq(highlights.id, post.highlightId))
      .limit(1);

    if (!highlight?.renderedVideoR2Url) {
      throw new Error('No rendered video available');
    }

    // Get a presigned download URL for the rendered video
    const videoUrl = await getPresignedDownloadUrl(highlight.renderedVideoR2Url);

    // Upload media to Ayrshare
    const media = await uploadMedia(videoUrl);

    // Create the post
    const postText = post.postDescription || post.postTitle || '';
    await createPost({
      post: postText,
      platforms: post.platforms as string[],
      mediaUrls: [media.url],
    });

    // Mark as posted
    await db
      .update(scheduledPosts)
      .set({ status: 'posted', postedAt: new Date() })
      .where(eq(scheduledPosts.id, postId));

    return { success: true };
  } catch (error) {
    // Mark as failed
    await db
      .update(scheduledPosts)
      .set({ status: 'failed' })
      .where(eq(scheduledPosts.id, postId));

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
