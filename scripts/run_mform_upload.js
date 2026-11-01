const fs = require('fs');

const url = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

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
  const rawRows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = tokenize(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    rawRows.push(obj);
  }
  return rawRows;
}

async function uploadInBatches() {
  const csvText = fs.readFileSync('scripts/mform_upload.csv', 'utf8');
  const rawRows = parseCSV(csvText);
  console.log(`Found ${rawRows.length} M-Form records to upload.`);

  // Map to Employment_Registration headers expected by Google Sheet
  const recordsToInsert = rawRows.map((r, idx) => {
    return {
      'First Name': r['First Name'] || '',
      'Last Name': r['Last Name'] || '',
      "Father's Name / Husband's Name": r["Father's Name / Husband's Name"] || '',
      'Grampanchayat': r['Grampanchayat'] || r['Village Of Candidate'] || '',
      'Block Name': r['Block Name'] || 'Dantewada',
      'Mobile Number': r['Mobile Number'] || '',
      'Gender': r['Gender'] || 'Male',
      'Category': r['Category'] || 'ST',
      'Highest Qualification': r['Highest Qualification'] || '12th Pass',
      'Current Occupation': 'M-Form Registered / Student',
      'Aspired Career': 'Direct Formal Jobs / Training'
    };
  });

  const BATCH_SIZE = 100;
  let totalUploaded = 0;

  for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
    const chunk = recordsToInsert.slice(i, i + BATCH_SIZE);
    console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} records, range ${i + 1} to ${i + chunk.length})...`);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'bulkInsert',
        payload: {
          sheetName: 'Employment_Registration',
          records: chunk
        }
      })
    });

    const data = await res.json();
    console.log(`Batch response:`, data);
    if (!data.success) {
      throw new Error(`Failed batch: ` + JSON.stringify(data));
    }
    totalUploaded += (data.insertedCount || chunk.length);
  }

  console.log(`\n🎉 ALL DONE! Total ${totalUploaded} records successfully inserted into Google Sheet!`);

  // Verify total count in sheet
  const checkRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'getTableRecords', payload: { sheetName: 'Employment_Registration' } })
  });
  const checkData = await checkRes.json();
  console.log(`Live Sheet Verification -> Total Records in Sheet:`, checkData.total);
}

uploadInBatches().catch(console.error);
