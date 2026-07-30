import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users, socialConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SOCIAL_PLATFORMS } from '@/config/ayrshare';
import { Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect('/sign-in');

  // Resolve internal user ID from Clerk ID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) redirect('/sign-in');

  // Get user's existing connections
  const userConnections = await db
    .select()
    .from(socialConnections)
    .where(eq(socialConnections.userId, user.id));

  const connectedPlatforms = new Set(userConnections.map((c) => c.platform));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Social Connections</h1>
        <p className="text-muted-foreground mt-1">
          Connect your social media accounts to schedule and publish short clips
          directly from JediClip.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const isConnected = connectedPlatforms.has(platform.id);

          return (
            <div
              key={platform.id}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <h3 className="font-medium text-sm">{platform.name}</h3>
                  {isConnected && (
                    <span className="text-xs text-success flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                </div>
              </div>

              {isConnected ? (
                <form action={async () => {
                  'use server';
                  const { disconnectPlatform } = await import('@/lib/ayrshare');
                  const { auth } = await import('@clerk/nextjs/server');
                  const { userId: clerkId } = await auth();
                  if (!clerkId) return;
                  await disconnectPlatform(platform.id);
                  // Remove from our DB
                  const { db } = await import('@/db');
                  const { users, socialConnections } = await import('@/db/schema');
                  const { eq, and } = await import('drizzle-orm');
                  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, clerkId)).limit(1);
                  if (!u) return;
                  await db
                    .delete(socialConnections)
                    .where(
                      and(
                        eq(socialConnections.userId, u.id),
                        eq(socialConnections.platform, platform.id)
                      )
                    );
                }}>
                  <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                    <Unlink className="h-3 w-3" />
                    Disconnect
                  </Button>
                </form>
              ) : (
                <form action={async () => {
                  'use server';
                  const { connectPlatform } = await import('@/lib/ayrshare');
                  const { auth } = await import('@clerk/nextjs/server');
                  const { userId: clerkId } = await auth();
                  if (!clerkId) return;
                  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/connections`;
                  const result = await connectPlatform(platform.id, callbackUrl);
                  if (result.authorizationUrl) {
                    // In production, redirect user to the authorization URL
                    // For now, save the connection to our DB
                    const { db } = await import('@/db');
                    const { users, socialConnections } = await import('@/db/schema');
                    const { eq } = await import('drizzle-orm');
                    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, clerkId)).limit(1);
                    if (!u) return;
                    await db.insert(socialConnections).values({
                      userId: u.id,
                      platform: platform.id,
                      platformUserId: 'pending',
                    });
                  }
                }}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Link2 className="h-3 w-3" />
                    Connect
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
