export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { highlights, videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getPresignedDownloadUrl, buildRenderKey } from '@/lib/r2';

/**
 * Test endpoint to trigger a render via the Railway render worker.
 * Generates a presigned R2 URL for the source video, then calls
 * the Railway worker's /render endpoint.
 *
 * Usage: GET /api/test-railway-render?secret=jediclip-test-2026&highlightId=<uuid>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const highlightId = searchParams.get('highlightId');

  if (secret !== 'jediclip-test-2026') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!highlightId) {
    return NextResponse.json(
      { error: 'highlightId required' },
      { status: 400 }
    );
  }

  try {
    // Fetch highlight
    const [highlight] = await db
      .select()
      .from(highlights)
      .where(eq(highlights.id, highlightId))
      .limit(1);

    if (!highlight) {
      return NextResponse.json(
        { error: `Highlight ${highlightId} not found` },
        { status: 404 }
      );
    }

    // Fetch source video
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, highlight.videoId))
      .limit(1);

    if (!video?.r2Url) {
      return NextResponse.json(
        { error: 'Source video has no R2 URL' },
        { status: 400 }
      );
    }

    // Generate presigned download URL for the source video
    const videoUrl = await getPresignedDownloadUrl(video.r2Url);
    const renderKey = buildRenderKey(video.clerkUserId, highlightId);

    const workerUrl = process.env.RENDER_WORKER_URL;
    if (!workerUrl) {
      return NextResponse.json(
        { error: 'RENDER_WORKER_URL not configured' },
        { status: 500 }
      );
    }

    // Call Railway render worker
    const renderResponse = await fetch(`${workerUrl}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        highlightId,
        videoUrl,
        startTime: highlight.startTime,
        endTime: highlight.endTime,
        captions: highlight.captionSegment || '',
        captionStyle: highlight.captionStyleId || 'karaoke-white',
        renderKey,
      }),
    });

    const result = await renderResponse.json();

    return NextResponse.json({
      success: renderResponse.ok,
      status: renderResponse.status,
      renderKey,
      workerResponse: result,
    });
  } catch (error) {
    console.error('[test-railway-render] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
