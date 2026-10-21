const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

describe('Excel/CSV Header Mapping and Value Formatting Unit Tests', () => {
  const formsJsPath = path.resolve(__dirname, '../js/forms.js');
  const code = fs.readFileSync(formsJsPath, 'utf8');

  // Extract CONCEPT_ALIASES, findMatchingExcelRawKey, and formatExcelValue
  const sandbox = {};
  vm.createContext(sandbox);

  const extractRegex = /(const CONCEPT_ALIASES = \{[\s\S]*?\n  \};\s*function findMatchingExcelRawKey[\s\S]*?\n  \}\s*function formatExcelValue[\s\S]*?\n  \})/;
  const match = code.match(extractRegex);
  assert.ok(match, 'Header mapping functions should be extractable from forms.js');

  vm.runInContext(match[1] + '; this.findKey = findMatchingExcelRawKey; this.formatVal = formatExcelValue;', sandbox);

  const findKey = sandbox.findKey;
  const formatVal = sandbox.formatVal;

  describe('findMatchingExcelRawKey', () => {
    test('Matches exact header name', () => {
      const rawKeys = ['Youth_Name', 'Mobile_Number', 'Block'];
      assert.equal(findKey(rawKeys, 'Youth_Name'), 'Youth_Name');
    });

    test('Matches case-insensitive and punctuation-free variants', () => {
      const rawKeys = ['youth name', 'mobile number', 'BLOCK'];
      assert.equal(findKey(rawKeys, 'Youth_Name'), 'youth name');
      assert.equal(findKey(rawKeys, 'Mobile_Number'), 'mobile number');
      assert.equal(findKey(rawKeys, 'Block'), 'BLOCK');
    });

    test('Matches common aliases for mobile number and serial number', () => {
      const rawKeys = ['Sr. No.', 'Contact No', 'Panchayat'];
      assert.equal(findKey(rawKeys, 's_no'), 'Sr. No.');
      assert.equal(findKey(rawKeys, 'mobile'), 'Contact No');
      assert.equal(findKey(rawKeys, 'gp'), 'Panchayat');
    });

    test('Matches Hindi column headers', () => {
      const rawKeys = ['क्र', 'नाम', 'पिता का नाम', 'मोबाइल नंबर', 'विकासखंड', 'ग्राम'];
      assert.equal(findKey(rawKeys, 'name'), 'नाम');
      assert.equal(findKey(rawKeys, 'father_name'), 'पिता का नाम');
      assert.equal(findKey(rawKeys, 'mobile'), 'मोबाइल नंबर');
      assert.equal(findKey(rawKeys, 'block'), 'विकासखंड');
      assert.equal(findKey(rawKeys, 'village'), 'ग्राम');
    });

    test('Returns undefined when no header matches', () => {
      const rawKeys = ['UnknownColA', 'AnotherColumn'];
      assert.equal(findKey(rawKeys, 'Youth_Name'), undefined);
    });
  });

  describe('formatExcelValue', () => {
    test('Formats JavaScript Date instance to YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(2026, 2, 31)); // 2026-03-31
      assert.equal(formatVal(date, 'date'), '2026-03-31');
    });

    test('Converts Excel serial number date to ISO string', () => {
      // Excel serial 45000 is ~March 15, 2023
      const formatted = formatVal(45000, 'date');
      assert.match(formatted, /^\d{4}-\d{2}-\d{2}$/);
    });

    test('Returns non-date values directly as string or number', () => {
      assert.equal(formatVal('Dantewada', 'Block'), 'Dantewada');
      assert.equal(formatVal(100000, 'loan_amount'), '100000');
      assert.equal(formatVal(null, 'name'), '');
      assert.equal(formatVal(undefined, 'name'), '');
    });
  });
});
