/**
 * Application limits and rate limiting constants.
 */

export const LIMITS = {
  /** Maximum video uploads per user per 24 hours */
  maxVideoUploadsPerDay: 2,

  /** Maximum video file size in bytes (2 GB) */
  maxVideoFileSize: 2 * 1024 * 1024 * 1024,

  /** Maximum video duration in seconds (2 hours) */
  maxVideoDuration: 2 * 60 * 60,

  /** Number of highlights to generate per video */
  highlightsPerVideo: 5,

  /** Schedule post check interval in minutes */
  scheduleCheckIntervalMinutes: 15,
} as const;
