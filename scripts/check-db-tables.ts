/**
 * Check database tables
 */
import prisma from '../lib/db';

async function checkTables() {
  try {
    // Try to query User table (capital U)
    try {
      const userCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
      console.log('✓ Found "User" table (capital U):', userCount);
    } catch (e: any) {
      console.log('✗ "User" table does not exist:', e.message.split('\n')[0]);
    }

    // Try to query users table (lowercase)
    try {
      const usersCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "users"`;
      console.log('✓ Found "users" table (lowercase):', usersCount);
    } catch (e: any) {
      console.log('✗ "users" table does not exist:', e.message.split('\n')[0]);
    }

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('\n📋 All tables in database:', tables);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
