const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

describe('Form Validation Logic Unit Tests', () => {
  // Regex as defined in js/forms.js (e.g. line 2686)
  const mobileRegex = /^[6-9]\d{9}$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const shiftedPhoneInBlockColRegex = /^\d{7,13}$/;

  describe('Indian 10-digit Mobile Number Validation', () => {
    test('Validates typical 10-digit mobile numbers starting with 6, 7, 8, or 9', () => {
      assert.ok(mobileRegex.test('9876543210'));
      assert.ok(mobileRegex.test('8123456789'));
      assert.ok(mobileRegex.test('7000000000'));
      assert.ok(mobileRegex.test('6200000000'));
    });

    test('Rejects invalid mobile numbers', () => {
      assert.ok(!mobileRegex.test('5123456789'), 'Should reject numbers starting with 0-5');
      assert.ok(!mobileRegex.test('987654321'), 'Should reject numbers with 9 digits');
      assert.ok(!mobileRegex.test('98765432100'), 'Should reject numbers with 11 digits');
      assert.ok(!mobileRegex.test('98765ABCD0'), 'Should reject alphanumeric input');
      assert.ok(!mobileRegex.test(''), 'Should reject empty string');
    });
  });

  describe('Date Format (YYYY-MM-DD) Validation', () => {
    test('Validates ISO dates', () => {
      assert.ok(dateRegex.test('2026-03-31'));
      assert.ok(dateRegex.test('2024-10-15'));
    });

    test('Rejects non-ISO date formats', () => {
      assert.ok(!dateRegex.test('31-03-2026'));
      assert.ok(!dateRegex.test('2026/03/31'));
      assert.ok(!dateRegex.test('31/03/2026'));
      assert.ok(!dateRegex.test('not-a-date'));
    });
  });

  describe('Heuristic Detection of Shifted Columns', () => {
    test('Detects numeric phone-like strings in text columns (e.g., Block/Village column shift)', () => {
      assert.ok(shiftedPhoneInBlockColRegex.test('9876543210'));
      assert.ok(shiftedPhoneInBlockColRegex.test('7712345678'));
      assert.ok(!shiftedPhoneInBlockColRegex.test('Dantewada'));
      assert.ok(!shiftedPhoneInBlockColRegex.test('Geedam'));
      assert.ok(!shiftedPhoneInBlockColRegex.test('Katekalyan'));
    });
  });

  describe('Table Records Ascending Sorting', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const formsJs = fs.readFileSync(path.resolve(__dirname, '../js/forms.js'), 'utf8');
    const sortMatch = formsJs.match(/function sortRecordsAscending\([\s\S]*?\n  \}/);
    assert.ok(sortMatch, 'sortRecordsAscending function must exist');

    const sortFn = new Function('records, config', sortMatch[0] + '\nreturn sortRecordsAscending(records, config);');

    test('Sorts records in ascending order by S.NO / numeric serial', () => {
      const records = [
        { 'SR. NO.': 25, Name: 'Zoya' },
        { 'SR. NO.': 2, Name: 'Aman' },
        { 'SR. NO.': 10, Name: 'Kavita' }
      ];
      const sorted = sortFn(records, { idField: 'SR. NO.' });
      assert.equal(sorted[0]['SR. NO.'], 2);
      assert.equal(sorted[1]['SR. NO.'], 10);
      assert.equal(sorted[2]['SR. NO.'], 25);
    });

    test('Sorts records in ascending order by prefixed ID (e.g. YH-2026-0001, ENT-2026-0168)', () => {
      const records = [
        { Youth_ID: 'YH-2026-0100', Name: 'Ramesh' },
        { Youth_ID: 'YH-2026-0003', Name: 'Suresh' },
        { Youth_ID: 'YH-2026-0015', Name: 'Mahesh' }
      ];
      const sorted = sortFn(records, { idField: 'Youth_ID' });
      assert.equal(sorted[0].Youth_ID, 'YH-2026-0003');
      assert.equal(sorted[1].Youth_ID, 'YH-2026-0015');
      assert.equal(sorted[2].Youth_ID, 'YH-2026-0100');
    });

    test('Sorts records in ascending order by Date when no numeric serial is present', () => {
      const records = [
        { Date: '2026-10-15', Title: 'Workshop C' },
        { Date: '2026-08-01', Title: 'Workshop A' },
        { Date: '2026-09-10', Title: 'Workshop B' }
      ];
      const sorted = sortFn(records, {});
      assert.equal(sorted[0].Date, '2026-08-01');
      assert.equal(sorted[1].Date, '2026-09-10');
      assert.equal(sorted[2].Date, '2026-10-15');
    });
  });
});
