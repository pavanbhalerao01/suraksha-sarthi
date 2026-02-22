import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'NDRF_ADMIN' as any },
    select: { id: true, email: true, role: true, name: true, status: true }
  });
  console.log('NDRF_ADMIN user:', JSON.stringify(admin));

  const superUser = await prisma.user.findUnique({
    where: { email: 'super@survive.exe' },
    select: { id: true, email: true, role: true, name: true, passwordHash: true }
  });
  console.log('Super admin:', superUser ? `${superUser.email} (${superUser.role})` : 'NOT FOUND');
  
  await prisma.$disconnect();
}
main().catch(console.error);
