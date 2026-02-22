import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'super@survive.exe' },
    });

    if (existing) {
      console.log('❌ Super admin already exists!');
      console.log('Email: super@survive.exe');
      console.log('Password: super');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('super', 12);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'super@survive.exe',
        phone: '+919000000000',
        passwordHash,
        password_hash: passwordHash, // New column
        name: 'Super Admin',
        role: 'NDRF_ADMIN', // Highest role available
        isActive: true,
        status: 'active',
      },
    });

    console.log('✅ Super admin created successfully!');
    console.log('==========================================');
    console.log('Email: super@survive.exe');
    console.log('Password: super');
    console.log('Role: NDRF_ADMIN (Super Admin Access)');
    console.log('==========================================');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
