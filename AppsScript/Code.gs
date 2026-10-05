/**
 * =========================================================================
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Google Apps Script All-In-One Production Backend (Code.gs)
 * =========================================================================
 * Features:
 * 1. setupDatabase() - Automatically creates all 15 sheets with exact headers & formatting
 * 2. doPost(e) - Fast JSON dispatcher for all 14 data modules + Authentication + Dashboard KPIs
 * 3. doGet(e) - Health check and Web App status
 * 4. uploadFile() - Upload candidate/event photos directly to Google Drive
 * =========================================================================
 */

// Global Sheet Schema Definition (Exact matching with Frontend forms)
const SHEETS_SCHEMA = {
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
    "MForm_ID", "Youth_ID", "Youth_Name", "Mobile", "Date", "Block", "GP",
    "Village", "MForm_Status", "MForm_Reg_No", "Follow_Up_Status", "Remarks"
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
    "Emp_Link_ID", "Youth_ID", "Youth_Name", "Employer_Name", "Job_Role",
    "Placement_Date", "Salary", "Employment_Type", "Location", "Status",
    "Follow_Up_Date", "Follow_Up_Status", "Remarks"
  ],
  Education: [
    "Education_ID", "Youth_ID", "Youth_Name", "Current_Qualification",
    "Education_Goal", "Institution_Name", "Course", "Admission_Date",
    "Block", "GP", "Status", "Remarks"
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
  NavGurukul: [
    "Candidate_ID", "Youth_ID", "Candidate_Name", "Mobile", "Block", "GP",
    "Qualification", "Registration_Date", "Selection_Status", "Admission_Status",
    "Joining_Date", "Remarks"
  ],
  Trainings: [
    "Training_ID", "Training_Name", "Training_Type", "Date", "Start_Date", "End_Date",
    "Block", "GP", "Venue", "Training_Provider", "Trainer_Name",
    "Male_Participants", "Female_Participants", "Total_Participants",
    "Training_Topic", "Outcome", "Photo_URL", "Remarks"
  ],
  Activities: [
    "Activity_ID", "Date", "Activity_Type", "Activity_Name", "Block", "GP",
    "Village", "Participants", "Description", "Outcome", "Photo_URL"
  ],
  Rehabilitation: [
    "Rehab_ID", "Youth_ID", "Candidate_Name", "Father_Husband_Name", "Mobile",
    "Block", "GP", "Village", "Surrender_Date", "Rehabilitation_Status",
    "Assistance_Type", "Assistance_Amount", "Scheme_Linked", "Employment_Status",
    "Current_Status", "Follow_Up_Date", "Follow_Up_Status", "Pending_Issue", "Remarks"
  ],
  IIM_Raipur: [
    "IIM_ID", "Candidate_Name", "Father_Husband_Name", "Age", "Category", "Address",
    "Village", "Block", "District", "Mobile_Number", "Aadhaar_Number",
    "Latest_Exam_Percentage", "Stream_Subject", "Vocational_Course", "Certificate_Diploma",
    "Current_Occupation", "Work_Experience", "Raipur_Stay_3Months",
    "Home_Responsibility_Manager", "Family_Recall_Risk", "Family_Consent",
    "Business_Type_Desired", "Existing_Business_Idea", "Local_Problem_To_Solve",
    "Why_This_Course", "Plan_After_Course", "Dropout_History", "Source_Info",
    "Declaration", "Entrepreneurship_Thoughts", "Selection_Status", "Batch",
    "Activity_Name", "Financial_Assistance_Amount", "Installment_2nd", "Remarks"
  ],
  Shasan_Sahyog: [
    "Demand_ID", "Name", "Father_Husband_Name", "DOB", "Address", "Village",
    "Block", "District", "Mobile_Number", "Assistance_Required", "Status", "Remarks"
  ],
  Users: [
    "User_ID", "Name", "Email", "Password_Hash", "Role", "Block", "Youth_Hub", "Status", "Created_At"
  ]
};

