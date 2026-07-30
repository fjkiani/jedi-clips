import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Bell, Shield, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect('/sign-in');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Badge variant="secondary">Free</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Unknown'}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <a
            href="https://manage.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1">
              Manage in Clerk
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Notification preferences coming soon. You&apos;ll be able to configure
          email alerts for render completions, scheduled posts, and more.
        </p>
      </section>

      {/* Security Section */}
      <section className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Two-Factor Auth</span>
            <Badge variant="outline">Managed by Clerk</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Sessions</span>
            <a
              href="https://manage.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1">
                View Sessions
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-destructive/20 bg-card p-6">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button variant="destructive" size="sm" disabled>
          Delete Account
        </Button>
      </section>
    </div>
  );
}
