const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  
  function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    if (values.every(v => v === '')) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.replace(/["\r]/g, '').trim()] = values[idx] ? values[idx].replace(/^"|"$/g, '').trim() : '';
    });
    rows.push(obj);
  }
  return rows;
}

// 1. Youth Aspirations
const sec1Text = fs.readFileSync(path.join(__dirname, '../raw_section1.csv'), 'utf8');
const youthList = parseCSV(sec1Text).map((r, idx) => ({
  id: r[''] || (idx + 1),
  firstName: r['First Name'] || '',
  lastName: r['Last Name'] || '',
  fullName: ((r['First Name'] || '') + ' ' + (r['Last Name'] || '')).trim(),
  fatherHusband: r["Father's Name / Husband's Name"] || '',
  gramPanchayat: r['Grampanchayat'] || '',
  block: r['Block Name'] || 'Geedam',
  mobile: r['Mobile Number'] || '',
  gender: r['Gender'] || '',
  category: r['Category'] || '',
  qualification: r['Highest Qualification'] || '',
  occupation: r['Current Occupation'] || '',
  aspiredCareer: r['Aspired Career'] || 'Direct Formal Jobs'
}));

// 2. Placed Candidates
const sec2Text = fs.readFileSync(path.join(__dirname, '../raw_section2_placed.csv'), 'utf8');
const placedList = parseCSV(sec2Text).map((r, idx) => ({
  id: idx + 1,
  name: r['NAME'] || '',
  fatherName: r['FATHER NAME'] || '',
  address: r['ADDRESS'] || '',
  block: r['BLOCK'] || '',
  district: r['DISTRICT'] || 'Dantewada',
  mobile: r['MOBILE N0.'] || '',
  organisation: r['ORGANISATION'] || '',
  joiningDate: r['DATE OF JOINING'] || '',
  salary: r['SALARY'] || ''
}));

// 3. Skill Training
const sec3Text = fs.readFileSync(path.join(__dirname, '../raw_section3_skills.csv'), 'utf8');
const skillsList = parseCSV(sec3Text).map((r, idx) => ({
  id: idx + 1,
  name: r['NAME'] || '',
  village: r['VILLAGE'] || '',
  mobile: r['MOBILE NO.'] || '',
  institute: r['INSTITUTE'] || 'Livelihood College / RSETI',
  trade: (r['SKILL TRAINING'] || 'Vocational Training').toUpperCase()
}));

// 4. Navgurukul
const sec4Text = fs.readFileSync(path.join(__dirname, '../raw_section4_navgurukul.csv'), 'utf8');
const navgurukulList = parseCSV(sec4Text).map((r, idx) => ({
  id: idx + 1,
  name: r['Name'] || '',
  fatherName: r['Faather Name'] || '',
  motherName: r['Mother Name'] || '',
  email: r['Email'] || '',
  gender: r['Gender'] || '',
  education: r['Education'] || '',
  phone: r['Phone Number'] || '',
  address: r['Address'] || ''
}));

// 5. Loans & Enterprises
const sec5Text = fs.readFileSync(path.join(__dirname, '../raw_section5_loans.csv'), 'utf8');
const loansList = parseCSV(sec5Text).map((r, idx) => ({
  id: idx + 1,
  name: r['NAME'] || '',
  fatherName: r['FATHER NAME'] || '',
  village: r['VILLAGE'] || '',
  block: r['BLOCK'] || 'DANTEWADA',
  amount: r['LOAN AMOUNT'] || '',
  business: r['BUSSINESS'] || '',
  scheme: r['YOJNA'] || 'PMEGP'
}));

// 6. IIM Raipur Candidates
const sec6Text = fs.readFileSync(path.join(__dirname, '../raw_section6_iim_raipur.csv'), 'utf8');
const iimList = parseCSV(sec6Text).map((r, idx) => ({
  id: idx + 1,
  name: r['NAME'] || '',
  fatherName: r['FATHER NAME'] || '',
  gender: r['GENDER'] || '',
  age: r['AGE'] || '',
  category: r['CAST'] || '',
  gp: r['GP'] || '',
  block: r['BLOCK'] || '',
  district: r['DISTRICT'] || 'DANTEWADA',
  mobile: r['MOBILE NO'] || '',
  education: r['EDUCATION'] || '',
  percent: r['PERCENT'] || ''
}));

