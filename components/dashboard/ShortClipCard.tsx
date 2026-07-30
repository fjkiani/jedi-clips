'use client';

import { useState } from 'react';
import {
  Download,
  Palette,
  CalendarClock,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HighlightData {
  id: string;
  title: string | null;
  startTime: number | null;
  endTime: number | null;
  score: number | null;
  seoScore: number | null;
  reason: string | null;
  transcriptSegment: string | null;
  captionStyleId: string | null;
  renderStatus: 'pending' | 'rendering' | 'completed' | 'failed' | null;
  renderedVideoR2Url: string | null;
}

interface ShortClipCardProps {
  highlight: HighlightData;
  videoR2Url: string;
}

const renderStatusConfig = {
  pending: { label: 'Not rendered', color: 'text-muted-foreground' },
  rendering: { label: 'Rendering...', color: 'text-primary' },
  completed: { label: 'Ready', color: 'text-success' },
  failed: { label: 'Failed', color: 'text-destructive' },
};

export default function ShortClipCard({
  highlight,
  videoR2Url,
}: ShortClipCardProps) {
  const [rendering, setRendering] = useState(false);
  const renderStatus = highlight.renderStatus || 'pending';
  const statusConfig = renderStatusConfig[renderStatus];

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const duration =
    highlight.startTime !== null && highlight.endTime !== null
      ? Math.round(highlight.endTime - highlight.startTime)
      : null;

  const handleRender = async () => {
    setRendering(true);
    try {
      const { triggerRender } = await import('@/app/actions/video');
      await triggerRender(highlight.id);
    } catch (error) {
      console.error('[ShortClipCard] Render failed:', error);
    } finally {
      setRendering(false);
    }
  };

  const handleDownload = async () => {
    if (!highlight.renderedVideoR2Url) return;
    // Get a presigned download URL via server action
    const { getRenderDownloadUrl } = await import('@/app/actions/video');
    const result = await getRenderDownloadUrl(highlight.id);
    if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="group rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-all">
      {/* Video Preview Area */}
      <div className="relative aspect-[9/16] max-h-48 bg-muted flex items-center justify-center overflow-hidden">
        {videoR2Url ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Play className="h-8 w-8" />
            <span className="text-xs">
              {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
            </span>
          </div>
        ) : (
          <div className="text-muted-foreground text-xs">No preview</div>
        )}

        {/* SEO Score Badge */}
        {highlight.seoScore !== null && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="font-mono text-sm bg-accent/20 text-accent border-accent/30"
            >
              {highlight.seoScore}
            </Badge>
          </div>
        )}

        {/* Duration Badge */}
        {duration !== null && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {duration}s
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-medium text-sm line-clamp-2">
          {highlight.title || 'Untitled Clip'}
        </h3>

        {highlight.reason && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {highlight.reason}
          </p>
        )}

        {/* Score Bar */}
        {highlight.score !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${highlight.score}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {highlight.score}
            </span>
          </div>
        )}

        {/* Render Status */}
        <div className={cn('text-xs flex items-center gap-1', statusConfig.color)}>
          {renderStatus === 'rendering' && <Loader2 className="h-3 w-3 animate-spin" />}
          {renderStatus === 'completed' && <CheckCircle2 className="h-3 w-3" />}
          {renderStatus === 'failed' && <XCircle className="h-3 w-3" />}
          {statusConfig.label}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pt-1">
          {renderStatus === 'completed' ? (
            <Button size="sm" variant="default" className="gap-1 flex-1 text-xs" onClick={handleDownload}>
              <Download className="h-3 w-3" />
              Download
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 flex-1 text-xs"
              onClick={handleRender}
              disabled={rendering || renderStatus === 'rendering'}
            >
              {rendering || renderStatus === 'rendering' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              {rendering || renderStatus === 'rendering' ? 'Rendering...' : 'Render'}
            </Button>
          )}
          <a href={`/dashboard/project/${highlight.id}/style`}>
            <Button size="sm" variant="ghost" className="gap-1 text-xs">
              <Palette className="h-3 w-3" />
            </Button>
          </a>
          <a href={`/dashboard/schedule?highlight=${highlight.id}`}>
            <Button size="sm" variant="ghost" className="gap-1 text-xs">
              <CalendarClock className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
