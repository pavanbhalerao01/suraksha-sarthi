/**
 * Create a test citizen user
 */
import prisma from '../lib/db';
import { hashPassword } from '../lib/auth/password';

async function createTestCitizen() {
  try {
    // Create a test citizen
    const testCitizen = await prisma.user.upsert({
      where: { phone: '+919876543210' },
      update: {},
      create: {
        name: 'Test Citizen',
        email: 'citizen@test.com',
        phone: '+919876543210',
        passwordHash: await hashPassword('password123'), // Original field (required)
        role: 'CITIZEN', // Must be uppercase to match enum
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('✅ Test citizen created successfully!\n');
    console.log('📱 Phone: +919876543210');
    console.log('🔐 OTP: 123456 (demo mode)');
    console.log('\n💡 You can now test citizen login at http://localhost:3000/portal');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Unique constraint')) {
      console.log('\n✅ Test citizen already exists - ready to use!');
      console.log('📱 Phone: +919876543210');
      console.log('🔐 OTP: 123456 (demo mode)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestCitizen();
