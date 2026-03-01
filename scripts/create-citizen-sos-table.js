const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CitizenSOS" (
      "id"          TEXT        PRIMARY KEY,
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
    );
  `);
  console.log('✅ CitizenSOS table created (or already exists)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
