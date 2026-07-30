export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import VideoUpload from '@/components/dashboard/VideoUpload';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { Video } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();

  let userVideos: typeof videos.$inferSelect[] = [];
  if (userId) {
    userVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.clerkUserId, userId))
      .orderBy(desc(videos.createdAt))
      .limit(10);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Upload Hero */}
      <section className="flex flex-col items-center text-center gap-4 py-8">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Upload your video
        </h1>
        <p className="text-muted-foreground max-w-md">
          Drop a long video and JediClip will find the best moments, generate
          captions, and create viral-ready shorts.
        </p>
      </section>

      {/* Upload Zone */}
      <VideoUpload />

      {/* Recent Projects */}
      {userVideos.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVideos.map((video) => (
              <ProjectCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
