const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const mformData = require('./mform_data.json');

const headers = [
  "SR. NO.",
  "Block Name",
  "Grampanchayat",
  "First Name",
  "Last Name",
  "Mobile Number",
  "Gender",
  "Email",
  "Pin Code",
  "Father's Name / Husband's Name",
  "Mother's Name",
  "Category",
  "Highest Qualification",
  "Current Occupation",
  "Aspired Career"
];

const rows = [headers];

mformData.forEach((item, idx) => {
  rows.push([
    idx + 1,
    item.block || 'Dantewada',
    item.gramPanchayat || '',
    item.firstName || '',
    item.lastName || '',
    item.mobile || '',
    item.gender || 'Male',
    item.email || '',
    item.pinCode || '',
    item.fatherHusband || '',
    item.motherName || '',
    item.category || 'ST',
    item.qualification || '12th Pass',
    item.currentOccupation || 'Candidate',
    item.aspiredCareer || 'Direct Formal Jobs'
  ]);
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);

// Set column widths
ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));

XLSX.utils.book_append_sheet(wb, ws, "M_Form");

const outPath = path.join(__dirname, '../M_Form_Dantewada_Complete.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Successfully generated:', outPath, 'with', mformData.length, 'records.');
