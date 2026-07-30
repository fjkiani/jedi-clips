import { inngest } from './client';
import { db } from '@/db';
import { videos, transcripts, highlights } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getPresignedDownloadUrl } from '@/lib/r2';
import { transcribeVideo } from '@/lib/deepgram';
import { selectHighlights } from '@/lib/gemini';
import { GEMINI_CONFIG } from '@/config/gemini';

/**
 * Video Processing Pipeline
 * Triggered when a user uploads a video.
 * Steps: Transcribe → AI Highlights → Save
 */
export const videoProcessing = inngest.createFunction(
  {
    id: 'video-processing',
    name: 'Video Processing Pipeline',
    retries: 2,
    throttle: { limit: 5, period: '1m' },
  },
  { event: 'video/uploaded' },
  async ({ event, step }) => {
    const { videoId, clerkUserId } = event.data;

    // Step 1: Get presigned R2 URL for the video
    const presignedUrl = await step.run('get-video-url', async () => {
      const video = await db.query.videos.findFirst({
        where: eq(videos.id, videoId),
      });
      if (!video?.r2Url) {
        throw new Error(`Video ${videoId} has no R2 URL`);
      }
      return getPresignedDownloadUrl(video.r2Url);
    });

    // Step 2: Transcribe video via Deepgram
    const transcription = await step.run('transcribe', async () => {
      const result = await transcribeVideo(presignedUrl);

      // Save transcript to database
      await db.insert(transcripts).values({
        videoId,
        rawJson: result.rawJson,
        fullText: result.fullText,
        caption: result.caption,
        language: result.language,
      });

      return result;
    });

    // Step 3: AI highlight selection via Gemini
    const highlightResults = await step.run('ai-highlights', async () => {
      const results = await selectHighlights(
        transcription.fullText,
        transcription.caption,
        GEMINI_CONFIG.highlightCount
      );

      // Save highlights to database
      if (results.length > 0) {
        await db.insert(highlights).values(
          results.map((h) => ({
            videoId,
            title: h.title,
            startTime: h.startTime,
            endTime: h.endTime,
            score: h.score,
            seoScore: h.seoScore,
            reason: h.reason,
            transcriptSegment: h.transcriptSegment,
            captionSegment: h.captionSegment,
          }))
        );
      }

      return results;
    });

    // Step 4: Update video status to completed
    await step.run('complete', async () => {
      await db
        .update(videos)
        .set({ status: 'completed' })
        .where(eq(videos.id, videoId));
    });

    return {
      videoId,
      transcriptLength: transcription.fullText.length,
      highlightsGenerated: highlightResults.length,
    };
  }
);

/**
 * Schedule Post Cron
 * Runs every 15 minutes to check for upcoming scheduled posts
 * and publishes them via Ayrshare.
 */
