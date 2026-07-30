'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Syncs the currently authenticated Clerk user into our Neon database.
 * Called on every dashboard visit to ensure user record exists and is up-to-date.
 * Uses upsert pattern: check if user exists, insert if not, update if changed.
 */
export async function syncCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { success: false, error: 'Clerk user not found' };
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { success: false, error: 'No email address found' };
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (existing) {
      // Update if any fields changed
      await db
        .update(users)
        .set({
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        })
        .where(eq(users.clerkUserId, userId));
    } else {
      // Insert new user
      await db.insert(users).values({
        clerkUserId: userId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[syncCurrentUser] Error:', error);
    return { success: false, error: 'Failed to sync user' };
  }
}
