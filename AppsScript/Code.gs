/**
 * =========================================================================
 * YOUTH HUB DANTEWADA - GOOGLE APPS SCRIPT PRODUCTION BACKEND (v3.1)
 * =========================================================================
 * आपकी एक्सेल शीट के सटीक हेडर्स व टाइटल रो (Title Row) संरचना के अनुसार।
 * 
 * 📌 सेटअप निर्देश (केवल 1 मिनट):
 * 1. अपनी Google Sheet खोलें।
 * 2. Extensions > Apps Script में जाएं।
 * 3. यह पूरा कोड पेस्ट करें और Save (Ctrl+S) करें।
 * 4. ऊपर फ़ंक्शन 'setupDatabase' चुनकर 'Run' दबाएं (यह 13 टैब्स और सटीक हेडर्स बना देगा)।
 * 5. ऊपर Deploy > New deployment > Web app:
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone'  <-- (जरूरी)
 * 6. Deploy करें और जो URL मिले, वह पोर्टल में डाल दें!
 * =========================================================================
 */

// आपकी एक्सेल फ़ाइल के सटीक 13 शीट्स के हेडर्स
const EXACT_EXCEL_TEMPLATES = {
  // 1. रोजगार पंजीयन
  "Employment_Registration": {
    hasTitle: false,
    headers: [
      "SR.No", "First Name", "Last Name", "Father's Name / Husband's Name",
      "Grampanchayat", "Block Name", "Mobile Number", "Gender", "Category",
      "Highest Qualification", "Current Occupation", "Aspired Career"
    ]
  },

  // 2. रोजगार प्राप्त
  "Employed": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME ", "FATHER NAME", "ADDRESS", "BLOCK",
      "DISTRICT", "MOBILE N0.", "ORGANISATION", "DATE OF JOINING", "SALARY"
    ]
  },

  // 3. कौशल प्रशिक्षण
  "Skill_Linked": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME ", "VILLAGE", "MOBILE NO.", "INSTITUTE", "SKILL TRAINING"
    ]
  },

  // 4. शिक्षा लिंकेज
  "Education_Linked": {
    hasTitle: false,
    headers: [
      "Name", "Faather Name", "Mother Name", "Email", "Gender",
      "Education", "Phone Number", "Address"
    ]
  },

  // 5. PMEGP / PMFME लोन
  "PMEGP_PMFME_Loan": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
      "LOAN AMOUNT", "YOJNA", "BUSSINESS"
    ]
  },

  // 6. आईआईएम रायपुर
  "IIM_Candidate_List": {
    hasTitle: true,
    titleText: "CANDIDATE LIST IIM RAIPUR 2025",
    headers: [
      "SR", "NAME ", "FATHER NAME", "GENDER", "AGE", "CAST",
      "GP", "BLOCK", "DISTRICT", "MOBILE NO, ", "EDUCATION", "PERCENT", "AGE"
    ]
  },

  // 7. आयोजित प्रशिक्षण
  "Training_Conducted": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME ", "ADDRESS", "MOBILE NO.", "INSTITUTE", "TRAINING"
    ]
  },

  // 8. माई भारत पंजीयन
  "MY_Bharat_Registration": {
    hasTitle: true,
    titleText: "MY BHARAT REGISTRATION LIST",
    headers: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
      "GENDER", "MOBILE NO.", "CATEGORY", "CURRENT OCCUPATION", "REMARK"
    ]
  },

  // 9. युवा हब प्रशिक्षण
  "Youth_Hub_Trainings": {
    hasTitle: true,
    titleText: "YOUTHS ATTENDED TRAININGS AT YOUTH HUBS",
    headers: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
      "GENDER", "MOBILE NO.", "REMARK"
    ]
  },

  // 10. बस्तर मुन्ने विशेष शिविर
  "Bastar_Munne_Shivir": {
    hasTitle: true,
    titleText: "BASTAR MUNNE SHIVIR REGISTERED YOUTH LIST FOR SKILL TRAINING",
    headers: [
      "SR. NO.", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
      "DOB", "GENDER", "MOBILE NO.", "AADHAR", "CATEGORY", "INTERESTED TRADE (इच्छुक ट्रेड)"
    ]
  },

  // 11. ग्राम संगठन (VO/CLF) बैठकें
  "Meetings_VO_CLF_TRIF": {
    hasTitle: false,
    headers: [
      "DATE", "VILLAGE", "BLOCK", "VO / CLF NAME", "ADHAYAKSH / SACHIV",
      "DISCUSS POINT", "REMARKS", "PHOTO"
    ]
  },

  // 12. उद्यमी व स्टार्टअप विचार
  "Entrepreneur_Identified": {
    hasTitle: false,
    headers: [
      "SR. NO.", "STARTUP / IDEA NAME", "DISTRICT", "FOUNDER NAME", "AGE",
      "ADDRESS", "EDUCATION", "MOBILE NO.", "INVESTMENT NEEDED", "WORK TYPE", "BUSINESS MODEL / PROBLEM"
    ]
  },

  // 13. रंग दे ऋण लाभार्थी
  "Rang_De_Loan": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
    ]
  },

  // 14. एम-फॉर्म सर्वे (17. M-Form)
  "M_Form": {
    hasTitle: false,
    headers: [
      "SR. NO.", "Block Name", "Grampanchayat", "First Name", "Last Name",
      "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name",
      "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ]
  }
};

