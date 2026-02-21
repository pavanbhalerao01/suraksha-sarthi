import prisma from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prismaClientForSeed = new PrismaClient();

// Maharashtra Districts with approximate coordinates
const maharashtraDistricts = [
  { name: 'Mumbai City', lat: 19.0760, lng: 72.8777, population: 3145966, areaSqKm: 157 },
  { name: 'Mumbai Suburban', lat: 19.1136, lng: 72.8697, population: 9356962, areaSqKm: 446 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, population: 9429408, areaSqKm: 15643 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781, population: 11060148, areaSqKm: 9558 },
  { name: 'Nashik', lat: 20.5937, lng: 73.7884, population: 6107187, areaSqKm: 15582 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, population: 4653570, areaSqKm: 9892 },
  { name: 'Ahmednagar', lat: 19.0948, lng: 74.7480, population: 4543083, areaSqKm: 17048 },
  { name: 'Solapur', lat: 17.6599, lng: 75.9064, population: 4317756, areaSqKm: 14895 },
  { name: 'Jalgaon', lat: 21.0077, lng: 75.5626, population: 4229917, areaSqKm: 11765 },
  { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, population: 3876001, areaSqKm: 7685 },
  { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, population: 3701282, areaSqKm: 10107 },
  { name: 'Nanded', lat: 19.1383, lng: 77.3210, population: 3361292, areaSqKm: 10528 },
  { name: 'Amravati', lat: 20.9374, lng: 77.7796, population: 2888445, areaSqKm: 12235 },
  { name: 'Satara', lat: 17.6805, lng: 74.0183, population: 3003741, areaSqKm: 10480 },
  { name: 'Akola', lat: 20.7002, lng: 77.0082, population: 1813906, areaSqKm: 5431 },
  { name: 'Latur', lat: 18.3983, lng: 76.5604, population: 2454196, areaSqKm: 7157 },
  { name: 'Dhule', lat: 20.9042, lng: 74.7749, population: 2050862, areaSqKm: 8063 },
  { name: 'Sangli', lat: 16.8524, lng: 74.5815, population: 2822143, areaSqKm: 8572 },
  { name: 'Yavatmal', lat: 20.3897, lng: 78.1215, population: 2772348, areaSqKm: 13582 },
  { name: 'Raigad', lat: 18.5204, lng: 73.0169, population: 2634200, areaSqKm: 7152 },
  { name: 'Buldhana', lat: 20.5310, lng: 76.1842, population: 2586258, areaSqKm: 9661 },
  { name: 'Beed', lat: 18.9889, lng: 75.7585, population: 2585049, areaSqKm: 10693 },
  { name: 'Chandrapur', lat: 19.9615, lng: 79.2961, population: 2204307, areaSqKm: 11443 },
  { name: 'Gondia', lat: 21.4560, lng: 80.1920, population: 1322507, areaSqKm: 5431 },
  { name: 'Osmanabad', lat: 18.1760, lng: 76.0402, population: 1657576, areaSqKm: 7569 },
  { name: 'Wardha', lat: 20.7453, lng: 78.6022, population: 1296157, areaSqKm: 6309 },
  { name: 'Ratnagiri', lat: 16.9902, lng: 73.3120, population: 1615069, areaSqKm: 8208 },
  { name: 'Washim', lat: 20.1104, lng: 77.1397, population: 1197160, areaSqKm: 5150 },
  { name: 'Parbhani', lat: 19.2704, lng: 76.7749, population: 1836086, areaSqKm: 6511 },
  { name: 'Jalna', lat: 19.8347, lng: 75.8800, population: 1959046, areaSqKm: 7718 },
  { name: 'Bhandara', lat: 21.1704, lng: 79.6519, population: 1200334, areaSqKm: 3890 },
  { name: 'Hingoli', lat: 19.7157, lng: 77.1542, population: 1177345, areaSqKm: 4526 },
  { name: 'Gadchiroli', lat: 20.1809, lng: 80.0014, population: 1072942, areaSqKm: 14412 },
  { name: 'Sindhudurg', lat: 16.0185, lng: 73.6736, population: 849651, areaSqKm: 5207 },
  { name: 'Palghar', lat: 19.6967, lng: 72.7683, population: 2990116, areaSqKm: 5037 },
  { name: 'Raigarh', lat: 18.2407, lng: 73.1305, population: 317112, areaSqKm: 4521 },
];

