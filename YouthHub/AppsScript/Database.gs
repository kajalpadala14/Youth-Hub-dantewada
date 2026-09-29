/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Database.gs - Database Schema, Setup, Sample Data & Table CRUD Operations
 */

const SHEET_NAMES = {
  YOUTH_MASTER: "Youth_Master",
  MOBILIZATION: "Mobilization",
  M_FORM: "M_Form",
  MY_BHARAT: "My_Bharat",
  COUNSELLING: "Counselling",
  SKILL_TRAINING: "Skill_Training",
  EMP_REGISTERED: "Employment_Registered",
  EMP_LINKED: "Employment_Linked",
  EDUCATION: "Education",
  ENTREPRENEURS: "Entrepreneurs",
  NAVGURUKUL: "NavGurukul",
  TRAININGS: "Trainings",
  ACTIVITIES: "Activities",
  USERS: "Users",
  SETTINGS: "Settings",
  AUDIT_LOG: "Audit_Log"
};

const SCHEMAS = {
  Youth_Master: [
    "Youth_ID", "Youth_Name", "Father_Mother_Name", "Mobile_Number", "Gender", 
    "DOB_Age", "Category", "Qualification", "Occupation", "Block", 
    "Gram_Panchayat", "Village", "Address", "Career_Interest", "Registration_Date", 
    "Remarks", "Created_By", "Created_At"
  ],
  Mobilization: [
    "Activity_ID", "Date", "Financial_Year", "Month", "Block", 
    "Gram_Panchayat", "Village", "Activity_Name", "Male", "Female", 
    "Other", "Total_Mobilized", "Remarks", "Photo_URL", "Drive_File_ID", 
    "Created_By", "Created_At"
  ],
  M_Form: [
    "MForm_ID", "Youth_ID", "Youth_Name", "Mobile", "Date", 
    "Block", "GP", "Village", "MForm_Status", "MForm_Reg_No", 
    "Remarks", "Created_By", "Created_At"
  ],
  My_Bharat: [
    "MyBharat_ID", "Youth_ID", "Youth_Name", "Mobile", "Registration_Date", 
    "Block", "GP", "Village", "MyBharat_Reg_No", "Status", 
    "Remarks", "Created_By", "Created_At"
  ],
  Counselling: [
    "Counselling_ID", "Youth_ID", "Youth_Name", "Date", "Block", 
    "GP", "Village", "Counselling_Type", "Career_Interest", "Counsellor_Name", 
    "Counselling_Outcome", "Recommended_Action", "Follow_Up_Required", "Remarks", "Created_By", "Created_At"
  ],
  Skill_Training: [
    "Training_Record_ID", "Youth_ID", "Youth_Name", "Training_Name", "Training_Provider", 
    "Course", "Start_Date", "End_Date", "Block", "GP", 
    "Training_Status", "Completion_Status", "Certificate_Status", "Employment_After_Training", "Remarks", "Created_By", "Created_At"
  ],
  Employment_Registered: [
    "Emp_Reg_ID", "Youth_ID", "Youth_Name", "Registration_Date", "Block", 
    "GP", "Qualification", "Preferred_Job", "Registration_Status", "Remarks", 
    "Created_By", "Created_At"
  ],
  Employment_Linked: [
    "Emp_Link_ID", "Youth_ID", "Youth_Name", "Employer_Name", "Job_Role", 
    "Placement_Date", "Salary", "Employment_Type", "Location", "Status", 
    "Remarks", "Created_By", "Created_At"
  ],
  Education: [
    "Education_ID", "Youth_ID", "Youth_Name", "Current_Qualification", "Education_Goal", 
    "Institution_Name", "Course", "Admission_Date", "Block", "GP", 
    "Status", "Remarks", "Created_By", "Created_At"
  ],
  Entrepreneurs: [
    "Entrepreneur_ID", "Youth_ID", "Name", "Mobile", "Block", 
    "GP", "Business_Idea", "Business_Category", "Identification_Date", "Business_Plan_Status", 
    "DPR_Status", "Counselling_Status", "Business_Name", "Business_Type", "Establishment_Date", 
    "Loan_Required", "Loan_Applied", "Loan_Approved", "Loan_Amount", "Bank_Name", 
    "Loan_Scheme", "Stage", "Status", "Remarks", "Created_By", "Created_At"
  ],
  NavGurukul: [
    "Candidate_ID", "Youth_ID", "Candidate_Name", "Mobile", "Block", 
    "GP", "Qualification", "Registration_Date", "Selection_Status", "Admission_Status", 
    "Joining_Date", "Remarks", "Created_By", "Created_At"
  ],
  Trainings: [
    "Training_ID", "Training_Name", "Training_Type", "Date", "Start_Date", 
    "End_Date", "Block", "GP", "Village", "Venue", 
    "Training_Provider", "Trainer_Name", "Male_Participants", "Female_Participants", "Total_Participants", 
    "Training_Topic", "Outcome", "Photos_URL", "Documents_URL", "Remarks", "Created_By", "Created_At"
  ],
  Activities: [
    "Activity_ID", "Date", "Activity_Type", "Activity_Name", "Block", 
    "GP", "Village", "Participants", "Description", "Outcome", 
    "Photo_URL", "Document_URL", "Remarks", "Created_By", "Created_At"
  ],
  Users: [
    "User_ID", "Name", "Email", "Password_Hash", "Role", 
    "Block", "Youth_Hub", "Status", "Created_At"
  ],
  Settings: [
    "Key", "Value", "Description", "Updated_At"
  ],
  Audit_Log: [
    "Log_ID", "Timestamp", "User_Email", "Role", "Action", 
    "Module", "Record_ID", "Details"
  ]
};

