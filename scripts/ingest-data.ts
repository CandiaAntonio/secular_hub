
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { themeMapping } from './theme-mapping';
import { institutionMapping } from './institution-mapping';

const prisma = new PrismaClient();

async function ingest() {
  const filePath = path.join(process.cwd(), 'Bloomberg_Outlooks_2019_2026.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error('Excel file not found');
    process.exit(1);
  }

  console.log('Reading Excel file...');
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} records. Starting ingestion...`);

  const batchSize = 100;
  let processed = 0;

  // Use a transaction for better performance?
  // Actually, standard inserts are fine for 7k records, but we can batch.

  for (const row of data as any[]) {
    const originalTheme = row.Theme ? row.Theme.toString().trim() : 'Unknown';
    const category = themeMapping[originalTheme] || 'Thematic'; // Default to Thematic if unknown
    const originalInst = row.Institution ? row.Institution.toString().trim() : 'Unknown';
    const cleanInst = institutionMapping[originalInst] || originalInst;
    
    // Normalize cleanInst further? E.g. removing " LLC" etc?
    // Using simple mapping for now.
    
    const rank = row.Rank ? parseInt(row.Rank) : null;
    let conviction = 'low';
    if (rank) {
      if (rank <= 10) conviction = 'high';
      else if (rank <= 30) conviction = 'medium';
    }

    const callText = row.Call_text ? row.Call_text.toString() : '';
    const wordCount = callText.trim().split(/\s+/).length;

    await prisma.outlookCall.create({
      data: {
        id: row.id, // Using Excel ID
        year: parseInt(row.Year) || 0,
        institution: originalInst,
        institutionCanonical: cleanInst,
        theme: originalTheme,
        subTheme: row.Sub_theme ? row.Sub_theme.toString() : null,
        themeCategory: category,
        sectionDescription: row.Section_description ? row.Section_description.toString() : null,
        callText: callText,
        rank: rank,
        convictionTier: conviction,
        wordCount: wordCount
      }
    });

    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`\rProcessed ${processed} records...`);
    }
  }

  console.log(`\nIngestion complete. Processed ${processed} records.`);
}

ingest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
