const fs = require('fs');
const vm = require('vm');

const scriptUrl = 'https://script.google.com/macros/s/AKfycbwCdp1wYyZIRpiFxluEaRyVBpMt1EIQJlZj4QDfSHRoSyuW_ySk0ou-0xEXsEjpuoNAeA/exec';

// Load DantewadaDB in VM
const dbCode = fs.readFileSync('js/db.js', 'utf8');
const sandbox = {
  window: {},
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  console: console,
  document: {},
  CustomEvent: class CustomEvent { constructor(name) { this.name = name; } },
  dispatchEvent: () => {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(dbCode, sandbox);
const DB = sandbox.window.DantewadaDB;

// Define the 14 sheets and sample test rows matching their headers
const testSheets = [
  {
    sheet: 'Employment_Registration',
    row: {
      'First Name': 'Ramesh',
      'Last Name': 'Kashyap',
      "Father's Name / Husband's Name": 'Sukhlal',
      'Grampanchayat': 'Gidam',
      'Block Name': 'Geedam',
      'Mobile Number': '9876500001',
      'Gender': 'Male',
      'Category': 'ST',
      'Highest Qualification': 'Graduate',
      'Current Occupation': 'Unemployed',
      'Aspired Career': 'Direct Formal Jobs'
    }
  },
  {
    sheet: 'Employed',
    row: {
      'NAME': 'Suresh Markam',
      'FATHER NAME': 'Laxman Markam',
      'ADDRESS': 'Katekalyan',
      'BLOCK': 'Katekalyan',
      'DISTRICT': 'Dantewada',
      'MOBILE NO.': '9876500002',
      'ORGANISATION': 'BPO Dantewada',
      'DATE OF JOINING': '2026-01-15',
      'SALARY': '15000'
    }
  },
  {
    sheet: 'Skill_Linked',
    row: {
      'NAME': 'Pooja Mandavi',
      'VILLAGE': 'Kuakonda',
      'MOBILE NO.': '9876500003',
      'INSTITUTE': 'Livelihood College',
      'SKILL TRAINING': 'Hospitality'
    }
  },
  {
    sheet: 'Education_Linked',
    row: {
      'Name': 'Kavita Oyam',
      'Faather Name': 'Mangal Oyam',
      'Mother Name': 'Sunita Oyam',
      'Email': 'kavita@gmail.com',
      'Gender': 'Female',
      'Education': '12th Pass',
      'Phone Number': '9876500004',
      'Address': 'Dantewada'
    }
  },
  {
    sheet: 'Entrepreneur_Identified',
    row: {
      'STARTUP / IDEA NAME': 'Bastar Herbs',
      'DISTRICT': 'Dantewada',
      'FOUNDER NAME': 'Arun Karma',
      'AGE': '24',
      'ADDRESS': 'Dantewada',
      'QUALIFICATION': 'Graduate',
      'MOBILE NO.': '9876500005',
      'EMAIL ID': 'arun@gmail.com',
      'DESCRIPTION': 'Organic herbs processing',
      'PROBLEM SOLVED': 'Local market for forest produce',
      'TARGET CUSTOMER': 'Tourists and local families',
      'INVESTED SO FAR': '20000',
      'INVESTMENT NEEDED': '50000',
      'TEAM MEMBERS': '2',
      'WORK TYPE': 'FULL TIME',
      'BUSINESS MODEL': 'Direct Sales'
    }
  },
  {
    sheet: 'PMEGP_PMFME_Loan',
    row: {
      'NAME': 'Manoj Tamo',
      'FATHER NAME': 'Somaru Tamo',
      'VILLAGE': 'Bade Bacheli',
      'BLOCK': 'Bacheli',
      'LOAN AMOUNT': '100000',
      'YOJNA': 'PMEGP',
      'BUSSINESS': 'Mobile Repair Shop'
    }
  },
  {
    sheet: 'Rang_De_Loan',
    row: {
      'NAME': 'Anita Netam',
      'ADDRESS': 'Geedam',
      'MOBILE NO.': '9876500006',
      'ACTIVITY': 'Poultry Farming',
      'AMOUNT (₹)': '50000',
      '2ND (₹)': '25000'
    }
  },
  {
    sheet: 'IIM_Candidate_List',
    row: {
      'NAME': 'Rajesh Bhogami',
      'FATHER NAME': 'Bheema Bhogami',
      'GENDER': 'Male',
      'AGE': '23',
      'CAST': 'ST',
      'GP': 'Palnar',
      'BLOCK': 'Kuakonda',
      'DISTRICT': 'Dantewada',
      'MOBILE NO.': '9876500007',
      'EDUCATION': 'B.Com',
      'PERCENT': '68%'
    }
  },
  {
    sheet: 'Training_Conducted',
    row: {
      'NAME': 'Sunita Sori',
      'ADDRESS': 'Geedam',
      'MOBILE NO.': '9876500008',
      'INSTITUTE': 'Livelihood College',
      'TRAINING': 'Solar Technician'
    }
  },
  {
    sheet: 'MY_Bharat_Registration',
    row: {
      'NAME': 'Dinesh Kunjam',
      'FATHER NAME': 'Lalsu Kunjam',
      'VILLAGE': 'Katekalyan',
      'BLOCK': 'Katekalyan',
      'DOB': '2002-04-10',
      'GENDER': 'Male',
      'MOBILE NO.': '9876500009',
      'CATEGORY': 'ST',
      'CURRENT OCCUPATION': 'Student',
      'REMARK': 'Registered'
    }
  },
  {
    sheet: 'Youth_Hub_Trainings',
    row: {
      'NAME': 'Meena Poyam',
      'FATHER NAME': 'Budhram Poyam',
      'VILLAGE': 'Kirandul',
      'BLOCK': 'Bacheli',
      'DOB': '2003-08-15',
      'GENDER': 'Female',
      'MOBILE NO.': '9876500010',
      'REMARK': 'Completed 30 days training'
    }
  },
  {
    sheet: 'Bastar_Munne_Shivir',
    row: {
      'NAME': 'Raju Kadti',
      'FATHER NAME': 'Kosa Kadti',
      'VILLAGE': 'Barsur',
      'BLOCK': 'Geedam',
      'DOB': '2001-12-05',
      'GENDER': 'Male',
      'MOBILE NO.': '9876500011',
      'AADHAR': '123456789012',
      'CATEGORY': 'ST',
      'REMARK': 'Eligible'
    }
  },
  {
    sheet: 'Meetings_VO_CLF_TRIF',
    row: {
      'DATE': '2026-03-01',
      'VILLAGE': 'Hiranar',
      'BLOCK': 'Geedam',
      'VO / CLF NAME': 'Prerna Mahila Gram Sangathan',
      'ADHAYAKSH / SACHIV': 'Smt. Jamuna Bai',
      'DISCUSS POINT': 'SHG youth mobilization',
      'REMARKS': 'Resolution passed',
      'PHOTO': 'https://example.com/photo.jpg'
    }
  },
  {
    sheet: 'M_Form',
    row: {
      'Block Name': 'Dantewada',
      'Grampanchayat': 'Hiranar',
      'First Name': 'Hemant',
      'Last Name': 'Barse',
      'Mobile Number': '9876500012',
      'Gender': 'Male',
      'Email': 'hemant@gmail.com',
      'Pin Code': '494551',
      "Father's Name / Husband's Name": 'Lachhu Barse',
      "Mother's Name": 'Phoolo Barse',
      'Category': 'ST',
      'Highest Qualification': '12th Pass',
      'Current Occupation': 'Unemployed',
      'Aspired Career': 'Direct Formal Jobs'
    }
  }
];

async function runTest() {
  console.log('====================================================');
  console.log('TESTING BULK UPLOAD ACROSS ALL 14 TABS');
  console.log('====================================================\n');

  const results = [];

  for (const item of testSheets) {
    const rawRows = [item.row];
    const preview = DB.previewImport(item.sheet, rawRows);
    const valid = preview.validRows.length;
    const invalid = preview.invalidRows.length;
    const error = invalid > 0 ? preview.invalidRows[0].reason : '';

    let commitResult = null;
    if (valid > 0) {
      commitResult = DB.commitImport(item.sheet, preview.validRows);
    }

    results.push({
      sheet: item.sheet,
      previewValid: valid,
      previewInvalid: invalid,
      errorReason: error,
      commitSuccess: commitResult ? commitResult.success !== false : false
    });
  }

  console.log('LOCAL DB PREVIEW & COMMIT RESULTS:');
  console.table(results);
}

runTest();
