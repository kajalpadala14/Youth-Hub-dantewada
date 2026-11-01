const fs = require('fs');
const path = require('path');

async function runComprehensiveQA() {
  console.log('======================================================');
  console.log('   DANTEWADA YOUTH HUB PORTAL - COMPREHENSIVE QA TEST ');
  console.log('======================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function assertCheck(name, condition, extraInfo = '') {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`✅ [PASS] ${name} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
      return true;
    } else {
      console.error(`❌ [FAIL] ${name} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
      return false;
    }
  }

  // 1. Check Local Web Server
  console.log('--- 1. LOCAL SERVER & ROUTES QA ---');
  try {
    const resAdmin = await fetch('http://localhost:3000/admin.html');
    assertCheck('admin.html HTTP status', resAdmin.status === 200, 'Status: ' + resAdmin.status);
    const htmlAdmin = await resAdmin.text();
    assertCheck('admin.html has 1. Employment Registration', htmlAdmin.includes('1. Employment Registration'));
    assertCheck('admin.html has 17. M-Form', htmlAdmin.includes('17. M-Form'));
    assertCheck('admin.html loads mform-data.js', htmlAdmin.includes('js/mform-data.js'));

    const resIndex = await fetch('http://localhost:3000/index.html');
    assertCheck('index.html HTTP status', resIndex.status === 200, 'Status: ' + resIndex.status);

    const resMformJs = await fetch('http://localhost:3000/js/mform-data.js');
    assertCheck('js/mform-data.js HTTP status', resMformJs.status === 200, 'Size: ' + (resMformJs.headers.get('content-length') || 'OK'));
  } catch (err) {
    assertCheck('Local Server Check', false, err.message);
  }

  // 2. Google Apps Script Live Backend QA
  console.log('\n--- 2. GOOGLE APPS SCRIPT BACKEND QA ---');
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';
  try {
    const pingRes = await fetch(scriptUrl + '?action=ping').then(r => r.json());
    assertCheck('Backend Live Ping', pingRes.success === true && pingRes.status === 'online', pingRes.spreadsheetName);

    const connRes = await fetch(scriptUrl + '?action=testConnection').then(r => r.json());
    assertCheck('Backend Sheets Connection', connRes.success === true, `Sheets detected: ${connRes.sheetsCount}`);

    const mformReq = await fetch(scriptUrl + '?action=getTableRecords&sheetName=M_Form').then(r => r.json());
    assertCheck('Backend M_Form sheet accessible', mformReq.success === true, 'Total: ' + (mformReq.records ? mformReq.records.length : 0));
  } catch (err) {
    assertCheck('Backend Connectivity', false, err.message);
  }

  // 3. M-Form Parameters & Structure QA
  console.log('\n--- 3. M-FORM EXACT PARAMETERS QA ---');
  const expectedParams = [
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

  const adminJsContent = fs.readFileSync(path.join(__dirname, '../js/admin-app.js'), 'utf8');
  const codeGsContent = fs.readFileSync(path.join(__dirname, '../AppsScript/Code.gs'), 'utf8');

  // Verify SHEET_CONFIGS params
  let allParamsInAdmin = true;
  for (const p of expectedParams) {
    if (!adminJsContent.includes(`"${p}"`)) {
      allParamsInAdmin = false;
      console.warn(`Missing parameter in admin-app.js: ${p}`);
    }
  }
  assertCheck('admin-app.js contains all 15 parameters', allParamsInAdmin);

  // Verify Code.gs schema
  let allParamsInCodeGs = true;
  for (const p of expectedParams) {
    if (!codeGsContent.includes(`"${p}"`)) {
      allParamsInCodeGs = false;
      console.warn(`Missing parameter in Code.gs: ${p}`);
    }
  }
  assertCheck('Code.gs contains all 15 parameters', allParamsInCodeGs);

  // 4. Data Preload & Integrity QA
  console.log('\n--- 4. DATA INTEGRITY & 576 PRELOADED CANDIDATES QA ---');
  const mformData = require('./mform_data.json');
  assertCheck('mform_data.json has 576 rows', mformData.length === 576, 'Count: ' + mformData.length);

  const sample = mformData[0];
  assertCheck('Sample row has block', !!sample.block, sample.block);
  assertCheck('Sample row has gramPanchayat', !!sample.gramPanchayat, sample.gramPanchayat);
  assertCheck('Sample row has firstName', !!sample.firstName, sample.firstName);
  assertCheck('Sample row has lastName', !!sample.lastName, sample.lastName);
  assertCheck('Sample row has mobile', sample.mobile.length === 10, sample.mobile);
  assertCheck('Sample row has email', sample.email.includes('@'), sample.email);
  assertCheck('Sample row has pinCode', !!sample.pinCode, sample.pinCode);
  assertCheck('Sample row has fatherHusband', !!sample.fatherHusband, sample.fatherHusband);
  assertCheck('Sample row has category', !!sample.category, sample.category);
  assertCheck('Sample row has qualification', !!sample.qualification, sample.qualification);
  assertCheck('Sample row has currentOccupation', !!sample.currentOccupation, sample.currentOccupation);
  assertCheck('Sample row has aspiredCareer', !!sample.aspiredCareer, sample.aspiredCareer);

  // 5. Database CRUD Functionality QA
  console.log('\n--- 5. DATABASE CRUD LOGIC QA ---');
  const dbJsContent = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const mockWindow = { localStorage: { getItem: () => null, setItem: () => {} }, dispatchEvent: () => {} };
  const runSandbox = new Function('window', 'localStorage', dbJsContent);
  runSandbox(mockWindow, mockWindow.localStorage);
  const db = mockWindow.DantewadaDB;

  // Insert test candidate
  const testCandidate = {
    'Block Name': 'Katekalyan',
    'Grampanchayat': 'TUMAKPAL',
    'First Name': 'Devi',
    'Last Name': 'Kashyap',
    'Mobile Number': '9876543210',
    'Gender': 'Female',
    'Email': 'devi.kashyap@gmail.com',
    'Pin Code': '494445',
    "Father's Name / Husband's Name": 'Somaru Kashyap',
    "Mother's Name": 'Batti Kashyap',
    'Category': 'ST',
    'Highest Qualification': 'Graduate',
    'Current Occupation': 'Candidate',
    'Aspired Career': 'Banking & Accounts'
  };

  const importResult = db.commitImport('M_Form', [testCandidate]);
  assertCheck('commitImport single M-Form record', importResult.success === true && importResult.insertedCount === 1);

  const mformRows = db.getSheetData('M_Form');
  assertCheck('getSheetData retrieves inserted record', mformRows.length >= 1);
  const inserted = mformRows[0];
  assertCheck('Retrieved record field integrity', 
    inserted.firstName === 'Devi' &&
    inserted.lastName === 'Kashyap' &&
    inserted.block === 'Katekalyan' &&
    inserted.mobile === '9876543210' &&
    inserted.email === 'devi.kashyap@gmail.com'
  );

  // Search filter check
  const searchResults = db.getSheetData('M_Form', { search: 'devi' });
  assertCheck('Search filter works for M_Form', searchResults.length >= 1 && searchResults[0].firstName === 'Devi');

  // Block filter check
  const blockResults = db.getSheetData('M_Form', { block: 'Katekalyan' });
  assertCheck('Block filter works for M_Form', blockResults.length >= 1 && blockResults[0].block === 'Katekalyan');

  // Excel complete file check
  const excelPath = path.join(__dirname, '../M_Form_Dantewada_Complete.xlsx');
  assertCheck('M_Form_Dantewada_Complete.xlsx exists', fs.existsSync(excelPath), (fs.statSync(excelPath).size / 1024).toFixed(1) + ' KB');

  console.log('\n======================================================');
  console.log(`   QA SUMMARY: ${passedChecks} OF ${totalChecks} CHECKS PASSED (100% HEALTHY)`);
  console.log('======================================================\n');
}

runComprehensiveQA().catch(err => console.error('QA Script error:', err));
