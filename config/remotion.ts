/**
 * Remotion render configuration.
 * Uses @remotion/renderer for server-side rendering (no AWS Lambda needed).
 * Renders are stored in Cloudflare R2.
 */

export const REMOTION_CONFIG = {
  /** Composition ID used in Remotion root */
  compositionId: 'ShortClip',

  /** Output dimensions */
  width: 1080,
  height: 1920,
  fps: 30,

  /** Codec */
  codec: 'h264' as const,
} as const;