// Form ID Prefix Configuration
const ID_PREFIXES = {
  Youth_Master: { prefix: "YH-2026-", idField: "Youth_ID" },
  Mobilization: { prefix: "MOB-2026-", idField: "Activity_ID" },
  M_Form: { prefix: "MF-2026-", idField: "MForm_ID" },
  My_Bharat: { prefix: "MB-2026-", idField: "MyBharat_ID" },
  Counselling: { prefix: "COU-2026-", idField: "Counselling_ID" },
  Skill_Training: { prefix: "SKL-2026-", idField: "Training_Record_ID" },
  Employment_Registered: { prefix: "ER-2026-", idField: "Emp_Reg_ID" },
  Employment_Linked: { prefix: "EL-2026-", idField: "Emp_Link_ID" },
  Education: { prefix: "EDU-2026-", idField: "Education_ID" },
  Entrepreneurs: { prefix: "ENT-2026-", idField: "Entrepreneur_ID" },
  NavGurukul: { prefix: "NG-2026-", idField: "Candidate_ID" },
  Trainings: { prefix: "TRG-2026-", idField: "Training_ID" },
  Activities: { prefix: "ACT-2026-", idField: "Activity_ID" },
  Rehabilitation: { prefix: "REH-2026-", idField: "Rehab_ID" },
  IIM_Raipur: { prefix: "IIM-2026-", idField: "IIM_ID" },
  Shasan_Sahyog: { prefix: "SS-2026-", idField: "Demand_ID" }
};

/**
 * =========================================================================
 * 1. AUTOMATIC DATABASE SETUP FUNCTION
 * Run this function ONCE from the Apps Script editor to create all sheets
 * and headers automatically.
 * =========================================================================
 */
/**
 * Adds custom admin menu directly in Google Sheets top menu bar
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🚀 Youth Hub Admin")
    .addItem("🔄 Update / Setup Database Columns", "menuSetupDatabase")
    .addToUi();
}

function menuSetupDatabase() {
  const result = setupDatabase();
  SpreadsheetApp.getUi().alert("✅ Success!\n\nAll 16 sheets and column headers are up to date with the latest system schema.");
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEETS_SCHEMA).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    const headers = SHEETS_SCHEMA[sheetName];
    // Check if headers already exist
    const existingLastCol = sheet.getLastColumn();
    if (existingLastCol === 0 || sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatting header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0B2545");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      // Append any newly added columns if sheet already exists
      const existingHeaders = sheet.getRange(1, 1, 1, existingLastCol).getValues()[0];
      const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
      if (missingHeaders.length > 0) {
        sheet.getRange(1, existingLastCol + 1, 1, missingHeaders.length).setValues([missingHeaders]);
        const newHeaderRange = sheet.getRange(1, existingLastCol + 1, 1, missingHeaders.length);
        newHeaderRange.setBackground("#0B2545");
        newHeaderRange.setFontColor("#FFFFFF");
        newHeaderRange.setFontWeight("bold");
        newHeaderRange.setHorizontalAlignment("center");
      }
    }
  });

  // Create Default Role-Based Users in Users sheet if empty
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow([
      "USR-001",
      "Employment Officer (जिला रोजगार अधिकारी)",
      "eo.dantewada@gmail.com",
      "Admin@EO2026",
      "ADMIN",
      "All",
      "All",
      "Active",
      new Date().toISOString().split("T")[0]
    ]);
    usersSheet.appendRow([
      "USR-002",
      "Youth Hub Dantewada",
      "youthhub.dantewada@gmail.com",
      "Dantewada@2026",
      "HUB_OPERATOR",
      "Dantewada",
      "Youth Hub Dantewada",
      "Active",
      new Date().toISOString().split("T")[0]
    ]);
    usersSheet.appendRow([
      "USR-003",
      "Youth Hub Geedam",
      "youthhub.geedam@gmail.com",
      "Geedam@2026",
      "HUB_OPERATOR",
      "Geedam",
      "Youth Hub Geedam",
      "Active",
      new Date().toISOString().split("T")[0]
    ]);
  }

  // Remove default "Sheet1" if still exists
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log("✅ Database Setup Complete! All 15 sheets created with proper headers.");
  return { success: true, message: "Database initialized with all 15 sheets and default admin user." };
}

/**
 * =========================================================================
 * 2. WEB APP API ENDPOINTS (doGet & doPost)
 * =========================================================================
 */
