import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";

export const comments = pgTable("comments", {
    id: text("id").primaryKey(),
    content: text("content").notNull(),
    postId: text("post_id").references(() => posts.pid).notNull(),
    userId: text("user_id").references(() => users.uid).notNull(),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collaborators = pgTable("collaborators", {
    postId: text("post_id").references(() => posts.pid).notNull(),
    userId: text("user_id").references(() => users.uid).notNull(),
}, (t) => ({
    pk: primaryKey(t.postId, t.userId),
}));