/**
 * Returns active spreadsheet instance
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Automatically creates all 16 sheets and formats headers
 */
function setupDatabase() {
  var ss = getSpreadsheet();
  var sheetNames = Object.keys(SCHEMAS);
  
  sheetNames.forEach(function(sName) {
    var sheet = ss.getSheetByName(sName);
    if (!sheet) {
      sheet = ss.insertSheet(sName);
    }
    
    // Set headers
    var headers = SCHEMAS[sName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F172A"); // Slate dark
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    
    // Freeze header row
    sheet.setFrozenRows(1);
  });
  
  // Default Settings
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    var defaults = [
      ["DISTRICT_NAME", "Dantewada", "Administrative District", new Date()],
      ["STATE_NAME", "Chhattisgarh", "State", new Date()],
      ["CURRENT_FY", getFinancialYear(new Date()), "Active Financial Year", new Date()],
      ["PORTAL_VERSION", "2.0.0", "Youth Hub Portal Build Version", new Date()]
    ];
    settingsSheet.getRange(2, 1, defaults.length, 4).setValues(defaults);
  }
  
  // Create default admin user if not exists
  createAdminUser();
  
  return { success: true, message: "All 16 Google Sheets and headers configured successfully!" };
}

/**
 * Generic row getter returning array of row objects
 */
function getSheetRows(sheetName) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    var hasData = row.some(function(cell) { return cell !== "" && cell !== null; });
    if (!hasData) continue;
    
    var obj = { _rowNumber: i + 1 };
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        val = formatDate(val);
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Appends record object to target sheet
 */
function appendRecord(sheetName, recordObj) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  var headers = SCHEMAS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = [];
  
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    var val = recordObj[h];
    if (val === undefined || val === null) val = "";
    rowData.push(val);
  }
  
  sheet.appendRow(rowData);
  return { success: true, row: sheet.getLastRow() };
}

/**
 * Updates a record in a sheet based on primary key column
 */
function updateRecord(sheetName, idColumnName, idValue, updateObj) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idColIdx = headers.indexOf(idColumnName);
  if (idColIdx === -1) throw new Error("Column not found: " + idColumnName);
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(idValue)) {
      var rowNum = i + 1;
      for (var col = 0; col < headers.length; col++) {
        var colName = headers[col];
        if (updateObj[colName] !== undefined) {
          sheet.getRange(rowNum, col + 1).setValue(updateObj[colName]);
        }
      }
      return { success: true, rowNumber: rowNum };
    }
  }
  throw new Error("Record not found with " + idColumnName + " = " + idValue);
}

/**
 * Deletes a record from a sheet by primary key column
 */
function deleteRecord(sheetName, idColumnName, idValue) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idColIdx = headers.indexOf(idColumnName);
  if (idColIdx === -1) throw new Error("Column not found: " + idColumnName);
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(idValue)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Record deleted successfully." };
    }
  }
  throw new Error("Record not found for deletion: " + idValue);
}

/**
 * Returns raw records for any sheet with optional block/date filtering and RBAC restriction
 */
function getTableRecordsData(sheetName, filters, userToken) {
  var user = verifySessionToken(userToken);
  filters = filters || {};

  if (!SHEET_NAMES[sheetName] && !SCHEMAS[sheetName]) {
    sheetName = SHEET_NAMES[sheetName] || sheetName;
  }

  var rows = getSheetRows(sheetName);
  var blockFilter = filters.block;
  if (user && user.role === ROLES.BLOCK_USER && user.block && user.block !== "All") {
    blockFilter = user.block;
  }

  if (blockFilter && blockFilter !== "All") {
    rows = rows.filter(function(r) {
      var b = r.Block || r.block || "";
      return String(b).toLowerCase() === String(blockFilter).toLowerCase();
    });
  }

  // Return records in reverse chronological order
  var reversed = rows.slice(-200).reverse();
  return {
    success: true,
    sheetName: sheetName,
    headers: SCHEMAS[sheetName] || [],
    records: reversed
  };
}

