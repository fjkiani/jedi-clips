import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getScheduledPosts } from '@/app/actions/schedule';
import { Calendar, Clock, Send, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cancelScheduledPost } from '@/app/actions/schedule';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const posts = await getScheduledPosts();

  // Group posts by date
  const postsByDate = new Map<string, typeof posts>();
  for (const p of posts) {
    const dateKey = p.post.scheduledAt.toISOString().split('T')[0];
    if (!postsByDate.has(dateKey)) {
      postsByDate.set(dateKey, []);
    }
    postsByDate.get(dateKey)!.push(p);
  }

  const sortedDates = [...postsByDate.keys()].sort();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled social media posts for rendered clips.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {posts.length} scheduled
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No scheduled posts</h3>
          <p className="text-muted-foreground mt-1 max-w-md">
            Render a short clip and schedule it to post across your connected
            social media accounts.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {sortedDates.map((dateKey) => {
            const date = new Date(dateKey + 'T00:00:00');
            const dayPosts = postsByDate.get(dateKey)!;
            const isToday =
              dateKey === new Date().toISOString().split('T')[0];

            return (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h2>
                  {isToday && (
                    <Badge variant="secondary" className="text-xs">
                      Today
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {dayPosts.map(({ post, highlight, video }) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2">
                          <span className="text-xs text-muted-foreground">
                            {post.scheduledAt.toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <h3 className="font-medium text-sm">
                            {post.postTitle || highlight.title || 'Untitled Clip'}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {video.fileName} &middot; {highlight.startTime?.toFixed(0)}s–{highlight.endTime?.toFixed(0)}s
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {(post.platforms as string[]).map((platform) => (
                              <Badge
                                key={platform}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={post.status} />

                        {post.status === 'pending' && (
                          <form action={async () => {
                            'use server';
                            await cancelScheduledPost(post.id);
                          }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-destructive"
                            >
                              <XCircle className="h-3 w-3" />
                              Cancel
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'posted':
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20">
          <Send className="h-3 w-3" />
          Posted
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
