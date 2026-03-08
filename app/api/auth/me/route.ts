import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ user: null });
    }

    // Always fetch fresh data from DB to ensure permissions (like isAdmin) are current
    const user = await db.query.users.findFirst({
        where: eq(users.uid, session.uid)
    });

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({
        user: {
            uid: user.uid,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            avatarUrl: user.avatarUrl
        }
    });
}
