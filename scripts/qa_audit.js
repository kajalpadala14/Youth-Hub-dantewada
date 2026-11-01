const url = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

async function runQA() {
  console.log('====================================================');
  console.log('   DANTEWADA YOUTH HUB - LIVE BACKEND QA AUDIT     ');
  console.log('====================================================\n');
  console.log('Target Web App URL:', url);

  const results = {
    connection: null,
    dashboard: null,
    allData: null,
    sheets: {},
    crudActions: {}
  };

  // 1. Ping / Test Connection
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'ping' })
    });
    const d = await res.json();
    results.connection = d;
    console.log('1. Connection Ping:', d.success ? '✅ SUCCESS' : '❌ FAILED', d);
  } catch (err) {
    results.connection = { success: false, error: err.message };
    console.log('1. Connection Ping: ❌ ERROR:', err.message);
  }

  // 2. Dashboard KPIs
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getDashboard' })
    });
    const d = await res.json();
    results.dashboard = d;
    console.log('2. Dashboard KPIs:', d.success ? '✅ SUCCESS' : '❌ FAILED', d);
  } catch (err) {
    results.dashboard = { success: false, error: err.message };
    console.log('2. Dashboard KPIs: ❌ ERROR:', err.message);
  }

  // 3. 14 Sheet Tabs Reading Test
  const sheetsToCheck = [
    'Employment_Registration',
    'Employed',
    'Skill_Linked',
    'Education_Linked',
    'Training_Conducted',
    'MY_Bharat_Registration',
    'PMEGP_PMFME_Loan',
    'IIM_Candidate_List',
    'Youth_Hub_Trainee',
    'Bastar_Munne_Shivir',
    'VO CLF Meeting',
    'Entrepreneur_Identified',
    'Rang_De_Loan'
  ];

  console.log('\n3. Testing 13+ Primary Sheet Tabs in Google Sheet:');
  for (const sheet of sheetsToCheck) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getTableRecords', payload: { sheetName: sheet } })
      });
      const d = await res.json();
      results.sheets[sheet] = {
        success: d.success,
        foundSheetName: d.sheet,
        recordsCount: (d.records || []).length,
        sample: (d.records && d.records[0]) || null,
        message: d.message
      };
      if (d.success) {
        console.log(`   ✅ ${sheet} -> Matched Sheet: "${d.sheet}", Records: ${d.total}`);
        if (d.records && d.records.length > 0) {
          console.log(`      Sample Keys: [${Object.keys(d.records[0]).join(', ')}]`);
        }
      } else {
        console.log(`   ❌ ${sheet} -> FAILED: ${d.message}`);
      }
    } catch (err) {
      results.sheets[sheet] = { success: false, error: err.message };
      console.log(`   ❌ ${sheet} -> ERROR: ${err.message}`);
    }
  }

  // 4. CRUD Actions Live Verification
  console.log('\n4. Testing CRUD Actions on Deployed Web App:');
  
  // Test updateRecord
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateRecord', payload: { sheetName: 'Rang_De_Loan', idValue: 'nonexistent_test_probe' } })
    });
    const d = await res.json();
    results.crudActions['updateRecord'] = d;
    console.log('   updateRecord:', d.message === 'Unknown action: updateRecord' ? '⚠️ NOT YET DEPLOYED (Unknown action)' : (d.success ? '✅ AVAILABLE' : `⚠️ ACTIVE (Handled: ${d.message})`));
  } catch (err) {
    results.crudActions['updateRecord'] = { error: err.message };
  }

  // Test deleteRecord
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteRecord', payload: { sheetName: 'Rang_De_Loan', idValue: 'nonexistent_test_probe' } })
    });
    const d = await res.json();
    results.crudActions['deleteRecord'] = d;
    console.log('   deleteRecord:', d.message === 'Unknown action: deleteRecord' ? '⚠️ NOT YET DEPLOYED (Unknown action)' : (d.success ? '✅ AVAILABLE' : `⚠️ ACTIVE (Handled: ${d.message})`));
  } catch (err) {
    results.crudActions['deleteRecord'] = { error: err.message };
  }

  // Test bulkInsert
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'bulkInsert', payload: { sheetName: 'Rang_De_Loan', records: [] } })
    });
    const d = await res.json();
    results.crudActions['bulkInsert'] = d;
    console.log('   bulkInsert:', d.message === 'Unknown action: bulkInsert' ? '⚠️ NOT YET DEPLOYED (Unknown action)' : (d.success ? '✅ AVAILABLE' : `⚠️ ACTIVE (Handled: ${d.message})`));
  } catch (err) {
    results.crudActions['bulkInsert'] = { error: err.message };
  }

  return results;
}

runQA();
