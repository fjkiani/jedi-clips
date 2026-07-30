'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, videos, highlights } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  buildVideoKey,
} from '@/lib/r2';
import { inngest } from '@/inngest/client';

/**
 * Step 1: Create a video record and return a presigned R2 upload URL.
 * The client uploads directly to R2 — no server-side file handling.
 */
export async function startUpload(fileName: string, contentType: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    // Resolve internal user ID from Clerk ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    if (!user) {
      return { error: 'User not found in database — please refresh the page' };
    }

    // Create video record with uploading status
    const [video] = await db
      .insert(videos)
      .values({
        userId: user.id,
        clerkUserId: userId,
        fileName,
        status: 'uploading',
      })
      .returning();

    if (!video) {
      return { error: 'Failed to create video record' };
    }

    // Generate presigned upload URL for R2
    const r2Key = buildVideoKey(userId, video.id, fileName);
    const presignedUrl = await getPresignedUploadUrl(r2Key, contentType);

    return { videoId: video.id, presignedUrl, r2Key };
  } catch (error) {
    console.error('[startUpload] Error:', error);
    return { error: 'Failed to start upload' };
  }
}

/**
 * Step 2: After client-side upload completes, confirm the video
 * and trigger the Inngest video processing pipeline.
 */
export async function createVideo(
  videoId: string,
  r2Key: string,
  fileName: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    // Update video record with R2 URL and processing status
    await db
      .update(videos)
      .set({
        r2Url: r2Key,
        status: 'processing',
      })
      .where(eq(videos.id, videoId));

    // Trigger Inngest video processing pipeline
    await inngest.send({
      name: 'video/uploaded',
      data: { videoId, clerkUserId: userId },
    });

    return { success: true };
  } catch (error) {
    console.error('[createVideo] Error:', error);
    return { error: 'Failed to create video' };
  }
}

/**
 * Get a presigned download URL for a video stored in R2.
 * Used for: Deepgram transcription, Remotion rendering, user downloads.
 */
export async function getVideoDownloadUrl(videoId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!video || video.clerkUserId !== userId) {
      return { error: 'Video not found' };
    }

    if (!video.r2Url) {
      return { error: 'Video has no storage URL' };
    }

    const downloadUrl = await getPresignedDownloadUrl(video.r2Url);
    return { downloadUrl };
  } catch (error) {
    console.error('[getVideoDownloadUrl] Error:', error);
    return { error: 'Failed to get download URL' };
  }
}

/**
 * Trigger a Remotion Lambda render for a specific highlight.
 * Sends an Inngest event that the renderVideo function will pick up.
 */
export async function triggerRender(highlightId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify the highlight belongs to this user
    const highlight = await db.query.highlights.findFirst({
      where: eq(highlights.id, highlightId),
      with: { video: true },
    });

    if (!highlight || highlight.video.clerkUserId !== userId) {
      return { error: 'Highlight not found' };
    }

    // Trigger Inngest render event
    await inngest.send({
      name: 'video/render-requested',
      data: { highlightId, clerkUserId: userId },
    });

    return { success: true };
  } catch (error) {
    console.error('[triggerRender] Error:', error);
    return { error: 'Failed to trigger render' };
  }
}

/**
 * Get a presigned download URL for a rendered highlight clip.
 * Used by the ShortClipCard download button (client component).
 */
export async function getRenderDownloadUrl(highlightId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify the highlight belongs to this user
    const highlight = await db.query.highlights.findFirst({
      where: eq(highlights.id, highlightId),
      with: { video: true },
    });

    if (!highlight || highlight.video.clerkUserId !== userId) {
      return { error: 'Highlight not found' };
    }

    if (!highlight.renderedVideoR2Url) {
      return { error: 'No rendered video available' };
    }

    const downloadUrl = await getPresignedDownloadUrl(highlight.renderedVideoR2Url);
    return { downloadUrl };
  } catch (error) {
    console.error('[getRenderDownloadUrl] Error:', error);
    return { error: 'Failed to get download URL' };
  }
}

/**
 * Apply a caption style to a highlight.
 * Updates the captionStyleId field — the next render will use this style.
 */
export async function applyCaptionStyle(
  highlightId: string,
  captionStyleId: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify the highlight belongs to this user
    const highlight = await db.query.highlights.findFirst({
      where: eq(highlights.id, highlightId),
      with: { video: true },
    });

    if (!highlight || highlight.video.clerkUserId !== userId) {
      return { error: 'Highlight not found' };
    }

    // Update caption style and reset render status (needs re-render)
    await db
      .update(highlights)
      .set({
        captionStyleId,
        renderStatus: 'pending',
        renderedVideoR2Url: null,
      })
      .where(eq(highlights.id, highlightId));

    return { success: true };
  } catch (error) {
    console.error('[applyCaptionStyle] Error:', error);
    return { error: 'Failed to apply caption style' };
  }
}
