import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and, isNull, inArray } from "drizzle-orm"; // Ensure imports

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    try {
        const roots = await db.select({
            id: comments.id,
            content: comments.content,
            parentId: comments.parentId,
            createdAt: comments.createdAt,
            userId: comments.userId,
            username: users.username,
            avatarUrl: users.avatarUrl
        })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.uid))
            .where(
                and(
                    eq(comments.postId, postId),
                    isNull(comments.parentId)
                )
            )
            .orderBy(desc(comments.createdAt))
            .limit(limit)
            .offset(offset);

        const rootIds = roots.map(r => r.id);
        let allRelatedComments = [...roots];

        if (rootIds.length > 0) {
            const children = await db.select({
                id: comments.id,
                content: comments.content,
                parentId: comments.parentId,
                createdAt: comments.createdAt,
                userId: comments.userId,
                username: users.username,
                avatarUrl: users.avatarUrl
            })
                .from(comments)
                .innerJoin(users, eq(comments.userId, users.uid))
                .where(
                    and(
                        eq(comments.postId, postId),
                        inArray(comments.parentId, rootIds)
                    )
                )
                .orderBy(comments.createdAt);

            allRelatedComments = [...allRelatedComments, ...children];
        }

        return NextResponse.json(allRelatedComments);
    } catch (e) {
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
