import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { comparePassword, signToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = signToken({ uid: user.uid, username: user.username, avatarUrl: user.avatarUrl });

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return NextResponse.json({ success: true, user: { uid: user.uid, username: user.username, email: user.email, avatarUrl: user.avatarUrl } });
    } catch (e) {
        console.error("Login Error:", e);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
