const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Entrepreneur Tabs (Identified vs Established) Tests', () => {
  const indexHtmlPath = path.resolve(__dirname, '../index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  const legacyHtml = indexHtml;

  const formsJsPath = path.resolve(__dirname, '../js/forms.js');
  const formsJs = fs.readFileSync(formsJsPath, 'utf8');

  test('Legacy index.html or modern index.html contains proper entrepreneur sections and models', () => {
    if (legacyHtml && legacyHtml.includes('data-ent-tab="identified"')) {
      assert.ok(legacyHtml.includes('data-ent-tab="identified"'), 'Should have tab for Identified entrepreneurs');
      assert.ok(legacyHtml.includes('data-ent-tab="established"'), 'Should have tab for Established entrepreneurs');
      assert.ok(!legacyHtml.includes('data-ent-tab="loan"'), 'Should NOT have tab for Loan Process in entrepreneurship');
      assert.ok(legacyHtml.includes('id="tblEntIdentified"'), 'Should have tblEntIdentified table');
      assert.ok(legacyHtml.includes('id="tblEntEstablished"'), 'Should have tblEntEstablished table');
    }
    // Modern public portal verification
    assert.ok(indexHtml.includes('id="startups"'), 'Modern portal should have dedicated startups section');
    assert.ok(indexHtml.includes('id="startupModal"'), 'Modern portal should have startup pitch detail modal');
  });

  test('KPI cards link to specific sub-tabs or startup features', () => {
    if (legacyHtml && legacyHtml.includes("App.switchView('entrepreneurship', 'identified')")) {
      assert.ok(legacyHtml.includes("App.switchView('entrepreneurship', 'identified')"), 'KPI 8 must link to identified subview');
      assert.ok(legacyHtml.includes("App.switchView('entrepreneurship', 'established')"), 'KPI 9 must link to established subview');
    } else {
      assert.ok(indexHtml.includes('href="#startups"'), 'Modern navbar must link to startups section');
    }
  });

  test('forms.js defines table configurations for ent_identified, ent_established, and ent_loan', () => {
    assert.ok(formsJs.includes('ent_identified: {'), 'forms.js should configure ent_identified');
    assert.ok(formsJs.includes('ent_established: {'), 'forms.js should configure ent_established');
    assert.ok(formsJs.includes('ent_loan: {'), 'forms.js should configure ent_loan');
    assert.ok(formsJs.includes('switchEntTab,'), 'forms.js must export switchEntTab');
  });

  test('Classification helper functions correctly separate identified from established records', () => {
    // Extract classifier functions from forms.js
    const estMatch = formsJs.match(/function isEstablishedEntrepreneur\([\s\S]*?\n  \}/);
    assert.ok(estMatch, 'isEstablishedEntrepreneur function must be present');

    const fn = new Function('rec', estMatch[0] + '\nreturn isEstablishedEntrepreneur(rec);');

    // Identified records
    assert.equal(fn({ Stage: 'Identified', Business_Idea: 'Dairy Unit' }), false);
    assert.equal(fn({ Stage: 'Business Plan', Business_Plan_Status: 'In Progress' }), false);
    assert.equal(fn({ Name: 'Ramesh', Business: 'Kirana' }), false);

    // Established records
    assert.equal(fn({ Stage: 'Established', Establishment_Date: '2026-05-10' }), true);
    assert.equal(fn({ Business_Status: 'Established', Business_Idea: 'Workshop' }), true);
    assert.equal(fn({ Establishment_Date: '2026-06-01' }), true);
    assert.equal(fn({ Updates: 'स्थापित इकाई - कार्य प्रगति पर' }), true);
  });

  test('Rang De classification and normalization correctly handles live sheet formats and shifted columns', () => {
    const isRangMatch = formsJs.match(/function isRangDeEntrepreneurRecord\([\s\S]*?\n  \}/);
    assert.ok(isRangMatch, 'isRangDeEntrepreneurRecord must exist');
    const isRangFn = new Function('rec', isRangMatch[0] + '\nreturn isRangDeEntrepreneurRecord(rec);');

    // Positive identification
    assert.equal(isRangFn({ '': 'RANG DE', 'FATHER NAME': 'PILU RAM KASHYAP' }), true);
    assert.equal(isRangFn({ Remarks: 'RANG DE' }), true);
    assert.equal(isRangFn({ Loan_Scheme: 'Rang De' }), true);
    assert.equal(isRangFn({ REMARK: 'रंग दे ऋण' }), true);

    // Negative identification
    assert.equal(isRangFn({ Stage: 'Identified', Remarks: 'PMEGP' }), false);
    assert.equal(isRangFn({ Name: 'Amit Kumar', Business: 'Kirana' }), false);

    // Normalization with shifted columns
    const normMatch = formsJs.match(/function normalizeRangDeRecord\([\s\S]*?\n  \}/);
    assert.ok(normMatch, 'normalizeRangDeRecord must exist');
    const normFn = new Function('rec, idx', normMatch[0] + '\nreturn normalizeRangDeRecord(rec, idx);');

    const sampleRow = {
      'S.NO': 'ENT-2026-0128',
      'BLOCK': 7587180868,
      'NAME': '',
      'FATHER NAME': 'VIMAL KUMAR BAGHEL',
      'BUSINESS': 'BARSOOR',
      '': 'RANG DE'
    };

    const normalized = normFn(sampleRow, 0);
    assert.equal(normalized.Name, 'VIMAL KUMAR BAGHEL', 'Name should be mapped from FATHER NAME if empty');
    assert.equal(normalized.Mobile, '7587180868', 'Mobile should be extracted from shifted numeric BLOCK column');
    assert.equal(normalized.Address, 'BARSOOR', 'Address should be mapped from BUSINESS location');
    assert.equal(normalized.Remarks, 'RANG DE');
  });
});
