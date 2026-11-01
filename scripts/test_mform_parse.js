const fs = require('fs');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headerLine = lines[0];

  function tokenize(line) {
    const tokens = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    tokens.push(current.trim());
    return tokens;
  }

  const headers = tokenize(headerLine);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = tokenize(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    rows.push(obj);
  }
  return { headers, rows };
}

const csv = fs.readFileSync('scripts/mform_upload.csv', 'utf8');
const { headers, rows } = parseCSV(csv);
console.log('Headers:', headers);
console.log('Total Parsed Rows:', rows.length);
console.log('Sample Row 1:', rows[0]);
