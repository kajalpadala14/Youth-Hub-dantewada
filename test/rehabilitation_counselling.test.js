const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Rehabilitation Counselling Module & Admin Sheet Tests', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const adminHtml = fs.readFileSync(path.resolve(__dirname, '../admin.html'), 'utf8');
  const adminAppJs = fs.readFileSync(path.resolve(__dirname, '../js/admin-app.js'), 'utf8');
  const rehabData = require('../js/rehabilitation-data.js');
  const supabaseService = require('../js/supabase.js');

  test('Public page does NOT display Rehabilitation Counselling (removed per request)', () => {
    assert.strictEqual(indexHtml.includes('id="rehabilitation-counselling"'), false, 'Public page must not have #rehabilitation-counselling section');
    assert.strictEqual(indexHtml.includes('href="#rehabilitation-counselling"'), false, 'Public nav must not link to #rehabilitation-counselling');
  });

  test('Admin portal includes Rehabilitation Counselling navigation, KPI card and Sheet Viewer', () => {
    assert.ok(adminHtml.includes('data-sheet="Rehabilitation_Counselling"'), 'Sidebar includes Rehabilitation_Counselling button');
    assert.ok(adminHtml.includes('17. Rehabilitation Counselling'), 'Title is 17. Rehabilitation Counselling');
    assert.ok(adminHtml.includes('kpi-card-val-rehabilitation-counselling'), 'KPI card for Rehabilitation Counselling exists');
    assert.ok(adminHtml.includes('openSheetViewer(\'Rehabilitation_Counselling\')'), 'Sheet viewer handler configured');
  });

  test('Admin Sheet Viewer defines exact columns: NAME, ADDRESS, MOBILE NO., INSTITUTE, TRAINING', () => {
    assert.ok(adminAppJs.includes('Rehabilitation_Counselling:'), 'SHEET_CONFIGS includes Rehabilitation_Counselling');
    assert.ok(adminAppJs.includes('"NAME",'), 'Config includes NAME');
    assert.ok(adminAppJs.includes('"ADDRESS",'), 'Config includes ADDRESS');
    assert.ok(adminAppJs.includes('"MOBILE NO.",'), 'Config includes MOBILE NO.');
    assert.ok(adminAppJs.includes('"INSTITUTE",'), 'Config includes INSTITUTE');
    assert.ok(adminAppJs.includes('"TRAINING"'), 'Config includes TRAINING');
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

  test('AppsScript Code.gs backend defines Rehabilitation Counselling template, schema, and routing', () => {
    const codeGs = fs.readFileSync(path.resolve(__dirname, '../AppsScript/Code.gs'), 'utf8');
    
    // Check templates and schemas
    assert.ok(codeGs.includes('"Rehabilitation Counselling":'), 'EXACT_EXCEL_TEMPLATES has "Rehabilitation Counselling"');
    assert.ok(codeGs.includes('"Rehabilitation_Counselling":'), 'EXACT_EXCEL_TEMPLATES has "Rehabilitation_Counselling"');
    
    // Check exact columns
    const expectedHeaders = ['"Sr.No"', '"NAME"', '"ADDRESS"', '"MOBILE NO."', '"INSTITUTE"', '"TRAINING"'];
    for (const h of expectedHeaders) {
      assert.ok(codeGs.includes(h), `Code.gs must include header ${h}`);
    }

    // Check action routing
    assert.ok(codeGs.includes('case "addRehabilitationCounselling":'), 'handleAction includes addRehabilitationCounselling case');
    assert.ok(codeGs.includes('action === "addRehabilitationCounselling"'), 'handleAction routes to Rehabilitation Counselling');
    assert.ok(codeGs.includes('"rehabilitation_counselling": "Rehabilitation Counselling"'), 'SHEET_ALIASES maps to Rehabilitation Counselling');
  });
});
