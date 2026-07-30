/**
 * Arcjet security configuration for JediClip.
 *
 * Arcjet provides bot protection, rate limiting, and shield (attack detection).
 * The @arcjet/next package provides a createMiddleware helper for Next.js.
 *
 * To enable Arcjet:
 * 1. Set ARCJET_KEY in your .env
 * 2. Uncomment the Arcjet middleware in middleware.ts
 * 3. Adjust rate limits as needed
 *
 * For now, Arcjet is configured but not active in middleware.
 * It can be used directly in server actions for per-endpoint protection.
 */

import arcjet, {
  fixedWindow,
  detectBot,
  shield,
} from 'arcjet';

// Auth route protection: shield + bot detection + rate limiting
export const authAj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: [], // Block all bots on auth routes
    }),
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '60s',
      max: 5,
    }),
  ],
});

// Upload route protection: shield + rate limiting
export const uploadAj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '60s',
      max: 10,
    }),
  ],
});
