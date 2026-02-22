import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSessionTable() {
  try {
    // Check if Session table exists and its structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Session'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Session Table Structure:');
    console.log('========================================');
    console.log(result);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('Error checking Session table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessionTable();
