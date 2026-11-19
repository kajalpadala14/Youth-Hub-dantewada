const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Rehabilitation Counselling Module & Beneficiary Table Unit Tests', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const adminHtml = fs.readFileSync(path.resolve(__dirname, '../admin.html'), 'utf8');
  const rehabData = require('../js/rehabilitation-data.js');
  const supabaseService = require('../js/supabase.js');

  test('Navigation tab is named "Rehabilitation Counselling" without duplicates', () => {
    // Check desktop nav links
    const desktopNavMatch = indexHtml.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(desktopNavMatch, 'Desktop nav must exist');
    const desktopLinks = desktopNavMatch[1].match(/href="#rehabilitation-counselling"[^>]*>([\s\S]*?)<\/a>/g) || [];
    assert.strictEqual(desktopLinks.length, 1, 'Exactly one rehabilitation-counselling link in desktop nav (no duplicate tabs)');
    assert.ok(desktopLinks[0].includes('Rehabilitation Counselling'), 'Desktop nav link contains "Rehabilitation Counselling"');

    // Check mobile nav links
    const mobileMenuMatch = indexHtml.match(/id="mobileNavMenu"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(mobileMenuMatch, 'Mobile menu must exist');
    const mobileLinks = mobileMenuMatch[1].match(/href="#rehabilitation-counselling"/g) || [];
    assert.strictEqual(mobileLinks.length, 1, 'Exactly one rehabilitation-counselling link in mobile menu');
  });

  test('Rehabilitation Counselling section contains professional beneficiary data table', () => {
    assert.ok(indexHtml.includes('id="rehabilitation-counselling"'), 'Rehabilitation Counselling section must exist');
    assert.ok(indexHtml.includes('id="rehabBeneficiaryTable"'), 'Beneficiary data table element must exist');
    assert.ok(indexHtml.includes('id="rehabTableBody"'), 'Table body must exist for dynamic rendering');
  });

  test('Table header contains exact columns in exact order: NAME, ADDRESS, MOBILE NO., INSTITUTE, TRAINING', () => {
    const tableHeaderRegex = /<table[^>]*id="rehabBeneficiaryTable"[^>]*>[\s\S]*?<thead>[\s\S]*?<\/thead>/;
    const headerMatch = indexHtml.match(tableHeaderRegex);
    assert.ok(headerMatch, 'Table thead must exist');
    const theadContent = headerMatch[0];

    const expectedColumns = ['NAME', 'ADDRESS', 'MOBILE NO.', 'INSTITUTE', 'TRAINING'];
    let lastIndex = -1;
    for (const col of expectedColumns) {
      const idx = theadContent.indexOf(col);
      assert.ok(idx !== -1, `Header must contain column "${col}"`);
      assert.ok(idx > lastIndex, `Column "${col}" must appear after preceding column in exact order`);
      lastIndex = idx;
    }
  });

  test('Search, filter, sorting, and pagination controls exist', () => {
    assert.ok(indexHtml.includes('id="rehabSearchInput"'), 'Search input must exist');
    assert.ok(indexHtml.includes('id="rehabFilterInstitute"'), 'Institute filter dropdown must exist');
    assert.ok(indexHtml.includes('id="rehabFilterTraining"'), 'Training filter dropdown must exist');
    assert.ok(indexHtml.includes('id="rehabPageSize"'), 'Page size dropdown must exist');
    assert.ok(indexHtml.includes('id="rehabPaginationContainer"'), 'Pagination container must exist');
    assert.ok(indexHtml.includes('sortRehabTable'), 'Sort handler function referenced in headers');
  });

  test('All 52 beneficiary records from uploaded Excel file are present with valid fields', () => {
    assert.strictEqual(rehabData.length, 52, 'Must have exactly 52 records');
    
    // First record: FANAS
    assert.strictEqual(rehabData[0].id, 1);
    assert.strictEqual(rehabData[0].name, 'FANAS');
    assert.strictEqual(rehabData[0].address, 'NAGFAMI');
    assert.strictEqual(rehabData[0].mobile, '9399438895');
    assert.strictEqual(rehabData[0].institute, 'LIVELIHOOD');
    assert.strictEqual(rehabData[0].training, 'computer operator');

    // Last record: KIRSU VETTI
    assert.strictEqual(rehabData[51].id, 52);
    assert.strictEqual(rehabData[51].name, 'KIRSU VETTI');
    assert.strictEqual(rehabData[51].address, 'KUNDENAR');
    assert.strictEqual(rehabData[51].mobile, '7828879161');
    assert.strictEqual(rehabData[51].institute, 'MTC SUKMA');
    assert.strictEqual(rehabData[51].training, 'ELECTRICIAN');

    // Every record must have name and address
    for (const r of rehabData) {
      assert.ok(r.name && r.name.length > 0, `Record ${r.id} must have a name`);
      assert.ok(r.address && r.address.length > 0, `Record ${r.id} must have an address`);
    }
  });

  test('Supabase integration service connects with graceful fallback', async () => {
    assert.ok(supabaseService, 'YouthHubSupabase service must be exported');
    assert.strictEqual(typeof supabaseService.getRehabilitationBeneficiaries, 'function');
    assert.strictEqual(typeof supabaseService.saveBeneficiary, 'function');
    assert.strictEqual(typeof supabaseService.syncAllToSupabase, 'function');

    const result = await supabaseService.getRehabilitationBeneficiaries();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.length, 52);
    assert.strictEqual(result.data[0].name, 'FANAS');
  });

  test('Admin dashboard includes Rehabilitation Counselling navigation and sheet viewer', () => {
    assert.ok(adminHtml.includes('data-sheet="Rehabilitation_Counselling"'), 'Sidebar includes Rehabilitation_Counselling');
    assert.ok(adminHtml.includes('17. Rehabilitation Counselling'), 'Title is 17. Rehabilitation Counselling');
    assert.ok(adminHtml.includes('kpi-card-val-rehabilitation-counselling'), 'KPI card for Rehabilitation Counselling exists');
  });
});
