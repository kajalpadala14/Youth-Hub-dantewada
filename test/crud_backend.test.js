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
            }
          };
        },
        appendRow(rowVals) {
          this.rows.push(rowVals);
        },
        deleteRow(rowIdx) {
          this.rows.splice(rowIdx - 1, 1);
        }
      };
    }

    return {
      getName() { return 'Test Database'; },
      getSheets() { return Object.values(sheetsMap); },
      getSheetByName(name) { return sheetsMap[name] || null; }
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
});
