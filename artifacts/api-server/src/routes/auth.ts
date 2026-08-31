import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody, ForgotPasswordBody } from "@workspace/api-zod";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "numverify_salt").digest("hex");
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name, company } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    name,
    company: company ?? null,
  }).returning();
  // Set session cookie
  res.cookie("session_uid", String(user.id), { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(201).json({ user: formatUser(user), token: `mock-token-${user.id}` });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.cookie("session_uid", String(user.id), { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: formatUser(user), token: `mock-token-${user.id}` });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  res.clearCookie("session_uid");
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const uid = req.cookies?.session_uid;
  const authHeader = req.headers.authorization;
  let userId: number | null = null;
  if (uid) {
    userId = parseInt(uid, 10);
  } else if (authHeader?.startsWith("Bearer mock-token-")) {
    userId = parseInt(authHeader.replace("Bearer mock-token-", ""), 10);
  }
  if (!userId || isNaN(userId)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export default router;
