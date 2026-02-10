import { prisma } from "./db";

function parsePasswordList(str) {
  return (str || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

export function isAdminPasswordValid(password) {
  const adminPasswords = parsePasswordList(process.env.ADMIN_PASSWORDS);
  if (!password || !adminPasswords.length) return false;
  return adminPasswords.includes(password);
}

export async function createAdminSession() {
  // Configured session duration or default 24h
  const sessionHours = Number(process.env.ADMIN_SESSION_HOURS || "24");
  const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000);

  const session = await prisma.adminSession.create({
    data: {
      expiresAt
    }
  });

  return session.id;
}

export async function verifyAdminSession(sessionId) {
  if (!sessionId) return false;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) return false;

  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.adminSession.delete({ where: { id: sessionId } }).catch(() => { });
    return false;
  }

  return true;
}
