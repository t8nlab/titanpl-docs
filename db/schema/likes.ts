import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";

export const likes = pgTable(
    "likes",
    {
        userId: text("user_id")
            .references(() => users.uid)
            .notNull(),
        postId: text("post_id")
            .references(() => posts.pid)
            .notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.postId] }),
    })
);
