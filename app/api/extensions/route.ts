import { NextResponse } from "next/server";
import { db } from "@/db";
import { extensions, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc, eq, lt } from "drizzle-orm";

const OFFICIAL_PREFIXES = ["@t8n/", "@tgrv/", "@titanpl/"];

function isOfficialPackage(npmPackage: string) {
    return OFFICIAL_PREFIXES.some(prefix => npmPackage.startsWith(prefix));
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12"), 1), 50);
        const cursor = searchParams.get("cursor"); // ISO timestamp

        const allExtensions = await db.query.extensions.findMany({
            ...(cursor ? { where: lt(extensions.createdAt, new Date(cursor)) } : {}),
            orderBy: [desc(extensions.isOfficial), desc(extensions.createdAt)],
            limit: limit + 1, // fetch one extra to determine if there's more
            with: {
                publisher: {
                    columns: {
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        const hasMore = allExtensions.length > limit;
        const data = hasMore ? allExtensions.slice(0, limit) : allExtensions;
        const nextCursor = hasMore ? data[data.length - 1].createdAt : null;

        return NextResponse.json({ data, nextCursor });
    } catch (e) {
        console.error("Fetch Extensions Error:", e);
        return NextResponse.json({ error: "Failed to fetch extensions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Always fetch fresh data from DB for permission checks
        const user = await db.query.users.findFirst({
            where: eq(users.uid, session.uid)
        });

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, npmPackage, githubRepo, docsLink, description } = await req.json();

        if (!name || !npmPackage || !githubRepo) {
            return NextResponse.json({ error: "Name, NPM Package, and GitHub Repo are required" }, { status: 400 });
        }

        const isOfficial = isOfficialPackage(npmPackage);

        // Security check
        if (isOfficial) {
            const AUTHORIZED_EMAILS = ["clashersoham07@gmail.com", "clashwithashu02@gmail.com", "ashu@titanpl.com", "team@t8nlab.com"];
            const isAuthorized = user.isAdmin || (user.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase()));

            if (!isAuthorized) {
                return NextResponse.json({
                    error: "Unauthorized: Only @titanpl teammates or admins can register official extensions."
                }, { status: 403 });
            }
        }

        // Check if name is somewhat consistent with NPM package
        // e.g. @t8n/auth should have name containing 'Auth'
        const baseNpmName = npmPackage.split('/').pop()?.toLowerCase() || '';
        const lowerName = name.toLowerCase();
        if (!lowerName.includes(baseNpmName) && !baseNpmName.includes(lowerName)) {
            return NextResponse.json({
                error: `Extension name "${name}" must be consistent with NPM package "${npmPackage}".`
            }, { status: 400 });
        }

        const newExtension = await db.insert(extensions).values({
            name,
            npmPackage,
            githubRepo,
            docsLink,
            description,
            publisherId: session.uid,
            isOfficial,
        }).returning();

        return NextResponse.json(newExtension[0]);
    } catch (e: any) {
        console.error("Register Extension Error:", e);
        if (e.code === '23505') {
            return NextResponse.json({ error: "Extension with this NPM package already registered" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to register extension" }, { status: 500 });
    }
}
