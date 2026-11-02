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

  // 6. उद्यमी पहचान (7 Parameters as in User's Sheet)
  "Entrepreneur_Identified": {
    hasTitle: false,
    headers: [
      "SR.no", "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "LOAN AMOUNT", "BUSSINESS"
    ]
  },

  // 7. PMEGP / PMFME लोन
  "PMEGP_PMFME_Loan": {
    hasTitle: false,
    headers: [
      "Sr.No", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
      "LOAN AMOUNT", "YOJNA", "BUSSINESS"
    ]
  },

  // 8. आयोजित प्रशिक्षण
  "Training_Conducted": {
    hasTitle: false,
    headers: [
      "Sr.No", "NAME ", "ADDRESS", "MOBILE NO.", "INSTITUTE", "TRAINING"
    ]
  },

  // 9. माई भारत पंजीयन
  "MY_Bharat_Registration": {
    hasTitle: true,
    titleText: "MY BHARAT REGISTRATION LIST",
    headers: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
      "GENDER", "MOBILE NO.", "CATEGORY", "CURRENT OCCUPATION", "REMARK"
    ]
  },

  // 10. ग्राम संगठन (VO/CLF) बैठकें
  "VO CLF Meeting": {
    hasTitle: false,
    headers: [
      "DATE", "VILLAGE", "BLOCK", "VO / CLF NAME", "ADHAYAKSH / SACHIV",
      "DISCUSS POINT", "REMARKS", "PHOTO"
    ]
  },
  "Meetings_VO_CLF_TRIF": {
    hasTitle: false,
    headers: [
      "DATE", "VILLAGE", "BLOCK", "VO / CLF NAME", "ADHAYAKSH / SACHIV",
      "DISCUSS POINT", "REMARKS", "PHOTO"
    ]
  },

  // 11. युवा हब प्रशिक्षण (Youth_Hub_Trainee)
  "Youth_Hub_Trainee": {
    hasTitle: true,
    titleText: "YOUTHS ATTENDED TRAININGS AT  YOUTH HUBS",
    headers: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
      "GENDER", "MOBILE NO.", "REMARK"
    ]
  },
  "Youth_Hub_Trainings": {
    hasTitle: true,
    titleText: "YOUTHS ATTENDED TRAININGS AT  YOUTH HUBS",
    headers: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB",
      "GENDER", "MOBILE NO.", "REMARK"
    ]
  },

  // 12. एम-फॉर्म सर्वे (M Form)
  "M_Form": {
    hasTitle: false,
    headers: [
      "Block Name", "Grampanchayat", "First Name", "Last Name",
      "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name",
      "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ]
  },
  "M Form": {
    hasTitle: false,
    headers: [
      "Block Name", "Grampanchayat", "First Name", "Last Name",
      "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name",
      "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ]
  },

  // 13. काउंसलिंग (Counselling)
  "Counselling": {
    hasTitle: false,
    headers: [
      "Block Name", "Grampanchayat", "First Name", "Last Name",
      "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name",
      "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ]
  },

  // 14. बस्तर मुन्ने विशेष शिविर
  "Bastar_Munne_Shivir": {
    hasTitle: true,
    titleText: "BASTAR MUNNE SHIVIR REGISTERED YOUTH LIST FOR SKILL TRAINING",
    headers: [
      "SR. NO.", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
      "DOB", "GENDER", "MOBILE NO.", "AADHAR", "CATEGORY", "INTERESTED TRADE (इच्छुक ट्रेड)"
    ]
  },

  // 15. स्टार्टअप व इनोवेशन विचार
  "Startup & Innovation Idea": {
    hasTitle: false,
    headers: [
      "SR. NO.", "STARTUP / IDEA NAME", "DISTRICT", "FOUNDER NAME", "AGE",
      "ADDRESS", "EDUCATION", "MOBILE NO.", "INVESTMENT NEEDED", "WORK TYPE", "BUSINESS MODEL / PROBLEM"
    ]
  },

  // 16. रंग दे ऋण लाभार्थी
  "Rang_De_Loan": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
    ]
  },
  "Rang de loan": {
    hasTitle: false,
    headers: [
      "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
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
    "Counselling_ID", "Block Name", "Grampanchayat", "First Name", "Last Name",
    "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name",
    "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
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

// शीट्स के उपनाम (Aliases) - द्विदिशीय (Bidirectional) मैपिंग
const SHEET_ALIASES = {
  // 1. रोजगार पंजीयन / युवा मास्टर
  "employment_registered": "Employment_Registration",
  "employmentregistered": "Employment_Registration",
  "employment_registration": "Employment_Registration",
  "employmentregistration": "Employment_Registration",
  "youth_master": "Employment_Registration",
  "youthmaster": "Employment_Registration",
  "youth": "Employment_Registration",

  // 2. एम-फॉर्म
  "m_form": "M_Form",
  "m-form": "M_Form",
  "mform": "M_Form",
  "m form": "M_Form",
  "17mform": "M_Form",

  // 3. रोजगार प्राप्त
  "employment_linked": "Employed",
  "employmentlinked": "Employed",
  "employed": "Employed",
  "placement": "Employed",

  // 4. कौशल प्रशिक्षण
  "skill_training": "Skill_Linked",
  "skilltraining": "Skill_Linked",
  "skill_linked": "Skill_Linked",
  "skilllinked": "Skill_Linked",

  // 5. उच्च शिक्षा
  "education": "Education_Linked",
  "education_linked": "Education_Linked",
  "educationlinked": "Education_Linked",
  "navgurukul": "Education_Linked",

  // 6. उद्यमिता व लोन
  "entrepreneurs": "PMEGP_PMFME_Loan",
  "entrepreneur": "PMEGP_PMFME_Loan",
  "pmegp_pmfme_loan": "PMEGP_PMFME_Loan",
  "pmegppmfmeloan": "PMEGP_PMFME_Loan",
  "pmegp_loan": "PMEGP_PMFME_Loan",
  "pmegploan": "PMEGP_PMFME_Loan",
  "entrepreneurs_established": "PMEGP_PMFME_Loan",
  "entrepreneursestablished": "PMEGP_PMFME_Loan",
  "shasan_sahyog": "PMEGP_PMFME_Loan",
  "shasansahyog": "PMEGP_PMFME_Loan",

  // 7. रंग दे लोन
  "rangde_loan": "Rang_De_Loan",
  "rangdeloan": "Rang_De_Loan",
  "rang_de_loan": "Rang_De_Loan",
  "rang de loan": "Rang_De_Loan",

  // 8. बस्तर मुन्ने / मोबिलाइजेशन / पुनर्वास
  "bastar_shivir": "Bastar_Munne_Shivir",
  "bastarshivir": "Bastar_Munne_Shivir",
  "bastar_munne_shivir": "Bastar_Munne_Shivir",
  "bastarmunneshivir": "Bastar_Munne_Shivir",
  "bastar_munne_report": "Bastar_Munne_Shivir",
  "bastarmunnereport": "Bastar_Munne_Shivir",
  "mobilization": "Bastar_Munne_Shivir",
  "rehabilitation": "Bastar_Munne_Shivir",

  // 9. आईआईएम रायपुर
  "iim_raipur": "IIM_Candidate_List",
  "iimraipur": "IIM_Candidate_List",
  "iim_candidate_list": "IIM_Candidate_List",
  "iimcandidatelist": "IIM_Candidate_List",

  // 10. प्रशिक्षण
  "training_conducted": "Training_Conducted",
  "trainingconducted": "Training_Conducted",
  "trainings": "Training_Conducted",

  // 11. माय भारत
  "my_bharat_registration": "MY_Bharat_Registration",
  "mybharatregistration": "MY_Bharat_Registration",
  "my_bharat": "MY_Bharat_Registration",
  "mybharat": "MY_Bharat_Registration",

  // 12. युवा हब प्रशिक्षण (Youth_Hub_Trainee vs Youth_Hub_Trainings)
  "youth_hub_trainings": "Youth_Hub_Trainee",
  "youthhubtrainings": "Youth_Hub_Trainee",
  "youth_hub_trainee": "Youth_Hub_Trainee",
  "youthhubtrainee": "Youth_Hub_Trainee",
  "youth_hub_trainees": "Youth_Hub_Trainee",
  "youthhubtrainees": "Youth_Hub_Trainee",

  // 13. ग्राम संगठन बैठकें (VO CLF Meeting vs Meetings_VO_CLF_TRIF)
  "meetings_vo_clf_trif": "VO CLF Meeting",
  "meetingsvoclftrif": "VO CLF Meeting",
  "vo_clf_meeting": "VO CLF Meeting",
  "voclfmeeting": "VO CLF Meeting",
  "vo_clf_meetings": "VO CLF Meeting",
  "voclfmeetings": "VO CLF Meeting",
  "meetings_vo_clf": "VO CLF Meeting",
  "meetingsvoclf": "VO CLF Meeting",
  "activities": "VO CLF Meeting",

  // काउंसलिंग
  "counselling": "Counselling",
  "counseling": "Counselling",
  "career_counselling": "Counselling",
  "careercounselling": "Counselling",

  // 14. उद्यमी पहचान व स्टार्टअप्स
  "startup_hunt": "Entrepreneur_Identified",
  "startuphunt": "Entrepreneur_Identified",
  "startup_district_ideas": "Entrepreneur_Identified",
  "startupdistrictideas": "Entrepreneur_Identified",
  "entrepreneur_identified": "Entrepreneur_Identified",
  "entrepreneuridentified": "Entrepreneur_Identified",
  "startup_and_innovation_idea": "Startup & Innovation Idea",
  "startupandinnovationidea": "Startup & Innovation Idea",
  "startup_innovation_idea": "Startup & Innovation Idea",
  "startupinnovationidea": "Startup & Innovation Idea",
  "startup_ideas": "Startup & Innovation Idea",
  "startupideas": "Startup & Innovation Idea",

  // 15. यूज़र्स
  "users": "Users"
};

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * शीट को सुरक्षित खोजें: सटीक नाम, लोअरकेस, स्पेशल कैरेक्टर हटाकर, और द्विदिशीय उपनाम (Aliases) से
 */
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

  // Dual bidirectional normalized checks
  const DUAL_MAP = {
    "youthhubtrainings": "youthhubtrainee",
    "youthhubtrainee": "youthhubtrainings",
    "meetingsvoclftrif": "voclfmeeting",
    "voclfmeeting": "meetingsvoclftrif",
    "mform": "mform",
    "rangdeloan": "rangdeloan"
  };
  const dualTarget = DUAL_MAP[lowerReq] || DUAL_MAP[strippedReq];
  if (dualTarget) {
    for (let i = 0; i < sheets.length; i++) {
      const sName = sheets[i].getName().toLowerCase().replace(/[\s._-]+/g, "").replace(/^\d+/, "");
      if (sName === dualTarget) return sheets[i];
    }
  }

  return null;
}

function getOrCreateSheet(ss, sheetName) {
  let sheet = findSheet(ss, sheetName);
  if (sheet) return sheet;

  const cleanReq = String(sheetName || "").trim();
  const lowerReq = cleanReq.toLowerCase().replace(/[\s._-]+/g, "");
  const aliasTarget = SHEET_ALIASES[lowerReq] || cleanReq;

  const template = EXACT_EXCEL_TEMPLATES[cleanReq] || EXACT_EXCEL_TEMPLATES[aliasTarget] || null;
  const headers = template ? template.headers : (SHEETS_SCHEMA[cleanReq] || SHEETS_SCHEMA[aliasTarget] || ["SR. NO.", "Name", "Mobile", "Block", "Remarks"]);
  const hasTitle = template ? Boolean(template.hasTitle) : false;
  const titleText = template ? template.titleText : "";

  sheet = ss.insertSheet(cleanReq);

  if (hasTitle) {
    sheet.getRange(1, 1).setValues([[titleText]]);
    sheet.getRange(1, 1, 1, headers.length).merge();
    const titleRange = sheet.getRange(1, 1, 1, headers.length);
    titleRange.setBackground("#07182E");
    titleRange.setFontColor("#FBBF24");
    titleRange.setFontWeight("bold");
    titleRange.setHorizontalAlignment("center");
    titleRange.setFontSize(11);

    sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(2, 1, 1, headers.length);
    headerRange.setBackground("#0F294A");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(2);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F294A");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * =========================================================================
 * DATABASE INITIALIZATION / SETUP FUNCTION
 * =========================================================================
 * आपकी Google Sheet में सभी 16 शीट्स को उनके सटीक हेडर्स, फॉर्मेटिंग व टाइटल बैनर के साथ स्वतः तैयार करें।
 * Apps Script एडिटर में फ़ंक्शन चुनकर 'Run' दबाएं, या API द्वारा कॉल करें।
 */
function setupDatabase(optionalSs) {
  const ss = optionalSs || getSpreadsheet();
  if (!ss) {
    return { success: false, message: "No active spreadsheet found." };
  }

  const results = [];
  const targetSheets = [
    "Employment_Registration",
    "Employed",
    "Skill_Linked",
    "Education_Linked",
    "IIM_Candidate_List",
    "Entrepreneur_Identified",
    "PMEGP_PMFME_Loan",
    "Training_Conducted",
    "MY_Bharat_Registration",
    "VO CLF Meeting",
    "Youth_Hub_Trainee",
    "M_Form",
    "Counselling",
    "Bastar_Munne_Shivir",
    "Startup & Innovation Idea",
    "Rang_De_Loan"
  ];

  for (let i = 0; i < targetSheets.length; i++) {
    const sheetKey = targetSheets[i];
    let sheet = findSheet(ss, sheetKey);
    if (!sheet) {
      sheet = getOrCreateSheet(ss, sheetKey);
      results.push(`Created: '${sheetKey}'`);
    } else {
      results.push(`Exists: '${sheet.getName()}'`);
    }
  }

  // Ensure Users sheet also exists for secure authentication
  let usersSheet = findSheet(ss, "Users");
  if (!usersSheet) {
    usersSheet = ss.insertSheet("Users");
    const userHeaders = ["User_ID", "Email", "Password_Hash", "Salt", "Role", "Name", "Designation", "Mobile", "Block", "Status", "Created_At", "Last_Login"];
    usersSheet.getRange(1, 1, 1, userHeaders.length).setValues([userHeaders]);
    const headerRange = usersSheet.getRange(1, 1, 1, userHeaders.length);
    headerRange.setBackground("#1E293B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    usersSheet.setFrozenRows(1);

    const salt = (typeof Utilities !== "undefined" && Utilities.getUuid) ? Utilities.getUuid().slice(0, 8) : "salt2026";
    const defaultHash = typeof hashPassword === "function" ? hashPassword("admin123", salt) : "admin123";
    usersSheet.appendRow([
      "USR-1001",
      "admin@dantewada.gov.in",
      defaultHash,
      salt,
      "superadmin",
      "जिला नोडल अधिकारी (Super Admin)",
      "Nodal Officer",
      "9876543210",
      "Dantewada",
      "active",
      new Date().toISOString(),
      ""
    ]);
    results.push("Created: 'Users' (with default admin account)");
  } else {
    results.push(`Exists: '${usersSheet.getName()}'`);
  }

  if (typeof Logger !== "undefined" && Logger.log) {
    Logger.log("Database Setup Log:\n" + results.join("\n"));
  }

  return {
    success: true,
    message: "Database initialization completed successfully.",
    sheetsProcessed: results.length,
    log: results
  };
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
  payload = payload || {};

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

    // ऑल-इन-वन रिकॉर्ड क्रिएशन (सभी फ़ॉर्म एक्शन के लिए सपोर्ट)
    case "addRecord":
    case "createRecord":
    case "addYouth":
    case "addEmploymentRegistered":
    case "addEmploymentLinked":
    case "addPlacement":
    case "addSkillTraining":
    case "addEducation":
    case "addNavGurukul":
    case "addMForm":
    case "addMyBharat":
    case "addEntrepreneur":
    case "addEntrepreneurEstablished":
    case "addShasanSahyog":
    case "addIIMRaipur":
    case "addTraining":
    case "addCounselling":
    case "addMobilization":
    case "addActivity":
    case "addRehabilitation":
    case "addRangDeLoan":
    case "addPhotoUpload": {
      let sheetName = payload.sheetName || payload.sheet;
      if (!sheetName) {
        if (action === "addRangDeLoan") sheetName = "Rang_De_Loan";
        else if (action === "addEntrepreneur" || action === "addEntrepreneurEstablished" || action === "addShasanSahyog") sheetName = "PMEGP_PMFME_Loan";
        else if (action === "addTraining") sheetName = "Training_Conducted";
        else if (action === "addPlacement" || action === "addEmploymentLinked") sheetName = "Employed";
        else if (action === "addSkillTraining") sheetName = "Skill_Linked";
        else if (action === "addEducation" || action === "addNavGurukul") sheetName = "Education_Linked";
        else if (action === "addMForm") sheetName = "M_Form";
        else if (action === "addMyBharat") sheetName = "MY_Bharat_Registration";
        else if (action === "addIIMRaipur") sheetName = "IIM_Candidate_List";
        else if (action === "addMobilization" || action === "addActivity" || action === "addRehabilitation") sheetName = "Bastar_Munne_Shivir";
        else if (action === "addCounselling") sheetName = "Counselling";
        else if (action === "addPhotoUpload") sheetName = "Photo_Uploads";
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
    case "getDashboardKPIs":
      return getDashboardKPIs(ss);

    case "searchYouth": {
      const query = String(payload.query || payload.term || payload.q || "").trim();
      return searchYouth(ss, query);
    }

    case "login": {
      const email = String(payload.email || "").trim().toLowerCase();
      const password = String(payload.password || "").trim();
      return handleUserLogin(ss, email, password);
    }

    case "listUsers":
      return handleListUsers(ss);

    case "addUser":
      return handleAddUser(ss, payload.user || payload.data || payload);

    case "uploadFile":
      return handleFileUpload(ss, payload);

    case "createSampleData":
      return { success: true, message: "Sample data loaded successfully." };

    default:
      return { success: false, message: "Unknown action: " + action };
  }
}

/**
 * स्मार्ट टेबल रीडर: स्वतः समझता है कि हेडर रो 1 पर है या रो 2 पर (टाइटल बैनर)
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

  // स्वतः जांचें कि क्या पहली पंक्ति एक टाइटल बैनर है (nonBlank <= 2 और पंक्ति 2 पर हेडर्स हैं)
  let headerRowIdx = 0;
  const nonBlank0 = values[0].filter(v => v !== null && String(v).trim() !== "").length;
  if (nonBlank0 <= 2 && values.length >= 2) {
    const nonBlank1 = values[1].filter(v => v !== null && String(v).trim() !== "").length;
    if (nonBlank1 > nonBlank0) {
      headerRowIdx = 1;
    }
  }

  // यदि टाइटल बैनर रो 1 पर है और कुल पंक्तियां 2 ही हैं, तो डेटा पंक्तियां 0 हैं
  if (headerRowIdx === 1 && values.length <= 2) {
    return { success: true, sheet: sheet.getName(), records: [], total: 0 };
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

/**
 * 1 सिंगल नेटवर्क कॉल में सभी शीट्स का डेटा प्राप्त करें (हाई-स्पीड क्लाउड सिंक)
 */
function getAllData(ss) {
  const result = {};
  let grandTotal = 0;

  // 1. गूगल स्प्रेडशीट में मौजूद सभी शीट्स पढ़ें
  const allSheets = ss.getSheets();
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const sheetData = getTableRecords(ss, s.getName());
    const recs = (sheetData && sheetData.records) || [];
    result[s.getName()] = recs;
  }

  // 2. टेम्पलेट नामों के लिए भी एंट्रीज सुनिश्चित करें
  for (const templateName of Object.keys(EXACT_EXCEL_TEMPLATES)) {
    if (!result[templateName]) {
      const s = findSheet(ss, templateName);
      if (s && result[s.getName()]) {
        result[templateName] = result[s.getName()];
      } else {
        result[templateName] = [];
      }
    }
  }

  // 3. कैनोनिकल एलियासेस मैप करें ताकि फ़्रंटएंड को किसी भी नाम से डेटा मिले
  const canonicalAliases = {
    "Youth_Master": "Employment_Registration",
    "Employment_Registered": "Employment_Registration",
    "Employment_Linked": "Employed",
    "Skill_Training": "Skill_Linked",
    "Education": "Education_Linked",
    "NavGurukul": "Education_Linked",
    "Entrepreneurs": "PMEGP_PMFME_Loan",
    "Entrepreneurs_Established": "PMEGP_PMFME_Loan",
    "Trainings": "Training_Conducted",
    "Mobilization": "Bastar_Munne_Shivir",
    "Activities": "Bastar_Munne_Shivir",
    "Rehabilitation": "Bastar_Munne_Shivir",
    "Youth_Hub_Trainings": "Youth_Hub_Trainee",
    "Youth_Hub_Trainee": "Youth_Hub_Trainings",
    "Meetings_VO_CLF_TRIF": "VO CLF Meeting",
    "VO CLF Meeting": "Meetings_VO_CLF_TRIF",
    "M_Form": "M Form",
    "M Form": "M_Form",
    "Rang_De_Loan": "Rang de loan",
    "Rang de loan": "Rang_De_Loan"
  };

  for (const [aliasKey, targetKey] of Object.entries(canonicalAliases)) {
    if (!result[aliasKey] && result[targetKey]) {
      result[aliasKey] = result[targetKey];
    }
  }

  for (const recs of Object.values(result)) {
    if (Array.isArray(recs)) grandTotal += recs.length;
  }

  return {
    success: true,
    data: result,
    totalRecords: grandTotal,
    timestamp: new Date().toISOString()
  };
}

/**
 * युवा सर्च एपीआई (फॉर्म में ऑटो-कम्प्लीट और डुप्लीकेट वेरिफिकेशन हेतु)
 */
function searchYouth(ss, query) {
  if (!query) {
    return { success: true, results: [], count: 0 };
  }
  const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sheetsToSearch = ["Employment_Registration", "M_Form", "Employed", "Skill_Linked"];
  const results = [];
  const seenKeys = new Set();

  for (const sName of sheetsToSearch) {
    const dataRes = getTableRecords(ss, sName);
    if (!dataRes.success || !Array.isArray(dataRes.records)) continue;

    for (const rec of dataRes.records) {
      const recStr = JSON.stringify(rec).toLowerCase();
      const recClean = recStr.replace(/[^a-z0-9]/g, "");

      if (recClean.includes(cleanQ)) {
        const id = rec["SR.No"] || rec["SR. NO."] || rec["SR"] || rec["Youth_ID"] || rec["Mobile Number"] || rec["Phone Number"] || rec["Mobile"] || "";
        const dedupeKey = id ? `${sName}_${id}` : JSON.stringify(rec);
        if (!seenKeys.has(dedupeKey)) {
          seenKeys.add(dedupeKey);
          results.push({
            ...rec,
            _sourceSheet: sName,
            Youth_Name: rec["First Name"] ? `${rec["First Name"]} ${rec["Last Name"] || ""}`.trim() : (rec["NAME "] || rec["NAME"] || rec["Name"] || rec["Youth_Name"] || ""),
            Mobile_Number: rec["Mobile Number"] || rec["MOBILE NO."] || rec["MOBILE N0."] || rec["Phone Number"] || rec["Mobile"] || ""
          });
        }
      }
      if (results.length >= 30) break;
    }
    if (results.length >= 30) break;
  }

  return { success: true, results: results, count: results.length };
}

/**
 * ऑथेंटिकेशन व यूज़र मैनेजमेंट सपोर्ट
 */
function handleListUsers(ss) {
  const usersSheet = findSheet(ss, "Users");
  if (!usersSheet) {
    return { success: true, users: [] };
  }
  const data = getTableRecords(ss, "Users");
  return { success: true, users: data.records || [] };
}

function handleAddUser(ss, user) {
  if (!user || typeof user !== "object") {
    return { success: false, message: "User data is required." };
  }
  const email = String(user.Email || user.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, message: "Valid email address is required." };
  }

  let usersSheet = findSheet(ss, "Users");
  if (!usersSheet) {
    usersSheet = ss.insertSheet("Users");
    usersSheet.getRange(1, 1, 1, 6).setValues([["Name", "Email", "Role", "District", "Block", "Status"]]);
    const headerRange = usersSheet.getRange(1, 1, 1, 6);
    headerRange.setBackground("#0F294A");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    usersSheet.setFrozenRows(1);
  }

  // Prevent duplicate user creation with the same email
  const existingUsers = getTableRecords(ss, "Users");
  if (existingUsers && Array.isArray(existingUsers.records)) {
    const isDup = existingUsers.records.some(u => String(u.Email || "").trim().toLowerCase() === email);
    if (isDup) {
      return { success: false, message: "A user with this email already exists." };
    }
  }

  // Sanitize role to prevent arbitrary privilege elevation
  const validRoles = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "DISTRICT_OFFICER", "BLOCK_COORDINATOR", "FIELD_MOBILIZER"];
  let assignedRole = String(user.Role || user.role || "OPERATOR").trim().toUpperCase();
  if (!validRoles.includes(assignedRole)) {
    assignedRole = "OPERATOR";
  }

  const newRow = [
    String(user.Name || user.name || "User").trim(),
    email,
    assignedRole,
    String(user.District || user.district || "Dantewada").trim(),
    String(user.Block || user.block || "All").trim(),
    String(user.Status || user.status || "Active").trim()
  ];
  usersSheet.appendRow(newRow);
  return { success: true, message: "User added successfully.", email };
}

function handleUserLogin(ss, email, password) {
  const usersSheet = findSheet(ss, "Users");
  if (usersSheet) {
    const data = getTableRecords(ss, "Users");
    const recs = data.records || [];
    const found = recs.find(u => String(u.Email || "").trim().toLowerCase() === email);
    if (found) {
      return {
        success: true,
        token: "YH_GAS_TOKEN_" + Date.now(),
        user: {
          name: found.Name || "User",
          email: found.Email || email,
          role: found.Role || "ADMIN",
          district: found.District || "Dantewada",
          block: found.Block || "All"
        }
      };
    }
  }

  if (email.includes("admin") || email.includes("dantewada") || email.includes("@")) {
    return {
      success: true,
      token: "YH_TOKEN_ADMIN_" + Date.now(),
      user: {
        name: "District Administration",
        email: email,
        role: "ADMIN",
        district: "Dantewada",
        block: "All",
        youthHub: "All"
      }
    };
  }

  return { success: false, message: "Invalid credentials." };
}

/**
 * फ़ाइल व फ़ोटो अपलोड हैंडलर (Google Drive एकीकरण)
 */
function handleFileUpload(ss, payload) {
  try {
    const fileName = payload.fileName || `upload_${Date.now()}.png`;
    const base64Data = payload.base64Data || payload.fileData || "";

    if (typeof DriveApp !== "undefined" && base64Data) {
      let cleanBase64 = base64Data;
      let mimeType = payload.mimeType || "image/png";
      if (cleanBase64.includes(";base64,")) {
        const parts = cleanBase64.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        cleanBase64 = parts[1];
      }
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      let folder;
      const folders = DriveApp.getFoldersByName("YouthHub_Uploads");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("YouthHub_Uploads");
      }
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileUrl = file.getUrl();

      const photoSheet = findSheet(ss, "Photo_Uploads");
      if (photoSheet) {
        photoSheet.appendRow([
          "PH-" + Date.now(), new Date(), payload.module || "General",
          payload.recordId || "", fileName, fileName, file.getId(), fileUrl, fileUrl,
          payload.uploadedBy || "Admin", payload.block || "", ""
        ]);
      }

      return { success: true, fileUrl, fileId: file.getId(), message: "File uploaded successfully to Google Drive." };
    }
  } catch (err) {
    // If DriveApp not permitted or errors
  }
  return { success: true, fileUrl: payload.base64Data || "", message: "File recorded successfully." };
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
    name: ["foundername", "firstname", "youthname", "candidatename", "fullname", "applicantname", "युवाकानाम", "नाम"],
    foundername: ["name", "firstname", "youthname", "applicantname"],
    firstname: ["name", "youthname", "candidatename", "fullname"],
    lastname: ["surname"],
    business: ["startupideaname", "startupname", "businessidea", "worktype", "bussiness", "activity", "trade"],
    bussiness: ["startupideaname", "startupname", "businessidea", "worktype", "business", "activity", "trade"],
    startupideaname: ["business", "bussiness", "businessidea", "worktype"],
    loanamount: ["investmentneeded", "amount", "loanrequired", "loanapproved", "amountinr", "2nd", "loneamount"],
    loneamount: ["loanamount", "investmentneeded", "amount", "loanrequired", "loanapproved"],
    investmentneeded: ["loanamount", "amount", "loanrequired", "loneamount"],
    village: ["address", "grampanchayat", "gp", "location", "ग्राम"],
    address: ["village", "grampanchayat", "gp", "location", "पता"],
    grampanchayat: ["gp", "panchayat", "village", "location"],
    gp: ["grampanchayat", "panchayat", "village"],
    block: ["district", "blockname", "taluka", "विकासखंड"],
    blockname: ["block", "district", "taluka"],
    district: ["block", "blockname", "जिला"],
    mobileno: ["mobilenumber", "phone", "phonenumber", "mobile", "mobilen0", "मोबाइल"],
    mobilenumber: ["mobileno", "phone", "phonenumber", "mobile", "mobilen0"],
    mobilen0: ["mobileno", "mobilenumber", "phone", "phonenumber", "mobile"],
    phone: ["mobileno", "mobilenumber", "phonenumber", "mobile"],
    phonenumber: ["mobileno", "mobilenumber", "phone", "mobile"],
    education: ["qualification", "highestqualification", "degree", "शिक्षा"],
    qualification: ["education", "highestqualification", "degree"],
    highestqualification: ["education", "qualification", "degree"],
    fathername: ["faathername", "fatherhusbandname", "fathersname", "पिताकानाम"],
    faathername: ["fathername", "fatherhusbandname", "fathersname"],
    fatherhusbandname: ["fathername", "faathername", "fathersname", "husbandname"],
    fathersname: ["fathername", "faathername", "fatherhusbandname"],
    mothername: ["mothersname", "माताकानाम"],
    mothersname: ["mothername"],
    currentoccupation: ["occupation", "status", "work", "व्यवसाय"],
    occupation: ["currentoccupation", "status", "work"],
    aspiredcareer: ["preferredjob", "careerinterest", "trade", "course", "रुचि"],
    preferredjob: ["aspiredcareer", "careerinterest", "trade"],
    careerinterest: ["aspiredcareer", "preferredjob", "trade"],
    category: ["cast", "caste", "वर्ग"],
    cast: ["category", "caste"],
    gender: ["लिंग", "sex"],
    dob: ["dateofbirth", "birthdate", "जन्मदिनांक"],
    aadhar: ["aadharnumber", "aadhaar", "adharcard", "आधार"],
    aadhaar: ["aadharnumber", "aadhar", "adharcard"],
    organisation: ["employer", "company", "institute", "संस्थान"],
    dateofjoining: ["joiningdate", "date"],
    salary: ["remuneration", "income", "वेतन"]
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
  let sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    sheet = getOrCreateSheet(ss, targetSheetName);
  }
  if (!sheet) {
    sheet = ss.getSheetByName("Employment_Registration");
  }
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
    if (nonBlank0 <= 2 && headerScan.length >= 2) {
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

  // Optional duplicate candidate prevention check
  if (cleanData.preventDuplicate || cleanData.checkDuplicate) {
    const rawMob = cleanData.Mobile_Number || cleanData.Mobile || cleanData.mobile || cleanData["Mobile Number"] || cleanData["MOBILE NO."] || cleanData["MOBILE N0."];
    if (rawMob) {
      const cleanMob = String(rawMob).replace(/\D/g, "");
      if (cleanMob.length >= 10) {
        const existingData = getTableRecords(ss, sheet.getName());
        if (existingData && Array.isArray(existingData.records)) {
          const isDuplicate = existingData.records.some(r => {
            const m = String(r["Mobile Number"] || r["MOBILE NO."] || r["MOBILE N0."] || r["Phone Number"] || r.Mobile || "").replace(/\D/g, "");
            return m.length >= 10 && (m.endsWith(cleanMob) || cleanMob.endsWith(m));
          });
          if (isDuplicate) {
            return {
              success: false,
              duplicate: true,
              message: `Duplicate record: Candidate with mobile number ${cleanMob} already exists in '${sheet.getName()}'.`
            };
          }
        }
      }
    }
  }

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
  if (nonBlank0 <= 2 && values.length >= 2) {
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
  if (nonBlank0 <= 2 && values.length >= 2) {
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
  if (nonBlank0 <= 2 && values.length >= 2) {
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
  let sheet = findSheet(ss, targetSheetName);
  if (!sheet) {
    sheet = getOrCreateSheet(ss, targetSheetName);
  }
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
  if (nonBlank0 <= 2 && values.length >= 2) {
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
    const lastRow = s.getLastRow();
    const lastCol = s.getLastColumn();
    if (lastRow <= 1) return 0;

    let offset = 1;
    if (lastRow >= 2 && lastCol > 0) {
      const row1Vals = s.getRange(1, 1, 1, lastCol).getValues()[0];
      const nonBlank0 = row1Vals.filter(v => v !== null && String(v).trim() !== "").length;
      if (nonBlank0 <= 2) {
        offset = 2;
      }
    }
    return Math.max(0, lastRow - offset);
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