// Global Schema Definition for Unit Tests and Core Compatibility
const SHEETS_SCHEMA = {
  Employment_Registration: [
    "SR.No", "First Name", "Last Name", "Father's Name / Husband's Name",
    "Grampanchayat", "Block Name", "Mobile Number", "Gender", "Category",
    "Highest Qualification", "Current Occupation", "Aspired Career"
  ],
  Employed: [
    "SR. NO.", "NAME ", "FATHER NAME", "ADDRESS", "BLOCK",
    "DISTRICT", "MOBILE N0.", "ORGANISATION", "DATE OF JOINING", "SALARY"
  ],
  Skill_Linked: [
    "SR. NO.", "NAME ", "VILLAGE", "MOBILE NO.", "INSTITUTE", "SKILL TRAINING"
  ],
  Education_Linked: [
    "Name", "Faather Name", "Mother Name", "Email", "Gender",
    "Education", "Phone Number", "Address"
  ],
  PMEGP_PMFME_Loan: [
    "SR. NO.", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
    "LOAN AMOUNT", "YOJNA", "BUSSINESS"
  ],
  IIM_Candidate_List: [
    "SR", "NAME ", "FATHER NAME", "GENDER", "AGE", "CAST",
    "GP", "BLOCK", "DISTRICT", "MOBILE NO, ", "EDUCATION", "PERCENT", "AGE2"
  ],
  Training_Conducted: [
    "SR. NO.", "NAME ", "ADDRESS", "MOBILE NO.", "INSTITUTE", "TRAINING"
  ],
  MY_Bharat_Registration: [
    "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
    "GENDER", "MOBILE NO.", "CATEGORY", "CURRENT OCCUPATION", "REMARK"
  ],
  Youth_Hub_Trainings: [
    "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
    "GENDER", "MOBILE NO.", "REMARK"
  ],
  Bastar_Munne_Shivir: [
    "SR. NO.", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
    "DOB", "GENDER", "MOBILE NO.", "AADHAR", "CATEGORY", "INTERESTED TRADE (इच्छुक ट्रेड)"
  ],
  Meetings_VO_CLF_TRIF: [
    "DATE", "VILLAGE", "BLOCK", "VO / CLF NAME", "ADHAYAKSH / SACHIV",
    "DISCUSS POINT", "REMARKS", "PHOTO"
  ],
  Entrepreneur_Identified: [
    "SR. NO.", "STARTUP / IDEA NAME", "DISTRICT", "FOUNDER NAME", "AGE",
    "ADDRESS", "EDUCATION", "MOBILE NO.", "INVESTMENT NEEDED", "WORK TYPE", "BUSINESS MODEL / PROBLEM"
  ],
  Rang_De_Loan: [
    "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
  ],

  // Compatibility schemas
  Youth_Master: [
    "Youth_ID", "Youth_Name", "Father_Husband_Name", "Mobile_Number", "Gender",
    "DOB", "Age", "Category", "Aadhaar_Number", "Qualification", "Occupation",
    "District", "Block", "Gram_Panchayat", "Village", "Address",
    "Career_Interest", "Registration_Date", "Follow_Up_Status", "Remarks"
  ],
  Mobilization: [
    "Activity_ID", "Date", "Financial_Year", "Month", "Block", "Gram_Panchayat",
    "Village", "Activity_Name", "Mobilization_Source", "Mobilizer_Name",
    "Male", "Female", "Other", "Total_Mobilized", "Photo_URL", "Remarks"
  ],
  M_Form: [
    "SR. NO.", "Block Name", "Grampanchayat", "First Name", "Last Name", "Mobile Number", "Gender",
    "Email", "Pin Code", "Father's Name / Husband's Name", "Mother's Name", "Category",
    "Highest Qualification", "Current Occupation", "Aspired Career", "MForm_ID"
  ],
  My_Bharat: [
    "MyBharat_ID", "Youth_ID", "Youth_Name", "Mobile", "Registration_Date",
    "Block", "GP", "MyBharat_Reg_No", "Status", "Remarks"
  ],
  Counselling: [
    "Counselling_ID", "Youth_ID", "Youth_Name", "Date", "Block", "Counselling_Type",
    "Career_Interest", "Counsellor_Name", "Counselling_Outcome",
    "Follow_Up_Required", "Follow_Up_Date", "Follow_Up_Status",
    "Pending_Issue", "Recommended_Action", "Remarks"
  ],
  Skill_Training: [
    "Training_Record_ID", "Youth_ID", "Youth_Name", "Training_Name", "Skill_Trade",
    "Training_Provider", "Course", "Start_Date", "End_Date", "Training_Status",
    "Completion_Status", "Certificate_Status", "Employment_After_Training",
    "Follow_Up_Date", "Follow_Up_Status", "Remarks"
  ],
  Employment_Registered: [
    "Emp_Reg_ID", "Youth_ID", "Youth_Name", "Registration_Date", "Block",
    "Qualification", "Preferred_Job", "Registration_Status", "Remarks"
  ],
  Employment_Linked: [
    "SR. NO.", "NAME ", "FATHER NAME", "ADDRESS", "BLOCK",
    "DISTRICT", "MOBILE N0.", "ORGANISATION", "DATE OF JOINING", "SALARY"
  ],
  Education: [
    "Name", "Faather Name", "Mother Name", "Email", "Gender",
    "Education", "Phone Number", "Address"
  ],
  Entrepreneurs: [
    "Entrepreneur_ID", "Stage", "Youth_ID", "Name", "Father_Name", "Mobile", "Block", "Village",
    "Business_Type", "Business_Idea", "Business_Category", "Identification_Date",
    "Business_Plan_Status", "DPR_Status", "Business_Status", "Establishment_Date",
    "Loan_Required", "Loan_Applied", "Loan_Approved", "Loan_Processed_Date",
    "Loan_Status", "Loan_Amount", "Received_Amount", "Loan_Scheme",
    "Bank_Name", "Account_Number", "IFSC_Code",
    "Udyam_Registration", "Bank_Documents", "Pan_Card", "Aadhar_Card", "Voter_Card", "Quotation", "Updates",
    "Follow_Up_Date", "Pending_Issue", "Remarks"
  ],
  Entrepreneurs_Established: [
    "S.NO", "BLOCK", "NAME", "FATHER NAME", "VILLAGE", "MOBILE NO.", "BUSINESS", "LONE AMOUNT"
  ],
  NavGurukul: [
    "Candidate_ID", "Youth_ID", "Candidate_Name", "Mobile", "Block", "GP",
    "Qualification", "Registration_Date", "Selection_Status", "Admission_Status",
    "Joining_Date", "Remarks"
  ],
  Trainings: [
    "Training_ID", "Financial_Year", "Quarter", "Month", "Training_Name",
    "Training_Category", "Training_Topic", "Start_Date", "End_Date", "Duration_Days",
    "Total_Participants", "Male", "Female", "Block", "Venue",
    "Trainer_Name", "Trainer_Org", "Cost_Incurred", "Outcome", "Photo_URL", "Remarks"
  ],
  Activities: [
    "Activity_ID", "Date", "Month", "Block", "Activity_Category",
    "Activity_Name", "Objective", "Key_Outcomes", "Male", "Female",
    "Total_Participants", "Lead_Person", "Photo_URL", "Remarks"
  ],
  Rehabilitation: [
    "Rehab_ID", "Youth_ID", "Youth_Name", "Date", "Block",
    "Rehab_Category", "Special_Needs", "Assistance_Provided",
    "Livelihood_Option", "Follow_Up_Date", "Current_Status", "Remarks"
  ],
  IIM_Raipur: [
    "SR", "NAME ", "FATHER NAME", "GENDER", "AGE", "CAST",
    "GP", "BLOCK", "DISTRICT", "MOBILE NO, ", "EDUCATION", "PERCENT", "AGE2"
  ],
  Photo_Uploads: [
    "Photo_ID", "Upload_Date", "Module", "Record_ID", "Title",
    "File_Name", "Drive_File_ID", "Direct_Link", "Thumbnail_Link", "Uploaded_By", "Block", "Tags"
  ],
  RangDe_Loan: [
    "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
  ]
};

