const fs = require('fs');
const path = require('path');

const mformData = fs.readFileSync(path.join(__dirname, 'mform_data.json'), 'utf8');
const seedPath = path.join(__dirname, '../js/seed-data.js');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Replace mFormRecords: [...] with updated mFormRecords
const mformRegex = /mFormRecords:\s*\[[\s\S]*?\],\s*("metadata"|metadata)/;
if (mformRegex.test(seedContent)) {
  seedContent = seedContent.replace(mformRegex, 'mFormRecords: ' + mformData + ',\n  $1');
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('Updated mFormRecords in js/seed-data.js');
} else {
  console.log('mFormRecords pattern not found in js/seed-data.js');
}
