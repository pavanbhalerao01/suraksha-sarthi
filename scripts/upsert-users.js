const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Upsert Pavan - CITIZEN - +919960785909
  const pavan = await prisma.user.upsert({
    where: { phone: '+919960785909' },
    update: {
      name: 'Pavan',
      role: 'CITIZEN',
    },
    create: {
      name: 'Pavan',
      email: 'pavan@survive.exe',
      phone: '+919960785909',
      passwordHash,
      role: 'CITIZEN',
    },
  });
  console.log('✅ Pavan:', pavan.phone, '|', pavan.role, '|', pavan.name);

  // 2. Upsert Aryan - VOLUNTEER - +919370950520
  const aryan = await prisma.user.upsert({
    where: { phone: '+919370950520' },
    update: {
      name: 'Aryan',
      role: 'VOLUNTEER',
    },
    create: {
      name: 'Aryan',
      email: 'aryan@survive.exe',
      phone: '+919370950520',
      passwordHash,
      role: 'VOLUNTEER',
    },
  });
  console.log('✅ Aryan:', aryan.phone, '|', aryan.role, '|', aryan.name);

  // Final list
  console.log('\n--- All users ---');
  const all = await prisma.user.findMany({ select: { name: true, phone: true, role: true } });
  all.forEach(u => console.log((u.role || '').padEnd(15), (u.phone || 'NULL').padEnd(20), u.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
