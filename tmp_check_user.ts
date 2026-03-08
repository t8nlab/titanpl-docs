import { db } from "./db";
import { users } from "./db/schema/users";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: ".env" });
}

async function check() {
    const email = "clashersoham07@gmail.com";
    console.log(`Checking user: ${email}`);

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (user) {
            console.log("User found:", JSON.stringify(user, null, 2));
        } else {
            console.log("User not found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

check();
