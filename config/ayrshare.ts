/**
 * Ayrshare API configuration for social media scheduling.
 * Ayrshare provides a unified API for posting across 15+ platforms.
 * No npm package — we use their REST API directly.
 */

export const AYRSHARE_CONFIG = {
  /** Base URL for Ayrshare API */
  baseUrl: 'https://app.ayrshare.com/api',

  /** API version — empty string, Ayrshare doesn't use versioned paths */
  version: '',

  /** API key from environment */
  get apiKey() {
    if (!process.env.AYRSHARE_API_KEY) {
      throw new Error('AYRSHARE_API_KEY is not set');
    }
    return process.env.AYRSHARE_API_KEY;
  },
} as const;

/**
 * Supported social media platforms via Ayrshare.
 */
export const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌' },
  { id: 'reddit', name: 'Reddit', icon: '🔴' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
] as const;
