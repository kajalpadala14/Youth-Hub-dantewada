const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('AppConfig Unit Tests', () => {
  const env = createBrowserEnv();
  const AppConfig = loadScript('js/app.js', env, ';AppConfig');

  test('AppConfig has expected Dantewada district properties', () => {
    assert.equal(AppConfig.DISTRICT, 'Dantewada');
    assert.ok(AppConfig.BLOCKS, 'AppConfig.BLOCKS should exist');
    assert.ok(Array.isArray(AppConfig.YOUTH_HUBS), 'YOUTH_HUBS should be an array');
    assert.ok(Array.isArray(AppConfig.FINANCIAL_YEARS), 'FINANCIAL_YEARS should be an array');
  });

  test('AppConfig defines all 4 Dantewada administrative blocks', () => {
    const expectedBlocks = ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'];
    const actualBlocks = Object.keys(AppConfig.BLOCKS);
    assert.deepEqual(actualBlocks.sort(), expectedBlocks.sort());
  });

  test('Each administrative block contains valid Gram Panchayats', () => {
    for (const [block, gps] of Object.entries(AppConfig.BLOCKS)) {
      assert.ok(Array.isArray(gps), `Gram Panchayats for ${block} should be an array`);
      assert.ok(gps.length >= 5, `Block ${block} should have at least 5 GPs, found ${gps.length}`);
      gps.forEach((gp) => {
        assert.equal(typeof gp, 'string');
        assert.ok(gp.trim().length > 0, 'GP name must not be empty');
      });
    }
  });

  test('AppConfig lists all 4 Youth Hubs', () => {
    assert.equal(AppConfig.YOUTH_HUBS.length, 4);
    assert.ok(AppConfig.YOUTH_HUBS.some((h) => h.includes('Dantewada')));
    assert.ok(AppConfig.YOUTH_HUBS.some((h) => h.includes('Geedam')));
    assert.ok(AppConfig.YOUTH_HUBS.some((h) => h.includes('Katekalyan')));
    assert.ok(AppConfig.YOUTH_HUBS.some((h) => h.includes('Kuakonda')));
  });

  test('Financial years are properly formatted (YYYY-YY)', () => {
    const fyRegex = /^\d{4}-\d{2}$/;
    for (const fy of AppConfig.FINANCIAL_YEARS) {
      assert.match(fy, fyRegex, `Financial year ${fy} does not match format YYYY-YY`);
    }
  });
});
