const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Entrepreneur Tabs (Identified vs Established) Tests', () => {
  const indexHtmlPath = path.resolve(__dirname, '../index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  const formsJsPath = path.resolve(__dirname, '../js/forms.js');
  const formsJs = fs.readFileSync(formsJsPath, 'utf8');

  test('index.html contains separate tabs for Identified and Established, and excludes Loan Process', () => {
    assert.ok(indexHtml.includes('data-ent-tab="identified"'), 'Should have tab for Identified entrepreneurs');
    assert.ok(indexHtml.includes('data-ent-tab="established"'), 'Should have tab for Established entrepreneurs');
    assert.ok(!indexHtml.includes('data-ent-tab="loan"'), 'Should NOT have tab for Loan Process in entrepreneurship');

    assert.ok(indexHtml.includes('id="tblEntIdentified"'), 'Should have tblEntIdentified table');
    assert.ok(indexHtml.includes('id="tblEntEstablished"'), 'Should have tblEntEstablished table');
    assert.ok(!indexHtml.includes('id="tblEntLoan"'), 'Should NOT have tblEntLoan table in entrepreneurship');

    assert.ok(indexHtml.includes('id="badgeEntIdentifiedCount"'), 'Should have badge for identified count');
    assert.ok(indexHtml.includes('id="badgeEntEstablishedCount"'), 'Should have badge for established count');

    // Verify Entrepreneurship sidebar dropdown contains only Identified and Established sub-items
    const dropdownMatch = indexHtml.match(/<div class="nav-dropdown" id="dropdownEntrepreneurship">([\s\S]*?)<\/div>\s*<\/div>/);
    assert.ok(dropdownMatch, 'dropdownEntrepreneurship must exist');
    const dropdownContent = dropdownMatch[1];
    assert.ok(dropdownContent.includes('data-subview="identified"'), 'Should have identified sub-item');
    assert.ok(dropdownContent.includes('data-subview="established"'), 'Should have established sub-item');
    assert.ok(!dropdownContent.includes('data-subview="loan"'), 'Should not have loan sub-item');
    assert.ok(!dropdownContent.includes('data-view="rangde"'), 'Should not have rangde sub-item in entrepreneurship dropdown');
  });

  test('KPI cards link to specific sub-tabs (identified vs established)', () => {
    assert.ok(indexHtml.includes("App.switchView('entrepreneurship', 'identified')"), 'KPI 8 must link to identified subview');
    assert.ok(indexHtml.includes("App.switchView('entrepreneurship', 'established')"), 'KPI 9 must link to established subview');
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
});
