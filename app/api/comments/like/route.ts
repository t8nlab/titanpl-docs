import { NextResponse } from "next/server";
import { db } from "@/db";
import { commentLikes } from "@/db/schema/likes";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { commentId } = await req.json();
        if (!commentId) return NextResponse.json({ error: "Missing commentId" }, { status: 400 });

        const existingLike = await db.select().from(commentLikes)
            .where(and(eq(commentLikes.userId, session.uid), eq(commentLikes.commentId, commentId)));

        if (existingLike.length > 0) {
            // Unlike
            await db.delete(commentLikes)
                .where(and(eq(commentLikes.userId, session.uid), eq(commentLikes.commentId, commentId)));
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await db.insert(commentLikes).values({
                userId: session.uid,
                commentId,
            });
            return NextResponse.json({ liked: true });
        }
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
    }
}
