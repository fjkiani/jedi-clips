import { Inngest } from 'inngest';

/**
 * Inngest client for JediClip background job processing.
 * All video processing, rendering, and social scheduling runs through Inngest.
 */
export const inngest = new Inngest({
  id: 'jediclip',
  name: 'JediClip',
});
