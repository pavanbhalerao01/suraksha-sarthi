import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Get enum values
    const enumValues = await prisma.$queryRawUnsafe(`
      SELECT e.enumlabel as enum_value 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname = 'UserRole' 
      ORDER BY e.enumsortorder
    `) as any[];
    console.log('UserRole enum values:', enumValues.map((r: any) => r.enum_value));

    // Get actual columns in User table
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `) as any[];
    console.log('\nUser table columns:');
    cols.forEach((c: any) => console.log(`  ${c.column_name}: ${c.data_type} (${c.udt_name})`));

    // Get one user to see actual data
    const users = await prisma.$queryRawUnsafe(`SELECT id, email, role FROM "User" LIMIT 3`) as any[];
    console.log('\nSample users:', users);
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
