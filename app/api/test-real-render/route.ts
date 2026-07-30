import { NextResponse } from 'next/server';
import { db } from '@/db';
import { highlights, videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getPresignedDownloadUrl, uploadToR2, buildRenderKey } from '@/lib/r2';

/**
 * Test endpoint that attempts a REAL Remotion render.
 * This will fail on Render free tier if resources are insufficient.
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

    // Update status to rendering
    await db
      .update(highlights)
      .set({ renderStatus: 'rendering' })
      .where(eq(highlights.id, highlightId));

    // Get source video
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, highlight.videoId),
    });

    if (!video?.r2Url) {
      return NextResponse.json({ error: 'Video has no R2 URL' }, { status: 400 });
    }

    const sourceVideoUrl = await getPresignedDownloadUrl(video.r2Url);

    // Attempt real Remotion render
    const { bundle } = await import('@remotion/bundler');
    const { renderMedia, selectComposition } = await import('@remotion/renderer');
    const path = await import('path');
    const fs = await import('fs');
    const os = await import('os');

    console.log('[test-real-render] Starting bundle...');
    const bundleStart = Date.now();

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), 'remotion/index.tsx'),
    });

    console.log(`[test-real-render] Bundle completed in ${Date.now() - bundleStart}ms`);

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ShortClip',
      inputProps: {
        videoUrl: sourceVideoUrl,
        startTime: highlight.startTime || 0,
        endTime: highlight.endTime || 10,
        captions: highlight.captionSegment || '',
        captionStyle: highlight.captionStyleId || 'karaoke-white',
      },
    });

    console.log('[test-real-render] Composition selected');

    // Create temp output
    const tmpDir = os.tmpdir();
    const outputPath = path.join(tmpDir, `render-${highlightId}.mp4`);

    console.log('[test-real-render] Starting render...');
    const renderStart = Date.now();

    // Render with minimal settings for free tier
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoUrl: sourceVideoUrl,
        startTime: highlight.startTime || 0,
        endTime: highlight.endTime || 10,
        captions: highlight.captionSegment || '',
        captionStyle: highlight.captionStyleId || 'karaoke-white',
      },
      // Limit resources for free tier
      concurrency: 1,
      frameRange: [0, 90], // Only render first 3 seconds for testing
    });

    console.log(`[test-real-render] Render completed in ${Date.now() - renderStart}ms`);

    // Upload to R2
    const renderKey = buildRenderKey(highlightId, highlightId);
    const fileBuffer = fs.readFileSync(outputPath);
    await uploadToR2(renderKey, fileBuffer, 'video/mp4');

    // Clean up
    fs.unlinkSync(outputPath);

    // Update highlight
    await db
      .update(highlights)
      .set({
        renderStatus: 'completed',
        renderedVideoR2Url: renderKey,
      })
      .where(eq(highlights.id, highlightId));

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Real Remotion render completed',
      data: {
        highlightId,
        renderKey,
        totalTimeMs: totalTime,
        note: 'Rendered first 3 seconds only (frameRange [0,90])',
      },
    });
  } catch (error) {
    console.error('[test-real-render] Error:', error);

    // Update status to failed
    await db
      .update(highlights)
      .set({ renderStatus: 'failed' })
      .where(eq(highlights.id, highlightId));

    const totalTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        totalTimeMs: totalTime,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
