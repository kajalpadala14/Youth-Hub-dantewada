const scriptUrl = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

async function testLiveSheetCRUD() {
  console.log('====================================================');
  console.log('LIVE GOOGLE SHEET CRUD & CONNECTIVITY VERIFICATION');
  console.log('Endpoint:', scriptUrl);
  console.log('====================================================\n');

  const testId = 'LIVE_TEST_' + Date.now();
  let createdRecordId = null;

  // ----------------------------------------------------
  // 1. CREATE (addRecord)
  // ----------------------------------------------------
  console.log('1. [CREATE TEST] - Adding a new record to Google Sheet (M_Form)...');
  const addPayload = {
    action: 'addRecord',
    payload: {
      sheetName: 'M_Form',
      record: {
        'Block Name': 'Dantewada',
        'Grampanchayat': 'TEST_LIVE_GP',
        'First Name': 'LiveCheck',
        'Last Name': testId,
        'Mobile Number': '9876543210',
        'Gender': 'Female',
        'Email': 'livecheck@dantewada.gov.in',
        'Pin Code': '494551',
        "Father's Name / Husband's Name": 'Test Father',
        "Mother's Name": 'Test Mother',
        'Category': 'ST',
        'Highest Qualification': 'Graduate',
        'Current Occupation': 'Candidate',
        'Aspired Career': 'Direct Formal Jobs'
      }
    }
  };

  const createRes = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(addPayload)
  }).then(r => r.json());

  console.log('-> Create Response:', createRes);
  if (!createRes.success) {
    console.error('FAILED CREATE');
    return;
  }

  // ----------------------------------------------------
  // 2. READ (getTableRecords)
  // ----------------------------------------------------
  console.log('\n2. [READ TEST] - Fetching rows from Google Sheet to verify record was added...');
  const readRes = await fetch(scriptUrl + '?action=getTableRecords&sheetName=M_Form').then(r => r.json());
  console.log('-> Total rows in M_Form sheet:', readRes.total ?? 0);

  const matched = (readRes.records || []).find(r => {
    return Object.values(r).some(v => String(v).includes(testId));
  });

  if (matched) {
    console.log('-> VERIFIED IN SHEET: Found record with Last Name =', testId);
    console.log('   Data:', JSON.stringify(matched));
    createdRecordId = matched['MForm_ID'] || matched['SR. NO.'] || testId;
  } else {
    console.warn('-> Record not found by testId in returned rows. First record:', readRes.records?.[0]);
  }

  // ----------------------------------------------------
  // 3. UPDATE (updateRecord)
  // ----------------------------------------------------
  console.log('\n3. [UPDATE TEST] - Updating mobile & occupation for record...');
  const updatePayload = {
    action: 'updateRecord',
    payload: {
      sheetName: 'M_Form',
      idColumn: "Last Name",
      idValue: testId,
      updates: {
        'Current Occupation': 'UPDATED_OCCUPATION_SUCCESS',
        'Mobile Number': '9999988888'
      }
    }
  };

  const updateRes = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(updatePayload)
  }).then(r => r.json());

  console.log('-> Update Response:', updateRes);

  // Read again to verify the update took effect in the sheet
  const verifyUpdate = await fetch(scriptUrl + '?action=getTableRecords&sheetName=M_Form').then(r => r.json());
  const updatedRow = (verifyUpdate.records || []).find(r => Object.values(r).some(v => String(v).includes(testId)));
  if (updatedRow) {
    console.log('-> VERIFIED UPDATE IN SHEET:', {
      'Current Occupation': updatedRow['Current Occupation'],
      'Mobile Number': updatedRow['Mobile Number']
    });
  }

  // ----------------------------------------------------
  // 4. DELETE (deleteRecord)
  // ----------------------------------------------------
  console.log('\n4. [DELETE TEST] - Deleting the test record from Google Sheet...');
  const deletePayload = {
    action: 'deleteRecord',
    payload: {
      sheetName: 'M_Form',
      idValue: testId
    }
  };

  const deleteRes = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(deletePayload)
  }).then(r => r.json());

  console.log('-> Delete Response:', deleteRes);

  // Read again to verify the record is gone
  const verifyDelete = await fetch(scriptUrl + '?action=getTableRecords&sheetName=M_Form').then(r => r.json());
  const stillExists = (verifyDelete.records || []).some(r => Object.values(r).some(v => String(v).includes(testId)));
  console.log('-> VERIFIED DELETE IN SHEET: Record still exists?', stillExists ? 'YES (Failed)' : 'NO (Successfully Removed)');

  console.log('\n====================================================');
  console.log('ALL LIVE CRUD OPERATIONS COMPLETED');
  console.log('====================================================');
}

testLiveSheetCRUD();
