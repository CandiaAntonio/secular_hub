
import { prisma } from '../lib/db/client';
import { getStats, getOutlooks } from '../lib/db/queries';

async function verify() {
  console.log('Verifying Backend Infrastructure...');
  
  // 1. Check DB Connection and Count
  const count = await prisma.outlookCall.count();
  console.log(`\nTotal Records in DB: ${count}`);
  if (count === 0) {
    console.error('ERROR: Database is empty! Ingestion failed.');
    process.exit(1);
  }

  // 2. Check Stats Logic
  console.log('\nRunning logical stats check...');
  const stats = await getStats();
  console.log(`Years found: ${stats.years.length}`);
  console.log(`Themes found: ${stats.themes.length}`);
  console.log(`Institutions found: ${stats.institutions.length}`);
  
  if (stats.years.length > 0) {
      console.log('Top Year:', stats.years[0]);
  }

  // 3. Check Outlook Query with filters
  console.log('\nTesting Outlook Query (Year=2025)...');
  const result = await getOutlooks({ year: 2025, limit: 5 });
  console.log(`Found ${result.total} outlooks for 2025.`);
  console.log('First outlook:', result.data[0] ? result.data[0].theme : 'None');

  console.log('\nVerification Complete.');
}

verify()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
