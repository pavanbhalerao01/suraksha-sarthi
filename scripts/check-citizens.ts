/**
 * Check if demo citizens exist in database
 */
import prisma from '../lib/db';

async function checkDemoCitizens() {
  try {
    console.log('Checking for demo citizen accounts...\n');
    
    const citizens = await prisma.user.findMany({
      where: { 
        role: 'citizen'
      },
      select: {
        fullName: true,
        phone: true,
        email: true,
        status: true,
        isDemo: true,
      }
    });
    
    if (citizens.length === 0) {
      console.log('❌ No citizen accounts found in database!');
      console.log('\n💡 You need to create a citizen account first.');
      console.log('   Use the registration flow or run the seed script:');
      console.log('   npx tsx prisma/seed.ts');
    } else {
      console.log(`✅ Found ${citizens.length} citizen account(s):\n`);
      citizens.forEach((citizen, i) => {
        console.log(`${i + 1}. ${citizen.fullName}`);
        console.log(`   Phone: ${citizen.phone}`);
        console.log(`   Email: ${citizen.email || 'N/A'}`);
        console.log(`   Status: ${citizen.status}`);
        console.log(`   Demo: ${citizen.isDemo ? 'Yes' : 'No'}`);
        console.log('');
      });
      
      console.log('📱 To login, use any of the phone numbers above.');
      console.log('🔐 OTP will be: 123456 (demo mode)');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoCitizens();
