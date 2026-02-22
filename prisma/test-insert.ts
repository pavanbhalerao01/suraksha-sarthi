import prisma from "../lib/db";
import { randomUUID } from "crypto";

async function main() {
  const id = randomUUID();
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeamSosAssignment"
        ("id","sosId","title","description","disasterType","severity","address","lat","lng",
         "reporterName","reporterPhone","injuredCount","affectedFamilies",
         "teamType","teamId","teamName","assignedBy","status","assignedAt","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::float,$9::float,$10,$11,$12::integer,$13::integer,$14,$15,$16,$17,'ASSIGNED',NOW(),NOW(),NOW())`,
      id, "sos-test", "Test Title",
      "Test description",
      "flood", "HIGH", "Test Address, Pune",
      null, null,
      "Test Reporter", "+91-9999999999",
      3, 5,
      "ndrf", "NDRF-999", "NDRF Field Team",
      "NDRF_ADMIN"
    );
    console.log("✅ INSERT succeeded, id:", id);
    // cleanup
    await prisma.$executeRawUnsafe(`DELETE FROM "TeamSosAssignment" WHERE "id" = $1`, id);
    console.log("✅ Cleanup done");
  } catch (e) {
    console.error("❌ INSERT failed:", e);
  }
}

main().finally(() => prisma.$disconnect());