/**
 * Global Search for Youth by Query (ID, Name, Mobile, GP, Block)
 */
function searchYouthDatabase(query) {
  if (!query) return [];
  query = String(query).toLowerCase().trim();
  
  var youthRows = getSheetRows(SHEET_NAMES.YOUTH_MASTER);
  var matches = youthRows.filter(function(y) {
    return (
      String(y.Youth_ID || "").toLowerCase().indexOf(query) !== -1 ||
      String(y.Youth_Name || "").toLowerCase().indexOf(query) !== -1 ||
      String(y.Mobile_Number || "").indexOf(query) !== -1 ||
      String(y.Block || "").toLowerCase().indexOf(query) !== -1 ||
      String(y.Gram_Panchayat || "").toLowerCase().indexOf(query) !== -1 ||
      String(y.Village || "").toLowerCase().indexOf(query) !== -1
    );
  });
  
  // Attach quick service summary to results
  var mforms = getSheetRows(SHEET_NAMES.M_FORM);
  var mybharat = getSheetRows(SHEET_NAMES.MY_BHARAT);
  var counselling = getSheetRows(SHEET_NAMES.COUNSELLING);
  var skill = getSheetRows(SHEET_NAMES.SKILL_TRAINING);
  var empLinked = getSheetRows(SHEET_NAMES.EMP_LINKED);
  var entrepreneurs = getSheetRows(SHEET_NAMES.ENTREPRENEURS);
  
  return matches.slice(0, 50).map(function(y) {
    var services = [];
    if (mforms.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("M-Form");
    if (mybharat.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("My Bharat");
    if (counselling.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("Counselling");
    if (skill.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("Skill Training");
    if (empLinked.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("Employment");
    if (entrepreneurs.some(function(r) { return r.Youth_ID === y.Youth_ID; })) services.push("Entrepreneurship");
    
    return {
      Youth_ID: y.Youth_ID,
      Youth_Name: y.Youth_Name,
      Father_Mother_Name: y.Father_Mother_Name,
      Mobile_Number: y.Mobile_Number,
      Gender: y.Gender,
      Category: y.Category,
      Block: y.Block,
      Gram_Panchayat: y.Gram_Panchayat,
      Village: y.Village,
      Qualification: y.Qualification,
      Career_Interest: y.Career_Interest,
      Services_Received: services.join(", ") || "Registered only"
    };
  });
}

/**
 * Creates sample data for verification and demo testing
 */
function createSampleData() {
  setupDatabase();
  var ss = getSpreadsheet();
  
  // 1. Sample Youth (10 Youth from Dantewada, Geedam, Katekalyan, Kuakonda)
  var sampleYouth = [
    {
      Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Father_Mother_Name: "Laxman Mandavi",
      Mobile_Number: "9406123401", Gender: "Male", DOB_Age: "22", Category: "ST", Qualification: "12th Pass",
      Occupation: "Unemployed", Block: "Dantewada", Gram_Panchayat: "Chitalanka", Village: "Chitalanka",
      Address: "Ward 4, Near School, Chitalanka", Career_Interest: "Automobile Technician",
      Registration_Date: "2026-04-05", Remarks: "Interested in technical training", Created_By: "admin@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Father_Mother_Name: "Manglu Karma",
      Mobile_Number: "9406123402", Gender: "Female", DOB_Age: "20", Category: "ST", Qualification: "Graduate (BA)",
      Occupation: "Student", Block: "Dantewada", Gram_Panchayat: "Bhansi", Village: "Bhansi",
      Address: "Main Basti Bhansi", Career_Interest: "Computer Programming",
      Registration_Date: "2026-04-10", Remarks: "Recommended for NavGurukul", Created_By: "admin@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Father_Mother_Name: "Sukhram Kashyap",
      Mobile_Number: "9406123403", Gender: "Male", DOB_Age: "24", Category: "OBC", Qualification: "ITI (Electrician)",
      Occupation: "Self-Employed", Block: "Geedam", Gram_Panchayat: "Barsoor", Village: "Barsoor",
      Address: "Near Battisa Temple, Barsoor", Career_Interest: "Electrical Shop / Repair Center",
      Registration_Date: "2026-04-12", Remarks: "Wants to start enterprise", Created_By: "admin@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Father_Mother_Name: "Kamlesh Markam",
      Mobile_Number: "9406123404", Gender: "Female", DOB_Age: "21", Category: "ST", Qualification: "12th Pass",
      Occupation: "Unemployed", Block: "Geedam", Gram_Panchayat: "Haram", Village: "Haram",
      Address: "Puri Para, Haram", Career_Interest: "Retail Sales",
      Registration_Date: "2026-04-18", Remarks: "Seeking immediate placement", Created_By: "operator@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00005", Youth_Name: "Manoj Telam", Father_Mother_Name: "Podia Telam",
      Mobile_Number: "9406123405", Gender: "Male", DOB_Age: "23", Category: "ST", Qualification: "10th Pass",
      Occupation: "Laborer", Block: "Katekalyan", Gram_Panchayat: "Marjum", Village: "Marjum",
      Address: "School Para, Marjum", Career_Interest: "Driving & Heavy Vehicle",
      Registration_Date: "2026-05-02", Remarks: "Mobilized during Block camp", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00006", Youth_Name: "Padmini Kunjam", Father_Mother_Name: "Dhiraj Kunjam",
      Mobile_Number: "9406123406", Gender: "Female", DOB_Age: "19", Category: "ST", Qualification: "12th Pass",
      Occupation: "Unemployed", Block: "Katekalyan", Gram_Panchayat: "Tumakpal", Village: "Tumakpal",
      Address: "Gauthan Para, Tumakpal", Career_Interest: "Software & Web Development",
      Registration_Date: "2026-05-05", Remarks: "NavGurukul applicant", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Father_Mother_Name: "Anil Baghel",
      Mobile_Number: "9406123407", Gender: "Male", DOB_Age: "25", Category: "SC", Qualification: "Diploma in Mech",
      Occupation: "Apprentice", Block: "Kuakonda", Gram_Panchayat: "Mailawada", Village: "Mailawada",
      Address: "Patel Para, Mailawada", Career_Interest: "Industrial Maintenance",
      Registration_Date: "2026-05-15", Remarks: "Placed at NMDC contractor", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Father_Mother_Name: "Bheema Sori",
      Mobile_Number: "9406123408", Gender: "Female", DOB_Age: "22", Category: "ST", Qualification: "Graduate (B.Com)",
      Occupation: "Unemployed", Block: "Kuakonda", Gram_Panchayat: "Nakulnar", Village: "Nakulnar",
      Address: "Hospital Chowk, Nakulnar", Career_Interest: "Banking & Accounting",
      Registration_Date: "2026-05-20", Remarks: "Completed Tally Course", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00009", Youth_Name: "Gopal Yadav", Father_Mother_Name: "Bihari Yadav",
      Mobile_Number: "9406123409", Gender: "Male", DOB_Age: "26", Category: "OBC", Qualification: "12th Pass",
      Occupation: "Dairy Farming", Block: "Dantewada", Gram_Panchayat: "Teknar", Village: "Teknar",
      Address: "Yadav Para, Teknar", Career_Interest: "Dairy Processing Unit",
      Registration_Date: "2026-06-02", Remarks: "Applying for PMEGP loan", Created_By: "admin@dantewada.gov.in", Created_At: new Date()
    },
    {
      Youth_ID: "YH-2026-00010", Youth_Name: "Shanti Poyam", Father_Mother_Name: "Dhaniram Poyam",
      Mobile_Number: "9406123410", Gender: "Female", DOB_Age: "21", Category: "ST", Qualification: "12th Pass",
      Occupation: "Unemployed", Block: "Geedam", Gram_Panchayat: "Kasoli", Village: "Kasoli",
      Address: "Near AWC, Kasoli", Career_Interest: "Higher Education (B.Sc)",
      Registration_Date: "2026-06-10", Remarks: "Assisted in college admission", Created_By: "operator@dantewada.gov.in", Created_At: new Date()
    }
  ];

  var ySheet = ss.getSheetByName(SHEET_NAMES.YOUTH_MASTER);
  if (ySheet.getLastRow() <= 1) {
    sampleYouth.forEach(function(y) { appendRecord(SHEET_NAMES.YOUTH_MASTER, y); });
  }

  // 2. Mobilization (5 entries)
  var sampleMob = [
    { Activity_ID: "MOB-2026-0001", Date: "2026-04-05", Financial_Year: "2026-27", Month: "April", Block: "Dantewada", Gram_Panchayat: "Chitalanka", Village: "Chitalanka", Activity_Name: "Gram Sabha Youth Outreach", Male: 28, Female: 34, Other: 0, Total_Mobilized: 62, Remarks: "High participation from SHG families", Photo_URL: "", Drive_File_ID: "", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Activity_ID: "MOB-2026-0002", Date: "2026-04-15", Financial_Year: "2026-27", Month: "April", Block: "Geedam", Gram_Panchayat: "Barsoor", Village: "Barsoor", Activity_Name: "Weekly Haat Bazar Mobilization", Male: 45, Female: 40, Other: 1, Total_Mobilized: 86, Remarks: "Distributed youth registration brochures", Photo_URL: "", Drive_File_ID: "", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { Activity_ID: "MOB-2026-0003", Date: "2026-05-02", Financial_Year: "2026-27", Month: "May", Block: "Katekalyan", Gram_Panchayat: "Marjum", Village: "Marjum", Activity_Name: "CLF Youth Mobilization Camp", Male: 32, Female: 38, Other: 0, Total_Mobilized: 70, Remarks: "Coordinated with NRLM BMMU", Photo_URL: "", Drive_File_ID: "", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date() },
    { Activity_ID: "MOB-2026-0004", Date: "2026-05-18", Financial_Year: "2026-27", Month: "May", Block: "Kuakonda", Gram_Panchayat: "Nakulnar", Village: "Nakulnar", Activity_Name: "Village Chopal Mobilization", Male: 36, Female: 42, Other: 0, Total_Mobilized: 78, Remarks: "Focus on IT and retail skills", Photo_URL: "", Drive_File_ID: "", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date() },
    { Activity_ID: "MOB-2026-0005", Date: "2026-06-08", Financial_Year: "2026-27", Month: "June", Block: "Dantewada", Gram_Panchayat: "Teknar", Village: "Teknar", Activity_Name: "Special Mobilization Drive", Male: 24, Female: 31, Other: 0, Total_Mobilized: 55, Remarks: "Mobilized candidates for RSETI training", Photo_URL: "", Drive_File_ID: "", Created_By: "admin@dantewada.gov.in", Created_At: new Date() }
  ];
  var mSheet = ss.getSheetByName(SHEET_NAMES.MOBILIZATION);
  if (mSheet.getLastRow() <= 1) {
    sampleMob.forEach(function(m) { appendRecord(SHEET_NAMES.MOBILIZATION, m); });
  }

  // 3. M-Form (5 records)
  var sampleMForm = [
    { MForm_ID: "MF-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Mobile: "9406123401", Date: "2026-04-06", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/DAN/2026/1021", Remarks: "Verified by Sarpanch", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { MForm_ID: "MF-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Mobile: "9406123402", Date: "2026-04-11", Block: "Dantewada", GP: "Bhansi", Village: "Bhansi", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/DAN/2026/1045", Remarks: "All documents attached", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { MForm_ID: "MF-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Mobile: "9406123403", Date: "2026-04-14", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/GED/2026/0890", Remarks: "Aadhaar verified", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { MForm_ID: "MF-2026-0004", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Mobile: "9406123404", Date: "2026-04-20", Block: "Geedam", GP: "Haram", Village: "Haram", MForm_Status: "Pending", MForm_Reg_No: "MF/CG/GED/2026/0912", Remarks: "Bank passbook photocopy pending", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { MForm_ID: "MF-2026-0005", Youth_ID: "YH-2026-00005", Youth_Name: "Manoj Telam", Mobile: "9406123405", Date: "2026-05-04", Block: "Katekalyan", GP: "Marjum", Village: "Marjum", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/KAT/2026/0411", Remarks: "Physical form submitted at Block office", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var mfSheet = ss.getSheetByName(SHEET_NAMES.M_FORM);
  if (mfSheet.getLastRow() <= 1) {
    sampleMForm.forEach(function(f) { appendRecord(SHEET_NAMES.M_FORM, f); });
  }

  // 4. My Bharat (5 records)
  var sampleMyBharat = [
    { MyBharat_ID: "MB-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Mobile: "9406123401", Registration_Date: "2026-04-07", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", MyBharat_Reg_No: "MB-CG-DAN-88129", Status: "Registered", Remarks: "Profile complete on portal", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { MyBharat_ID: "MB-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Mobile: "9406123402", Registration_Date: "2026-04-12", Block: "Dantewada", GP: "Bhansi", Village: "Bhansi", MyBharat_Reg_No: "MB-CG-DAN-88155", Status: "Registered", Remarks: "Volunteering activities chosen", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { MyBharat_ID: "MB-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Mobile: "9406123403", Registration_Date: "2026-04-15", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", MyBharat_Reg_No: "MB-CG-GED-77402", Status: "Registered", Remarks: "Registered via Youth Hub Kiosk", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { MyBharat_ID: "MB-2026-0004", Youth_ID: "YH-2026-00006", Youth_Name: "Padmini Kunjam", Mobile: "9406123406", Registration_Date: "2026-05-08", Block: "Katekalyan", GP: "Tumakpal", Village: "Tumakpal", MyBharat_Reg_No: "MB-CG-KAT-55110", Status: "Registered", Remarks: "Youth Club member", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date() },
    { MyBharat_ID: "MB-2026-0005", Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Mobile: "9406123408", Registration_Date: "2026-05-22", Block: "Kuakonda", GP: "Nakulnar", Village: "Nakulnar", MyBharat_Reg_No: "", Status: "Pending", Remarks: "OTP verification awaited", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var mbSheet = ss.getSheetByName(SHEET_NAMES.MY_BHARAT);
  if (mbSheet.getLastRow() <= 1) {
    sampleMyBharat.forEach(function(b) { appendRecord(SHEET_NAMES.MY_BHARAT, b); });
  }

  // 5. Career Counselling (4 records)
  var sampleCounselling = [
    { Counselling_ID: "COU-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Date: "2026-04-15", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", Counselling_Type: "Skill Training", Career_Interest: "Automobile Technician", Counsellor_Name: "Sanjay Verma (Counsellor YH)", Counselling_Outcome: "Recommended for Livelihood College 3-Month Certificate", Recommended_Action: "Enroll in Batch 12 Livelihood College", Follow_Up_Required: "Yes", Remarks: "Motivated for technical trade", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Counselling_ID: "COU-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Date: "2026-04-20", Block: "Dantewada", GP: "Bhansi", Village: "Bhansi", Counselling_Type: "NavGurukul", Career_Interest: "Computer Programming", Counsellor_Name: "Priyanka Sahu (Lead Counsellor)", Counselling_Outcome: "Eligible for NavGurukul Dantewada Coding Bootcamp", Recommended_Action: "Appear for NavGurukul entrance test", Follow_Up_Required: "Yes", Remarks: "High logical reasoning score", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Counselling_ID: "COU-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Date: "2026-04-25", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", Counselling_Type: "Entrepreneurship", Career_Interest: "Electrical Shop", Counsellor_Name: "Rajeshwar Rao (EDII Consultant)", Counselling_Outcome: "Viable business concept in Barsoor market", Recommended_Action: "Attend RSETI EDP training + PMEGP DPR preparation", Follow_Up_Required: "Yes", Remarks: "Owns land along main road", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { Counselling_ID: "COU-2026-0004", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Date: "2026-04-28", Block: "Geedam", GP: "Haram", Village: "Haram", Counselling_Type: "Employment", Career_Interest: "Retail / Counter Sales", Counsellor_Name: "Priyanka Sahu (Lead Counsellor)", Counselling_Outcome: "Candidate ready for direct placement", Recommended_Action: "Register with Rozgar Mela at Youth Hub", Follow_Up_Required: "No", Remarks: "Good communication skills", Created_By: "operator@dantewada.gov.in", Created_At: new Date() }
  ];
  var cSheet = ss.getSheetByName(SHEET_NAMES.COUNSELLING);
  if (cSheet.getLastRow() <= 1) {
    sampleCounselling.forEach(function(c) { appendRecord(SHEET_NAMES.COUNSELLING, c); });
  }

  // 6. Skill Training (3 records)
  var sampleSkill = [
    { Training_Record_ID: "SKL-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Training_Name: "Automotive Service Technician", Training_Provider: "Livelihood College", Course: "4-Wheeler Service & Repair (NSQF L4)", Start_Date: "2026-05-01", End_Date: "2026-07-31", Block: "Dantewada", GP: "Chitalanka", Training_Status: "Completed", Completion_Status: "Passed", Certificate_Status: "Issued", Employment_After_Training: "Yes", Remarks: "Appeared for final practical assessment", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Training_Record_ID: "SKL-2026-0002", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Training_Name: "Entrepreneurship Development Program (EDP)", Training_Provider: "RSETI", Course: "Micro-Enterprise Management & Accounting", Start_Date: "2026-05-10", End_Date: "2026-05-25", Block: "Geedam", GP: "Barsoor", Training_Status: "Completed", Completion_Status: "Passed", Certificate_Status: "Issued", Employment_After_Training: "Self-Employed", Remarks: "Graduated with A grade", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { Training_Record_ID: "SKL-2026-0003", Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Training_Name: "Financial Accounting & Tally Prime", Training_Provider: "Livelihood College", Course: "Computerized Accounting (NSQF L4)", Start_Date: "2026-06-01", End_Date: "2026-08-31", Block: "Kuakonda", GP: "Nakulnar", Training_Status: "Ongoing", Completion_Status: "In Progress", Certificate_Status: "Pending", Employment_After_Training: "Pending", Remarks: "85% attendance maintained", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var skSheet = ss.getSheetByName(SHEET_NAMES.SKILL_TRAINING);
  if (skSheet.getLastRow() <= 1) {
    sampleSkill.forEach(function(s) { appendRecord(SHEET_NAMES.SKILL_TRAINING, s); });
  }

  // 7. Employment Registered (2 records)
  var sampleEmpReg = [
    { Emp_Reg_ID: "ER-2026-0001", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Registration_Date: "2026-04-29", Block: "Geedam", GP: "Haram", Qualification: "12th Pass", Preferred_Job: "Retail Store Executive", Registration_Status: "Active", Remarks: "Willing to relocate to Dantewada town", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { Emp_Reg_ID: "ER-2026-0002", Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Registration_Date: "2026-05-16", Block: "Kuakonda", GP: "Mailawada", Qualification: "Diploma Mechanical", Preferred_Job: "Plant Technician / Fitter", Registration_Status: "Active", Remarks: "Technical experience 1 year", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var erSheet = ss.getSheetByName(SHEET_NAMES.EMP_REGISTERED);
  if (erSheet.getLastRow() <= 1) {
    sampleEmpReg.forEach(function(r) { appendRecord(SHEET_NAMES.EMP_REGISTERED, r); });
  }

  // 8. Employment Linked (2 records)
  var sampleEmpLink = [
    { Emp_Link_ID: "EL-2026-0001", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Employer_Name: "Bastar Fresh Retail Mart", Job_Role: "Sales & Cashier Executive", Placement_Date: "2026-05-15", Salary: "12000", Employment_Type: "Full Time", Location: "Geedam Market", Status: "Placed", Remarks: "Offer letter issued on 14 May", Created_By: "operator@dantewada.gov.in", Created_At: new Date() },
    { Emp_Link_ID: "EL-2026-0002", Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Employer_Name: "NMDC Allied Contractor Services", Job_Role: "Mechanical Maintenance Assistant", Placement_Date: "2026-06-01", Salary: "16500", Employment_Type: "Full Time", Location: "Kirandul / Bacheli", Status: "Placed", Remarks: "Joined on site with EPF/ESI", Created_By: "kua.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var elSheet = ss.getSheetByName(SHEET_NAMES.EMP_LINKED);
  if (elSheet.getLastRow() <= 1) {
    sampleEmpLink.forEach(function(l) { appendRecord(SHEET_NAMES.EMP_LINKED, l); });
  }

  // 9. Education Linked (1 record)
  var sampleEdu = [
    { Education_ID: "EDU-2026-0001", Youth_ID: "YH-2026-00010", Youth_Name: "Shanti Poyam", Current_Qualification: "12th Pass (Bio)", Education_Goal: "B.Sc (Forestry & Botany)", Institution_Name: "Govt. Danteshwari PG College Dantewada", Course: "Bachelor of Science", Admission_Date: "2026-06-15", Block: "Geedam", GP: "Kasoli", Status: "Admitted", Remarks: "District administration scholarship applied", Created_By: "operator@dantewada.gov.in", Created_At: new Date() }
  ];
  var edSheet = ss.getSheetByName(SHEET_NAMES.EDUCATION);
  if (edSheet.getLastRow() <= 1) {
    sampleEdu.forEach(function(e) { appendRecord(SHEET_NAMES.EDUCATION, e); });
  }

  // 10. Entrepreneurs (2 records - 1 Identified, 1 Established)
  var sampleEnt = [
    { Entrepreneur_ID: "ENT-2026-0001", Youth_ID: "YH-2026-00009", Name: "Gopal Yadav", Mobile: "9406123409", Block: "Dantewada", GP: "Teknar", Business_Idea: "Teknar Modern Dairy & Ghee Processing Unit", Business_Category: "Agro & Food Processing", IdentificationDate: "2026-06-03", Business_Plan_Status: "Approved", DPR_Status: "Submitted", Counselling_Status: "Completed", Business_Name: "Teknar Dairy", Business_Type: "Proprietorship", Establishment_Date: "", Loan_Required: "Yes", Loan_Applied: "Yes", Loan_Approved: "Pending", Loan_Amount: "250000", Bank_Name: "Chhattisgarh Rajya Gramin Bank Teknar", Loan_Scheme: "PMEGP", Stage: "Identified", Status: "In Process", Remarks: "DPR under bank review", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Entrepreneur_ID: "ENT-2026-0002", Youth_ID: "YH-2026-00003", Name: "Devendra Kashyap", Mobile: "9406123403", Block: "Geedam", GP: "Barsoor", Business_Idea: "Barsoor Electricals & Solar Home Solutions", Business_Category: "Service & Electrical Retail", IdentificationDate: "2026-04-16", Business_Plan_Status: "Approved", DPR_Status: "Approved", Counselling_Status: "Completed", Business_Name: "Barsoor Solar & Electrical Hub", Business_Type: "Proprietorship", Establishment_Date: "2026-06-10", Loan_Required: "Yes", Loan_Applied: "Yes", Loan_Approved: "Yes", Loan_Amount: "200000", Bank_Name: "SBI Geedam Branch", Loan_Scheme: "MUDRA Kishore", Stage: "Established", Status: "Operational", Remarks: "Shop open and operational with 1 assistant", Created_By: "operator@dantewada.gov.in", Created_At: new Date() }
  ];
  var entSheet = ss.getSheetByName(SHEET_NAMES.ENTREPRENEURS);
  if (entSheet.getLastRow() <= 1) {
    sampleEnt.forEach(function(et) { appendRecord(SHEET_NAMES.ENTREPRENEURS, et); });
  }

  // 11. NavGurukul (2 candidates)
  var sampleNav = [
    { Candidate_ID: "NG-2026-0001", Youth_ID: "YH-2026-00002", Candidate_Name: "Sunita Karma", Mobile: "9406123402", Block: "Dantewada", GP: "Bhansi", Qualification: "Graduate (BA)", Registration_Date: "2026-04-22", Selection_Status: "Admitted", Admission_Status: "Joined", Joining_Date: "2026-05-10", Remarks: "Enrolled in 1-Year Full Stack Software Engineering Program", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Candidate_ID: "NG-2026-0002", Youth_ID: "YH-2026-00006", Candidate_Name: "Padmini Kunjam", Mobile: "9406123406", Block: "Katekalyan", GP: "Tumakpal", Qualification: "12th Pass", Registration_Date: "2026-05-10", Selection_Status: "Shortlisted", Admission_Status: "Pending", Joining_Date: "", Remarks: "Cleared aptitude round, interview scheduled", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var ngSheet = ss.getSheetByName(SHEET_NAMES.NAVGURUKUL);
  if (ngSheet.getLastRow() <= 1) {
    sampleNav.forEach(function(n) { appendRecord(SHEET_NAMES.NAVGURUKUL, n); });
  }

  // 12. Trainings (2 activity events)
  var sampleTrainings = [
    { Training_ID: "TRG-2026-0001", Training_Name: "Youth Entrepreneurship & Financial Literacy Bootcamp", Training_Type: "Entrepreneurship Workshop", Date: "2026-05-20", Start_Date: "2026-05-20", End_Date: "2026-05-22", Block: "Dantewada", GP: "Dantewada Rural", Village: "Dantewada", Venue: "Youth Hub Multipurpose Hall, Dantewada", Training_Provider: "EDII & Livelihood College", Trainer_Name: "Dr. K. Sharma", Male_Participants: 28, Female_Participants: 32, Total_Participants: 60, Training_Topic: "Business Model Canvas & MUDRA Scheme", Outcome: "60 youth trained; 14 DPRs initiated", Photos_URL: "", Documents_URL: "", Remarks: "Inaugurated by Collector Dantewada", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Training_ID: "TRG-2026-0002", Training_Name: "Digital Skills & Cyber Safety Awareness Workshop", Training_Type: "Skill Training", Date: "2026-06-05", Start_Date: "2026-06-05", End_Date: "2026-06-06", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", Venue: "Govt Higher Secondary School Barsoor", Training_Provider: "Youth Hub Tech Fellows", Trainer_Name: "Ankita Jain", Male_Participants: 22, Female_Participants: 38, Total_Participants: 60, Training_Topic: "Smartphone Digital Tools, DigiLocker & Online Jobs", Outcome: "High female participation", Photos_URL: "", Documents_URL: "", Remarks: "Certificates awarded to all attendees", Created_By: "operator@dantewada.gov.in", Created_At: new Date() }
  ];
  var trSheet = ss.getSheetByName(SHEET_NAMES.TRAININGS);
  if (trSheet.getLastRow() <= 1) {
    sampleTrainings.forEach(function(t) { appendRecord(SHEET_NAMES.TRAININGS, t); });
  }

  // 13. Activities (2 activities)
  var sampleAct = [
    { Activity_ID: "ACT-2026-0001", Date: "2026-04-25", Activity_Type: "M-Form Registration Camp", Activity_Name: "Special M-Form Mega Camp Chitalanka", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", Participants: 75, Description: "On-the-spot M-Form verification and Aadhaar linking", Outcome: "42 M-Forms submitted in a single day", Photo_URL: "", Document_URL: "", Remarks: "Organized with District Panchayat", Created_By: "admin@dantewada.gov.in", Created_At: new Date() },
    { Activity_ID: "ACT-2026-0002", Date: "2026-05-28", Activity_Type: "Career Counselling Camp", Activity_Name: "Katekalyan Youth Guidance Session", Block: "Katekalyan", GP: "Marjum", Village: "Marjum", Participants: 55, Description: "Interaction with youth on competitive exams & skill courses", Outcome: "24 youth registered for upcoming skill batches", Photo_URL: "", Document_URL: "", Remarks: "Panchayat representatives attended", Created_By: "kate.user@dantewada.gov.in", Created_At: new Date() }
  ];
  var actSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITIES);
  if (actSheet.getLastRow() <= 1) {
    sampleAct.forEach(function(a) { appendRecord(SHEET_NAMES.ACTIVITIES, a); });
  }

  return { success: true, message: "Sample data loaded successfully into all tables!" };
}