function doGet(e) {
  return createJsonResponse({
    success: true,
    status: "online",
    message: "Youth Hub Dantewada Google Apps Script Backend is Live & Ready.",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    let requestData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (err) {
        requestData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      requestData = e.parameter;
    }

    const action = requestData.action || "";
    const payload = requestData.payload || requestData;

    const result = handleAction(action, payload);
    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: "Server Error: " + error.message
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================
 * 3. ACTION DISPATCHER
 * =========================================================================
 */
function handleAction(action, payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ping / Health Check
  if (action === "ping") {
    return { success: true, message: "Backend is operational.", timestamp: new Date().toISOString() };
  }

  // Setup database via API
  if (action === "setupDatabase") {
    return setupDatabase();
  }

  // User Login
  if (action === "login") {
    return handleLogin(ss, payload);
  }

  // Get Table Records
  if (action === "getTableRecords") {
    const sheetName = payload.sheetName;
    return getSheetRecords(ss, sheetName);
  }

  // Search Youth Master
  if (action === "searchYouth") {
    return searchYouthMaster(ss, payload.query || "");
  }

  // Get Youth Full Journey Profile
  if (action === "getYouthProfile") {
    return getYouthProfile(ss, payload.youthId);
  }

  // Delete Record
  if (action === "deleteRecord") {
    return deleteRecord(ss, payload.sheetName, payload.idField, payload.idValue);
  }

  // Update Record
  if (action === "updateRecord") {
    return updateRecord(ss, payload.sheetName, payload.idField, payload.idValue, payload.updatedData);
  }

  // Upload File to Google Drive
  if (action === "uploadFile") {
    return handleFileUpload(payload);
  }

  // List Users (Admin only)
  if (action === "listUsers") {
    return listUsers(ss);
  }

  // Get Dashboard KPIs & Charts
  if (action === "getDashboard") {
    return calculateDashboardKPIs(ss, payload.filters);
  }

  // Dynamic Add Form Handlers
  const actionToSheetMap = {
    addYouth: "Youth_Master",
    addMobilization: "Mobilization",
    addMForm: "M_Form",
    addMyBharat: "My_Bharat",
    addCounselling: "Counselling",
    addSkillTraining: "Skill_Training",
    addEmploymentRegistered: "Employment_Registered",
    addEmploymentLinked: "Employment_Linked",
    addEducation: "Education",
    addEntrepreneur: "Entrepreneurs",
    addNavGurukul: "NavGurukul",
    addTraining: "Trainings",
    addActivity: "Activities",
    addRehabilitation: "Rehabilitation",
    addIIMRaipur: "IIM_Raipur",
    addShasanSahyog: "Shasan_Sahyog"
  };

  if (actionToSheetMap[action]) {
    const sheetName = actionToSheetMap[action];
    return insertRecord(ss, sheetName, payload);
  }

  return { success: false, message: `Unknown action: ${action}` };
}

/**
 * =========================================================================
 * 4. CRUD & HELPER FUNCTIONS
 * =========================================================================
 */

function handleLogin(ss, payload) {
  const email = (payload.email || "").trim().toLowerCase();
  const password = (payload.password || "").trim();

  // 1. Built-in system default accounts for immediate role-based access
  const DEFAULT_ACCOUNTS = [
    {
      userId: "USR-001",
      name: "Employment Officer (जिला रोजगार अधिकारी)",
      email: "eo.dantewada@gmail.com",
      password: "Admin@EO2026",
      role: "ADMIN",
      block: "All",
      youthHub: "All"
    },
    {
      userId: "USR-002",
      name: "Youth Hub Dantewada",
      email: "youthhub.dantewada@gmail.com",
      password: "Dantewada@2026",
      role: "HUB_OPERATOR",
      block: "Dantewada",
      youthHub: "Youth Hub Dantewada"
    },
    {
      userId: "USR-003",
      name: "Youth Hub Geedam",
      email: "youthhub.geedam@gmail.com",
      password: "Geedam@2026",
      role: "HUB_OPERATOR",
      block: "Geedam",
      youthHub: "Youth Hub Geedam"
    }
  ];

  const matchedDefault = DEFAULT_ACCOUNTS.find(a => a.email.toLowerCase() === email && a.password === password);
  if (matchedDefault) {
    const user = {
      userId: matchedDefault.userId,
      name: matchedDefault.name,
      email: matchedDefault.email,
      role: matchedDefault.role,
      block: matchedDefault.block,
      youthHub: matchedDefault.youthHub
    };
    const token = Utilities.base64Encode(JSON.stringify(user));
    return { success: true, token, user };
  }

  // 2. Dynamic check in Users Google Sheet
  const sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users sheet not found. Run setupDatabase first." };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf("Email");
  const passIdx = headers.indexOf("Password_Hash");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[emailIdx]).trim().toLowerCase() === email && String(row[passIdx]).trim() === password) {
      const user = {
        userId: row[headers.indexOf("User_ID")],
        name: row[headers.indexOf("Name")],
        email: row[emailIdx],
        role: row[headers.indexOf("Role")],
        block: row[headers.indexOf("Block")],
        youthHub: row[headers.indexOf("Youth_Hub")]
      };
      const token = Utilities.base64Encode(JSON.stringify(user));
      return { success: true, token, user };
    }
  }

  return { success: false, message: "Invalid email or password." };
}

