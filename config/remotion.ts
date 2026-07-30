/**
 * Remotion Lambda configuration.
 * These values are set during the one-time Remotion Lambda setup on AWS.
 * See: https://www.remotion.dev/docs/lambda/setup
 */

export const REMOTION_CONFIG = {
  /** AWS region for Remotion Lambda */
  region: process.env.AWS_REGION || 'us-east-1',

  /** Remotion Lambda function name (set after `npx remotion lambda functions deploy`) */
  functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME || '',

  /** S3 bucket name for Remotion renders (set after `npx remotion lambda buckets create`) */
  bucketName: process.env.REMOTION_S3_BUCKET_NAME || '',

  /** Deployed Remotion site URL (set after `npx remotion sites deploy`) */
  siteUrl: process.env.REMOTION_SITE_URL || '',

  /** Composition ID used in Remotion root */
  compositionId: 'ShortClip',
} as const;
