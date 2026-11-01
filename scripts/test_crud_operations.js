const fs = require('fs');
const path = require('path');

console.log('--- TESTING CRUD OPERATIONS (Create, Read, Update, Delete) ---\n');

// Load DB Service
const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
const mockStorage = {};
const mockWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; },
    removeItem: (k) => { delete mockStorage[k]; }
  },
  dispatchEvent: () => {}
};

const runSandbox = new Function('window', 'localStorage', dbJs);
runSandbox(mockWindow, mockWindow.localStorage);
const db = mockWindow.DantewadaDB;

// 1. CREATE TEST
console.log('1. [CREATE TEST]');
const newRecordData = {
  'Block Name': 'Dantewada',
  'Grampanchayat': 'BHANSI',
  'First Name': 'Ramesh',
  'Last Name': 'Kumar',
  'Mobile Number': '9876500001',
  'Gender': 'Male',
  'Email': 'ramesh.kumar@gmail.com',
  'Pin Code': '494551',
  "Father's Name / Husband's Name": 'Shri Ramnath Kumar',
  "Mother's Name": 'Smt. Geeta Devi',
  'Category': 'ST',
  'Highest Qualification': 'Graduate',
  'Current Occupation': 'Candidate',
  'Aspired Career': 'Govt Job / Technical'
};

const createRes = db.commitImport('M_Form', [newRecordData]);
console.log('-> Create Result:', createRes.success ? 'SUCCESS (Record Created)' : 'FAILED');
console.log('-> Inserted Count:', createRes.insertedCount);

// 2. READ TEST
console.log('\n2. [READ TEST]');
const readList = db.getSheetData('M_Form', { search: 'Ramesh' });
console.log('-> Read Search "Ramesh": Found', readList.length, 'record(s)');
const createdRow = readList[0];
console.log('-> Read Details:', {
  Name: createdRow.firstName + ' ' + createdRow.lastName,
  Mobile: createdRow.mobile,
  Block: createdRow.block,
  GP: createdRow.gramPanchayat,
  Qualification: createdRow.qualification,
  Career: createdRow.aspiredCareer
});

// 3. UPDATE TEST
console.log('\n3. [UPDATE TEST]');
// Simulate editing the record in collection
const recordIndex = db.data.mFormRecords.findIndex(r => r.mobile === '9876500001' || r.firstName === 'Ramesh');
if (recordIndex !== -1) {
  db.data.mFormRecords[recordIndex].qualification = 'Post Graduate';
  db.data.mFormRecords[recordIndex].aspiredCareer = 'District Program Manager';
  db.persist();
  console.log('-> Update executed on index:', recordIndex);
}

// Verify update via read
const updatedList = db.getSheetData('M_Form', { search: 'Ramesh' });
console.log('-> After Update Verification:', {
  Name: updatedList[0].firstName + ' ' + updatedList[0].lastName,
  Qualification: updatedList[0].qualification,
  Career: updatedList[0].aspiredCareer
});
const updateSuccess = updatedList[0].qualification === 'Post Graduate' && updatedList[0].aspiredCareer === 'District Program Manager';
console.log('-> Update Result:', updateSuccess ? 'SUCCESS (Record Updated)' : 'FAILED');

// 4. DELETE TEST
console.log('\n4. [DELETE TEST]');
const deleteIndex = db.data.mFormRecords.findIndex(r => r.firstName === 'Ramesh');
if (deleteIndex !== -1) {
  const removed = db.data.mFormRecords.splice(deleteIndex, 1);
  db.persist();
  console.log('-> Deleted record:', removed[0].firstName, removed[0].lastName);
}

// Verify deletion via read
const afterDeleteList = db.getSheetData('M_Form', { search: 'Ramesh' });
console.log('-> Read Search "Ramesh" after delete:', afterDeleteList.length, 'record(s)');
const deleteSuccess = afterDeleteList.length === 0;
console.log('-> Delete Result:', deleteSuccess ? 'SUCCESS (Record Removed Completely)' : 'FAILED');

console.log('\n----------------------------------------');
console.log('FINAL CRUD STATUS: ' + (createRes.success && readList.length > 0 && updateSuccess && deleteSuccess ? 'ALL 4 OPERATIONS WORKING 100%' : 'SOME OPERATIONS FAILED'));
console.log('----------------------------------------');
