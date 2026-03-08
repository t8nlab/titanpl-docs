import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  uid: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false), // Field for official extension management
  createdAt: timestamp("created_at").defaultNow(),
});
