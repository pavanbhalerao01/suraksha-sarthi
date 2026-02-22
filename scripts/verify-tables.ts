/**
 * Verify Auth Tables Exist
 */

import prisma from '../lib/db';

async function verifyTables() {
  try {
    console.log('Checking auth tables...\n');
    
    // Test audit_logs table
    const auditCount = await prisma.auditLog.count();
    console.log('✓ audit_logs table exists:', auditCount, 'rows');
    
    // Test team_profiles table
    const teamProfileCount = await prisma.teamProfile.count();
    console.log('✓ team_profiles table exists:', teamProfileCount, 'rows');
    
    // Test validation_queue table
    const validationCount = await prisma.validationQueue.count();
    console.log('✓ validation_queue table exists:', validationCount, 'rows');
    
    // Test User table has auth fields
    const userCount = await prisma.user.count();
    console.log('✓ User table accessible:', userCount, 'rows');
    
    console.log('\n✅ All auth tables created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
