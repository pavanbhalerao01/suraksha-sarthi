/**
 * List all users in database
 */
import prisma from '../lib/db';

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { role: 'asc' },
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('💡 Run the seed script: npx tsx prisma/seed.ts');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Status: ${user.status || (user.isActive ? 'Active' : 'Inactive')}`);
        console.log('');
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
