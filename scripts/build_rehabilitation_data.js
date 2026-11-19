const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../training_conducted_upload.csv');
const raw = fs.readFileSync(csvPath, 'utf8').trim();
const lines = raw.split(/\r?\n/);
const records = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(',').map(s => s.trim());
  const addr = parts[2] || '';
  let block = 'Dantewada';
  if (/geedam/i.test(addr)) block = 'Geedam';
  else if (/kuakonda/i.test(addr)) block = 'Kuakonda';
  else if (/katekalyan/i.test(addr)) block = 'Katekalyan';

  records.push({
    id: parseInt(parts[0], 10) || i,
    name: parts[1] || '',
    address: addr,
    mobile: parts[3] || '',
    institute: parts[4] || '',
    training: parts[5] || '',
    block: block
  });
}

const fileContent = `/**
 * Rehabilitation Counselling Beneficiary Dataset
 * District Administration, Dantewada
 * 52 Beneficiary Records from Excel
 */
(function(scope) {
  const records = ${JSON.stringify(records, null, 2)};
  if (scope) {
    scope.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof window !== 'undefined') {
    window.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof global !== 'undefined') {
    global.DANTEWADA_REHABILITATION_DATA = records;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = records;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
`;

fs.writeFileSync(path.join(__dirname, '../js/rehabilitation-data.js'), fileContent, 'utf8');
console.log('Successfully generated js/rehabilitation-data.js with ' + records.length + ' records.');
