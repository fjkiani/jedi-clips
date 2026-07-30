import { NextResponse } from 'next/server';
import { db } from '@/db';
import { highlights, videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getPresignedDownloadUrl, buildRenderKey } from '@/lib/r2';

/**
 * Test endpoint that calls the render worker with a proper presigned URL.
 * This tests the full render pipeline.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const highlightId = searchParams.get('highlightId');

  if (secret !== 'jediclip-test-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!highlightId) {
    return NextResponse.json({ error: 'highlightId required' }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    // Get highlight data
    const highlight = await db.query.highlights.findFirst({
      where: eq(highlights.id, highlightId),
    });

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    // Get source video
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, highlight.videoId),
    });

    if (!video?.r2Url) {
      return NextResponse.json({ error: 'Video has no R2 URL' }, { status: 400 });
    }

    // Generate presigned URL for the source video
    const sourceVideoUrl = await getPresignedDownloadUrl(video.r2Url);
    const renderKey = buildRenderKey(highlightId, highlightId);

    // Call the render worker
    const renderWorkerUrl = process.env.RENDER_WORKER_URL || 'http://localhost:3001';

    console.log(`[test-render-worker] Calling ${renderWorkerUrl}/render`);

    const response = await fetch(`${renderWorkerUrl}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        highlightId,
        videoUrl: sourceVideoUrl,
        startTime: highlight.startTime || 0,
        endTime: highlight.endTime || 5,
        captions: highlight.captionSegment || '',
        captionStyle: highlight.captionStyleId || 'karaoke-white',
        renderKey,
      }),
    });

    const result = await response.json();
    const totalTime = Date.now() - startTime;

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Render worker failed',
        totalTimeMs: totalTime,
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Render worker completed successfully',
      data: {
        highlightId,
        renderKey,
        renderWorkerResult: result,
        totalTimeMs: totalTime,
      },
    });
  } catch (error) {
    console.error('[test-render-worker] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTimeMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