// शीट्स के उपनाम (Aliases)
const SHEET_ALIASES = {
  "employment_registered": "Employment_Registration",
  "youth_master": "Employment_Registration",
  "m_form": "M_Form",
  "m-form": "M_Form",
  "mform": "M_Form",
  "employment_linked": "Employed",
  "employed": "Employed",
  "skill_training": "Skill_Linked",
  "skill_linked": "Skill_Linked",
  "education": "Education_Linked",
  "education_linked": "Education_Linked",
  "navgurukul": "Education_Linked",
  "entrepreneurs": "PMEGP_PMFME_Loan",
  "pmegp_pmfme_loan": "PMEGP_PMFME_Loan",
  "rangde_loan": "Rang_De_Loan",
  "rang_de_loan": "Rang_De_Loan",
  "bastar_shivir": "Bastar_Munne_Shivir",
  "bastar_munne_shivir": "Bastar_Munne_Shivir",
  "bastar_munne_report": "Bastar_Munne_Shivir",
  "bastarmunnereport": "Bastar_Munne_Shivir",
  "iim_raipur": "IIM_Candidate_List",
  "iim_candidate_list": "IIM_Candidate_List",
  "training_conducted": "Training_Conducted",
  "my_bharat_registration": "MY_Bharat_Registration",
  "youth_hub_trainings": "Youth_Hub_Trainee",
  "youth_hub_trainee": "Youth_Hub_Trainee",
  "youth_hub_trainees": "Youth_Hub_Trainee",
  "youthhubtrainee": "Youth_Hub_Trainee",
  "youthhubtrainings": "Youth_Hub_Trainee",
  "meetings_vo_clf_trif": "VO CLF Meeting",
  "vo_clf_meeting": "VO CLF Meeting",
  "voclfmeeting": "VO CLF Meeting",
  "vo_clf_meetings": "VO CLF Meeting",
  "meetings_vo_clf": "VO CLF Meeting",
  "startup_hunt": "Entrepreneur_Identified",
  "startuphunt": "Entrepreneur_Identified",
  "startup_district_ideas": "Entrepreneur_Identified",
  "startupdistrictideas": "Entrepreneur_Identified",
  "entrepreneur_identified": "Entrepreneur_Identified"
};

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * एक क्लिक में सभी 13 शीट्स और हेडर्स ऑटो-क्रिएट करें
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  const createdSheets = [];

  for (const [sheetName, template] of Object.entries(EXACT_EXCEL_TEMPLATES)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      if (template.hasTitle) {
        // Row 1: Title Banner
        sheet.getRange(1, 1).setValue(template.titleText);
        sheet.getRange(1, 1, 1, template.headers.length).merge();
        const titleRange = sheet.getRange(1, 1, 1, template.headers.length);
        titleRange.setBackground("#07182E");
        titleRange.setFontColor("#FBBF24");
        titleRange.setFontWeight("bold");
        titleRange.setHorizontalAlignment("center");
        titleRange.setFontSize(11);

        // Row 2: Headers
        sheet.getRange(2, 1, 1, template.headers.length).setValues([template.headers]);
        const headerRange = sheet.getRange(2, 1, 1, template.headers.length);
        headerRange.setBackground("#0F294A");
        headerRange.setFontColor("#FFFFFF");
        headerRange.setFontWeight("bold");
        headerRange.setFontSize(10);
        sheet.setFrozenRows(2);
      } else {
        // Row 1: Headers
        sheet.getRange(1, 1, 1, template.headers.length).setValues([template.headers]);
        const headerRange = sheet.getRange(1, 1, 1, template.headers.length);
        headerRange.setBackground("#0F294A");
        headerRange.setFontColor("#FFFFFF");
        headerRange.setFontWeight("bold");
        headerRange.setFontSize(10);
        sheet.setFrozenRows(1);
      }
    }
    createdSheets.push(sheetName);
  }

  return {
    success: true,
    message: "सफलतापूर्वक सभी शीट्स (M-Form सहित) तैयार हो गईं!",
    sheets: createdSheets
  };
}

