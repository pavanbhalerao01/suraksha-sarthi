/**
 * Manual migration: Create TeamSosAssignment table
 * Run with: npx tsx prisma/migrate-team-sos.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Creating TeamSosAssignment table if it does not exist...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeamSosAssignment" (
      "id"                TEXT NOT NULL,
      "sosId"             TEXT NOT NULL,
      "title"             TEXT NOT NULL,
      "description"       TEXT NOT NULL,
      "disasterType"      TEXT NOT NULL,
      "severity"          TEXT NOT NULL,
      "address"           TEXT NOT NULL,
      "lat"               DOUBLE PRECISION,
      "lng"               DOUBLE PRECISION,
      "reporterName"      TEXT NOT NULL,
      "reporterPhone"     TEXT NOT NULL,
      "injuredCount"      INTEGER NOT NULL DEFAULT 0,
      "affectedFamilies"  INTEGER NOT NULL DEFAULT 0,
      "teamType"          TEXT NOT NULL,
      "teamId"            TEXT NOT NULL,
      "teamName"          TEXT NOT NULL,
      "assignedBy"        TEXT NOT NULL DEFAULT 'NDRF_ADMIN',
      "assignedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "status"            TEXT NOT NULL DEFAULT 'ASSIGNED',
      "responseStartedAt" TIMESTAMP(3),
      "resolvedAt"        TIMESTAMP(3),
      "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TeamSosAssignment_pkey" PRIMARY KEY ("id")
    );
  `);

  // Create indexes
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "TeamSosAssignment_teamType_idx" ON "TeamSosAssignment"("teamType");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "TeamSosAssignment_teamId_idx" ON "TeamSosAssignment"("teamId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "TeamSosAssignment_status_idx" ON "TeamSosAssignment"("status");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "TeamSosAssignment_sosId_idx" ON "TeamSosAssignment"("sosId");
  `);

  console.log("✅ TeamSosAssignment table created (or already exists).");
  console.log("✅ Indexes created.");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
