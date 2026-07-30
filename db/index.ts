import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string');
}

const client = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export const db = drizzle(client, { schema });
