import { NextResponse } from "next/server";
import { db } from "@/db";
import { extensions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug } = await params;
        // slug is an array like ["titanpl", "core"] from URL "/api/extensions/titanpl/core"
        // Reconstruct the npm package name as "@titanpl/core"
        const npmPackage = `@${slug.join("/")}`;

        const ext = await db.query.extensions.findFirst({
            where: eq(extensions.npmPackage, npmPackage),
            with: {
                publisher: {
                    columns: {
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        if (!ext) {
            return NextResponse.json(
                { error: "Extension not found" },
                { status: 404 }
            );
        }

        // Fetch NPM registry data
        let npmData: any = null;
        try {
            const npmRes = await fetch(
                `https://registry.npmjs.org/${encodeURIComponent(npmPackage)}`,
                { next: { revalidate: 3600 } }
            );
            if (npmRes.ok) {
                npmData = await npmRes.json();
            }
        } catch (e) {
            console.error("NPM Registry fetch error:", e);
        }

        // Fetch download stats
        let downloadsData: any = null;
        try {
            const dlRes = await fetch(
                `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(npmPackage)}`,
                { next: { revalidate: 3600 } }
            );
            if (dlRes.ok) {
                downloadsData = await dlRes.json();
            }
        } catch (e) {
            console.error("NPM Downloads fetch error:", e);
        }

        // Fetch weekly downloads
        let weeklyDownloads: number | null = null;
        try {
            const wRes = await fetch(
                `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(npmPackage)}`,
                { next: { revalidate: 3600 } }
            );
            if (wRes.ok) {
                const wData = await wRes.json();
                weeklyDownloads = wData.downloads;
            }
        } catch (e) { }

        // Fetch README from npm
        let readme: string | null = null;
        if (npmData) {
            readme = npmData.readme || null;
        }

        // Extract useful info
        const latestVersion = npmData?.["dist-tags"]?.latest || null;
        const latestVersionData = latestVersion
            ? npmData?.versions?.[latestVersion]
            : null;

        const response = {
            ...ext,
            npm: {
                readme,
                latestVersion,
                license: latestVersionData?.license || npmData?.license || null,
                homepage: npmData?.homepage || null,
                keywords: latestVersionData?.keywords || npmData?.keywords || [],
                repository: npmData?.repository || null,
                maintainers: npmData?.maintainers || [],
                engines: latestVersionData?.engines || null,
                dependencies: latestVersionData?.dependencies
                    ? Object.keys(latestVersionData.dependencies).length
                    : 0,
                lastPublish: npmData?.time?.[latestVersion] || null,
                createdAt: npmData?.time?.created || null,
            },
            downloads: {
                monthly: downloadsData?.downloads || 0,
                weekly: weeklyDownloads || 0,
            },
        };

        return NextResponse.json(response);
    } catch (e) {
        console.error("Fetch Extension Error:", e);
        return NextResponse.json(
            { error: "Failed to fetch extension details" },
            { status: 500 }
        );
    }
}