function findSheet(ss, requestedName) {
  if (!requestedName) return null;
  const cleanReq = String(requestedName).trim();

  let sheet = ss.getSheetByName(cleanReq);
  if (sheet) return sheet;

  const sheets = ss.getSheets();
  const lowerReq = cleanReq.toLowerCase().replace(/[\s._-]+/g, "");
  for (let i = 0; i < sheets.length; i++) {
    const sName = sheets[i].getName().toLowerCase().replace(/[\s._-]+/g, "");
    if (sName === lowerReq) return sheets[i];
  }

  // Also match ignoring leading numbers e.g. "17. M-Form" vs "M_Form"
  const strippedReq = lowerReq.replace(/^\d+/, "");
  if (strippedReq.length > 2) {
    for (let i = 0; i < sheets.length; i++) {
      const sNameStripped = sheets[i].getName().toLowerCase().replace(/[\s._-]+/g, "").replace(/^\d+/, "");
      if (sNameStripped === strippedReq) return sheets[i];
    }
  }

  const aliasTarget = SHEET_ALIASES[lowerReq] || SHEET_ALIASES[cleanReq.toLowerCase()] || SHEET_ALIASES[strippedReq];
  if (aliasTarget) {
    sheet = ss.getSheetByName(aliasTarget);
    if (sheet) return sheet;
    const targetNorm = aliasTarget.toLowerCase().replace(/[\s._-]+/g, "");
    for (let i = 0; i < sheets.length; i++) {
      const sName = sheets[i].getName().toLowerCase().replace(/[\s._-]+/g, "").replace(/^\d+/, "");
      if (sName === targetNorm) return sheets[i];
    }
  }

  return null;
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || "ping";

  let responseData;
  if (action === "ping") {
    responseData = {
      success: true,
      status: "online",
      spreadsheetName: getSpreadsheet().getName(),
      message: "Dantewada Youth Portal Backend is Live & Connected.",
      timestamp: new Date().toISOString()
    };
  } else {
    responseData = handleAction(action, params);
  }

  return createJsonResponse(responseData);
}

