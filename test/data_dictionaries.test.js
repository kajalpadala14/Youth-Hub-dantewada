const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('Data Dictionaries Unit Tests', () => {
  const env = createBrowserEnv();
  loadScript('js/pmegp_data.js', env);
  loadScript('js/rangde_data.js', env);

  const pmegpData = env.window.PMEGP_CANDIDATE_DATA;
  const rangdeData = env.window.RANGDE_INITIAL_DATA;

  test('PMEGP candidate dictionary is populated with valid format', () => {
    assert.ok(pmegpData, 'PMEGP_CANDIDATE_DATA should exist on window');
    const keys = Object.keys(pmegpData);
    assert.ok(keys.length > 50, `Expected at least 50 PMEGP entries, found ${keys.length}`);

    // Check key format (should be either 'name:...' or 'mob:...')
    for (const key of keys.slice(0, 30)) {
      assert.ok(
        key.startsWith('name:') || key.startsWith('mob:'),
        `Key ${key} does not follow 'name:' or 'mob:' prefix convention`
      );
      const record = pmegpData[key];
      assert.ok(
        typeof record.loan === 'number' || typeof record.loan === 'string',
        'Loan amount should be number or string representation'
      );
      if (record.loan !== '') {
        const cleanLoan = String(record.loan).replace(/,/g, '').trim();
        assert.ok(!isNaN(Number(cleanLoan)), `Loan amount should be numeric: ${record.loan}`);
      }
      const validStatuses = ['YES', 'NO', ''];
      assert.ok(validStatuses.includes(record.udyam), `Udyam should be YES, NO, or empty, found: "${record.udyam}"`);
      assert.ok(validStatuses.includes(record.bank), `Bank docs should be YES, NO, or empty, found: "${record.bank}"`);
      assert.ok(validStatuses.includes(record.pan), `PAN should be YES, NO, or empty, found: "${record.pan}"`);
      assert.ok(validStatuses.includes(record.adhar), `Aadhaar should be YES, NO, or empty, found: "${record.adhar}"`);
    }
  });

  test('RangDe initial dataset initializes as a clean array', () => {
    assert.ok(Array.isArray(rangdeData), 'RANGDE_INITIAL_DATA should be an array');
  });
});
