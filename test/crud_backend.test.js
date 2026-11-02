const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

describe('Google Apps Script Backend CRUD Tests', () => {
  const codeGsPath = path.resolve(__dirname, '../AppsScript/Code.gs');
  const code = fs.readFileSync(codeGsPath, 'utf8');

  function createMockSpreadsheet(initialSheets = {}) {
    const sheetsMap = {};

    for (const [name, data] of Object.entries(initialSheets)) {
      sheetsMap[name] = {
        name,
        rows: data.slice(),
        getName() { return this.name; },
        getLastRow() { return this.rows.length; },
        getLastColumn() { return this.rows[0] ? this.rows[0].length : 0; },
        getRange(row, col, numRows = 1, numCols = 1) {
          const self = this;
          return {
            getValues() {
              const res = [];
              for (let r = row - 1; r < row - 1 + numRows; r++) {
                const rowData = self.rows[r] ? self.rows[r].slice(col - 1, col - 1 + numCols) : [];
                res.push(rowData);
              }
              return res;
            },
            setValues(vals) {
              for (let r = 0; r < vals.length; r++) {
                const targetRowIdx = row - 1 + r;
                if (!self.rows[targetRowIdx]) self.rows[targetRowIdx] = [];
                for (let c = 0; c < vals[r].length; c++) {
                  self.rows[targetRowIdx][col - 1 + c] = vals[r][c];
                }
              }
            },
            setBackground() {},
            setFontColor() {},
            setFontWeight() {},
            setHorizontalAlignment() {},
            setFontSize() {},
            merge() {}
          };
        },
        appendRow(rowVals) {
          this.rows.push(rowVals);
        },
        deleteRow(rowIdx) {
          this.rows.splice(rowIdx - 1, 1);
        },
        setFrozenRows() {}
      };
    }

    return {
      getName() { return 'Test Database'; },
      getSheets() { return Object.values(sheetsMap); },
      getSheetByName(name) { return sheetsMap[name] || null; },
      insertSheet(name) {
        const newSheet = {
          name,
          rows: [],
          getName() { return this.name; },
          getLastRow() { return this.rows.length; },
          getLastColumn() { return this.rows[0] ? this.rows[0].length : 0; },
          getRange(row, col, numRows = 1, numCols = 1) {
            const self = this;
            return {
              getValues() {
                const res = [];
                for (let r = row - 1; r < row - 1 + numRows; r++) {
                  const rowData = self.rows[r] ? self.rows[r].slice(col - 1, col - 1 + numCols) : [];
                  res.push(rowData);
                }
                return res;
              },
              setValues(vals) {
                for (let r = 0; r < vals.length; r++) {
                  const targetRowIdx = row - 1 + r;
                  if (!self.rows[targetRowIdx]) self.rows[targetRowIdx] = [];
                  for (let c = 0; c < vals[r].length; c++) {
                    self.rows[targetRowIdx][col - 1 + c] = vals[r][c];
                  }
                }
              },
              setBackground() {},
              setFontColor() {},
              setFontWeight() {},
              setHorizontalAlignment() {},
              setFontSize() {},
              merge() {}
            };
          },
          appendRow(rowVals) {
            this.rows.push(rowVals);
          },
          deleteRow(rowIdx) {
            this.rows.splice(rowIdx - 1, 1);
          },
          setFrozenRows() {}
        };
        sheetsMap[name] = newSheet;
        return newSheet;
      }
    };
  }

  function setupVm(mockSs) {
    const sandbox = {
      Logger: { log: () => {} },
      ContentService: {
        createTextOutput(s) { return { setMimeType: () => {}, getContent: () => s }; },
        MimeType: { JSON: 'json' }
      },
      Session: { getScriptTimeZone: () => 'Asia/Kolkata' },
      Utilities: { formatDate: (d) => d.toISOString().split('T')[0] },
      SpreadsheetApp: {
        getActiveSpreadsheet: () => mockSs,
        openById: () => mockSs
      }
    };

    const ctx = vm.createContext(sandbox);
    vm.runInContext(code, ctx);
    return ctx;
  }

  test('Create: addRecord appends new row with proper columns and auto-increment serial', () => {
    const mockSs = createMockSpreadsheet({
      'Rang_De_Loan': [
        ['SR. NO.', 'NAME', 'ADDRESS', 'MOBILE NO.', 'ACTIVITY', 'AMOUNT (₹)', '2ND (₹)']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('addRecord', {
      sheetName: 'Rang_De_Loan',
      NAME: 'Ramesh Patel',
      ADDRESS: 'Gidam, Dantewada',
      'MOBILE NO.': '9876543210',
      ACTIVITY: 'Dairy Farming',
      'AMOUNT (₹)': '30000',
      '2ND (₹)': '20000'
    });

    assert.equal(res.success, true);
    const sheet = mockSs.getSheetByName('Rang_De_Loan');
    assert.equal(sheet.rows.length, 2);
    assert.equal(sheet.rows[1][0], 1); // Serial number
    assert.equal(sheet.rows[1][1], 'Ramesh Patel');
    assert.equal(sheet.rows[1][5], '30000');
  });

  test('Update: updateRecord modifies row data by idValue match', () => {
    const mockSs = createMockSpreadsheet({
      'Rang_De_Loan': [
        ['SR. NO.', 'NAME', 'ADDRESS', 'MOBILE NO.', 'ACTIVITY', 'AMOUNT (₹)', '2ND (₹)'],
        [1, 'Ramesh Patel', 'Gidam', '9876543210', 'Dairy', '30000', '20000']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('updateRecord', {
      sheetName: 'Rang_De_Loan',
      idField: 'NAME',
      idValue: 'Ramesh Patel',
      updatedData: {
        ACTIVITY: 'Advanced Dairy',
        'AMOUNT (₹)': '50000'
      }
    });

    assert.equal(res.success, true);
    const sheet = mockSs.getSheetByName('Rang_De_Loan');
    assert.equal(sheet.rows[1][4], 'Advanced Dairy');
    assert.equal(sheet.rows[1][5], '50000');
  });

  test('Delete: deleteRecord removes target row by idValue match', () => {
    const mockSs = createMockSpreadsheet({
      'Rang_De_Loan': [
        ['SR. NO.', 'NAME', 'ADDRESS', 'MOBILE NO.', 'ACTIVITY', 'AMOUNT (₹)', '2ND (₹)'],
        [1, 'Ramesh Patel', 'Gidam', '9876543210', 'Dairy', '30000', '20000']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('deleteRecord', {
      sheetName: 'Rang_De_Loan',
      idField: 'NAME',
      idValue: 'Ramesh Patel'
    });

    assert.equal(res.success, true);
    const sheet = mockSs.getSheetByName('Rang_De_Loan');
    assert.equal(sheet.rows.length, 1); // Only header remains
  });

  test('Bulk: bulkInsert appends multiple records in batch', () => {
    const mockSs = createMockSpreadsheet({
      'Employment_Registration': [
        ['SR.No', 'Youth_Name', "Father's Name / Husband's Name", 'Mobile Number', 'Block Name', 'Village']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('bulkInsert', {
      sheetName: 'Employment_Registration',
      records: [
        { Youth_Name: 'Anita', Mobile_Number: '9111111111', 'Block Name': 'Dantewada' },
        { Youth_Name: 'Suresh', Mobile_Number: '9222222222', 'Block Name': 'Geedam' }
      ]
    });

    assert.equal(res.success, true);
    assert.equal(res.insertedCount, 2);
    const sheet = mockSs.getSheetByName('Employment_Registration');
    assert.equal(sheet.rows.length, 3);
    assert.equal(sheet.rows[1][1], 'Anita');
    assert.equal(sheet.rows[2][1], 'Suresh');
  });

  test('Title Banner: getTableRecords correctly handles 2-row title sheets with 0 records', () => {
    const mockSs = createMockSpreadsheet({
      'IIM_Candidate_List': [
        ['CANDIDATE LIST IIM RAIPUR 2025', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['SR', 'NAME ', 'FATHER NAME', 'GENDER', 'AGE', 'CAST', 'GP', 'BLOCK', 'DISTRICT', 'MOBILE NO, ', 'EDUCATION', 'PERCENT', 'AGE']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('getTableRecords', { sheetName: 'IIM_Candidate_List' });
    assert.equal(res.success, true);
    assert.equal(res.total, 0, 'Should have 0 records when only Title banner and Headers exist');
    assert.equal(res.records.length, 0, 'Records array should be empty');
  });

  test('Form Actions: addMForm and addSkillTraining route correctly without unknown action error', () => {
    const mockSs = createMockSpreadsheet({
      'M_Form': [
        ['SR. NO.', 'Block Name', 'Grampanchayat', 'First Name', 'Last Name', 'Mobile Number']
      ],
      'Skill_Linked': [
        ['SR. NO.', 'NAME ', 'VILLAGE', 'MOBILE NO.', 'INSTITUTE', 'SKILL TRAINING']
      ]
    });
    const ctx = setupVm(mockSs);

    const mformRes = ctx.handleAction('addMForm', {
      data: {
        'First Name': 'Pooja',
        'Last Name': 'Markam',
        'Mobile Number': '9406112233',
        'Block Name': 'Dantewada'
      }
    });
    assert.equal(mformRes.success, true);
    const mSheet = mockSs.getSheetByName('M_Form');
    assert.equal(mSheet.rows.length, 2);
    assert.equal(mSheet.rows[1][3], 'Pooja');

    const skillRes = ctx.handleAction('addSkillTraining', {
      data: {
        'NAME ': 'Amit Kumar',
        'VILLAGE': 'Katekalyan',
        'MOBILE NO.': '9876543210'
      }
    });
    assert.equal(skillRes.success, true);
    const sSheet = mockSs.getSheetByName('Skill_Linked');
    assert.equal(sSheet.rows.length, 2);
    assert.equal(sSheet.rows[1][1], 'Amit Kumar');
  });

  test('Search: searchYouth returns matching candidates across sheets', () => {
    const mockSs = createMockSpreadsheet({
      'Employment_Registration': [
        ['SR.No', 'First Name', 'Last Name', 'Mobile Number', 'Block Name'],
        [1, 'Sunil', 'Yadav', '9893001122', 'Kuakonda']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('searchYouth', { query: '9893001122' });
    assert.equal(res.success, true);
    assert.equal(res.results.length, 1);
    assert.equal(res.results[0].Youth_Name, 'Sunil Yadav');
  });

  test('Aliases: findSheet resolves dual names bidirectionally', () => {
    const mockSs = createMockSpreadsheet({
      'Youth_Hub_Trainee': [['NAME', 'MOBILE']],
      'VO CLF Meeting': [['DATE', 'VILLAGE']]
    });
    const ctx = setupVm(mockSs);

    const s1 = ctx.findSheet(mockSs, 'Youth_Hub_Trainings');
    assert.ok(s1, 'Should find Youth_Hub_Trainee when queried as Youth_Hub_Trainings');
    assert.equal(s1.getName(), 'Youth_Hub_Trainee');

    const s2 = ctx.findSheet(mockSs, 'Meetings_VO_CLF_TRIF');
    assert.ok(s2, 'Should find VO CLF Meeting when queried as Meetings_VO_CLF_TRIF');
    assert.equal(s2.getName(), 'VO CLF Meeting');
  });

  test('Form Actions: all additional form actions route correctly without errors', () => {
    const mockSs = createMockSpreadsheet({
      'MY_Bharat_Registration': [['NAME', 'FATHER NAME', 'VILLAGE', 'BLOCK', 'DOB', 'GENDER', 'MOBILE NO.', 'CATEGORY', 'CURRENT OCCUPATION', 'REMARK']],
      'Education_Linked': [['Name', 'Faather Name', 'Mother Name', 'Email', 'Gender', 'Education', 'Phone Number', 'Address']],
      'Employed': [['SR. NO.', 'NAME ', 'FATHER NAME', 'ADDRESS', 'BLOCK', 'DISTRICT', 'MOBILE N0.', 'ORGANISATION', 'DATE OF JOINING', 'SALARY']],
      'Bastar_Munne_Shivir': [['SR. NO.', 'NAME', 'FATHER NAME', 'VILLAGE', 'BLOCK', 'DOB', 'GENDER', 'MOBILE NO.', 'AADHAR', 'CATEGORY', 'INTERESTED TRADE (इच्छुक ट्रेड)']],
      'IIM_Candidate_List': [['SR', 'NAME ', 'FATHER NAME', 'GENDER', 'AGE', 'CAST', 'GP', 'BLOCK', 'DISTRICT', 'MOBILE NO, ', 'EDUCATION', 'PERCENT', 'AGE2']],
      'PMEGP_PMFME_Loan': [['SR. NO.', 'NAME', 'FATHER NAME', 'VILLAGE', 'BLOCK', 'LOAN AMOUNT', 'YOJNA', 'BUSSINESS']],
      'Training_Conducted': [['SR. NO.', 'NAME ', 'ADDRESS', 'MOBILE NO.', 'INSTITUTE', 'TRAINING']]
    });
    const ctx = setupVm(mockSs);

    const actions = [
      { action: 'addMyBharat', payload: { NAME: 'Raju', 'MOBILE NO.': '9876543210' }, target: 'MY_Bharat_Registration' },
      { action: 'addEducation', payload: { Name: 'Kavita', 'Phone Number': '9876543211' }, target: 'Education_Linked' },
      { action: 'addNavGurukul', payload: { Name: 'Sunita', 'Phone Number': '9876543212' }, target: 'Education_Linked' },
      { action: 'addEmploymentLinked', payload: { 'NAME ': 'Pawan', 'MOBILE N0.': '9876543213' }, target: 'Employed' },
      { action: 'addMobilization', payload: { NAME: 'Mukesh', 'MOBILE NO.': '9876543214' }, target: 'Bastar_Munne_Shivir' },
      { action: 'addRehabilitation', payload: { NAME: 'Suresh', 'MOBILE NO.': '9876543215' }, target: 'Bastar_Munne_Shivir' },
      { action: 'addIIMRaipur', payload: { 'NAME ': 'Deepak', 'MOBILE NO, ': '9876543216' }, target: 'IIM_Candidate_List' },
      { action: 'addShasanSahyog', payload: { NAME: 'Gita', 'BUSSINESS': 'Dairy' }, target: 'PMEGP_PMFME_Loan' },
      { action: 'addTraining', payload: { 'NAME ': 'Sanjay', 'TRAINING': 'Welding' }, target: 'Training_Conducted' }
    ];

    for (const a of actions) {
      const res = ctx.handleAction(a.action, a.payload);
      assert.equal(res.success, true, `Action ${a.action} should succeed`);
      const s = mockSs.getSheetByName(a.target);
      assert.ok(s.rows.length >= 2, `Sheet ${a.target} should have at least 1 record`);
    }
  });

  test('getAllData: aggregates all sheets and canonical aliases correctly', () => {
    const mockSs = createMockSpreadsheet({
      'Employment_Registration': [
        ['SR.No', 'First Name', 'Last Name', 'Mobile Number'],
        [1, 'Ramesh', 'Patel', '9876543210']
      ],
      'Youth_Hub_Trainee': [
        ['NAME', 'MOBILE'],
        ['Anil', '9123456780']
      ]
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('getAllData', {});
    assert.equal(res.success, true);
    assert.ok(res.data['Employment_Registration'], 'Must contain Employment_Registration');
    assert.equal(res.data['Employment_Registration'].length, 1);
    assert.ok(res.data['Youth_Master'], 'Must contain alias Youth_Master');
    assert.ok(res.data['Youth_Hub_Trainings'], 'Must contain alias Youth_Hub_Trainings mapped to Youth_Hub_Trainee');
    assert.equal(res.data['Youth_Hub_Trainings'].length, 1);
  });

  test('User Management: login, listUsers, and addUser enforce validation and duplicate check', () => {
    const mockSs = createMockSpreadsheet({});
    const ctx = setupVm(mockSs);

    // 1. Add user
    const addRes = ctx.handleAction('addUser', {
      Email: 'coordinator@dantewada.gov.in',
      Name: 'Rahul Coordinator',
      Role: 'BLOCK_COORDINATOR'
    });
    assert.equal(addRes.success, true);

    // 2. Reject duplicate user
    const dupRes = ctx.handleAction('addUser', {
      Email: 'coordinator@dantewada.gov.in',
      Name: 'Duplicate Person'
    });
    assert.equal(dupRes.success, false);
    assert.match(dupRes.message, /already exists/i);

    // 3. List users
    const listRes = ctx.handleAction('listUsers', {});
    assert.equal(listRes.success, true);
    assert.equal(listRes.users.length, 1);
    assert.equal(listRes.users[0].Email, 'coordinator@dantewada.gov.in');

    // 4. Login
    const loginRes = ctx.handleAction('login', { email: 'coordinator@dantewada.gov.in' });
    assert.equal(loginRes.success, true);
    assert.equal(loginRes.user.role, 'BLOCK_COORDINATOR');
  });

  test('Duplicate Prevention: addRecord rejects duplicate candidate when preventDuplicate=true', () => {
    const mockSs = createMockSpreadsheet({
      'Employment_Registration': [
        ['SR.No', 'First Name', 'Last Name', 'Mobile Number'],
        [1, 'Ramesh', 'Kumar', '9406123456']
      ]
    });
    const ctx = setupVm(mockSs);

    const dupRes = ctx.handleAction('addRecord', {
      sheetName: 'Employment_Registration',
      data: {
        'First Name': 'Ramesh Junior',
        'Mobile Number': '9406123456',
        preventDuplicate: true
      }
    });
    assert.equal(dupRes.success, false);
    assert.equal(dupRes.duplicate, true);
    assert.match(dupRes.message, /already exists/i);
  });

  test('Empty Sheet Handling: returns 0 records safely without errors', () => {
    const mockSs = createMockSpreadsheet({
      'EmptySheet': []
    });
    const ctx = setupVm(mockSs);

    const res = ctx.handleAction('getTableRecords', { sheetName: 'EmptySheet' });
    assert.equal(res.success, true);
    assert.equal(res.total, 0);
    assert.equal(res.records.length, 0);
  });
});
