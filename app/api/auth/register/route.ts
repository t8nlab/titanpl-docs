import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check existing
        const existing = await db.query.users.findFirst({
            where: eq(users.email, email)
        });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const uid = crypto.randomUUID();

        await db.insert(users).values({
            uid,
            username,
            email,
            password: hashedPassword,
        });

        return NextResponse.json({ success: true, uid });
    } catch (e) {
        console.error("Register Error:", e);
        return NextResponse.json({ error: "Register failed" }, { status: 500 });
    }
}
