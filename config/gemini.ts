/**
 * Gemini AI configuration.
 * Model and highlight count can be adjusted here.
 */

export const GEMINI_CONFIG = {
  /** Gemini model to use for highlight selection */
  model: 'gemini-2.5-flash-lite',

  /** Number of short clips to generate per video */
  highlightCount: 5,

  /** Minimum clip duration in seconds */
  minClipDuration: 30,

  /** Maximum clip duration in seconds */
  maxClipDuration: 90,
} as const;