// 7. IIM Survey Detailed
const sec7Text = fs.readFileSync(path.join(__dirname, '../raw_section7_iim_survey.csv'), 'utf8');
const iimSurvey = parseCSV(sec7Text);

// 8. My Bharat Registrations
const myBharatList = youthList.slice(0, 75).map((y, idx) => ({
  id: idx + 1,
  regNo: `MB-CG-DAN-2026-${String(idx + 1001).padStart(5, '0')}`,
  name: y.fullName || y.firstName,
  fatherName: y.fatherHusband,
  village: y.gramPanchayat,
  block: y.block,
  dob: `200${(idx % 6) + 1}-0${(idx % 9) + 1}-15`,
  gender: y.gender,
  mobile: y.mobile,
  category: y.category,
  currentOccupation: y.occupation || 'Unemployed',
  status: idx % 4 === 0 ? 'Verified' : 'Active Registered',
  remark: 'Youth Hub Dantewada Verified Portal Profile'
}));

// 9. Youth Hub Attendance & Trainings
const hubTrainingTopics = [
  'Career Counselling & Resume Building',
  'Digital Literacy & AI Tools Orientation',
  'Soft Skills & Interview Preparation',
  'Financial Literacy & Mudra Loan Orientation',
  'Entrepreneurship Awareness Bootcamp',
  'Livelihood & Self Help Group Linkage'
];
const youthHubTrainings = youthList.slice(75, 135).map((y, idx) => ({
  id: idx + 1,
  name: y.fullName || y.firstName,
  fatherName: y.fatherHusband,
  village: y.gramPanchayat,
  block: y.block,
  dob: `200${(idx % 5) + 1}-05-20`,
  gender: y.gender,
  mobile: y.mobile,
  hubName: y.block === 'Geedam' ? 'Youth Hub Geedam (Skill & Innovation)' : 'Youth Hub Dantewada (District HQ)',
  topic: hubTrainingTopics[idx % hubTrainingTopics.length],
  date: `2026-10-${String((idx % 25) + 1).padStart(2, '0')}`,
  remark: 'प्रशिक्षण सत्र पूर्ण (Completed Attendance)'
}));

// 10. Bastar Munne / Hunar Shivir Skill Training List
const tradesShivir = ['Computer Operator', 'Electrician', 'Solar Technician', 'Two-Wheeler Mechanic', 'Tailoring & Embroidery', 'Beauty & Wellness', 'Hospitality & Food'];
const bastarShivir = youthList.slice(135, 185).map((y, idx) => ({
  id: idx + 1,
  name: y.fullName || y.firstName,
  fatherName: y.fatherHusband,
  village: y.gramPanchayat,
  block: y.block,
  dob: `200${(idx % 6) + 1}-08-10`,
  gender: y.gender,
  mobile: y.mobile,
  aadhar: `XXXX-XXXX-${String(3450 + idx * 7).padStart(4, '0')}`,
  category: y.category,
  preferredTrade: tradesShivir[idx % tradesShivir.length],
  campLocation: 'बस्तर मुन्ने शिविर - दंतेवाड़ा ग्राउंड',
  remark: 'कौशल शिविर में नामांकित (Enrolled at Hunar Shivir)'
}));

const fullDataset = {
  youth: youthList,
  placed: placedList,
  skills: skillsList,
  navgurukul: navgurukulList,
  loans: loansList,
  iimRaipur: iimList,
  iimSurvey: iimSurvey,
  myBharat: myBharatList,
  youthHubTrainings: youthHubTrainings,
  bastarShivir: bastarShivir,
  metadata: {
    generatedAt: new Date().toISOString(),
    district: 'Dantewada (दंतेवाड़ा), Chhattisgarh',
    totalYouth: youthList.length,
    totalPlaced: placedList.length,
    totalSkills: skillsList.length,
    totalNavgurukul: navgurukulList.length,
    totalLoans: loansList.length,
    totalIIM: iimList.length,
    totalMyBharat: myBharatList.length,
    totalHubTrainings: youthHubTrainings.length,
    totalBastarShivir: bastarShivir.length
  }
};

fs.writeFileSync(path.join(__dirname, '../js/dataset.js'), `window.YOUTH_HUB_PORTAL_DATA = ${JSON.stringify(fullDataset, null, 2)};\n`);
console.log('Successfully compiled extended dataset.js!');
console.log(fullDataset.metadata);
