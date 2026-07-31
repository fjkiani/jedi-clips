import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Database client with lazy initialization.
 *
 * Next.js evaluates route modules at build time ("Collecting page data"),
 * when DATABASE_URL is not available. We defer the postgres connection
 * until the first actual query at runtime.
 */

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | undefined;

function getDb(): Db {
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

/**
 * Export a proxy that lazily initializes the real db client on first use.
 * This allows module-scope imports without triggering a connection at build time.
 */
export const db: Db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    const real = getDb() as any;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
