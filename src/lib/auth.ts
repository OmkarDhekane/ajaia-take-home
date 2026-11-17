import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { getDatabase } from "./db";
import { sessions, users } from "./db/schema";

const cookieName = "ajaia_session";
const ttl = 7 * 24 * 60 * 60;
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  return (
    (await getDatabase()
      .select({ id: users.id, displayName: users.displayName })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash(token)),
          gt(sessions.expiresAt, Date.now()),
        ),
      )
      .get()) ?? null
  );
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) {
    await getDatabase()
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash(token)))
      .run();
  }
  jar.delete(cookieName);
}

export async function startSession(userId: string) {
  await endSession();
  const token = randomBytes(32).toString("base64url");
  await getDatabase()
    .insert(sessions)
    .values({
      tokenHash: tokenHash(token),
      userId,
      expiresAt: Date.now() + ttl * 1000,
    })
    .run();
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.SESSION_COOKIE_SECURE
      ? process.env.SESSION_COOKIE_SECURE !== "false"
      : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttl,
  });
}
