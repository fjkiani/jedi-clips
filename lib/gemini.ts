import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI wrapper for highlight selection.
 * Analyzes transcript and picks the most engaging moments for short videos.
 */

export interface HighlightResult {
  title: string;
  startTime: number;
  endTime: number;
  score: number;
  seoScore: number;
  reason: string;
  transcriptSegment: string;
  captionSegment: string;
}

const HIGHLIGHT_PROMPT = `You are an expert viral content curator. Analyze the following video transcript and select the most engaging moments that would make great short-form videos (30-90 seconds each).

For each selected moment, provide:
1. A catchy title for the short clip
2. The start time (in seconds from the beginning)
3. The end time (in seconds from the beginning)
4. An engagement score (0-100) based on how likely this segment is to go viral
5. An SEO score (0-100) based on how discoverable and shareable this content is
6. A brief reason explaining why this moment is engaging
7. The transcript text for this time range
8. The caption text for this time range

Rules:
- Select exactly HIGHLIGHT_COUNT highlights
- Each clip must be between 30-90 seconds
- Prioritize moments with strong hooks, emotional peaks, surprising reveals, or actionable takeaways
- Avoid segments that require too much context from earlier in the video
- Prefer segments that work as standalone content

Respond with ONLY a JSON array, no markdown formatting or code blocks:
[
  {
    "title": "...",
    "startTime": 0,
    "endTime": 0,
    "score": 0,
    "seoScore": 0,
    "reason": "...",
    "transcriptSegment": "...",
    "captionSegment": "..."
  }
]

TRANSCRIPT:
`;

export async function selectHighlights(
  transcript: string,
  captions: string,
  highlightCount: number = 5
): Promise<HighlightResult[]> {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = HIGHLIGHT_PROMPT.replace(
    'HIGHLIGHT_COUNT',
    String(highlightCount)
  ) + transcript + '\n\nCAPTIONS (SRT format):\n' + captions;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response — handle potential markdown code blocks
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const highlights: HighlightResult[] = JSON.parse(jsonStr);

    // Validate each highlight has required fields
    return highlights.filter(
      (h) =>
        typeof h.startTime === 'number' &&
        typeof h.endTime === 'number' &&
        h.endTime > h.startTime &&
        h.title &&
        h.reason
    );
  } catch (parseError) {
    console.error('[selectHighlights] Failed to parse Gemini response:', parseError);
    console.error('[selectHighlights] Raw response:', text);
    throw new Error('Failed to parse AI highlight selection response');
  }
}