function doPost(e) {
  let requestData = {};
  if (e && e.postData && e.postData.contents) {
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (err) {
      return createJsonResponse({ success: false, message: "Invalid JSON: " + err.message });
    }
  }

  const action = requestData.action || "ping";
  const payload = requestData.payload || {};

  const responseData = handleAction(action, payload);
  return createJsonResponse(responseData);
}

function handleAction(action, payload) {
  const ss = getSpreadsheet();

  switch (action) {
    case "ping":
    case "testConnection":
      return {
        success: true,
        status: "online",
        spreadsheetName: ss.getName(),
        sheetsCount: ss.getSheets().length,
        message: "Google Sheet Backend Connection Successful!",
        timestamp: new Date().toISOString()
      };

    case "setupDatabase":
      return setupDatabase();

    case "getTableRecords":
      return getTableRecords(ss, payload.sheetName || payload.sheet);

    case "getAllData":
      return getAllData(ss);

    case "addRecord":
    case "createRecord":
    case "addYouth":
    case "addEmploymentRegistered":
    case "addRangDeLoan":
    case "addEntrepreneur":
    case "addEntrepreneurEstablished":
    case "addTraining":
    case "addPlacement":
    case "addCounselling":
    case "addActivity":
    case "addPhotoUpload": {
      let sheetName = payload.sheetName || payload.sheet;
      if (!sheetName) {
        if (action === "addRangDeLoan") sheetName = "Rang_De_Loan";
        else if (action === "addEntrepreneur" || action === "addEntrepreneurEstablished") sheetName = "PMEGP_PMFME_Loan";
        else if (action === "addTraining") sheetName = "Training_Conducted";
        else if (action === "addPlacement") sheetName = "Employed";
        else if (action === "addCounselling") sheetName = "Meetings_VO_CLF_TRIF";
        else sheetName = "Employment_Registration";
      }
      return addRecord(ss, sheetName, payload.data || payload.record || payload);
    }

    case "updateRecord":
    case "editRecord": {
      const sheetName = payload.sheetName || payload.sheet || "Employment_Registration";
      return updateRecord(ss, sheetName, payload);
    }

    case "deleteRecord":
    case "removeRecord": {
      const sheetName = payload.sheetName || payload.sheet || "Employment_Registration";
      return deleteRecord(ss, sheetName, payload);
    }

    case "bulkInsert":
    case "batchAdd":
    case "bulkUpload": {
      const sheetName = payload.sheetName || payload.sheet || "Employment_Registration";
      return bulkInsert(ss, sheetName, payload);
    }

    case "clearSheet":
    case "truncateSheet":
    case "resetSheet": {
      const sheetName = payload.sheetName || payload.sheet || "Employment_Registration";
      return clearSheetData(ss, sheetName);
    }

    case "getDashboard":
      return getDashboardKPIs(ss);

    default:
      return { success: false, message: "Unknown action: " + action };
  }
}

/**
 * स्मार्ट टेबल रीडर: स्वतः समझता है कि हेडर रो 1 पर है या रो 2 पर
 */
function getTableRecords(ss, sheetName) {
  const sheet = findSheet(ss, sheetName);
  if (!sheet) {
    return { success: false, message: `Sheet '${sheetName}' does not exist.` };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow <= 1 || lastCol === 0) {
    return { success: true, sheet: sheet.getName(), records: [], total: 0 };
  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  // स्वतः जांचें कि क्या पहली पंक्ति एक टाइटल बैनर है
  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length > 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) {
      headerRowIdx = 1;
    }
  }

  const rawHeaders = values[headerRowIdx];
  const records = [];

  for (let r = headerRowIdx + 1; r < values.length; r++) {
    const row = values[r];
    const isBlank = row.every(val => val === null || val === undefined || String(val).trim() === "");
    if (isBlank) continue;

    const record = {};
    for (let c = 0; c < rawHeaders.length; c++) {
      let rawH = rawHeaders[c];
      if (rawH === null || rawH === undefined || String(rawH).trim() === "") {
        continue;
      }
      const headerKey = String(rawH).trim();
      let val = row[c];

      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");
      }
      record[headerKey] = (val === null || val === undefined) ? "" : val;
    }
    records.push(record);
  }

  return {
    success: true,
    sheet: sheet.getName(),
    records: records,
    total: records.length
  };
}

function getAllData(ss) {
  const result = {};
  let grandTotal = 0;

  for (const sheetName of Object.keys(EXACT_EXCEL_TEMPLATES)) {
    const sheetData = getTableRecords(ss, sheetName);
    result[sheetName] = sheetData.records || [];
    grandTotal += (sheetData.records || []).length;
  }

  return {
    success: true,
    data: result,
    totalRecords: grandTotal,
    timestamp: new Date().toISOString()
  };
}

