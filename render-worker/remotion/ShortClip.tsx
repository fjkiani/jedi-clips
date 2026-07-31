import React from 'react';
import {
  AbsoluteFill,
  Video as RemotionVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

/**
 * Remotion composition for rendering a short clip with captions.
 * Props are passed from the Inngest renderVideo function or the Remotion Player.
 */

export interface ShortClipProps {
  videoUrl: string;
  startTime: number;
  endTime: number;
  captions: string;
  captionStyle: string;
  [key: string]: unknown;
}

export const ShortClip: React.FC<ShortClipProps> = ({
  videoUrl,
  startTime,
  endTime,
  captions,
  captionStyle,
}: ShortClipProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationInFrames = Math.round((endTime - startTime) * fps);

  // Parse SRT captions into timed segments
  const captionBlocks = parseSRT(captions);

  // Find the current caption block based on the current time
  const currentTime = startTime + frame / fps;
  const activeCaption = captionBlocks.find(
    (block) => currentTime >= block.start && currentTime <= block.end
  );

  // Get the style config for the current caption style
  const styleConfig = getCaptionStyleConfig(captionStyle);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Video source — plays from startTime */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <RemotionVideo
          src={videoUrl}
          startFrom={Math.round(startTime * fps)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Sequence>

      {/* Caption overlay */}
      {activeCaption && (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingBottom: styleConfig.paddingBottom,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              maxWidth: '85%',
            }}
          >
            {activeCaption.lines.map((line, i) => (
              <span
                key={i}
                style={{
                  ...styleConfig.textStyle,
                  textShadow: styleConfig.textShadow,
                  backgroundColor: styleConfig.backgroundColor,
                  padding: styleConfig.padding,
                  borderRadius: styleConfig.borderRadius,
                  lineHeight: 1.3,
                }}
              >
                {line}
              </span>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * Parse SRT caption format into timed blocks.
 */
function parseSRT(srt: string): CaptionBlock[] {
  if (!srt) return [];

  const blocks: CaptionBlock[] = [];
  const rawBlocks = srt.trim().split(/\n\n+/);

  for (const rawBlock of rawBlocks) {
    const lines = rawBlock.trim().split('\n');
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const textLines = lines.slice(2);

    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    if (!timeMatch) continue;

    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    blocks.push({
      start,
      end,
      lines: textLines,
    });
  }

  return blocks;
}

interface CaptionBlock {
  start: number;
  end: number;
  lines: string[];
}

interface CaptionStyleConfig {
  textStyle: React.CSSProperties;
  textShadow: string;
  backgroundColor: string;
  padding: string;
  borderRadius: string;
  paddingBottom: string;
}

/**
 * Get the visual config for a caption style.
 */
function getCaptionStyleConfig(styleId: string): CaptionStyleConfig {
  const styles: Record<string, CaptionStyleConfig> = {
    'karaoke-white': {
      textStyle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: '0px 0px 8px rgba(0,0,0,0.8)',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: '4px 12px',
      borderRadius: '6px',
      paddingBottom: '12%',
    },
    'karaoke-teal': {
      textStyle: {
        color: '#2DD4BF',
        fontSize: 28,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: '0px 0px 8px rgba(0,0,0,0.8)',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: '4px 12px',
      borderRadius: '6px',
      paddingBottom: '12%',
    },
    'pop-on-amber': {
      textStyle: {
        color: '#FBBF24',
        fontSize: 30,
        fontWeight: 800,
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase' as const,
      },
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
      backgroundColor: 'transparent',
      padding: '4px 0',
      borderRadius: '0',
      paddingBottom: '10%',
    },
    'pop-on-white': {
      textStyle: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 800,
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase' as const,
      },
      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
      backgroundColor: 'transparent',
      padding: '4px 0',
      borderRadius: '0',
      paddingBottom: '10%',
    },
    'subtitle-outline': {
      textStyle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        WebkitTextStroke: '1px #000',
      },
      textShadow: '0px 0px 4px rgba(0,0,0,0.9)',
      backgroundColor: 'transparent',
      padding: '4px 0',
      borderRadius: '0',
      paddingBottom: '12%',
    },
    'subtitle-teal': {
      textStyle: {
        color: '#2DD4BF',
        fontSize: 26,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: '0px 0px 6px rgba(0,0,0,0.9)',
      backgroundColor: 'transparent',
      padding: '4px 0',
      borderRadius: '0',
      paddingBottom: '12%',
    },
    'box-dark': {
      textStyle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: 'none',
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: '8px 16px',
      borderRadius: '8px',
      paddingBottom: '12%',
    },
    'box-teal': {
      textStyle: {
        color: '#042F2E',
        fontSize: 24,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: 'none',
      backgroundColor: 'rgba(45,212,191,0.9)',
      padding: '8px 16px',
      borderRadius: '8px',
      paddingBottom: '12%',
    },
    'glow-amber': {
      textStyle: {
        color: '#FBBF24',
        fontSize: 28,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      },
      textShadow: '0px 0px 20px rgba(251,191,36,0.5), 0px 0px 8px rgba(0,0,0,0.8)',
      backgroundColor: 'transparent',
      padding: '4px 0',
      borderRadius: '0',
      paddingBottom: '10%',
    },
  };

  return styles[styleId] || styles['karaoke-white'];
}
