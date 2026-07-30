/**
 * Ayrshare REST API wrapper for social media management.
 * No npm package — we use fetch directly against their API.
 * Docs: https://docs.ayrshare.com
 */

import { AYRSHARE_CONFIG } from '@/config/ayrshare';

export interface AyrshareProfile {
  platform: string;
  platformUserId: string;
  displayName: string;
  profileUrl: string;
}

/**
 * Get all connected social profiles for the user.
 */
export async function getConnectedProfiles(): Promise<AyrshareProfile[]> {
  const response = await fetch(
    `${AYRSHARE_CONFIG.baseUrl}/${AYRSHARE_CONFIG.version}/profiles`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Ayrshare profiles API error: ${response.status}`);
  }

  const data = await response.json();
  return data.profiles || [];
}

/**
 * Connect a social media platform via Ayrshare.
 * Returns a URL the user must visit to authorize the connection.
 */
export async function connectPlatform(
  platform: string,
  callbackUrl: string
): Promise<{ authorizationUrl: string }> {
  const response = await fetch(
    `${AYRSHARE_CONFIG.baseUrl}/${AYRSHARE_CONFIG.version}/profiles/connect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        platform,
        callbackUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Ayrshare connect API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Disconnect a social media platform.
 */
export async function disconnectPlatform(platform: string): Promise<void> {
  const response = await fetch(
    `${AYRSHARE_CONFIG.baseUrl}/${AYRSHARE_CONFIG.version}/profiles/disconnect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
      },
      body: JSON.stringify({ platform }),
    }
  );

  if (!response.ok) {
    throw new Error(`Ayrshare disconnect API error: ${response.status}`);
  }
}

/**
 * Create a post on one or more social media platforms.
 */
export async function createPost(params: {
  post: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduleDate?: string;
}): Promise<{ id: string; status: string }> {
  const response = await fetch(
    `${AYRSHARE_CONFIG.baseUrl}/${AYRSHARE_CONFIG.version}/post`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ayrshare post API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Upload media to Ayrshare for use in posts.
 */
export async function uploadMedia(
  videoUrl: string
): Promise<{ mediaId: string; url: string }> {
  const response = await fetch(
    `${AYRSHARE_CONFIG.baseUrl}/${AYRSHARE_CONFIG.version}/media/upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AYRSHARE_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        videoUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Ayrshare media upload API error: ${response.status}`);
  }

  return response.json();
}
