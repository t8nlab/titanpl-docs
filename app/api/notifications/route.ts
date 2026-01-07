import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, likes, comments, collaborators, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, ne, desc, sql } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json([]); // Return empty if not logged in
        }

        const uid = session.uid;

        // 1. Likes on my posts
        const myLikes = await db.select({
            type: sql<string>`'like'`,
            actorName: users.username,
            actorAvatar: users.avatarUrl,
            postId: posts.pid,
            postTitle: posts.title,
            createdAt: likes.createdAt
        })
            .from(likes)
            .innerJoin(posts, eq(likes.postId, posts.pid))
            .innerJoin(users, eq(likes.userId, users.uid))
            .where(and(
                eq(posts.authorId, uid),
                ne(likes.userId, uid) // Don't notify self-likes
            ));

        // 2. Comments on my posts
        const myComments = await db.select({
            type: sql<string>`'comment'`,
            actorName: users.username,
            actorAvatar: users.avatarUrl,
            postId: posts.pid,
            postTitle: posts.title,
            createdAt: comments.createdAt,
            content: comments.content
        })
            .from(comments)
            .innerJoin(posts, eq(comments.postId, posts.pid))
            .innerJoin(users, eq(comments.userId, users.uid))
            .where(and(
                eq(posts.authorId, uid),
                ne(comments.userId, uid)
            ));

        // 3. Mentions (Collaborations)
        const myMentions = await db.select({
            type: sql<string>`'mention'`,
            actorName: users.username,
            actorAvatar: users.avatarUrl,
            postId: posts.pid,
            postTitle: posts.title,
            createdAt: posts.createdAt // Post creation time
        })
            .from(collaborators)
            .innerJoin(posts, eq(collaborators.postId, posts.pid))
            .innerJoin(users, eq(posts.authorId, users.uid)) // The post author mentioned me
            .where(and(
                eq(collaborators.userId, uid),
                ne(posts.authorId, uid) // Don't notify if I added myself (unlikely but good safety)
            ));

        // Merge and Sort
        const notifications = [
            ...myLikes.map(i => ({ ...i, type: 'like' })),
            ...myComments.map(i => ({ ...i, type: 'comment' })),
            ...myMentions.map(i => ({ ...i, type: 'mention' }))
        ]
            // @ts-ignore
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(notifications);

    } catch (e) {
        console.error("Notifications Error:", e);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
