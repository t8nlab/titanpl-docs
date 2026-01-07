import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, likes, collaborators, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const pid = params.id;
        const session = await getSession();

        const post = await db.select({
            pid: posts.pid,
            title: posts.title,
            content: posts.content,
            link: posts.link,
            imageUrl: posts.imageUrl,
            description: posts.description,
            likes: posts.likes,
            createdAt: posts.createdAt,
            authorId: posts.authorId,
            authorName: users.username,
            authorAvatar: users.avatarUrl
        })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.uid))
            .where(eq(posts.pid, pid))
            .then(res => res[0]);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Fetch Likes
        let isLiked = false;
        if (session) {
            const liked = await db.select().from(likes).where(and(eq(likes.postId, pid), eq(likes.userId, session.uid)));
            isLiked = liked.length > 0;
        }

        // Fetch Collaborators
        const collabs = await db.select({
            postId: collaborators.postId,
            username: users.username,
            uid: users.uid,
            avatarUrl: users.avatarUrl
        })
            .from(collaborators)
            .innerJoin(users, eq(collaborators.userId, users.uid))
            .where(eq(collaborators.postId, pid));

        return NextResponse.json({
            ...post,
            isLiked,
            collaborators: collabs,
            author: {
                username: post.authorName || 'Unknown',
                avatarUrl: post.authorAvatar
            }
        });

    } catch (e) {
        console.error("Get Single Post Error:", e);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

import { and } from "drizzle-orm";
