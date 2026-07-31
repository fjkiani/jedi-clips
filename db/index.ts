import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Lazy database initialization.
 *
 * Next.js evaluates route modules at build time ("Collecting page data"),
 * when DATABASE_URL is not available. Throwing at module scope kills the
 * build. Instead, connect on first use (first actual request at runtime).
 */

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbClient | null = null;

function getDb(): DbClient {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  const client = postgres(url, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  });

  _db = drizzle(client, { schema });
  return _db;
}

// Proxy so existing call sites (`db.select()`, `db.query.*`, etc.) work
// unchanged while the real client is only created on first use.
export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