export const schedulePostCron = inngest.createFunction(
  {
    id: 'schedule-post-cron',
    name: 'Schedule Post Cron',
    retries: 1,
  },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const { scheduledPosts } = await import('@/db/schema');
    const { and, lte, gte, eq, sql } = await import('drizzle-orm');

    // Step 1: Find posts due in the next 15 minutes
    const duePosts = await step.run('find-due-posts', async () => {
      const now = new Date();
      const fifteenMinFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      const posts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, 'pending'),
            lte(scheduledPosts.scheduledAt, fifteenMinFromNow),
            gte(scheduledPosts.scheduledAt, sql`NOW() - INTERVAL '15 minutes'`)
          )
        );

      return posts;
    });

    if (duePosts.length === 0) {
      return { published: 0, message: 'No posts due' };
    }

    // Step 2: Publish each post via Ayrshare
    const results = await step.run('publish-posts', async () => {
      const { AYRSHARE_CONFIG } = await import('@/config/ayrshare');
      const published: string[] = [];
      const failed: string[] = [];

      for (const post of duePosts) {
        try {
          // Get the rendered video URL for this highlight
          const highlight = await db.query.highlights.findFirst({
            where: eq(highlights.id, post.highlightId),
          });

          if (!highlight?.renderedVideoR2Url) {
            throw new Error('Highlight has no rendered video');
          }

          const videoUrl = await getPresignedDownloadUrl(highlight.renderedVideoR2Url);

          // Call Ayrshare API to post
          const response = await fetch(
            `${AYRSHARE_CONFIG.baseUrl}/post`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
              },
              body: JSON.stringify({
                post: post.postDescription || post.postTitle || '',
                platforms: post.platforms,
                mediaUrls: [videoUrl],
                scheduleDate: new Date(post.scheduledAt).toISOString(),
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Ayrshare API error: ${response.status}`);
          }

          // Mark as posted
          await db
            .update(scheduledPosts)
            .set({
              status: 'posted',
              postedAt: new Date(),
            })
            .where(eq(scheduledPosts.id, post.id));

          published.push(post.id);
        } catch (error) {
          console.error(`[schedulePostCron] Failed to publish post ${post.id}:`, error);
          await db
            .update(scheduledPosts)
            .set({ status: 'failed' })
            .where(eq(scheduledPosts.id, post.id));
          failed.push(post.id);
        }
      }

      return { published, failed };
    });

    return results;
  }
);

/**
 * Render Video via @remotion/renderer (server-side, no AWS Lambda)
 * Triggered when user clicks "Download" on a highlight.
 * Renders the composition and uploads the result to Cloudflare R2.
 */
export const renderVideo = inngest.createFunction(
  {
    id: 'render-video',
    name: 'Render Video via Remotion Renderer',
    retries: 1,
    timeouts: {
      finish: '15m',
    },
  },
  { event: 'video/render-requested' },
  async ({ event, step }) => {
    const { highlightId, clerkUserId } = event.data;

    // Step 1: Get highlight data
    const highlightData = await step.run('get-highlight', async () => {
      const highlight = await db.query.highlights.findFirst({
        where: eq(highlights.id, highlightId),
      });
      if (!highlight) {
        throw new Error(`Highlight ${highlightId} not found`);
      }
      return highlight;
    });

    // Step 2: Update render status
    await step.run('update-rendering', async () => {
      await db
        .update(highlights)
        .set({ renderStatus: 'rendering' })
        .where(eq(highlights.id, highlightId));
    });

    // Step 3: Render video using @remotion/renderer
    const renderResult = await step.run('render', async () => {
      const { bundle } = await import('@remotion/bundler');
      const { renderMedia, selectComposition } = await import('@remotion/renderer');
      const { REMOTION_CONFIG } = await import('@/config/remotion');
      const { getPresignedDownloadUrl, uploadToR2, buildRenderKey } = await import('@/lib/r2');
      const path = await import('path');
      const fs = await import('fs');
      const os = await import('os');

      // Get the source video URL
      const video = await db.query.videos.findFirst({
        where: eq(videos.id, highlightData.videoId),
      });
      if (!video?.r2Url) {
        throw new Error('Source video has no R2 URL');
      }

      const sourceVideoUrl = await getPresignedDownloadUrl(video.r2Url);

      // Bundle the Remotion project
      const bundleLocation = await bundle({
        entryPoint: path.resolve(process.cwd(), 'remotion/index.tsx'),
        // If you have a custom webpack override, add it here
      });

      // Select the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: REMOTION_CONFIG.compositionId,
        inputProps: {
          videoUrl: sourceVideoUrl,
          startTime: highlightData.startTime,
          endTime: highlightData.endTime,
          captions: highlightData.captionSegment || '',
          captionStyle: highlightData.captionStyleId || 'karaoke-white',
        },
      });

      // Create temp output file
      const tmpDir = os.tmpdir();
      const outputPath = path.join(tmpDir, `render-${highlightId}.mp4`);

      // Render the video
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: REMOTION_CONFIG.codec,
        outputLocation: outputPath,
        inputProps: {
          videoUrl: sourceVideoUrl,
          startTime: highlightData.startTime,
          endTime: highlightData.endTime,
          captions: highlightData.captionSegment || '',
          captionStyle: highlightData.captionStyleId || 'karaoke-white',
        },
      });

      // Upload to R2
      const renderKey = buildRenderKey(clerkUserId, highlightId);
      const fileBuffer = fs.readFileSync(outputPath);
      await uploadToR2(renderKey, fileBuffer, 'video/mp4');

      // Clean up temp file
      fs.unlinkSync(outputPath);

      return { renderKey };
    });

    // Step 4: Update highlight with render result
    await step.run('save-render', async () => {
      await db
        .update(highlights)
        .set({
          renderStatus: 'completed',
          renderedVideoR2Url: renderResult.renderKey,
        })
        .where(eq(highlights.id, highlightId));
    });

    return { highlightId, renderKey: renderResult.renderKey };
  }
);

export const functions = [videoProcessing, schedulePostCron, renderVideo];
