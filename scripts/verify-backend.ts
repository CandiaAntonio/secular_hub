
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// We can't easily import the query functions if they are ES modules in lib/db/queries.ts
// So we will just use prisma directly here to verify.
// Or we can try to require them if we make queries.ts compatible, but queries.ts is part of Next app so likely ESM/TS.
// Verification script will just use Prisma Client.

async function verify() {
  console.log('Verifying Backend Infrastructure...');
  
  // 1. Check DB Connection and Count
  const count = await prisma.outlookCall.count();
  console.log(`\nTotal Records in DB: ${count}`);
  
  // 2. Sample Check
  if (count > 0) {
      const sample = await prisma.outlookCall.findFirst();
      console.log('Sample Record:', sample);
      
      const years = await prisma.outlookCall.groupBy({
          by: ['year'],
          _count: { _all: true },
          orderBy: { year: 'desc' },
      });
      console.log('Years distribution:', years);
  } else {
    console.error('ERROR: Database is empty!');
    process.exit(1);
  }

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
