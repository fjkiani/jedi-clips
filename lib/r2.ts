import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 client — S3-compatible API with zero egress fees.
 * Uses the same AWS SDK, just pointed at R2's endpoint.
 */

function getR2Client() {
  if (
    !process.env.CF_ACCOUNT_ID ||
    !process.env.CF_R2_ACCESS_KEY_ID ||
    !process.env.CF_R2_SECRET_ACCESS_KEY
  ) {
    throw new Error(
      'Missing Cloudflare R2 environment variables: CF_ACCOUNT_ID, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY'
    );
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generate a presigned URL for uploading a file to R2.
 * The client uploads directly to R2 — no server-side file handling needed.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.CF_R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from R2.
 * Used for: Deepgram transcription, Remotion rendering, user downloads.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.CF_R2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Build the R2 object key for a user's video upload.
 * Format: videos/{clerkUserId}/{videoId}/{fileName}
 */
export function buildVideoKey(
  clerkUserId: string,
  videoId: string,
  fileName: string
): string {
  return `videos/${clerkUserId}/${videoId}/${fileName}`;
}

/**
 * Build the R2 object key for a rendered short clip.
 * Format: renders/{clerkUserId}/{highlightId}.mp4
 */
export function buildRenderKey(
  clerkUserId: string,
  highlightId: string
): string {
  return `renders/${clerkUserId}/${highlightId}.mp4`;
}
