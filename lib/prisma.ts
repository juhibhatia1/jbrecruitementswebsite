import { PrismaClient } from "./prisma-client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
let candidateApplicationSchemaRepairPromise: Promise<void> | null = null;

function sanitizeDatabaseUrl(rawUrl?: string | null): string {
  return (rawUrl ?? "").trim().replace(/^["']|["']$/g, "");
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
  });
}

function buildDatabaseUrl(): string {
  const base = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  // Neon serverless: append connection params to handle idle TCP timeout.
  // connect_timeout — abort if can't establish connection within N seconds.
  // pool_timeout — wait up to N seconds for a pooled connection.
  if (!base.includes("connect_timeout")) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}connect_timeout=10&pool_timeout=20`;
  }
  return base;
}

async function ensureCandidateApplicationSchema(client: PrismaClient): Promise<void> {
  if (!candidateApplicationSchemaRepairPromise) {
    candidateApplicationSchemaRepairPromise = (async () => {
      await client.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TYPE "CandidateApplicationStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);

      await client.$executeRawUnsafe(`
        ALTER TABLE "CandidateApplication"
          ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT,
          ADD COLUMN IF NOT EXISTS "resumeText" TEXT,
          ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
      `);
    })().catch((error) => {
      candidateApplicationSchemaRepairPromise = null;
      throw error;
    });
  }

  await candidateApplicationSchemaRepairPromise;
}

function withRetryMiddleware(client: PrismaClient): PrismaClient {
  // Retry once on connection errors (Neon compute waking from idle sleep).
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isConnErr =
        msg.includes("Can't reach database server") ||
        msg.includes("Connection refused") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT");
      const isCandidateApplicationSchemaErr =
        msg.includes("CandidateApplication.resumeUrl") ||
        msg.includes("CandidateApplication.scheduledAt") ||
        (msg.includes("CandidateApplication") && msg.includes("does not exist"));

      if (isCandidateApplicationSchemaErr) {
        await ensureCandidateApplicationSchema(client);
        return next(params);
      }

      if (!isConnErr) throw err;

      // Reconnect and retry once.
      await client.$disconnect().catch(() => {});
      await client.$connect();
      return next(params);
    }
  });
  return client;
}

export const prisma =
  globalForPrisma.prisma ?? withRetryMiddleware(createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
