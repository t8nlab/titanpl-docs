import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, likes, collaborators, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc, eq, inArray } from "drizzle-orm";

// Simple in-memory rate limiter
const rateLimit = new Map<string, number[]>();

const checkRateLimit = (ip: string) => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    if (!rateLimit.has(ip)) rateLimit.set(ip, []);

    const timestamps = rateLimit.get(ip) || [];
    // Filter out old timestamps
    const recent = timestamps.filter(t => t > windowStart);

    if (recent.length >= 100) return false; // 100 requests per minute

    recent.push(now);
    rateLimit.set(ip, recent);
    return true;
};

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');
        // We want half new, half popular per page
        const subLimit = Math.ceil(limit / 2);
        const subOffset = (page - 1) * subLimit;

        const session = await getSession();

        // Fetch Recent Posts (5)
        const recentPostsPromise = db.select({
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
            .orderBy(desc(posts.createdAt))
            .limit(subLimit)
            .offset(subOffset);

        // Fetch Popular Posts (5)
        const popularPostsPromise = db.select({
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
            .orderBy(desc(posts.likes))
            .limit(subLimit)
            .offset(subOffset);

        const [recentPosts, popularPosts] = await Promise.all([recentPostsPromise, popularPostsPromise]);

        // Interleave: 5 Recent, 5 Popular, Repeat...
        const interleavedPosts: typeof recentPosts = [];
        let r = 0, p = 0;
        while (r < recentPosts.length || p < popularPosts.length) {
            if (r < recentPosts.length) interleavedPosts.push(...recentPosts.slice(r, r + 5));
            if (p < popularPosts.length) interleavedPosts.push(...popularPosts.slice(p, p + 5));
            r += 5;
            p += 5;
        }

        const uniquePosts = new Map();
        interleavedPosts.forEach(p => uniquePosts.set(p.pid, p));
        const finalPosts = Array.from(uniquePosts.values());

        const postIds = finalPosts.map(p => p.pid);

        if (postIds.length === 0) return NextResponse.json([]);

        // Fetch Likes
        let userLikes = new Set<string>();
        if (session) {
            const likedPosts = await db.select().from(likes).where(eq(likes.userId, session.uid));
            likedPosts.forEach(l => userLikes.add(l.postId));
        }

        // Fetch Collaborators
        const allCollabs = await db.select({
            postId: collaborators.postId,
            username: users.username,
            uid: users.uid,
            avatarUrl: users.avatarUrl
        })
            .from(collaborators)
            .innerJoin(users, eq(collaborators.userId, users.uid))
            .where(inArray(collaborators.postId, postIds));

        const collabMap = new Map<string, any[]>();
        const collabSeen = new Set<string>(); // composite key "postId:uid"
        allCollabs.forEach(c => {
            const composite = `${c.postId}:${c.uid}`;
            if (!collabSeen.has(composite)) {
                if (!collabMap.has(c.postId)) collabMap.set(c.postId, []);
                collabMap.get(c.postId)?.push(c);
                collabSeen.add(composite);
            }
        });

        const result = finalPosts.map(p => ({
            ...p,
            isLiked: userLikes.has(p.pid),
            collaborators: collabMap.get(p.pid) || [],
            author: {
                username: p.authorName || 'Unknown',
                avatarUrl: p.authorAvatar
            }
        }));

        return NextResponse.json(result);
    } catch (e) {
        console.error("Get Posts Error:", e);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

import ogs from 'open-graph-scraper';

// Helper for metadata
// Helper for metadata
const fetchMetadata = async (url: string) => {
    try {
        const { error, result } = await ogs({
            url,
            timeout: 10000,
            fetchOptions: { headers: { 'user-agent': 'Mozilla/5.0 (compatible; TitanBot/1.0; +http://localhost:3000)' } }
        });
        if (error || !result.ogImage) return null;

        const image = Array.isArray(result.ogImage) ? result.ogImage[0] : result.ogImage;
        return image?.url || null;
    } catch (e) {
        console.error("Metadata fetch error for url:", url, e);
        return null;
    }
};

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, link, description } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: "Missing fields: title or content" }, { status: 400 });
        }

        if (content.length > 800) {
            return NextResponse.json({ error: "Content exceeds 800 characters" }, { status: 400 });
        }

        let imageUrl = null;
        if (link) {
            imageUrl = await fetchMetadata(link);
        }

        const pid = crypto.randomUUID();

        await db.insert(posts).values({
            pid,
            title,
            content,
            link: link || null,
            imageUrl: imageUrl || null,
            description: description || "",
            authorId: session.uid,
        });

        // Mention Parsing
        const mentionRegex = /@(\w+)/g;
        const matches = [...content.matchAll(mentionRegex)].map(m => m[1]);

        if (matches.length > 0) {
            // Find users
            const mentionedUsers = await db.select({ uid: users.uid }).from(users).where(inArray(users.username, matches));

            if (mentionedUsers.length > 0) {
                const collabInserts = mentionedUsers.map(u => ({
                    postId: pid,
                    userId: u.uid
                }));
                // dedupe based on composite key logic if needed, but here simple map is fine as long as no dupes in matches
                await db.insert(collaborators).values(collabInserts).onConflictDoNothing();
            }
        }

        return NextResponse.json({ success: true, pid });
    } catch (e) {
        console.error("Create Post Error:", e);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
