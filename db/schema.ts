import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──

export const videoStatusEnum = pgEnum("video_status", [
  "uploading",
  "processing",
  "completed",
  "failed",
]);

export const highlightStatusEnum = pgEnum("highlight_status", [
  "pending",
  "clipping",
  "rendering",
  "completed",
  "failed",
]);

export const renderStatusEnum = pgEnum("render_status", [
  "pending",
  "rendering",
  "completed",
  "failed",
]);

export const postStatusEnum = pgEnum("post_status", [
  "pending",
  "posted",
  "failed",
]);

// ── Tables ──

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clerkUserId: text("clerk_user_id").notNull(),
  fileName: text("file_name"),
  r2Url: text("r2_url"),
  status: videoStatusEnum("status").default("uploading"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const transcripts = pgTable("transcripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  rawJson: jsonb("raw_json"),
  fullText: text("full_text"),
  caption: text("caption"),
  language: text("language"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title"),
  startTime: real("start_time"),
  endTime: real("end_time"),
  score: integer("score"),
  seoScore: integer("seo_score"),
  reason: text("reason"),
  transcriptSegment: text("transcript_segment"),
  captionSegment: text("caption_segment"),
  captionStyleId: text("caption_style_id").default("karaoke-white"),
  renderStatus: renderStatusEnum("render_status").default("pending"),
  renderedVideoR2Url: text("rendered_video_r2_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const captionStyles = pgTable("caption_styles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  previewUrl: text("preview_url"),
  config: jsonb("config"),
});

export const socialConnections = pgTable("social_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  platform: text("platform").notNull(),
  platformUserId: text("platform_user_id"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  highlightId: uuid("highlight_id")
    .references(() => highlights.id, { onDelete: "cascade" })
    .notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(),
  postTitle: text("post_title"),
  postDescription: text("post_description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: postStatusEnum("status").default("pending"),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ──

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  socialConnections: many(socialConnections),
  scheduledPosts: many(scheduledPosts),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  highlights: many(highlights),
  transcript: one(transcripts, {
    fields: [videos.id],
    references: [transcripts.videoId],
  }),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  video: one(videos, {
    fields: [transcripts.videoId],
    references: [videos.id],
  }),
}));

export const highlightsRelations = relations(highlights, ({ one }) => ({
  video: one(videos, {
    fields: [highlights.videoId],
    references: [videos.id],
  }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  user: one(users, {
    fields: [socialConnections.userId],
    references: [users.id],
  }),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one }) => ({
  user: one(users, {
    fields: [scheduledPosts.userId],
    references: [users.id],
  }),
  highlight: one(highlights, {
    fields: [scheduledPosts.highlightId],
    references: [highlights.id],
  }),
}));
