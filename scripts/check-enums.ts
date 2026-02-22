/**
 * Check actual enum values in database
 */
import prisma from '../lib/db';

async function checkEnums() {
  try {
    // Check UserRole enum values
    const roles = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'UserRole'
      ORDER BY e.oid
    `;
    
    console.log('📋 UserRole enum values in database:');
    console.table(roles);
    
    // Check what roles are actually used
    const actualRoles = await prisma.$queryRaw`
      SELECT DISTINCT role FROM "User" ORDER BY role
    `;
    
    console.log('\n📊 Actual roles used in User table:');
    console.table(actualRoles);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnums();
