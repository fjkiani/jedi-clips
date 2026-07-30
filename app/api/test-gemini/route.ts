import { NextResponse } from 'next/server';
import { selectHighlights } from '@/lib/gemini';

/**
 * Test endpoint to verify Gemini API is working.
 * Only available with the secret key.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'jediclip-test-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test with a simple transcript
    const testTranscript = "This is a test video about artificial intelligence and machine learning. AI is transforming how we work and live. Machine learning models can now understand natural language, generate images, and even write code. The future of AI is incredibly exciting.";
    const testCaptions = "1\n00:00:00,000 --> 00:00:05,000\nThis is a test video about artificial intelligence.\n\n2\n00:00:05,000 --> 00:00:10,000\nMachine learning models can now understand natural language.\n";

    const results = await selectHighlights(testTranscript, testCaptions, 1);

    return NextResponse.json({
      success: true,
      model: 'gemini-2.5-flash-lite',
      highlights: results,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
