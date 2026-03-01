import prisma from "../lib/db";

async function main() {
  const tables = await prisma.$queryRawUnsafe<any[]>(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
  );
  console.log("Tables:", tables.map((t: any) => t.tablename));
}

main().catch(console.error).finally(() => prisma.$disconnect());
