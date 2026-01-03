
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'Bloomberg_Outlooks_2019_2026.xlsx');
console.log(`Reading file from: ${filePath}`);

if (!fs.existsSync(filePath)) {
  console.error('File not found!');
  process.exit(1);
}

const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const themes = new Set();
data.forEach((r: any) => {
  if (r.Theme) {
      themes.add(r.Theme.toString().trim());
  }
});

const sortedThemes = Array.from(themes).sort();
fs.writeFileSync('themes.json', JSON.stringify(sortedThemes, null, 2));
console.log('Themes written to themes.json');
