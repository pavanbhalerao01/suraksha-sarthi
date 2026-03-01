const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM "CitizenSOS"')
  .then(r => console.log('✅ CitizenSOS table OK — rows:', r[0].count))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
