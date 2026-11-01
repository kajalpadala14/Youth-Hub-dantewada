const fs = require('fs');
const XLSX = require('../js/vendor/xlsx.full.min.js');
const wb = XLSX.utils.book_new();

const sheets = {
  'Employment_Registration': [
    ['First Name', 'Last Name', "Father's Name / Husband's Name", 'Grampanchayat', 'Block Name', 'Mobile Number', 'Gender', 'Category', 'Highest Qualification', 'Current Occupation', 'Aspired Career'],
    ['Manisha', 'Yadav', 'Girdhar', 'HIRANAR', 'Geedam', '9754000000', 'Female', 'OBC', 'Graduate', 'Unemployed', 'Direct Formal Jobs'],
    ['Naresh', 'Thakur', 'Madhusudhan thakur', 'RONJE', 'Geedam', '9771000000', 'Male', 'OBC', '12th Pass', 'Unemployed', 'Direct Formal Jobs']
  ],
  'Employed': [
    ['SR. NO.', 'NAME', 'FATHER NAME', 'ADDRESS', 'BLOCK', 'DISTRICT', 'MOBILE NO.', 'ORGANISATION', 'DATE OF JOINING', 'SALARY'],
    [1, 'MOHAN THAKUR', 'Jeevan ram', 'RONJE', 'Geedam', 'Dantewada', '9617780736', 'SBI MITRA', '2026-05-15', '₹12,000']
  ],
  'Skill_Linked': [
    ['SR. NO.', 'NAME', 'VILLAGE', 'MOBILE NO.', 'INSTITUTE', 'SKILL TRAINING'],
    [1, 'FANAS', 'NAGFAMI', '9399438895', 'LIVELIHOOD COLLEGE', 'Computer Operator']
  ],
  'Education_Linked': [
    ['Name', 'Faather Name', 'Mother Name', 'Email', 'Gender', 'Education', 'Phone Number', 'Address'],
    ['Aashish Markam', 'Bomda markam', 'Sukdi markam', 'aashish@navgurukul.org', 'M', '2nd year Bcom', '6260926752', 'Pattarash, Dantewada']
  ],
  'PMEGP_PMFME_Loan': [
    ['SR. NO.', 'NAME', 'FATHER NAME', 'VILLAGE', 'BLOCK', 'LOAN AMOUNT', 'YOJNA', 'BUSSINESS'],
    [1, 'MOHAN BHASKAR', 'SUKHMAN BHASKAR', 'KAMALOOR', 'Dantewada', '50000', 'PMEGP', 'KIRANA DUKAN']
  ],
  'IIM_Candidate_List': [
    ['SR', 'NAME', 'FATHER NAME', 'GENDER', 'AGE', 'CAST', 'GP', 'BLOCK', 'DISTRICT', 'MOBILE NO.', 'EDUCATION', 'PERCENT', 'AGE (2)'],
    [1, 'DIKESHWAR THAKUR', 'MADHUSUDAN THAKUR', 'MALE', 23, 'OBC', 'RONJE', 'Geedam', 'Dantewada', '9302736053', 'GRADUATE', '65%', 23]
  ],
  'Bastar_Munne_Shivir': [
    ['SR. NO.', 'NAME', 'FATHER NAME', 'VILLAGE', 'BLOCK', 'DOB', 'GENDER', 'MOBILE NO.', 'AADHAR', 'CATEGORY', 'INTERESTED TRADE'],
    [1, 'RAMESH KUMAR', 'SUDRU RAM', 'PADHAPUR', 'Dantewada', '2004-02-10', 'MALE', '9876543210', '987654321012', 'ST', 'RAJMISTRI']
  ]
};

for (const [name, rows] of Object.entries(sheets)) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = rows[0].map(h => ({ wch: Math.max(String(h).length + 4, 16) }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync('dantewada_master_database_template.xlsx', buffer);
console.log('Successfully created dantewada_master_database_template.xlsx');
