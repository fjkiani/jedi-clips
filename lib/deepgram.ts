import { createClient } from '@deepgram/sdk';

/**
 * Deepgram SDK wrapper for video transcription.
 * Accepts a presigned R2 URL directly — no FFmpeg audio extraction needed.
 */

export interface DeepgramTranscription {
  fullText: string;
  caption: string; // SRT-formatted captions
  rawJson: Record<string, unknown>;
  language: string;
}

export async function transcribeVideo(
  videoUrl: string
): Promise<DeepgramTranscription> {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is not set');
  }

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: videoUrl },
    {
      model: 'nova-3',
      smart_format: true,
      punctuate: true,
      utterances: true,
      diarize: false,
    }
  );

  if (error) {
    throw new Error(`Deepgram transcription failed: ${error.message}`);
  }

  if (!result) {
    throw new Error('Deepgram returned no result');
  }

  // Extract full text from channels
  const channels = result.results?.channels || [];
  const fullText = channels
    .flatMap((ch) => {
      const alternatives = ch.alternatives || [];
      return alternatives.map((alt) => alt.transcript || '');
    })
    .filter(Boolean)
    .join('\n\n');

  // Generate SRT captions from words
  const words = channels
    .flatMap((ch) => {
      const alternatives = ch.alternatives || [];
      return alternatives.flatMap((alt) => {
        return alt.words || [];
      });
    });

  const caption = generateSRT(words as unknown as Record<string, unknown>[]);

  const language = channels[0]?.detected_language || 'en';

  return {
    fullText,
    caption,
    rawJson: result as unknown as Record<string, unknown>,
    language,
  };
}

/**
 * Convert Deepgram word-level timestamps to SRT caption format.
 */
function generateSRT(words: Record<string, unknown>[]): string {
  if (!words || words.length === 0) return '';

  const MAX_CHARS_PER_LINE = 32;
  const MAX_LINES = 2;
  const MAX_CHARS = MAX_CHARS_PER_LINE * MAX_LINES;
  const MAX_DURATION_MS = 5000; // 5 seconds max per caption block

  const blocks: string[] = [];
  let blockIndex = 1;
  let blockWords: string[] = [];
  let blockStart: number | null = null;
  let blockEnd: number | null = null;
  let blockCharCount = 0;

  const flushBlock = () => {
    if (blockWords.length === 0 || blockStart === null || blockEnd === null) return;

    const text = blockWords.join(' ');
    // Split into lines of ~MAX_CHARS_PER_LINE
    const lines: string[] = [];
    let currentLine = '';
    for (const word of blockWords) {
      if (currentLine.length + word.length + 1 > MAX_CHARS_PER_LINE && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    }
    if (currentLine) lines.push(currentLine);

    blocks.push(
      `${blockIndex}\n${formatSRTTime(blockStart)} --> ${formatSRTTime(blockEnd)}\n${lines.join('\n')}\n`
    );
    blockIndex++;
    blockWords = [];
    blockStart = null;
    blockEnd = null;
    blockCharCount = 0;
  };

  for (const word of words) {
    const start = (word.start as number) ?? 0;
    const end = (word.end as number) ?? 0;
    const punctuatedWord = (word.punctuated_word as string) || (word.word as string) || '';

    if (blockStart === null) blockStart = start;

    const wouldExceedChars = blockCharCount + punctuatedWord.length + 1 > MAX_CHARS;
    const wouldExceedDuration = blockEnd !== null && start - (blockEnd || start) > MAX_DURATION_MS / 1000;

    if (wouldExceedChars || wouldExceedDuration) {
      flushBlock();
      blockStart = start;
    }

    blockWords.push(punctuatedWord);
    blockEnd = end;
    blockCharCount += punctuatedWord.length + 1;
  }

  flushBlock();

  return blocks.join('\n');
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}
