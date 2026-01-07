
import { db } from "./db";
import { comments } from "./db/schema";
import { sql } from "drizzle-orm";

async function main() {
    try {
        const allComments = await db.select({
            id: comments.id,
            parentId: comments.parentId,
            postId: comments.postId,
        }).from(comments);

        console.log("Total comments:", allComments.length);
        const children = allComments.filter(c => c.parentId);
        console.log("Total replies:", children.length);

        if (children.length > 0) {
            console.log("First reply:", children[0]);

            // Test the count query for its parent
            const pId = children[0].parentId;
            console.log("Testing count for parent:", pId);

            const countRes = await db.execute(sql`SELECT count(*)::int as count FROM comments WHERE parent_id = ${pId}`);
            console.log("Count result:", countRes);
        } else {
            console.log("No replies found in DB.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
