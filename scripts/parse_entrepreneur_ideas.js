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
console.log('Total parsed rows:', rows.length);
console.log('Header columns:', rows[0].length);

// Extract the 119 main records
const validRecords = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const sr = parseInt(r[0], 10);
  if (!isNaN(sr) && sr >= 1 && sr <= 119) {
    // Column map for the main 119 items
    validRecords.push({
      id: sr,
      startupName: r[1] || r[9] || 'Startup',
      district: r[2] || 'Dantewada',
      founderName: r[3] || 'N/A',
      age: r[4] || 'N/A',
      address: r[5] || 'N/A',
      education: r[6] || 'N/A',
      mobile: r[7] ? String(r[7]).replace(/[^\d+,\s]/g, '') : 'N/A',
      email: r[8] || 'N/A',
      description: r[10] || r[9] || 'N/A',
      problemSolved: r[11] || 'N/A',
      targetCustomer: r[12] || 'N/A',
      investedSoFar: r[13] || 'N/A',
      investmentNeeded: r[14] || 'N/A',
      teamMembers: r[15] || '1',
      workType: r[16] || 'FULL TIME',
      businessModel: r[17] || 'N/A',
      futureGoals: r[18] || 'N/A',
      socialLinks: r[19] || 'N/A',
      businessPlanLink: r[20] || 'N/A'
    });
  }
}

console.log('Successfully extracted records count:', validRecords.length);
if (validRecords.length > 0) {
  console.log('Record 1:', validRecords[0].id, validRecords[0].startupName, validRecords[0].founderName, validRecords[0].district);
  console.log('Record 119:', validRecords[validRecords.length - 1].id, validRecords[validRecords.length - 1].startupName, validRecords[validRecords.length - 1].founderName);
}
