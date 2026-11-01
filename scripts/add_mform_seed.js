const fs = require('fs');
const path = require('path');

const mformData = fs.readFileSync(path.join(__dirname, 'mform_data.json'), 'utf8');
const seedPath = path.join(__dirname, '../js/seed-data.js');
let seedContent = fs.readFileSync(seedPath, 'utf8');

if (!seedContent.includes('mFormRecords:')) {
  const target = '  "metadata": {';
  const insertion = '  mFormRecords: ' + mformData + ',\n' + target;
  seedContent = seedContent.replace(target, insertion);
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('Added mFormRecords to js/seed-data.js');
} else {
  console.log('mFormRecords already present in js/seed-data.js');
}
