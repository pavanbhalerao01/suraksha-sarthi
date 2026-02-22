const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Replace garbage 'www.google.com' entry with the verified Twilio number
  const updated = await prisma.user.update({
    where: { phone: '+919998889998' },
    data: {
      phone: '+919960785909',
      name: 'Verified Test Citizen',
    },
  });
  console.log('✅ Updated user:', updated.phone, '|', updated.name, '|', updated.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
