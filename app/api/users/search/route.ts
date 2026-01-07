import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const results = await db
            .select({
                uid: users.uid,
                username: users.username,
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(ilike(users.username, `${query}%`))
            .limit(5);

        return NextResponse.json(results);
    } catch (e) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
