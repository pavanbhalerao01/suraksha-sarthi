import prisma from "../lib/db";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CitizenSOS" (
      "id"          TEXT        NOT NULL PRIMARY KEY,
      "ticketId"    TEXT        NOT NULL UNIQUE,
      "name"        TEXT        NOT NULL,
      "phone"       TEXT        NOT NULL,
      "disasterType" TEXT       NOT NULL DEFAULT 'other',
      "description" TEXT,
      "address"     TEXT,
      "lat"         DOUBLE PRECISION,
      "lng"         DOUBLE PRECISION,
      "severity"    TEXT        NOT NULL DEFAULT 'HIGH',
      "status"      TEXT        NOT NULL DEFAULT 'UNVERIFIED',
      "createdAt"   TIMESTAMP   NOT NULL DEFAULT NOW(),
      "updatedAt"   TIMESTAMP   NOT NULL DEFAULT NOW()
    )
  `);
  console.log("✅ CitizenSOS table created (or already exists)");

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "CitizenSOS_status_idx" ON "CitizenSOS"("status")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "CitizenSOS_createdAt_idx" ON "CitizenSOS"("createdAt" DESC)
  `);
  console.log("✅ Indexes created");
}

main()
  .catch((e) => { console.error("❌ Migration failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
