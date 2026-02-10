import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global;

// Resolve the database file path from DATABASE_URL (e.g., "file:./dev.db")
const dbPath = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace("file:", "");

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
