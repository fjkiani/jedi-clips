export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { videos, highlights, transcripts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ShortClipCard from '@/components/dashboard/ShortClipCard';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

type VideoStatus = 'uploading' | 'processing' | 'completed' | 'failed';

const steps = [
  { key: 'uploading', label: 'Upload' },
  { key: 'processing', label: 'AI Analysis' },
  { key: 'completed', label: 'Ready' },
];

function getStepIndex(status: VideoStatus): number {
  if (status === 'failed') return -1;
  return steps.findIndex((s) => s.key === status);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  // Fetch video with transcript and highlights
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: {
      transcript: true,
      highlights: true,
    },
  });

  if (!video || video.clerkUserId !== userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Video not found</p>
        <Link
          href="/dashboard"
          className="text-primary hover:underline text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const status = (video.status as VideoStatus) || 'uploading';
  const currentStep = getStepIndex(status);
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{video.fileName || 'Untitled Video'}</h1>
          <p className="text-sm text-muted-foreground">
            {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Duration unknown'}
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      {!isCompleted && (
        <div className="flex items-center gap-2 py-4">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isPending = i > currentStep;

            return (
              <div key={step.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : isPending
                        ? 'bg-muted text-muted-foreground'
                        : ''
                    } ${isFailed && i === currentStep ? 'bg-destructive/20 text-destructive border-2 border-destructive' : ''}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isFailed && isActive ? (
                      <XCircle className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-foreground'
                        : isDone
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-12 ${
                      isDone ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Processing Message */}
      {status === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-lg font-medium">AI is analyzing your video...</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Deepgram is transcribing your audio and Gemini is selecting the most
            engaging moments. This usually takes 30-60 seconds.
          </p>
        </div>
      )}

      {/* Failed Message */}
      {isFailed && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-lg font-medium">Processing failed</p>
          <p className="text-sm text-muted-foreground">
            Something went wrong. Please try uploading again.
          </p>
        </div>
      )}

      {/* Short Clips Grid */}
      {isCompleted && video.highlights && video.highlights.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Generated Shorts ({video.highlights.length})
            </h2>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Upload another video
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {video.highlights.map((highlight) => (
              <ShortClipCard
                key={highlight.id}
                highlight={highlight}
                videoR2Url={video.r2Url || ''}
              />
            ))}
          </div>
        </section>
      )}

      {/* Transcript Section */}
      {video.transcript && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Transcript</h2>
          <div className="rounded-xl border border-border/50 bg-card p-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {video.transcript.fullText}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
