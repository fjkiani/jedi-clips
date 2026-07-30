const express = require('express');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// R2 Client
function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
    },
  });
}

async function getPresignedDownloadUrl(key, expiresIn = 3600) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.CF_R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

async function uploadToR2(key, body, contentType) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.CF_R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await client.send(command);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'jediclip-render-worker' });
});

// Render endpoint
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  const { highlightId, videoUrl, startTime: clipStart, endTime: clipEnd, captions, captionStyle, renderKey } = req.body;

  if (!highlightId || !videoUrl || !renderKey) {
    return res.status(400).json({ error: 'Missing required fields: highlightId, videoUrl, renderKey' });
  }

  try {
    console.log(`[render] Starting render for highlight ${highlightId}`);

    // Bundle Remotion project
    console.log('[render] Bundling...');
    const bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, 'remotion/index.tsx'),
    });
    console.log(`[render] Bundle completed in ${Date.now() - startTime}ms`);

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ShortClip',
      inputProps: {
        videoUrl,
        startTime: clipStart || 0,
        endTime: clipEnd || 10,
        captions: captions || '',
        captionStyle: captionStyle || 'karaoke-white',
      },
    });

    // Render
    const tmpDir = os.tmpdir();
    const outputPath = path.join(tmpDir, `render-${highlightId}.mp4`);

    console.log('[render] Rendering...');
    const renderStart = Date.now();

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoUrl,
        startTime: clipStart || 0,
        endTime: clipEnd || 10,
        captions: captions || '',
        captionStyle: captionStyle || 'karaoke-white',
      },
      concurrency: 1,
    });

    console.log(`[render] Render completed in ${Date.now() - renderStart}ms`);

    // Upload to R2
    const fileBuffer = fs.readFileSync(outputPath);
    await uploadToR2(renderKey, fileBuffer, 'video/mp4');

    // Clean up
    fs.unlinkSync(outputPath);

    const totalTime = Date.now() - startTime;
    console.log(`[render] Total time: ${totalTime}ms`);

    res.json({
      success: true,
      highlightId,
      renderKey,
      totalTimeMs: totalTime,
    });
  } catch (error) {
    console.error('[render] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      totalTimeMs: Date.now() - startTime,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Render worker listening on port ${PORT}`);
});
