/**
 * Verification script to check if demo accounts exist
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Checking demo accounts...\n');
  
  try {
    const users = await prisma.user.findMany({
      where: {
        isDemo: true,
      },
      orderBy: {
        role: 'asc',
      },
      include: {
        teamProfile: true,
      },
    });
    
    console.log(`Found ${users.length} demo accounts:\n`);
    
    const groupedByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, any[]>);
    
    for (const [role, roleUsers] of Object.entries(groupedByRole)) {
      console.log(`\n📌 ${role.toUpperCase()} (${roleUsers.length}):`);
      for (const user of roleUsers) {
        console.log(`   - ${user.fullName} (${user.email})`);
        if (user.teamProfile) {
          console.log(`     Team: ${user.teamProfile.teamId || 'N/A'} | District: ${user.teamProfile.district}`);
        }
      }
    }
    
    console.log(`\n✅ Total: ${users.length} demo accounts`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
