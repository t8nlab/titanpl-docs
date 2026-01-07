import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const posts = pgTable("posts", {
  pid: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  link: text("link"),
  imageUrl: text("image_url"),
  description: text("description"),
  authorId: text("author_id")
    .references(() => users.uid)
    .notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