/**
 * बुद्धिमान फ़ील्ड रिज़ॉल्वर: हेडर नाम, क्लीन नाम, और पर्यायवाची (Synonyms) द्वारा मान खोजता है
 */
function resolveFieldValue(item, rawH, cleanH) {
  if (!item) return "";
  if (item[rawH] !== undefined && item[rawH] !== null && String(item[rawH]).trim() !== "") {
    return item[rawH];
  }

  // Exact alphanumeric match
  for (const [k, v] of Object.entries(item)) {
    if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanH) {
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
  }

  // Comprehensive synonym mappings
  const synonyms = {
    name: ["foundername", "firstname", "youthname", "candidatename", "fullname", "applicantname"],
    foundername: ["name", "firstname", "youthname", "applicantname"],
    business: ["startupideaname", "startupname", "businessidea", "worktype", "bussiness", "activity", "trade"],
    bussiness: ["startupideaname", "startupname", "businessidea", "worktype", "business", "activity", "trade"],
    startupideaname: ["business", "bussiness", "businessidea", "worktype"],
    loanamount: ["investmentneeded", "amount", "loanrequired", "loanapproved", "amountinr", "2nd"],
    investmentneeded: ["loanamount", "amount", "loanrequired"],
    village: ["address", "grampanchayat", "gp", "location"],
    address: ["village", "grampanchayat", "gp", "location"],
    block: ["district", "blockname", "taluka"],
    district: ["block", "blockname"],
    mobileno: ["mobilenumber", "phone", "phonenumber", "mobile", "mobilen0"],
    mobilen0: ["mobileno", "mobilenumber", "phone", "phonenumber", "mobile"],
    education: ["qualification", "highestqualification", "degree"],
    highestqualification: ["education", "qualification"],
    fathername: ["faathername", "fatherhusbandname", "fathersname"],
    faathername: ["fathername", "fatherhusbandname", "fathersname"]
  };

  const synList = synonyms[cleanH];
  if (synList) {
    for (const syn of synList) {
      for (const [k, v] of Object.entries(item)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === syn) {
          if (v !== undefined && v !== null && String(v).trim() !== "") return v;
        }
      }
    }
  }

  return "";
}

function addRecord(ss, targetSheetName, data) {
  const sheet = findSheet(ss, targetSheetName) || ss.getSheetByName("Employment_Registration");
  if (!sheet) {
    return { success: false, message: `Sheet '${targetSheetName}' not found.` };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  let headers = [];
  let headerRowIdx = 0;
  if (lastRow > 0 && lastCol > 0) {
    const headerScan = sheet.getRange(1, 1, Math.min(lastRow, 3), lastCol).getValues();
    const nonBlank0 = headerScan[0].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank0 <= 2 && headerScan.length > 2) {
      const nonBlank1 = headerScan[1].filter(v => v !== null && String(v).trim() !== "").length;
      if (nonBlank1 > nonBlank0) headerRowIdx = 1;
    }
    headers = headerScan[headerRowIdx].map(h => String(h || "").trim()).filter(h => h.length > 0);
  }

  if (headers.length === 0) {
    const template = EXACT_EXCEL_TEMPLATES[sheet.getName()] || EXACT_EXCEL_TEMPLATES["Employment_Registration"];
    headers = template ? template.headers : [];
  }

  const newRow = [];
  const nextSerial = Math.max(1, lastRow - headerRowIdx);
  const cleanData = (data && (data.data || data.record)) ? (data.data || data.record) : (data || {});

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    let val = resolveFieldValue(cleanData, h, cleanH);

    if (!val && (cleanH.includes("sr") || cleanH === "sno" || cleanH === "id")) {
      val = nextSerial;
    }

    newRow.push(val !== undefined && val !== null ? val : "");
  }

  sheet.appendRow(newRow);

  return {
    success: true,
    message: `Record added to '${sheet.getName()}' successfully.`,
    rowNumber: sheet.getLastRow(),
    record: newRow
  };
}

