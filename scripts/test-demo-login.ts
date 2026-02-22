import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDemoLogin() {
  try {
    console.log('Testing database connection...');
    
    // Check if demo user exists
    const user = await prisma.user.findUnique({
      where: { phone: '+919999999999' },
    });
    
    console.log('Demo user (+919999999999):', user ? JSON.stringify(user, null, 2) : 'NOT FOUND');
    
    // Check schema/enum - try to create a simple test
    console.log('\nTesting user creation with CITIZEN role...');
    const testEmail = `test-${Date.now()}@demo.test`;
    
    try {
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          phone: `+9188${Date.now().toString().slice(-8)}`,
          passwordHash: 'test',
          password_hash: 'test',
          name: 'Test User',
          role: 'CITIZEN' as any,
          isActive: true,
          status: 'active',
        },
      });
      console.log('User created successfully:', newUser.id, newUser.role);
      
      // Cleanup
      await prisma.user.delete({ where: { id: newUser.id } });
      console.log('Cleanup done');
    } catch (createError: any) {
      console.error('User creation error:', createError.message);
      console.error('Error code:', createError.code);
    }
    
    // List valid enum values
    const enumValues = await prisma.$queryRaw`
      SELECT e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'UserRole'
      ORDER BY e.enumsortorder
    ` as any[];
    console.log('\nUserRole enum values in DB:', enumValues.map((v: any) => v.value));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDemoLogin();
