/**
 * Caption style catalog for the Edit Style modal.
 * Each style has an ID, display name, and description.
 * The visual config is defined in remotion/ShortClip.tsx.
 */

export interface CaptionStyle {
  id: string;
  name: string;
  description: string;
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: 'karaoke-white',
    name: 'Karaoke White',
    description: 'White text on dark background, classic karaoke style',
  },
  {
    id: 'karaoke-teal',
    name: 'Karaoke Teal',
    description: 'Teal text on dark background, Jedi Labs branded',
  },
  {
    id: 'pop-on-amber',
    name: 'Pop On Amber',
    description: 'Bold amber uppercase, high energy impact',
  },
  {
    id: 'pop-on-white',
    name: 'Pop On White',
    description: 'Bold white uppercase, clean and punchy',
  },
  {
    id: 'subtitle-outline',
    name: 'Subtitle Outline',
    description: 'White text with black outline, classic subtitle look',
  },
  {
    id: 'subtitle-teal',
    name: 'Subtitle Teal',
    description: 'Teal text with shadow, modern and branded',
  },
  {
    id: 'box-dark',
    name: 'Box Dark',
    description: 'White text in dark rounded box, clean and readable',
  },
  {
    id: 'box-teal',
    name: 'Box Teal',
    description: 'Dark text in teal rounded box, branded and bold',
  },
  {
    id: 'glow-amber',
    name: 'Glow Amber',
    description: 'Amber text with glow effect, cinematic feel',
  },
];
