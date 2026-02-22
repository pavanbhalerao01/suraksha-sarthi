/**
 * Check User table schema
 */
import prisma from '../lib/db';

async function checkUserSchema() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Actual User table columns:\n');
    console.table(columns);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSchema();
