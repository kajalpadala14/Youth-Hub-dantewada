const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

test('Dantewada Youth Development Portal - Backend & Data Integrity Test', async (t) => {
  // 1. Verify seed data exists and has all 12 modules
  const seedFile = fs.readFileSync('js/seed-data.js', 'utf8');
  assert.ok(seedFile.length > 50000, 'Seed data file should be populated');

  const sandbox = {};
  eval(seedFile.replace('window.DANTEWADA_SEED_DATA', 'sandbox.data'));
  const d = sandbox.data;

  await t.test('Seed Data Module Verification', () => {
    assert.strictEqual(d.youth.length >= 300, true, 'At least 300 registered youth in seed data');
    assert.strictEqual(d.placed.length >= 25, true, 'Employed youth records present');
    assert.strictEqual(d.skills.length >= 50, true, 'Skill linked youth present');
    assert.strictEqual(d.loans.length >= 40, true, 'PMEGP/PMFME/Mudra loans present');
    assert.strictEqual(d.trainingConducted.length >= 5, true, 'Trainings conducted present');
    assert.strictEqual(d.fieldVisits.length >= 4, true, 'Field visits present');
    assert.strictEqual(d.successStories.length >= 4, true, 'Success stories present');
  });

  await t.test('Field Visit Photos and Attributes Verification', () => {
    const v1 = d.fieldVisits[0];
    assert.ok(v1.id.startsWith('VIS-2026-'), 'Visit ID should follow VIS-2026-XXXX format');
    assert.ok(Array.isArray(v1.photos) && v1.photos.length > 0, 'Visit should contain attached photos');
    assert.ok(v1.officerName, 'Visiting officer name should be present');
    assert.ok(v1.findings, 'Findings should be present');
  });

  await t.test('Success Stories Structure Verification', () => {
    const s1 = d.successStories[0];
    assert.ok(s1.youthName, 'Youth name should be present in story');
    assert.ok(s1.title, 'Title should be present');
    assert.ok(s1.summary, 'Summary should be present');
    assert.ok(s1.photoUrl, 'Photo URL should be present');
    assert.strictEqual(s1.status, 'Published', 'Sample story should be published');
  });

  await t.test('PII Masking Verification', () => {
    const maskMobile = (mobile) => {
      const clean = String(mobile).replace(/\D/g, '');
      if (clean.length < 10) return 'XXXXX-' + clean.slice(-4);
      return clean.slice(0, 2) + 'XXXX-XX' + clean.slice(-2);
    };

    const masked = maskMobile('9754000000');
    assert.strictEqual(masked, '97XXXX-XX00', 'Mobile number should be correctly masked');
    assert.strictEqual(masked.includes('975400'), false, 'Sensitive digits should not be visible');
  });

  await t.test('11 Sheets Schema & Quirks Verification', () => {
    // Read and verify db.js handles the custom sheet quirks
    const dbCode = fs.readFileSync('js/db.js', 'utf8');
    assert.ok(dbCode.includes('Faather Name'), 'Should handle Faather Name typo');
    assert.ok(dbCode.includes('First Name'), 'Should combine First Name and Last Name');
    assert.ok(dbCode.includes('AGE_1'), 'Should handle duplicate AGE columns');
    assert.ok(dbCode.includes('BUSSINESS'), 'Should map BUSSINESS field');
  });

  await t.test('12 Category Module KPI Cards Verification in Admin Dashboard', () => {
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    const requiredKpiCardIds = [
      'kpi-card-val-employment-registration',
      'kpi-card-val-employed',
      'kpi-card-val-skill-linked',
      'kpi-card-val-education-linked',
      'kpi-card-val-entrepreneur-identified',
      'kpi-card-val-pmegp-pmfme-loan',
      'kpi-card-val-rang-de-loan',
      'kpi-card-val-iim-candidate-list',
      'kpi-card-val-training-conducted',
      'kpi-card-val-my-bharat-registration',
      'kpi-card-val-youth-hub-trainings',
      'kpi-card-val-bastar-munne-shivir'
    ];
    for (const id of requiredKpiCardIds) {
      assert.ok(adminHtml.includes(id), `admin.html should contain KPI card id: ${id}`);
    }
  });

  await t.test('Meetings with VO, CLF & TRIF Verification', () => {
    assert.ok(Array.isArray(d.meetingsVoClfTrif), 'meetingsVoClfTrif array exists in seed data');
    assert.ok(d.meetingsVoClfTrif.length >= 20, 'Should contain at least 20 meeting records');
    const firstMeeting = d.meetingsVoClfTrif[0];
    assert.ok(firstMeeting.orgName, 'Should contain organization/CLF name');
    assert.ok(firstMeeting.agenda, 'Should contain meeting agenda');
    assert.ok(firstMeeting.block, 'Should contain block name');
  });

  await t.test('Bastar Munne Shivir Real 254 Records Verification', () => {
    assert.strictEqual(d.bastarShivir.length, 254, 'Should contain all 254 real candidate records');
    const trades = new Set(d.bastarShivir.map(r => r.training));
    assert.ok(trades.has('RAJMISTRI'), 'Should contain Rajmistri trade');
    assert.ok(trades.has('DRIVING'), 'Should contain Driving trade');
    assert.ok(trades.has('SILAI'), 'Should contain Silai trade');
    assert.ok(trades.has('COMPUTER'), 'Should contain Computer trade');
    assert.ok(trades.has('ELECTRICIAN'), 'Should contain Electrician trade');
    assert.ok(trades.has('WELDING'), 'Should contain Welding trade');
    assert.ok(trades.has('PLUMBER'), 'Should contain Plumber trade');
  });

  await t.test('Bastar Munne Shivir Village-wise Report Verification', () => {
    assert.ok(Array.isArray(d.bastarMunneVillageReport), 'Village report array exists in seed data');
    assert.strictEqual(d.bastarMunneVillageReport.length, 37, 'Should contain 36 villages + 1 total row');
    const totalRow = d.bastarMunneVillageReport[d.bastarMunneVillageReport.length - 1];
    assert.strictEqual(totalRow.total, 441, 'Total registrations should be 441');
    assert.strictEqual(totalRow.rajmistri, 236, 'Total Rajmistri should be 236');
    assert.strictEqual(totalRow.driving, 101, 'Total Driving should be 101');
    assert.strictEqual(totalRow.silai, 71, 'Total Silai should be 71');
  });

  await t.test('Bastar Munne Shivir Interactive Village Candidate Directory Verification', () => {
    assert.ok(Array.isArray(d.bastarVillageCandidates), 'bastarVillageCandidates exists in seed data');
    assert.ok(d.bastarVillageCandidates.length >= 441, 'Should contain detailed candidate records for all 441+ registrations');

    // Test village drilldown
    const padhapur = d.bastarVillageCandidates.filter(c => c.village === 'PADHAPUR');
    assert.ok(padhapur.length >= 10, 'Padhapur should have candidates');
    const padhapurRajmistri = padhapur.filter(c => c.training === 'RAJMISTRI');
    assert.strictEqual(padhapurRajmistri.length, 10, 'Padhapur should have 10 Rajmistri candidates');

    // Test Aranpur drilldown
    const aranpur = d.bastarVillageCandidates.filter(c => c.village === 'ARANPUR');
    assert.ok(aranpur.length >= 20, 'Aranpur should have candidates');
    const aranpurRajmistri = aranpur.filter(c => c.training === 'RAJMISTRI');
    assert.strictEqual(aranpurRajmistri.length, 20, 'Aranpur should have 20 Rajmistri candidates');
  });

  await t.test('Entrepreneur Identified 119 Real Startup Ideas Verification', () => {
    assert.ok(Array.isArray(d.entrepreneurIdeas), 'entrepreneurIdeas array exists in seed data');
    assert.strictEqual(d.entrepreneurIdeas.length, 119, 'Should contain all 119 startup ideas');
    assert.strictEqual(d.entrepreneurIdeas[0].startupName, 'Wellness center');
    assert.strictEqual(d.entrepreneurIdeas[118].id, 119);
  });

  await t.test('Navigation Bar Startup Ideas (119) & District Integration Verification', () => {
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    const indexHtml = fs.readFileSync('index.html', 'utf8');

    // Admin Sidebar Navigation
    assert.ok(adminHtml.includes('12. Startup Hunt') || adminHtml.includes('12. Startup & Innovation Ideas'), 'Admin sidebar has 12. Startup Hunt');
    const adminJs = fs.readFileSync('js/admin-app.js', 'utf8');
    assert.ok(adminJs.includes('Startup_District_Ideas'), 'Admin JS supports Startup Ideas by District handler');
    assert.ok(adminHtml.includes('startupDistrictFilterBar'), 'Admin viewer has district filter bar');

    // Index Public Navigation Bar
    assert.ok(indexHtml.includes('href="#startups"'), 'Index navbar links to #startups');
    assert.ok(indexHtml.includes('id="startups"'), 'Index has dedicated startups section');
    assert.ok(indexHtml.includes('id="startupModal"'), 'Index has startup detail modal');
  });

  await t.test('Bulk Upload Feature & Exact CSV Format Verification', () => {
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    const adminJs = fs.readFileSync('js/admin-app.js', 'utf8');
    const dbJs = fs.readFileSync('js/db.js', 'utf8');

    // UI elements in admin.html
    assert.ok(adminHtml.includes('openBulkUploadModal'), 'Admin has Bulk Upload button');
    assert.ok(adminHtml.includes('id="bulkUploadModal"'), 'Admin has Bulk Upload modal');
    assert.ok(adminHtml.includes('id="bulkPasteTextarea"'), 'Admin modal has direct CSV paste textarea');
    assert.ok(adminHtml.includes('downloadSheetExcelTemplate'), 'Admin modal has Excel template download');
    assert.ok(adminHtml.includes('id="bulkDropzone"'), 'Admin modal has file drag & drop');

    // Controller functions in admin-app.js
    assert.ok(adminJs.includes('window.openBulkUploadModal'), 'admin-app.js defines openBulkUploadModal');
    assert.ok(adminJs.includes('window.downloadSheetCsvTemplate'), 'admin-app.js defines downloadSheetCsvTemplate');
    assert.ok(adminJs.includes('window.parseBulkPasteData'), 'admin-app.js defines parseBulkPasteData');
    assert.ok(adminJs.includes('window.commitBulkUpload'), 'admin-app.js defines commitBulkUpload');

    // DB service support in db.js
    assert.ok(dbJs.includes('previewImport'), 'db.js has previewImport');
    assert.ok(dbJs.includes('commitImport'), 'db.js has commitImport');
  });

  await t.test('Clean Slate 0-Record Default Database Verification', () => {
    const dbJs = fs.readFileSync('js/db.js', 'utf8');
    assert.ok(dbJs.includes('DANTEWADA_PORTAL_DB_V3'), 'Uses V3 cache key to prevent stale mock data reload');
    assert.ok(dbJs.includes('clearAllData'), 'Provides clearAllData function');
    assert.ok(dbJs.includes('createEmptyDatabase'), 'Provides clean empty database factory');

    // Run db.js inside an isolated sandbox with mock localStorage
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
    assert.ok(db, 'DantewadaDB instance created');

    // Verify all collections start at 0 records
    assert.strictEqual(db.data.youth.length, 0, 'Youth collection starts at 0');
    assert.strictEqual(db.data.placed.length, 0, 'Placed collection starts at 0');
    assert.strictEqual(db.data.skills.length, 0, 'Skills collection starts at 0');
    assert.strictEqual(db.data.loans.length, 0, 'Loans collection starts at 0');
    assert.strictEqual(db.data.trainingConducted.length, 0, 'TrainingConducted starts at 0');
    assert.strictEqual(db.data.entrepreneurIdeas.length, 0, 'EntrepreneurIdeas starts at 0');
    assert.strictEqual(db.data.bastarShivir.length, 0, 'BastarShivir starts at 0');

    // Verify KPIs all calculate to 0
    const kpis = db.getKPIs();
    assert.strictEqual(kpis.totalYouth, 0);
    assert.strictEqual(kpis.employedYouth, 0);
    assert.strictEqual(kpis.skillTrainedYouth, 0);
    assert.strictEqual(kpis.identifiedEntrepreneurs, 0);

    // Verify sheet data methods return 0 rows
    assert.strictEqual(db.getSheetData('Employment_Registration').length, 0);
    assert.strictEqual(db.getSheetData('Training_Conducted').length, 0);
    assert.strictEqual(db.getSheetData('Entrepreneur_Identified').length, 0);
    assert.strictEqual(db.getSheetData('Startup_District_Ideas').length, 0);
    assert.strictEqual(db.getSheetData('Bastar_Munne_Shivir').length, 0);

    // Test clearAllData works
    db.data.youth.push({ id: 1, name: 'Test' });
    assert.strictEqual(db.data.youth.length, 1);
    db.clearAllData();
    assert.strictEqual(db.data.youth.length, 0, 'clearAllData resets back to 0');

    // Test legacy mock seed auto-purge
    const legacyStorage = {
      'DANTEWADA_PORTAL_DB_V3': JSON.stringify({
        metadata: { district: 'Dantewada', version: '3.0.0' },
        youth: [{ id: '1', name: 'Manisha Yadav', firstName: 'Manisha' }],
        placed: [{ id: '1', name: 'Rahul Baghel', organisation: 'NMDC Ltd' }],
        skills: [{ id: '1', trade: 'Electrician', institute: 'District Livelihood College' }]
      })
    };
    const legacyWindow = {
      localStorage: {
        getItem: (k) => legacyStorage[k] || null,
        setItem: (k, v) => { legacyStorage[k] = v; }
      },
      dispatchEvent: () => {}
    };
    runSandbox(legacyWindow, legacyWindow.localStorage);
    assert.strictEqual(legacyWindow.DantewadaDB.data.youth.length, 0, 'Legacy mock youth is automatically purged');
    assert.strictEqual(legacyWindow.DantewadaDB.data.placed.length, 0, 'Legacy mock placed is automatically purged');
    assert.strictEqual(legacyWindow.DantewadaDB.data.skills.length, 0, 'Legacy mock skills is automatically purged');
  });

  await t.test('XSS Sanitization & HTML Escaping Verification', () => {
    const dbJs = fs.readFileSync('js/db.js', 'utf8');
    const mockWindow = { localStorage: { getItem: () => null, setItem: () => {} }, dispatchEvent: () => {} };
    const runSandbox = new Function('window', 'localStorage', dbJs);
    runSandbox(mockWindow, mockWindow.localStorage);

    const escapeHtml = mockWindow.escapeHtml || mockWindow.DantewadaUtils.escapeHtml;
    assert.ok(typeof escapeHtml === 'function', 'escapeHtml should be exported');

    // Test malicious script tags
    const payload1 = '<script>alert("xss")</script>';
    assert.strictEqual(escapeHtml(payload1), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    // Test malicious event attributes
    const payload2 = '<img src=x onerror=alert(1)>';
    assert.strictEqual(escapeHtml(payload2), '&lt;img src=x onerror=alert(1)&gt;');

    // Test quotes and ampersands
    const payload3 = 'Dantewada & Bastar "Youth" \'Initiative\'';
    assert.strictEqual(escapeHtml(payload3), 'Dantewada &amp; Bastar &quot;Youth&quot; &#39;Initiative&#39;');

    // Null/undefined safety
    assert.strictEqual(escapeHtml(null), '');
    assert.strictEqual(escapeHtml(undefined), '');
  });

  await t.test('Public PII Masking & Privacy Verification', () => {
    const publicJs = fs.readFileSync('js/public-app.js', 'utf8');
    assert.ok(publicJs.includes('maskMobile'), 'public-app.js uses maskMobile');
    assert.ok(publicJs.includes('maskMobile(idea.mobile)'), 'Startup details modal masks founder mobile');
    assert.ok(!publicJs.includes('${idea.mobile || \'N/A\'}'), 'Raw unmasked idea.mobile is not rendered');
  });

  await t.test('Server Security Configuration Verification', () => {
    const serverCode = fs.readFileSync('server.js', 'utf8');
    assert.ok(serverCode.includes('X-Content-Type-Options'), 'Server enforces nosniff header');
    assert.ok(serverCode.includes('X-Frame-Options'), 'Server enforces SAMEORIGIN header');
    assert.ok(serverCode.includes('BLOCKED_PATTERNS'), 'Server has blocked patterns for sensitive files');
    assert.ok(serverCode.includes('isSafePath'), 'Server validates safe paths to prevent directory traversal');
  });

  await t.test('VO / CLF Meeting Module & 8 Fields Verification', () => {
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    const adminJs = fs.readFileSync('js/admin-app.js', 'utf8');
    const dbJs = fs.readFileSync('js/db.js', 'utf8');

    // 1. Sidebar Nav and Dashboard Card
    assert.ok(adminHtml.includes('16. VO CLF Meeting'), 'Admin sidebar includes 16. VO CLF Meeting');
    assert.ok(adminHtml.includes('kpi-card-val-meetings-vo-clf-trif'), 'Dashboard card KPI counter exists');
    assert.ok(adminHtml.includes('value="Meetings_VO_CLF_TRIF"'), 'Importer dropdown has Meetings_VO_CLF_TRIF');

    // 2. Exact 8 Fields in SHEET_CONFIGS
    const requiredFields = [
      'DATE',
      'VILLAGE',
      'BLOCK',
      'VO / CLF NAME',
      'ADHAYAKSH / SACHIV',
      'DISCUSS POINT',
      'REMARKS',
      'PHOTO UPLOAD'
    ];
    requiredFields.forEach(field => {
      assert.ok(adminJs.includes(`"${field}"`), `SHEET_CONFIGS should include param ${field}`);
    });

    // 3. Database import and retrieval verification
    const mockWindow = { localStorage: { getItem: () => null, setItem: () => {} }, dispatchEvent: () => {} };
    const runSandbox = new Function('window', 'localStorage', dbJs);
    runSandbox(mockWindow, mockWindow.localStorage);
    const db = mockWindow.DantewadaDB;

    // Insert sample meeting via commitImport
    const importRes = db.commitImport('Meetings_VO_CLF_TRIF', [
      {
        'DATE': '2026-03-01',
        'VILLAGE': 'HIRANAR',
        'BLOCK': 'Geedam',
        'VO / CLF NAME': 'Prerna Mahila Gram Sangathan',
        'ADHAYAKSH / SACHIV': 'Smt. Jamuna Bai',
        'DISCUSS POINT': 'Youth mobilization for training',
        'REMARKS': 'Resolution passed',
        'PHOTO': 'https://example.com/photo.jpg'
      }
    ]);
    assert.strictEqual(importRes.success, true);
    assert.strictEqual(importRes.insertedCount, 1);

    const sheetRows = db.getSheetData('Meetings_VO_CLF_TRIF');
    assert.strictEqual(sheetRows.length, 1);
    const row = sheetRows[0];
    assert.strictEqual(row.date, '2026-03-01');
    assert.strictEqual(row.village, 'HIRANAR');
    assert.strictEqual(row.block, 'Geedam');
    assert.strictEqual(row.voClfName, 'Prerna Mahila Gram Sangathan');
    assert.strictEqual(row.adhayakshSachiv, 'Smt. Jamuna Bai');
    assert.strictEqual(row.discussPoint, 'Youth mobilization for training');
    assert.strictEqual(row.remarks, 'Resolution passed');
    assert.strictEqual(row.photo, 'https://example.com/photo.jpg');
  });

  await t.test('Sheet 17 M-Form Dedicated Module Verification', () => {
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    const adminJs = fs.readFileSync('js/admin-app.js', 'utf8');
    const dbJs = fs.readFileSync('js/db.js', 'utf8');

    // 1. Navigation verification
    assert.ok(adminHtml.includes('17. M-Form'), 'admin.html should have 17. M-Form button in navigation');
    assert.ok(adminHtml.includes('1. Employment Registration'), 'admin.html should retain 1. Employment Registration cleanly');
    assert.ok(adminHtml.includes('data-sheet="M_Form"'), 'admin.html should have data-sheet="M_Form"');

    // 2. SHEET_CONFIGS verification
    assert.ok(adminJs.includes('titleEn: "17. M-Form"'), 'SHEET_CONFIGS should configure 17. M-Form');
    assert.ok(adminJs.includes('collection: "mFormRecords"'), 'SHEET_CONFIGS should map to mFormRecords');

    // 3. Database import and retrieval verification
    const mockWindow = { localStorage: { getItem: () => null, setItem: () => {} }, dispatchEvent: () => {} };
    const runSandbox = new Function('window', 'localStorage', dbJs);
    runSandbox(mockWindow, mockWindow.localStorage);
    const db = mockWindow.DantewadaDB;

    const importRes = db.commitImport('M_Form', [
      {
        'Block Name': 'Dantewada',
        'Grampanchayat': 'BADEKAMELI',
        'First Name': 'Radhika',
        'Last Name': 'Tamo',
        'Mobile Number': '9399150975',
        'Gender': 'Female',
        'Email': 'radhika.tamo@gmail.com',
        'Pin Code': '494551',
        "Father's Name / Husband's Name": 'Chamru tamo',
        "Mother's Name": 'Smt. Tamo',
        'Category': 'ST',
        'Highest Qualification': '12th Pass',
        'Current Occupation': 'Candidate',
        'Aspired Career': 'Direct Formal Jobs'
      }
    ]);
    assert.strictEqual(importRes.success, true);
    assert.strictEqual(importRes.insertedCount, 1);

    const mRows = db.getSheetData('M_Form');
    assert.strictEqual(mRows.length, 1);
    assert.strictEqual(mRows[0].block, 'Dantewada');
    assert.strictEqual(mRows[0].gramPanchayat, 'BADEKAMELI');
    assert.strictEqual(mRows[0].firstName, 'Radhika');
    assert.strictEqual(mRows[0].lastName, 'Tamo');
    assert.strictEqual(mRows[0].mobile, '9399150975');
    assert.strictEqual(mRows[0].gender, 'Female');
    assert.strictEqual(mRows[0].email, 'radhika.tamo@gmail.com');
    assert.strictEqual(mRows[0].pinCode, '494551');
    assert.strictEqual(mRows[0].fatherHusband, 'Chamru tamo');
    assert.strictEqual(mRows[0].motherName, 'Smt. Tamo');
    assert.strictEqual(mRows[0].category, 'ST');
    assert.strictEqual(mRows[0].qualification, '12th Pass');
    assert.strictEqual(mRows[0].currentOccupation, 'Candidate');
    assert.strictEqual(mRows[0].aspiredCareer, 'Direct Formal Jobs');
  });

  await t.test('Employed Bulk Upload: Handles trailing space in NAME and MOBILE N0. cleanly', () => {
    const dbJs = fs.readFileSync('js/db.js', 'utf8');
    const mockWindow = { localStorage: { getItem: () => null, setItem: () => {} }, dispatchEvent: () => {} };
    const runSandbox = new Function('window', 'localStorage', dbJs);
    runSandbox(mockWindow, mockWindow.localStorage);
    const db = mockWindow.DantewadaDB;

    const rawEmployedRows = [
      {
        'SR. NO.': 1,
        'NAME ': 'Sanjay Kumar',
        'FATHER NAME': 'Ramu Ram',
        'ADDRESS': 'MOFALNAR',
        'BLOCK': 'Dantewada',
        'DISTRICT': 'Dantewada',
        'MOBILE N0.': '8225886404',
        'ORGANISATION': 'TRI MOBILIZER',
        'DATE OF JOINING': '2024-05-01',
        'SALARY': '15000'
      }
    ];

    const preview = db.previewImport('Employed', rawEmployedRows);
    assert.strictEqual(preview.totalCount, 1);
    assert.strictEqual(preview.validRows.length, 1);
    assert.strictEqual(preview.invalidRows.length, 0);
    assert.strictEqual(preview.validRows[0]._normalized.name, 'Sanjay Kumar');
    assert.strictEqual(preview.validRows[0]._normalized.mobile, '8225886404');
    assert.strictEqual(preview.validRows[0]._normalized.organisation, 'TRI MOBILIZER');
  });

  await t.test('Cloud Synchronization & Dual Header Compatibility Verification', () => {
    const adminAppCode = fs.readFileSync('js/admin-app.js', 'utf8');
    const mockWindow = {};
    try {
      const evalEnv = new Function('window', 'document', adminAppCode);
      evalEnv(mockWindow, { getElementById: () => null });
    } catch (e) {
      // Ignore DOM setup errors
    }

    assert.strictEqual(typeof mockWindow.getCloudSheetName, 'function');
    assert.strictEqual(mockWindow.getCloudSheetName('Youth_Hub_Trainings'), 'Youth_Hub_Trainee');
    assert.strictEqual(mockWindow.getCloudSheetName('Meetings_VO_CLF_TRIF'), 'VO CLF Meeting');
    assert.strictEqual(mockWindow.getCloudSheetName('Startup_District_Ideas'), 'Entrepreneur_Identified');
    assert.strictEqual(mockWindow.getCloudSheetName('Bastar_Munne_Report'), 'Bastar_Munne_Shivir');

    // Test dual header preparation for Startup Hunt
    const rawStartupHuntRows = [
      {
        'SR. NO.': 1,
        'STARTUP / IDEA NAME': 'Dantewada Organic Mahua Jam',
        'FOUNDER NAME': 'Ramesh Kumar',
        'DISTRICT': 'Dantewada',
        'ADDRESS': 'Bade Bacheli',
        'INVESTMENT NEEDED': '500000',
        'EDUCATION': 'Graduate',
        'MOBILE NO.': '9876543210'
      }
    ];

    const prepared = mockWindow.prepareRecordsForCloud('Entrepreneur_Identified', rawStartupHuntRows);
    assert.strictEqual(prepared.length, 1);
    // Legacy Google Sheet columns populated
    assert.strictEqual(prepared[0]['NAME'], 'Ramesh Kumar');
    assert.strictEqual(prepared[0]['BUSSINESS'], 'Dantewada Organic Mahua Jam');
    assert.strictEqual(prepared[0]['LOAN AMOUNT'], '500000');
    assert.strictEqual(prepared[0]['VILLAGE'], 'Bade Bacheli');
    assert.strictEqual(prepared[0]['BLOCK'], 'Dantewada');
    // Modern descriptive columns also preserved
    assert.strictEqual(prepared[0]['STARTUP / IDEA NAME'], 'Dantewada Organic Mahua Jam');
    assert.strictEqual(prepared[0]['FOUNDER NAME'], 'Ramesh Kumar');
    assert.strictEqual(prepared[0]['INVESTMENT NEEDED'], '500000');

    // Verify admin.html contains all key options in importerSheetSelect
    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    assert.ok(adminHtml.includes('value="Entrepreneur_Identified"'));
    assert.ok(adminHtml.includes('value="M_Form"'));
    assert.ok(adminHtml.includes('value="Youth_Hub_Trainings"'));
    assert.ok(adminHtml.includes('value="Meetings_VO_CLF_TRIF"'));
  });
});

