export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

import { uploadToR2, buildVideoKey } from '@/lib/r2';

/**
 * Server-side upload proxy.
 *
 * The preferred upload path is browser → R2 direct via presigned URL,
 * but that requires CORS rules on the bucket. Until CORS is configured
 * in the Cloudflare dashboard, this endpoint proxies the file through
 * the Next.js server (which already has R2 credentials).
 *
 * Client sends: POST /api/upload?videoId=<uuid>&fileName=<name>
 * Body: raw file bytes (Content-Type: video/*)
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const fileName = searchParams.get('fileName') || 'upload.mp4';

  if (!videoId) {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 });
  }

  try {
    const contentType =
      request.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await request.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    const r2Key = buildVideoKey(userId, videoId, fileName);
    await uploadToR2(r2Key, buffer, contentType);

    return NextResponse.json({ success: true, r2Key, size: buffer.length });
  } catch (error) {
    console.error('[api/upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// Allow large video uploads (up to 2GB per project limits)
export const maxDuration = 300;
