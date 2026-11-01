const scriptUrl = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

async function testBackendCRUD() {
  console.log('--- TESTING LIVE GOOGLE APPS SCRIPT BACKEND CRUD ---\n');

  // 1. CREATE via addRecord
  console.log('1. [BACKEND CREATE]');
  const testId = 'TEST-' + Date.now();
  const createPayload = {
    action: 'addRecord',
    payload: {
      sheetName: 'M_Form',
      record: {
        'Block Name': 'Dantewada',
        'Grampanchayat': 'TEST_GP',
        'First Name': 'TestUser',
        'Last Name': testId,
        'Mobile Number': '9999988888',
        'Gender': 'Male',
        'Email': 'test@gmail.com',
        'Pin Code': '494551',
        "Father's Name / Husband's Name": 'Father Name',
        "Mother's Name": 'Mother Name',
        'Category': 'ST',
        'Highest Qualification': '12th Pass',
        'Current Occupation': 'Candidate',
        'Aspired Career': 'Direct Jobs'
      }
    }
  };

  const createRes = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(createPayload)
  }).then(r => r.json());

  console.log('-> Create Result:', createRes.success ? 'SUCCESS' : 'FAILED', createRes.message || '');

  // 2. READ via getTableRecords
  console.log('\n2. [BACKEND READ]');
  const readRes = await fetch(scriptUrl + '?action=getTableRecords&sheetName=M_Form').then(r => r.json());
  console.log('-> Read Result:', readRes.success ? 'SUCCESS' : 'FAILED', 'Total Records:', readRes.total || 0);

  // 3. DELETE via deleteRecord
  console.log('\n3. [BACKEND DELETE]');
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

  console.log('-> Delete Result:', deleteRes.success ? 'SUCCESS' : 'INFO/RESPONSE', deleteRes.message || '');
}

testBackendCRUD().catch(e => console.error('Error:', e.message));
