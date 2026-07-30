import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Progress stepper skeleton */}
      <div className="flex items-center gap-2 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
            {i < 2 && <Skeleton className="h-px w-12" />}
          </div>
        ))}
      </div>

      {/* Clips grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
