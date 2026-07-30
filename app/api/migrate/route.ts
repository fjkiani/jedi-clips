import { NextResponse } from 'next/server';
import postgres from 'postgres';

/**
 * One-time database migration endpoint.
 * Creates all tables and enums if they don't exist.
 * Safe to call multiple times (idempotent).
 */
export async function GET() {
  try {
    const sql = postgres(process.env.DATABASE_URL!, {
      ssl: 'require',
    });

    // Create enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE video_status AS ENUM ('uploading', 'processing', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE highlight_status AS ENUM ('pending', 'clipping', 'rendering', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE render_status AS ENUM ('pending', 'rendering', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE post_status AS ENUM ('pending', 'posted', 'failed');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_user_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        clerk_user_id TEXT NOT NULL,
        file_name TEXT,
        r2_url TEXT,
        status video_status DEFAULT 'uploading',
        duration INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transcripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        raw_json JSONB,
        full_text TEXT,
        caption TEXT,
        language TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS highlights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        title TEXT,
        start_time REAL,
        end_time REAL,
        score INTEGER,
        seo_score INTEGER,
        reason TEXT,
        transcript_segment TEXT,
        caption_segment TEXT,
        caption_style_id TEXT DEFAULT 'karaoke-white',
        render_status render_status DEFAULT 'pending',
        rendered_video_r2_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS caption_styles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        preview_url TEXT,
        config JSONB
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS social_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        platform_user_id TEXT,
        connected_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        highlight_id UUID NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
        platforms JSONB NOT NULL,
        post_title TEXT,
        post_description TEXT,
        scheduled_at TIMESTAMP NOT NULL,
        status post_status DEFAULT 'pending',
        posted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Seed caption styles
    const styles = [
      { id: 'karaoke-white', name: 'Karaoke White' },
      { id: 'karaoke-teal', name: 'Karaoke Teal' },
      { id: 'pop-on-amber', name: 'Pop-on Amber' },
      { id: 'pop-on-white', name: 'Pop-on White' },
      { id: 'subtitle-outline', name: 'Subtitle Outline' },
      { id: 'subtitle-teal', name: 'Subtitle Teal' },
      { id: 'box-dark', name: 'Box Dark' },
      { id: 'box-teal', name: 'Box Teal' },
      { id: 'glow-amber', name: 'Glow Amber' },
    ];

    for (const style of styles) {
      await sql`
        INSERT INTO caption_styles (id, name)
        VALUES (${style.id}, ${style.name})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    await sql.end();

    return NextResponse.json({
      success: true,
      message: 'Database migration completed — all tables and enums created',
    });
  } catch (error) {
    console.error('[migrate] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
