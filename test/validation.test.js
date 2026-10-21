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
});
