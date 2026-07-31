export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

import { db } from '@/db';

import { highlights, videos } from '@/db/schema';

import { eq } from 'drizzle-orm';

import { getPresignedDownloadUrl, uploadToR2, buildRenderKey } from '@/lib/r2';

/**
 * Test endpoint to directly trigger a render without Inngest.
 * This bypasses the event queue and calls the render logic directly.
 * Only for testing — remove in production.
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

    // For testing, we'll skip the actual Remotion render (too heavy for free tier)
    // and instead just copy the source video as the "rendered" output
    const renderKey = buildRenderKey(highlightId, highlightId);

    // Download the source video and re-upload as rendered
    const response = await fetch(sourceVideoUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await uploadToR2(renderKey, buffer, 'video/mp4');

    // Update highlight with render result
    await db
      .update(highlights)
      .set({
        renderStatus: 'completed',
        renderedVideoR2Url: renderKey,
      })
      .where(eq(highlights.id, highlightId));

    return NextResponse.json({
      success: true,
      message: 'Test render completed (source video copied as rendered output)',
      data: {
        highlightId,
        renderKey,
        note: 'Actual Remotion render skipped — too heavy for Render free tier',
      },
    });
  } catch (error) {
    console.error('[test-render] Error:', error);

    // Update status to failed
    await db
      .update(highlights)
      .set({ renderStatus: 'failed' })
      .where(eq(highlights.id, highlightId));

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
