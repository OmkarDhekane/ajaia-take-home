import { migrate } from "drizzle-orm/libsql/migrator";
import { getDatabase } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/password";

async function main() {
  const command = process.argv[2];
  if (command === "migrate") {
    await migrate(getDatabase(), { migrationsFolder: "./drizzle" });
    console.log("Database migrated.");
    return;
  }

  if (command !== "seed") throw new Error("Expected migrate or seed.");
  const alex = process.env.DEMO_ALEX_PASSWORD;
  const sam = process.env.DEMO_SAM_PASSWORD;
  if (!alex || !sam) {
    throw new Error(
      "Set DEMO_ALEX_PASSWORD and DEMO_SAM_PASSWORD before seeding.",
    );
  }

  const accounts = [
    {
      id: "alex",
      displayName: "Alex Chen",
      email: "alex@example.test",
      passwordHash: await hashPassword(alex),
    },
    {
      id: "sam",
      displayName: "Sam Rivera",
      email: "sam@example.test",
      passwordHash: await hashPassword(sam),
    },
  ];
  const db = getDatabase();
  await db.transaction(async (tx) => {
    for (const account of accounts) {
      await tx
        .insert(users)
        .values(account)
        .onConflictDoUpdate({
          target: users.id,
          set: { passwordHash: account.passwordHash },
        })
        .run();
    }
  });
  console.log("Demo accounts seeded.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