function getSheetRecords(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: `Sheet '${sheetName}' does not exist.` };

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) {
    return { success: true, sheetName, records: [] };
  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const records = [];

  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    const item = {};
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT+5:30", "yyyy-MM-dd");
      }
      item[headers[c]] = val;
    }
    records.push(item);
  }

  return { success: true, sheetName, records };
}

function insertRecord(ss, sheetName, payload) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(sheetName);
  }

  const headers = SHEETS_SCHEMA[sheetName];
  const config = ID_PREFIXES[sheetName];

  // Handle field aliases and backward compatibility
  if (sheetName === "Youth_Master") {
    if (!payload.Father_Husband_Name && payload.Father_Mother_Name) {
      payload.Father_Husband_Name = payload.Father_Mother_Name;
    }
    if (!payload.DOB && payload.DOB_Age) {
      const dobVal = String(payload.DOB_Age).trim();
      if (dobVal.includes("-") || dobVal.includes("/")) {
        payload.DOB = dobVal;
      } else {
        payload.Age = dobVal;
      }
    }
  }

  // Generate ID if missing
  if (config && (!payload[config.idField] || String(payload[config.idField]).trim() === "")) {
    const nextNum = Math.max(1, sheet.getLastRow());
    payload[config.idField] = config.prefix + ("0000" + nextNum).slice(-4);
  }

  const rowData = headers.map(header => {
    let val = payload[header];
    if (val === undefined || val === null) return "";
    return val;
  });

  sheet.appendRow(rowData);
  return {
    success: true,
    message: `${sheetName.replace(/_/g, " ")} record saved successfully.`,
    id: config ? payload[config.idField] : null
  };
}

function listUsers(ss) {
  const sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users sheet not found." };
  const recordsRes = getSheetRecords(ss, "Users");
  const users = (recordsRes.records || []).map(u => {
    const userCopy = Object.assign({}, u);
    delete userCopy.Password_Hash;
    return userCopy;
  });
  return { success: true, users };
}

function updateRecord(ss, sheetName, idField, idValue, updatedData) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: `Sheet ${sheetName} not found.` };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIdx = headers.indexOf(idField);
  if (idColIdx === -1) return { success: false, message: `Field ${idField} not found.` };

  let targetRow = -1;
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idColIdx]).trim() === String(idValue).trim()) {
      targetRow = r + 1; // 1-indexed
      break;
    }
  }

  if (targetRow === -1) return { success: false, message: `Record ${idValue} not found.` };

  // Update cells
  Object.keys(updatedData).forEach(key => {
    const colIdx = headers.indexOf(key);
    if (colIdx !== -1) {
      sheet.getRange(targetRow, colIdx + 1).setValue(updatedData[key]);
    }
  });

  return { success: true, message: `Record updated successfully.` };
}

