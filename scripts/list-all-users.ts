import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        isActive: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    console.log('\n========================================');
    console.log('📋 ALL USERS IN DATABASE');
    console.log('========================================\n');

    if (users.length === 0) {
      console.log('No users found in database.');
      return;
    }

    // Group by role
    const usersByRole: Record<string, typeof users> = {};
    users.forEach((user) => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    // Display users by role
    Object.keys(usersByRole).forEach((role) => {
      console.log(`\n🔹 ${role} (${usersByRole[role].length} users)`);
      console.log('─'.repeat(60));
      
      usersByRole[role].forEach((user) => {
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        if (user.phone) console.log(`Phone: ${user.phone}`);
        console.log(`Status: ${user.status} | Active: ${user.isActive}`);
        console.log('─'.repeat(60));
      });
    });

    console.log('\n========================================');
    console.log('📝 LOGIN CREDENTIALS GUIDE');
    console.log('========================================\n');

    console.log('🔐 SUPER ADMIN (Team Login - Email/Password)');
    console.log('   Email: super@survive.exe');
    console.log('   Password: super\n');

    console.log('📱 CITIZENS (Phone + OTP)');
    console.log('   Phone: +919876543210 (Test Citizen)');
    console.log('   OTP: 123456 (demo mode)\n');

    console.log('👥 TEAM MEMBERS (Email/Password) - Check seed data');
    console.log('   Password for all: password123\n');

    console.log('========================================\n');

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
