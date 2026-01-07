import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, likes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const postId = params.id;
    const userId = session.uid;

    try {
        // Check if liked
        const existingLike = await db.select().from(likes).where(
            and(eq(likes.userId, userId), eq(likes.postId, postId))
        ).limit(1);

        if (existingLike.length > 0) {
            // Unlike
            await db.delete(likes).where(
                and(eq(likes.userId, userId), eq(likes.postId, postId))
            );
            await db.update(posts)
                .set({ likes: sql`${posts.likes} - 1` })
                .where(eq(posts.pid, postId));

            return NextResponse.json({ liked: false });
        } else {
            // Like
            await db.insert(likes).values({
                userId,
                postId
            });
            await db.update(posts)
                .set({ likes: sql`${posts.likes} + 1` })
                .where(eq(posts.pid, postId));

            return NextResponse.json({ liked: true });
        }
    } catch (e) {
        console.error("Like Toggle Error:", e);
        return NextResponse.json({ error: "Action failed" }, { status: 500 });
    }
}
