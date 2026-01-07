import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and, isNull, inArray } from "drizzle-orm"; // Ensure imports

import { sql } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const parentId = searchParams.get('parentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    try {
        const query = db.select({
            id: comments.id,
            content: comments.content,
            parentId: comments.parentId,
            createdAt: comments.createdAt,
            userId: comments.userId,
            username: users.username,
            avatarUrl: users.avatarUrl,
            replyCount: sql<number>`(SELECT count(*)::int FROM comments c2 WHERE c2.parent_id = ${comments.id})`
        })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.uid));

        let conditions = eq(comments.postId, postId);

        if (parentId) {
            conditions = and(conditions, eq(comments.parentId, parentId))!;
        } else {
            conditions = and(conditions, isNull(comments.parentId))!;
        }

        const data = await query.where(conditions)
            .orderBy(parentId ? comments.createdAt : desc(comments.createdAt)) // Oldest first for replies, Newest for roots
            .limit(limit)
            .offset(offset);

        // Transform count to number
        const formatted = data.map(c => ({
            ...c,
            replyCount: parseInt(String(c.replyCount || 0), 10)
        }));

        // console.log("Debug Comments:", formatted);

        return NextResponse.json(formatted);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { postId, content, parentId } = await req.json();
        if (!postId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const cid = crypto.randomUUID();
        await db.insert(comments).values({
            id: cid,
            postId,
            userId: session.uid,
            content,
            parentId: parentId || null // Handle replies
        });

        return NextResponse.json({ success: true, cid });
    } catch (e) {
        return NextResponse.json({ error: "Failed to comment" }, { status: 500 });
    }
}
