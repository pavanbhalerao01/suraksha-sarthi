const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, role: true },
    orderBy: { role: 'asc' },
  });
  console.log('\nRole            | Phone                | Name');
  console.log('----------------|----------------------|---------------------');
  users.forEach(u => {
    console.log(
      (u.role || '').padEnd(16) + '| ' +
      (u.phone || 'NULL').padEnd(20) + ' | ' +
      u.name
    );
  });
  console.log(`\nTotal users: ${users.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