function updateRecord(ss, targetSheetName, payload) {
  const sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    return { success: false, message: `Sheet '${targetSheetName}' not found.` };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) {
    return { success: false, message: "Sheet has no data rows to update." };
  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length > 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) headerRowIdx = 1;
  }

  const rawHeaders = values[headerRowIdx];
  const headersClean = rawHeaders.map(h => String(h || "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  let targetRow = null;
  if (payload.rowNumber && typeof payload.rowNumber === "number" && payload.rowNumber > headerRowIdx + 1 && payload.rowNumber <= lastRow) {
    targetRow = payload.rowNumber;
  } else if (payload.rowIndex !== undefined && typeof payload.rowIndex === "number") {
    const computedRow = headerRowIdx + 2 + payload.rowIndex;
    if (computedRow > headerRowIdx + 1 && computedRow <= lastRow) {
      targetRow = computedRow;
    }
  }

  if (!targetRow && payload.idValue !== undefined && String(payload.idValue).trim() !== "") {
    const idValStr = String(payload.idValue).trim().toLowerCase();
    let idColIdx = -1;
    if (payload.idField) {
      const targetClean = String(payload.idField).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      idColIdx = headersClean.indexOf(targetClean);
    }

    if (idColIdx !== -1) {
      for (let r = headerRowIdx + 1; r < values.length; r++) {
        if (String(values[r][idColIdx] || "").trim().toLowerCase() === idValStr) {
          targetRow = r + 1;
          break;
        }
      }
    } else {
      for (let r = headerRowIdx + 1; r < values.length; r++) {
        if (values[r].some(v => String(v || "").trim().toLowerCase() === idValStr)) {
          targetRow = r + 1;
          break;
        }
      }
    }
  }

  if (!targetRow || targetRow <= headerRowIdx + 1 || targetRow > sheet.getLastRow()) {
    return { success: false, message: `Matching record not found to update in '${sheet.getName()}'.` };
  }

  const updatedData = payload.updatedData || payload.data || payload.record || payload;
  const currentRowValues = sheet.getRange(targetRow, 1, 1, rawHeaders.length).getValues()[0];

  for (let c = 0; c < rawHeaders.length; c++) {
    const cleanH = headersClean[c];
    if (!cleanH) continue;

    for (const [k, v] of Object.entries(updatedData)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanH) {
        currentRowValues[c] = v;
        break;
      }
    }
  }

  sheet.getRange(targetRow, 1, 1, rawHeaders.length).setValues([currentRowValues]);

  return {
    success: true,
    message: `Record at row ${targetRow} in '${sheet.getName()}' updated successfully.`,
    rowNumber: targetRow
  };
}

function deleteRecord(ss, targetSheetName, payload) {
  const sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    return { success: false, message: `Sheet '${targetSheetName}' not found.` };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) {
    return { success: false, message: "Sheet has no data rows to delete." };
  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length > 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) headerRowIdx = 1;
  }

  const rawHeaders = values[headerRowIdx];
  const headersClean = rawHeaders.map(h => String(h || "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  let targetRow = null;

  // 1. If rowData provided, match by primary fields (name, mobile, serial)
  if (payload.rowData && typeof payload.rowData === "object") {
    const rd = payload.rowData;
    const targetName = String(rd.name || rd.NAME || rd.Youth_Name || rd['NAME '] || "").trim().toLowerCase();
    const targetMobile = String(rd.mobile || rd.Mobile || rd['MOBILE NO.'] || rd['MOBILE N0.'] || rd.phone || "").trim().replace(/\D/g, "");
    const targetSerial = String(rd.sNo || rd['SR. NO.'] || rd['SR.NO.'] || rd.id || "").trim();

    const nameColIdx = headersClean.findIndex(h => h.includes("name") && !h.includes("father") && !h.includes("mother"));
    const mobileColIdx = headersClean.findIndex(h => h.includes("mobile") || h.includes("phone"));
    const serialColIdx = headersClean.findIndex(h => h.includes("sr") || h === "sno" || h === "id");

    for (let r = headerRowIdx + 1; r < values.length; r++) {
      const row = values[r];
      let matches = false;

      if (targetName && nameColIdx !== -1) {
        const rowName = String(row[nameColIdx] || "").trim().toLowerCase();
        if (rowName === targetName) {
          if (targetMobile && mobileColIdx !== -1) {
            const rowMobile = String(row[mobileColIdx] || "").trim().replace(/\D/g, "");
            if (rowMobile && rowMobile === targetMobile) matches = true;
            else if (!rowMobile) matches = true;
          } else {
            matches = true;
          }
        }
      } else if (targetSerial && serialColIdx !== -1) {
        const rowSerial = String(row[serialColIdx] || "").trim();
        if (rowSerial === targetSerial) matches = true;
      }

      if (matches) {
        targetRow = r + 1;
        break;
      }
    }
  }

  // 2. Match by idField and idValue
  if (!targetRow && payload.idValue !== undefined && String(payload.idValue).trim() !== "") {
    const idValStr = String(payload.idValue).trim().toLowerCase();
    let idColIdx = -1;
    if (payload.idField) {
      const targetClean = String(payload.idField).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      idColIdx = headersClean.indexOf(targetClean);
    }

    if (idColIdx !== -1) {
      for (let r = headerRowIdx + 1; r < values.length; r++) {
        if (String(values[r][idColIdx] || "").trim().toLowerCase() === idValStr) {
          targetRow = r + 1;
          break;
        }
      }
    } else {
      for (let r = headerRowIdx + 1; r < values.length; r++) {
        if (values[r].some(v => String(v || "").trim().toLowerCase() === idValStr)) {
          targetRow = r + 1;
          break;
        }
      }
    }
  }

  // 3. Fallback to rowNumber or rowIndex
  if (!targetRow) {
    if (payload.rowNumber && typeof payload.rowNumber === "number" && payload.rowNumber > headerRowIdx + 1 && payload.rowNumber <= lastRow) {
      targetRow = payload.rowNumber;
    } else if (payload.rowIndex !== undefined && typeof payload.rowIndex === "number") {
      const computedRow = headerRowIdx + 2 + payload.rowIndex;
      if (computedRow > headerRowIdx + 1 && computedRow <= lastRow) {
        targetRow = computedRow;
      }
    }
  }

  if (targetRow && targetRow > headerRowIdx + 1 && targetRow <= sheet.getLastRow()) {
    sheet.deleteRow(targetRow);
    return {
      success: true,
      message: `Record at row ${targetRow} deleted successfully from '${sheet.getName()}'.`,
      deletedRow: targetRow
    };
  }

  return {
    success: false,
    message: `Matching record not found to delete in sheet '${sheet.getName()}'.`
  };
}

function clearSheetData(ss, targetSheetName) {
  const sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    return { success: false, message: `Sheet '${targetSheetName}' not found.` };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) {
    return { success: true, message: `Sheet '${sheet.getName()}' is already empty.`, deletedRows: 0 };
  }

  const values = sheet.getRange(1, 1, Math.min(lastRow, 3), Math.max(lastCol, 1)).getValues();
  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length > 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) headerRowIdx = 1;
  }

  const dataStartRow = headerRowIdx + 2;
  const numRowsToDelete = lastRow - headerRowIdx - 1;

  if (numRowsToDelete > 0) {
    sheet.deleteRows(dataStartRow, numRowsToDelete);
    return {
      success: true,
      message: `Successfully cleared ${numRowsToDelete} data rows from '${sheet.getName()}'. Headers preserved.`,
      deletedRows: numRowsToDelete
    };
  }

  return { success: true, message: `Sheet '${sheet.getName()}' is already clear of data.`, deletedRows: 0 };
}

