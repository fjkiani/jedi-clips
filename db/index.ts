import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Database client.
 *
 * Next.js evaluates route modules at build time ("Collecting page data"),
 * when DATABASE_URL is not available. We detect the build phase and
 * create a dummy client that will never actually be queried — the real
 * connection only happens at runtime when a request comes in.
 */

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url && !isBuildPhase) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  // During build, use a dummy connection string that will never connect
  const client = postgres(
    url || 'postgresql://build:build@localhost:5432/build',
    {
      ssl:
        process.env.NODE_ENV === 'production' && !isBuildPhase
          ? 'require'
          : false,
      // Prevent actual connections during build
      ...(isBuildPhase ? { max: 0, idle_timeout: 0, connect_timeout: 0 } : {}),
    }
  );

  return drizzle(client, { schema });
}

export const db = createDb();