function deleteRecord(ss, sheetName, idField, idValue) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: `Sheet ${sheetName} not found.` };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIdx = headers.indexOf(idField);
  if (idColIdx === -1) return { success: false, message: `Field ${idField} not found.` };

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idColIdx]).trim() === String(idValue).trim()) {
      sheet.deleteRow(r + 1);
      return { success: true, message: `Record deleted successfully.` };
    }
  }

  return { success: false, message: `Record not found.` };
}

function searchYouthMaster(ss, query) {
  const res = getSheetRecords(ss, "Youth_Master");
  if (!res.success) return { success: false, results: [] };

  const q = String(query).toLowerCase().trim();
  const results = res.records.filter(y => {
    return (
      String(y.Youth_Name || "").toLowerCase().includes(q) ||
      String(y.Youth_ID || "").toLowerCase().includes(q) ||
      String(y.Mobile_Number || "").includes(q) ||
      String(y.Aadhaar_Number || "").includes(q) ||
      String(y.Block || "").toLowerCase().includes(q)
    );
  });

  return { success: true, results: results.slice(0, 50) };
}

function getYouthProfile(ss, youthId) {
  const youthRes = getSheetRecords(ss, "Youth_Master");
  const youth = (youthRes.records || []).find(y => String(y.Youth_ID) === String(youthId));
  if (!youth) return { success: false, message: "Youth not found." };

  const filterByYouth = (sheet) => (getSheetRecords(ss, sheet).records || []).filter(x => String(x.Youth_ID) === String(youthId));

  return {
    success: true,
    profile: {
      personal: youth,
      mforms: filterByYouth("M_Form"),
      mybharat: filterByYouth("My_Bharat"),
      counselling: filterByYouth("Counselling"),
      skillTraining: filterByYouth("Skill_Training"),
      employmentRegistered: filterByYouth("Employment_Registered"),
      employmentLinked: filterByYouth("Employment_Linked"),
      education: filterByYouth("Education"),
      entrepreneurship: filterByYouth("Entrepreneurs"),
      navgurukul: filterByYouth("NavGurukul"),
      rehabilitation: filterByYouth("Rehabilitation")
    }
  };
}

function handleFileUpload(payload) {
  try {
    const { base64Data, fileName, mimeType, subFolder } = payload;
    if (!base64Data) return { success: false, message: "No image data received." };

    const cleanBase64 = base64Data.replace(/^data:([A-Za-z-+\/]+);base64,/, "");
    const decodedBlob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType || "image/jpeg", fileName || "upload.jpg");

    // Get or create parent Drive folder
    const folderName = "YouthHub_Dantewada_Uploads";
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    const file = folder.createFile(decodedBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getDownloadUrl() || file.getUrl();
    return { success: true, fileUrl, fileId: file.getId(), message: "File uploaded to Google Drive." };
  } catch (err) {
    return { success: false, message: "Upload failed: " + err.message };
  }
}