function bulkInsert(ss, targetSheetName, payload) {
  const sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    return { success: false, message: `Sheet '${targetSheetName}' not found.` };
  }

  const records = payload.records || payload.data || payload;
  if (!Array.isArray(records) || records.length === 0) {
    return { success: false, message: "No records provided for bulk insertion." };
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow === 0 || lastCol === 0) {
    return { success: false, message: "Sheet has no headers configured." };
  }

  const values = sheet.getRange(1, 1, Math.min(lastRow, 3), lastCol).getValues();
  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length > 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) headerRowIdx = 1;
  }

  const rawHeaders = values[headerRowIdx];
  const headersClean = rawHeaders.map(h => String(h || "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  let nextSerial = Math.max(1, lastRow - headerRowIdx);
  const rowsToInsert = [];

  for (let r = 0; r < records.length; r++) {
    const item = records[r];
    const newRow = [];

    for (let c = 0; c < rawHeaders.length; c++) {
      const h = String(rawHeaders[c] || "").trim();
      const cleanH = headersClean[c];
      let val = resolveFieldValue(item, h, cleanH);

      if (!val && (cleanH.includes("sr") || cleanH === "sno" || cleanH === "id")) {
        val = nextSerial;
      }

      newRow.push(val !== undefined && val !== null ? val : "");
    }

    rowsToInsert.push(newRow);
    nextSerial++;
  }

  if (rowsToInsert.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, rawHeaders.length).setValues(rowsToInsert);
  }

  return {
    success: true,
    message: `${rowsToInsert.length} records inserted into '${sheet.getName()}'.`,
    insertedCount: rowsToInsert.length
  };
}

function getDashboardKPIs(ss) {
  const getCount = (name) => {
    const s = findSheet(ss, name);
    if (!s) return 0;
    const t = EXACT_EXCEL_TEMPLATES[s.getName()];
    const offset = (t && t.hasTitle) ? 2 : 1;
    return Math.max(0, s.getLastRow() - offset);
  };

  return {
    success: true,
    kpis: {
      totalYouth: getCount("Employment_Registration"),
      employedYouth: getCount("Employed"),
      skillTrainedYouth: getCount("Skill_Linked"),
      educationLinked: getCount("Education_Linked"),
      identifiedEntrepreneurs: getCount("PMEGP_PMFME_Loan"),
      rangDeLoans: getCount("Rang_De_Loan"),
      bastarShivir: getCount("Bastar_Munne_Shivir"),
      communityMeetings: getCount("Meetings_VO_CLF_TRIF"),
      iimCandidates: getCount("IIM_Candidate_List")
    },
    timestamp: new Date().toISOString()
  };
}

function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
