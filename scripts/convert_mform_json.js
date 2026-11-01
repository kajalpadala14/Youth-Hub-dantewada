const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'mform_upload.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.trim().split(/\r?\n/);

function parseCsvLine(line) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  result.push(curr.trim());
  return result;
}

const data = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const cols = parseCsvLine(lines[i]);
  const fn = cols[5] || '';
  const ln = cols[7] || '';
  const emailVal = fn ? `${fn.toLowerCase()}.${(ln || 'youth').toLowerCase()}@gmail.com` : 'candidate.dantewada@gmail.com';
  const occVal = 'Candidate';
  const aspVal = 'Direct Formal Jobs';

  const obj = {
    id: i,
    block: cols[2] || 'Dantewada',
    gramPanchayat: cols[3] || '',
    firstName: fn,
    lastName: ln,
    mobile: cols[8] || '',
    gender: cols[9] || 'Male',
    email: emailVal,
    pinCode: cols[10] || '',
    fatherHusband: cols[12] || '',
    motherName: cols[13] || '',
    category: cols[14] || 'ST',
    qualification: cols[15] || '12th Pass',
    currentOccupation: occVal,
    aspiredCareer: aspVal,
    // Preserve other metadata for compatibility
    state: cols[0] || 'CHHATTISGARH',
    district: cols[1] || 'Dantewada',
    village: cols[4] || '',
    middleName: cols[6] || '',
    address: cols[11] || '',
    yearOfPassing: cols[16] || ''
  };
  data.push(obj);
}

console.log('Parsed successfully: ' + data.length + ' records');
console.log('Sample record 0:', JSON.stringify(data[0], null, 2));

const outJsonPath = path.join(__dirname, 'mform_data.json');
fs.writeFileSync(outJsonPath, JSON.stringify(data, null, 2), 'utf8');

const jsDataPath = path.join(__dirname, '../js/mform-data.js');
fs.writeFileSync(jsDataPath, 'window.DANTEWADA_MFORM_DATA = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
console.log('Saved to mform_data.json & js/mform-data.js');
