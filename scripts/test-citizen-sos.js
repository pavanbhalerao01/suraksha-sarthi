const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Test create
  const sos = await prisma.citizenSos.create({
    data: {
      ticketId: 'TEST-2026-ABCD1234',
      name: 'Test User',
      phone: '+919960785909',
      disasterType: 'flood',
      severity: 'HIGH',
      status: 'UNVERIFIED',
    },
  });
  console.log('✅ Created SOS:', sos.ticketId, '| id:', sos.id);

  // Test read
  const rows = await prisma.citizenSos.findMany({ take: 5 });
  console.log('✅ Total SOS records:', rows.length);

  // Cleanup test record
  await prisma.citizenSos.delete({ where: { id: sos.id } });
  console.log('✅ Test record cleaned up.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
