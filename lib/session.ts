import { cookies } from "next/headers";
import { prisma } from "./db";
import crypto from "crypto";

export async function createSession(userId: string, rememberMe: boolean = true) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = rememberMe
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day session

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const cookieStore = cookies();
  cookieStore.set("sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });

  return token;
}

export async function getSession() {
  try {
    const cookieStore = cookies();
    const sid = cookieStore.get("sid")?.value;
    if (!sid) return null;

    const session = await prisma.session.findUnique({
      where: { token: sid },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    // Update lastSeen
    await prisma.user.update({
      where: { id: session.userId },
      data: { lastSeen: new Date() },
    }).catch(() => {});

    return session.user;
  } catch {
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = cookies();
    const sid = cookieStore.get("sid")?.value;
    if (sid) {
      await prisma.session.deleteMany({ where: { token: sid } }).catch(() => {});
      cookieStore.set("sid", "", { maxAge: 0, path: "/" });
    }
  } catch {
    // ignore
  }
}
