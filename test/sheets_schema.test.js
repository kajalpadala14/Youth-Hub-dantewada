const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

describe('Database Schema (SHEETS_SCHEMA) Unit Tests', () => {
  const codeGsPath = path.resolve(__dirname, '../AppsScript/Code.gs');
  const code = fs.readFileSync(codeGsPath, 'utf8');

  // Extract SHEETS_SCHEMA object
  const ctx = vm.createContext({});
  // We can execute up to the end of SHEETS_SCHEMA
  const schemaMatch = code.match(/const\s+SHEETS_SCHEMA\s*=\s*(\{[\s\S]*?\n\s*\};)/);
  assert.ok(schemaMatch, 'SHEETS_SCHEMA definition should be present in Code.gs');
  
  vm.runInContext('var SHEETS_SCHEMA = ' + schemaMatch[1].replace(/;\s*$/, ''), ctx);
  const schema = ctx.SHEETS_SCHEMA;

  test('All 15+ Core database sheets are defined', () => {
    const requiredSheets = [
      'Youth_Master',
      'Mobilization',
      'M_Form',
      'My_Bharat',
      'Counselling',
      'Skill_Training',
      'Employment_Registered',
      'Employment_Linked',
      'Education',
      'Entrepreneurs',
      'Entrepreneurs_Established',
      'NavGurukul',
      'Trainings',
      'Activities',
      'Rehabilitation',
      'IIM_Raipur',
      'Photo_Uploads',
    ];

    for (const sheet of requiredSheets) {
      assert.ok(Array.isArray(schema[sheet]), `Sheet "${sheet}" should be defined as an array in SHEETS_SCHEMA`);
      assert.ok(schema[sheet].length > 0, `Sheet "${sheet}" should contain column definitions`);
    }
  });

  test('Primary identity columns are present in core master sheets', () => {
    assert.ok(schema.Youth_Master.includes('Youth_ID'), 'Youth_Master must have Youth_ID');
    assert.ok(schema.Youth_Master.includes('Mobile_Number'), 'Youth_Master must have Mobile_Number');
    assert.ok(schema.Youth_Master.includes('Block'), 'Youth_Master must have Block');

    assert.ok(schema.Mobilization.includes('Activity_ID'), 'Mobilization must have Activity_ID');
    assert.ok(schema.M_Form.includes('MForm_ID'), 'M_Form must have MForm_ID');
    assert.ok(schema.Counselling.includes('Counselling_ID'), 'Counselling must have Counselling_ID');
    assert.ok(schema.Skill_Training.includes('Training_Record_ID'), 'Skill_Training must have Training_Record_ID');
    assert.ok(schema.Entrepreneurs.includes('Entrepreneur_ID'), 'Entrepreneurs must have Entrepreneur_ID');
    assert.ok(schema.Entrepreneurs_Established.includes('S.NO'), 'Entrepreneurs_Established must have S.NO');
  });

  test('Columns have no duplicate headers within any single sheet', () => {
    for (const [sheetName, columns] of Object.entries(schema)) {
      const seen = new Set();
      for (const col of columns) {
        assert.ok(!seen.has(col), `Duplicate column "${col}" found in sheet "${sheetName}"`);
        seen.add(col);
      }
    }
  });
});
