export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/db';

export const dynamic = 'force-dynamic';
import { users, videos, transcripts, highlights } from '@/db/schema';

export const dynamic = 'force-dynamic';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to create sample data for pipeline testing.
 * Creates a test user, video, transcript, and highlight.
 * Only available in development or with a secret key.
 */
export async function GET(request: Request) {
  // Simple protection — require a secret key
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'jediclip-test-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clerkUserId = 'test-clerk-user-123';

    // Create or get test user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          clerkUserId,
          email: 'test@jediclip.dev',
          firstName: 'Test',
          lastName: 'User',
        })
        .returning();
    }

    // Create test video
    const [video] = await db
      .insert(videos)
      .values({
        userId: user.id,
        clerkUserId,
        fileName: 'test-video-speech.mp4',
        r2Url: 'videos/test-user-123/test-video-789/test-video-speech.mp4',
        status: 'completed',
        duration: 15,
      })
      .returning();

    // Create test transcript
    await db.insert(transcripts).values({
      videoId: video.id,
      fullText:
        'this in a test video for jedi clip we are testing the pipeline from transcription to highlight selection a quick round fox dump over the laser on this video demonstrates how artificial intelligence can automatically find the best moments in your content',
      caption:
        '1\n00:00:00,000 --> 00:00:05,000\nthis in a test video for jedi clip\n\n2\n00:00:05,000 --> 00:00:10,000\nwe are testing the pipeline from transcription\n\n3\n00:00:10,000 --> 00:00:15,000\nto highlight selection a quick round fox\n',
      language: 'en',
    });

    // Create test highlight
    const [highlight] = await db
      .insert(highlights)
      .values({
        videoId: video.id,
        title: 'AI Pipeline Test',
        startTime: 0,
        endTime: 10,
        score: 8,
        reason: 'Testing the pipeline',
        captionSegment:
          '1\n00:00:00,000 --> 00:00:05,000\nthis in a test video for jedi clip\n\n2\n00:00:05,000 --> 00:00:10,000\nwe are testing the pipeline\n',
        captionStyleId: 'karaoke-white',
        renderStatus: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        clerkUserId,
        videoId: video.id,
        highlightId: highlight.id,
      },
    });
  } catch (error) {
    console.error('[test-pipeline] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
