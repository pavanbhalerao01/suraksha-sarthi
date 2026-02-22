import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_name = 'Session'
    ORDER BY ordinal_position
  `) as any[];
  console.log('Session columns:', cols.map((c: any) => `${c.column_name}: ${c.data_type}`));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