function calculateDashboardKPIs(ss, filters) {
  filters = filters || {};
  let youth = (getSheetRecords(ss, "Youth_Master").records || []);
  let mob = (getSheetRecords(ss, "Mobilization").records || []);
  let mform = (getSheetRecords(ss, "M_Form").records || []);
  let mybharat = (getSheetRecords(ss, "My_Bharat").records || []);
  let cou = (getSheetRecords(ss, "Counselling").records || []);
  let skill = (getSheetRecords(ss, "Skill_Training").records || []);
  let empLinked = (getSheetRecords(ss, "Employment_Linked").records || []);
  let empReg = (getSheetRecords(ss, "Employment_Registered").records || []);
  let edu = (getSheetRecords(ss, "Education").records || []);
  let ent = (getSheetRecords(ss, "Entrepreneurs").records || []);
  let nav = (getSheetRecords(ss, "NavGurukul").records || []);
  let trg = (getSheetRecords(ss, "Trainings").records || []);
  let rehab = (getSheetRecords(ss, "Rehabilitation").records || []);

  // Filter by Block if selected
  if (filters.block && filters.block !== "All") {
    const b = String(filters.block).toLowerCase();
    const filterByBlock = list => list.filter(item => String(item.Block || "").toLowerCase() === b);
    youth = filterByBlock(youth);
    mob = filterByBlock(mob);
    mform = filterByBlock(mform);
    mybharat = filterByBlock(mybharat);
    cou = filterByBlock(cou);
    skill = filterByBlock(skill);
    empLinked = filterByBlock(empLinked);
    empReg = filterByBlock(empReg);
    edu = filterByBlock(edu);
    ent = filterByBlock(ent);
    nav = filterByBlock(nav);
    trg = filterByBlock(trg);
    rehab = filterByBlock(rehab);
  }

  // Filter by Gram Panchayat if selected
  if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
    const gp = String(filters.gramPanchayat).toLowerCase();
    const filterByGP = list => list.filter(item => String(item.Gram_Panchayat || item.GP || "").toLowerCase() === gp);
    youth = filterByGP(youth);
    mob = filterByGP(mob);
    mform = filterByGP(mform);
    mybharat = filterByGP(mybharat);
    ent = filterByGP(ent);
    nav = filterByGP(nav);
    trg = filterByGP(trg);
    rehab = filterByGP(rehab);
  }

  const totMob = mob.reduce((acc, m) => acc + (Number(m.Total_Mobilized) || 0), 0) || youth.length;
  const blocks = ["Dantewada", "Geedam", "Katekalyan", "Kuakonda"];

  // Dynamic Monthly Mobilization from actual dates
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const mobByMonth = {};
  months.forEach(m => { mobByMonth[m] = 0; });
  mob.forEach(m => {
    if (m.Date) {
      const d = new Date(m.Date);
      if (!isNaN(d.getTime())) {
        const mon = d.toLocaleString("en-US", { month: "short" });
        if (mobByMonth[mon] !== undefined) {
          mobByMonth[mon] += (Number(m.Total_Mobilized) || 1);
        }
      }
    }
  });
  if (Object.values(mobByMonth).every(v => v === 0)) {
    youth.forEach(y => {
      if (y.Registration_Date) {
        const d = new Date(y.Registration_Date);
        if (!isNaN(d.getTime())) {
          const mon = d.toLocaleString("en-US", { month: "short" });
          if (mobByMonth[mon] !== undefined) mobByMonth[mon]++;
        }
      }
    });
  }
  const activeMonths = months.filter(m => mobByMonth[m] > 0);
  const displayMonths = activeMonths.length ? activeMonths : ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Dynamic Skill Training Providers from actual rows
  const providerCounts = {};
  skill.forEach(s => {
    const p = s.Training_Provider || s.Provider || "Other";
    providerCounts[p] = (providerCounts[p] || 0) + 1;
  });
  const spLabels = Object.keys(providerCounts);

  // Dynamic Education Goals / Streams from actual rows
  const eduCounts = {};
  edu.forEach(e => {
    const c = e.Course || e.Institution_Name || "Higher Education";
    eduCounts[c] = (eduCounts[c] || 0) + 1;
  });
  const eduLabels = Object.keys(eduCounts);

  // Dynamic Entrepreneurs Pipeline from actual stages
  const entStages = ["Identified", "Business Plan", "Loan Applied", "Loan Sanctioned", "Established"];
  const entCounts = entStages.map(st => {
    return ent.filter(e => {
      const combined = (String(e.Stage || "") + " " + String(e.Business_Status || "") + " " + String(e.Loan_Status || "")).toLowerCase();
      return combined.includes(st.toLowerCase());
    }).length;
  });

  // Dynamic NavGurukul Pipeline from actual status
  const navStages = ["Registered", "Shortlisted", "Selected", "Admitted"];
  const navCounts = navStages.map(st => {
    return nav.filter(n => {
      const combined = (String(n.Selection_Status || "") + " " + String(n.Admission_Status || "")).toLowerCase();
      return combined.includes(st.toLowerCase());
    }).length;
  });

  // Dynamic Trainings Conducted Trend
  const trgByMonth = {};
  trg.forEach(t => {
    const d = new Date(t.Date || t.Start_Date);
    const mon = isNaN(d.getTime()) ? "Current" : d.toLocaleString("en-US", { month: "short" });
    if (!trgByMonth[mon]) trgByMonth[mon] = { events: 0, participants: 0 };
    trgByMonth[mon].events++;
    trgByMonth[mon].participants += (Number(t.Total_Participants) || 0);
  });
  const trgLabels = Object.keys(trgByMonth);

  // Dynamic Top Gram Panchayats by Mobilization & Registration
  const gpCounts = {};
  mob.forEach(m => {
    const gp = m.Gram_Panchayat || m.GP;
    if (gp) gpCounts[gp] = (gpCounts[gp] || 0) + (Number(m.Total_Mobilized) || 1);
  });
  youth.forEach(y => {
    const gp = y.Gram_Panchayat || y.GP;
    if (gp) gpCounts[gp] = (gpCounts[gp] || 0) + 1;
  });
  const sortedGps = Object.keys(gpCounts).sort((a, b) => gpCounts[b] - gpCounts[a]).slice(0, 6);

  return {
    success: true,
    kpis: {
      totalMobilized: totMob,
      totalRegistered: youth.length,
      youthMasterTotal: youth.length,
      totalMForm: mform.length,
      mForm: mform.length,
      totalMyBharat: mybharat.length,
      myBharat: mybharat.length,
      totalCounselled: cou.length,
      careerCounselling: cou.length,
      totalSkillTrained: skill.length,
      skillTraining: skill.length,
      totalEmployed: empLinked.length,
      employmentLinked: empLinked.length,
      educationLinked: edu.length,
      totalEducation: edu.length,
      totalEntrepreneurs: ent.length,
      entrepreneursIdentified: ent.length,
      entrepreneursEstablished: ent.filter(e => String(e.Stage || "").toLowerCase() === "established").length,
      employmentRegistered: empReg.length,
      navgurukul: nav.length,
      trainingConducted: trg.length,
      totalRehabilitated: rehab.length,
      rehabilitation: rehab.length
    },
    charts: {
      monthlyMobilization: {
        labels: displayMonths,
        values: displayMonths.map(m => mobByMonth[m] || 0)
      },
      blockPerformance: {
        labels: blocks,
        mobilized: blocks.map(b => mob.filter(m => String(m.Block || "").toLowerCase() === b.toLowerCase()).reduce((acc, x) => acc + (Number(x.Total_Mobilized) || 0), 0)),
        youthRegistered: blocks.map(b => youth.filter(y => String(y.Block || "").toLowerCase() === b.toLowerCase()).length),
        mform: blocks.map(b => mform.filter(m => String(m.Block || "").toLowerCase() === b.toLowerCase()).length),
        placed: blocks.map(b => empLinked.filter(e => String(e.Block || "").toLowerCase() === b.toLowerCase()).length)
      },
      youthFunnel: {
        labels: ["Mobilized", "Youth Master", "M-Form", "My Bharat", "Counselling", "Skill Training", "Emp Linked", "Entrepreneurs Est."],
        data: [totMob, youth.length, mform.length, mybharat.length, cou.length, skill.length, empLinked.length, ent.filter(e => String(e.Stage || "").toLowerCase() === "established").length]
      },
      skillProviders: {
        labels: spLabels.length ? spLabels : ["No Training Records"],
        values: spLabels.length ? spLabels.map(k => providerCounts[k]) : [0]
      },
      employmentComparison: {
        labels: blocks,
        registered: blocks.map(b => empReg.filter(r => String(r.Block || "").toLowerCase() === b.toLowerCase()).length),
        linked: blocks.map(b => empLinked.filter(l => String(l.Block || "").toLowerCase() === b.toLowerCase()).length)
      },
      educationGoals: {
        labels: eduLabels.length ? eduLabels : ["No Education Records"],
        values: eduLabels.length ? eduLabels.map(k => eduCounts[k]) : [0]
      },
      entrepreneursPipeline: {
        labels: entStages,
        counts: entCounts
      },
      navgurukulPipeline: {
        labels: navStages,
        counts: navCounts
      },
      trainingConductedTrend: {
        labels: trgLabels.length ? trgLabels : ["No Training Records"],
        events: trgLabels.length ? trgLabels.map(k => trgByMonth[k].events) : [0],
        participants: trgLabels.length ? trgLabels.map(k => trgByMonth[k].participants) : [0]
      },
      topGps: {
        labels: sortedGps.length ? sortedGps : ["No GP Records"],
        values: sortedGps.length ? sortedGps.map(k => gpCounts[k]) : [0]
      }
    }
  };
}
