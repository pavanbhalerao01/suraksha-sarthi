import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check which tables exist
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `) as any[];
  console.log('Tables:', tables.map((t: any) => t.tablename).join(', '));
  
  await prisma.$disconnect();
}
main().catch(console.error);
