'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAPTION_STYLES } from '@/remotion/CaptionStyles';

interface EditStyleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyleId: string;
  highlightId: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  captions: string;
  onStyleApplied?: () => void;
}

export default function EditStyleModal({
  open,
  onOpenChange,
  currentStyleId,
  highlightId,
  videoUrl,
  startTime,
  endTime,
  captions,
  onStyleApplied,
}: EditStyleModalProps) {
  const [selectedStyle, setSelectedStyle] = useState(currentStyleId);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      const { applyCaptionStyle } = await import('@/app/actions/video');
      const result = await applyCaptionStyle(highlightId, selectedStyle);
      if (result.success) {
        onStyleApplied?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('[EditStyleModal] Apply failed:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Caption Style</DialogTitle>
        </DialogHeader>

        {/* 3x3 Grid of Styles */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all hover:border-primary/50',
                selectedStyle === style.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              {/* Style Preview Box */}
              <div
                className="w-full h-16 rounded-md flex items-center justify-center text-sm font-medium"
                style={getStylePreviewStyle(style.id)}
              >
                Sample Text
              </div>
              <span className="text-xs font-medium">{style.name}</span>
              {selectedStyle === style.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={applying}>
            {applying ? 'Applying...' : 'Apply Style'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Get a simplified preview style for the style selection grid.
 * This is NOT the Remotion render — just a visual hint for the user.
 */
function getStylePreviewStyle(styleId: string): React.CSSProperties {
  const previewStyles: Record<string, React.CSSProperties> = {
    'karaoke-white': {
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.6)',
      textShadow: '0px 0px 4px rgba(0,0,0,0.8)',
    },
    'karaoke-teal': {
      color: '#2DD4BF',
      backgroundColor: 'rgba(0,0,0,0.6)',
      textShadow: '0px 0px 4px rgba(0,0,0,0.8)',
    },
    'pop-on-amber': {
      color: '#FBBF24',
      backgroundColor: 'transparent',
      fontWeight: 800,
      textTransform: 'uppercase',
      textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
    },
    'pop-on-white': {
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      fontWeight: 800,
      textTransform: 'uppercase',
      textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
    },
    'subtitle-outline': {
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      WebkitTextStroke: '0.5px #000',
    },
    'subtitle-teal': {
      color: '#2DD4BF',
      backgroundColor: 'transparent',
      textShadow: '0px 0px 4px rgba(0,0,0,0.8)',
    },
    'box-dark': {
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderRadius: '6px',
    },
    'box-teal': {
      color: '#042F2E',
      backgroundColor: 'rgba(45,212,191,0.9)',
      borderRadius: '6px',
    },
    'glow-amber': {
      color: '#FBBF24',
      backgroundColor: 'transparent',
      textShadow: '0px 0px 12px rgba(251,191,36,0.5)',
    },
  };

  return previewStyles[styleId] || previewStyles['karaoke-white'];
}