// Sample historical disasters
const historicalDisasters = [
  {
    name: 'July 2019 Pune Floods',
    type: 'flood',
    startDate: new Date('2019-07-24'),
    endDate: new Date('2019-07-26'),
    severity: 'severe',
    casualties: 17,
    economicLossCr: 150,
    description: 'Heavy rainfall (300mm in 24hrs) caused severe flooding in low-lying areas including Sinhagad Road and Deccan.',
    source: 'PMC',
  },
  {
    name: '2019 Maharashtra Floods',
    type: 'flood',
    startDate: new Date('2019-08-01'),
    endDate: new Date('2019-08-10'),
    severity: 'catastrophic',
    casualties: 48,
    economicLossCr: 2500,
    description: 'Widespread monsoon flooding across Western Maharashtra, Kolhapur and Sangli severely affected.',
    source: 'NDMA',
  },
  {
    name: '2021 Cyclone Tauktae',
    type: 'cyclone',
    startDate: new Date('2021-05-17'),
    endDate: new Date('2021-05-19'),
    severity: 'severe',
    casualties: 6,
    economicLossCr: 1800,
    description: 'Severe cyclonic storm affected coastal Maharashtra, evacuation of 150,000+ people.',
    source: 'IMD',
  },
  {
    name: '2022 Marathwada Drought',
    type: 'drought',
    startDate: new Date('2022-03-01'),
    endDate: new Date('2022-06-15'),
    severity: 'severe',
    casualties: 0,
    economicLossCr: 800,
    description: 'Severe drought conditions in Marathwada region, dam levels below 20%, agricultural crisis.',
    source: 'NDMA',
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Maharashtra state
  console.log('Creating Maharashtra state...');
  const maharashtra = await prismaClientForSeed.region.create({
    data: {
      name: 'Maharashtra',
      type: 'state',
      centroid: JSON.stringify({ lat: 19.7515, lng: 75.7139 }),
      population: 112374333,
      areaSqKm: 307713,
    },
  });

  console.log('✅ Maharashtra state created');

  // Create districts
  console.log('Creating districts...');
  const districts = [];
  
  for (const district of maharashtraDistricts) {
    const created = await prismaClientForSeed.region.create({
      data: {
        name: district.name,
        type: 'district',
        parentId: maharashtra.id,
        centroid: JSON.stringify({ lat: district.lat, lng: district.lng }),
        population: district.population,
        areaSqKm: district.areaSqKm,
      },
    });
    districts.push(created);
  }

  console.log(`✅ Created ${districts.length} districts`);

  // Generate realistic risk scores for each district
  console.log('Generating risk scores...');
  
  const riskScores = [];
  for (const district of districts) {
    // Generate different risk levels based on district characteristics
    let baseRisk = 30; // Default moderate risk
    
    // Coastal districts - higher flood risk
    if (['Raigad', 'Ratnagiri', 'Sindhudurg', 'Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar'].includes(district.name)) {
      baseRisk = 60 + Math.random() * 20; // 60-80
    }
    
    // Pune, Kolhapur, Sangli - flood prone
    if (['Pune', 'Kolhapur', 'Sangli'].includes(district.name)) {
      baseRisk = 70 + Math.random() * 15; // 70-85
    }
    
    // Marathwada - drought prone
    if (['Beed', 'Osmanabad', 'Latur', 'Parbhani', 'Jalna', 'Hingoli'].includes(district.name)) {
      baseRisk = 50 + Math.random() * 20; // 50-70 (drought risk)
    }
    
    // Add some randomness
    const finalRisk = Math.min(100, baseRisk + (Math.random() - 0.5) * 10);
    
    const primaryHazard = baseRisk > 60 ? 'flood' : baseRisk > 40 ? 'drought' : 'heatwave';
    
    // Calculate population density safely (handle null values)
    const populationDensity = (district.population && district.areaSqKm) 
      ? district.population / district.areaSqKm 
      : 500; // Default density
    
    const riskScore = await prismaClientForSeed.riskScore.create({
      data: {
        regionId: district.id,
        timestamp: new Date(),
        riskScore: parseFloat(finalRisk.toFixed(2)),
        primaryHazard,
        factors: JSON.stringify({
          heavy_rainfall: primaryHazard === 'flood' ? 0.8 : 0.2,
          saturated_soil: primaryHazard === 'flood' ? 0.7 : 0.3,
          population_density: populationDensity > 1000 ? 0.9 : 0.5,
        }),
        modelVersion: 'v1.0-seed',
        confidence: 0.75 + Math.random() * 0.2,
      },
    });
    
    riskScores.push(riskScore);
  }

  console.log(`✅ Created ${riskScores.length} risk scores`);

  // Create historical disasters
  console.log('Creating historical disasters...');
  
  for (const disaster of historicalDisasters) {
    // Find appropriate region
    let regionId = maharashtra.id;
    
    if (disaster.name.includes('Pune')) {
      const pune = districts.find(d => d.name === 'Pune');
      if (pune) regionId = pune.id;
    } else if (disaster.name.includes('Marathwada')) {
      const beed = districts.find(d => d.name === 'Beed');
      if (beed) regionId = beed.id;
    }
    
    await prismaClientForSeed.disaster.create({
      data: {
        ...disaster,
        regionId,
      },
    });
  }

  console.log(`✅ Created ${historicalDisasters.length} historical disasters`);

  // Create sample infrastructure
  console.log('Creating sample infrastructure...');
  
  const puneDistrict = districts.find(d => d.name === 'Pune');
  if (puneDistrict) {
    await prismaClientForSeed.infrastructure.createMany({
      data: [
        {
          name: 'Sinhagad Road Bridge',
          type: 'bridge',
          regionId: puneDistrict.id,
          location: JSON.stringify({ lat: 18.4574, lng: 73.8071 }),
          constructionYear: 1985,
          vulnerabilityScore: 75,
          lastAssessmentDate: new Date('2023-06-15'),
        },
        {
          name: 'Sassoon General Hospital',
          type: 'hospital',
          regionId: puneDistrict.id,
          location: JSON.stringify({ lat: 18.5196, lng: 73.8553 }),
          constructionYear: 1868,
          vulnerabilityScore: 65,
          lastAssessmentDate: new Date('2024-01-10'),
        },
        {
          name: 'Khadakwasla Dam',
          type: 'dam',
          regionId: puneDistrict.id,
          location: JSON.stringify({ lat: 18.4391, lng: 73.7535 }),
          constructionYear: 1879,
          vulnerabilityScore: 40,
          lastAssessmentDate: new Date('2025-11-20'),
        },
      ],
    });
  }

  console.log('✅ Created sample infrastructure');

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - 1 state (Maharashtra)`);
  console.log(`   - ${districts.length} districts`);
  console.log(`   - ${riskScores.length} risk scores`);
  console.log(`   - ${historicalDisasters.length} historical disasters`);
  console.log(`   - 3 infrastructure items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClientForSeed.$disconnect();
  });
