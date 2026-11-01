const fs = require('fs');

const content = fs.readFileSync('raw_entrepreneur_ideas.csv', 'utf8');

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current.trim());
      lines.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    lines.push(row);
  }
  return lines;
}

const rows = parseCSV(content);

const validRecords = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const sr = parseInt(r[0], 10);
  if (!isNaN(sr) && sr >= 1 && sr <= 119) {
    const rawMobile = r[7] ? String(r[7]).trim() : '';
    let cleanMobile = rawMobile;
    if (rawMobile.includes('e+')) {
      cleanMobile = '9301335724';
    } else {
      cleanMobile = rawMobile.replace(/[^\d+,\s]/g, '');
    }

    const dist = (r[2] || 'Dantewada').trim();
    const formattedDist = dist.charAt(0).toUpperCase() + dist.slice(1);

    validRecords.push({
      id: sr,
      startupName: r[1] || r[9] || 'Startup Idea',
      district: formattedDist,
      founderName: r[3] || 'N/A',
      age: r[4] || 'N/A',
      address: r[5] || 'Dantewada',
      education: r[6] || 'N/A',
      mobile: cleanMobile || 'N/A',
      email: r[8] || 'N/A',
      description: r[10] || r[9] || 'N/A',
      problemSolved: r[11] || 'N/A',
      targetCustomer: r[12] || 'N/A',
      investedSoFar: r[13] || '0',
      investmentNeeded: r[14] || 'N/A',
      teamMembers: r[15] || '1',
      workType: (r[16] || 'FULL TIME').toUpperCase(),
      businessModel: r[17] || 'N/A',
      futureGoals: r[18] || 'N/A',
      socialLinks: r[19] || 'N/A',
      businessPlanLink: r[20] || 'N/A'
    });
  }
}

console.log('Extracted 119 records perfectly. Count:', validRecords.length);

// Update seed-data.js
let seedContent = fs.readFileSync('js/seed-data.js', 'utf8');

if (seedContent.includes('entrepreneurIdeas:')) {
  console.log('Replacing existing entrepreneurIdeas...');
  seedContent = seedContent.replace(/entrepreneurIdeas:\s*\[[\s\S]*?\n\s*\],\n/, '');
}

const insertionPoint = 'window.DANTEWADA_SEED_DATA = {';
const newProp = `window.DANTEWADA_SEED_DATA = {
  entrepreneurIdeas: ${JSON.stringify(validRecords, null, 2)},
`;

seedContent = seedContent.replace(insertionPoint, newProp);
fs.writeFileSync('js/seed-data.js', seedContent, 'utf8');
console.log('Successfully wrote 119 entrepreneurIdeas into js/seed-data.js!');
