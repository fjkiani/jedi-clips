import Link from 'next/link';
import { FileVideo, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type VideoStatus = 'uploading' | 'processing' | 'completed' | 'failed';

interface ProjectCardProps {
  video: {
    id: string;
    fileName: string | null;
    status: VideoStatus | null;
    duration: number | null;
    createdAt: Date;
  };
}

const statusConfig: Record<
  VideoStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  uploading: {
    label: 'Uploading',
    icon: Loader2,
    color: 'text-muted-foreground',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    color: 'text-primary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-success',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-destructive',
  },
};

export default function ProjectCard({ video }: ProjectCardProps) {
  const status = (video.status as VideoStatus) || 'uploading';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/dashboard/project/${video.id}`}>
      <div className="group rounded-xl border border-border/50 bg-card p-4 hover:border-primary/50 transition-all">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileVideo className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {video.fileName || 'Untitled Video'}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1',
                  status === 'processing' || status === 'uploading'
                    ? 'animate-pulse'
                    : '',
                  config.color
                )}
              >
                <StatusIcon
                  className={cn(
                    'h-3 w-3',
                    status === 'processing' || status === 'uploading'
                      ? 'animate-spin'
                      : ''
                  )}
                />
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
