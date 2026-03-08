import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const extensions = pgTable("extensions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    npmPackage: text("npm_package").notNull().unique(), // Unique NPM package name
    githubRepo: text("github_repo"),
    docsLink: text("docs_link"),
    description: text("description"),
    publisherId: text("publisher_id").references(() => users.uid),
    isOfficial: boolean("is_official").default(false), // Calculated on insert usually
    createdAt: timestamp("created_at").defaultNow(),
});

export const extensionsRelations = relations(extensions, ({ one }) => ({
    publisher: one(users, {
        fields: [extensions.publisherId],
        references: [users.uid],
    }),
}));
