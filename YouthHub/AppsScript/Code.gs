/**
 * YOUTH HUB DANTEWADA
 * Youth Mobilization, Counselling, Skill, Employment & Entrepreneurship Monitoring System
 * Main Web App Routing & Controller (Code.gs)
 */

/**
 * Handles Web App GET requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  
  if (action === "ping") {
    return createJsonResponse({ success: true, message: "Youth Hub Dantewada API is active.", timestamp: new Date() });
  }
  
  if (action === "getMetadata") {
    return createJsonResponse({
      success: true,
      config: DANTEWADA_CONFIG
    });
  }
  
  // Serve the HTML Web App when opened directly via Apps Script Web App URL
  try {
    var template = HtmlService.createTemplateFromFile("index");
    return template.evaluate()
      .setTitle("YOUTH HUB DANTEWADA - Monitoring System")
      .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // If running in standalone backend API mode
    return createJsonResponse({
      success: true,
      system: "Youth Hub Dantewada API Server",
      status: "Operational",
      message: "Please connect via the frontend web application or HTML service."
    });
  }
}

/**
 * Handles Web App POST requests (REST API)
 */
function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }
    
    var action = postData.action || "";
    var payload = postData.payload || postData;
    var token = postData.token || payload.userToken || "";
    var response = { success: false, message: "Invalid action or request." };
    
    switch (action) {
      // Setup & Metadata
      case "setupDatabase":
        response = setupDatabase();
        break;
      case "createSampleData":
        response = createSampleData();
        break;
      case "getMetadata":
        response = { success: true, config: DANTEWADA_CONFIG };
        break;

      // Authentication & Users
      case "login":
        response = authenticateUser(payload.email, payload.password);
        break;
      case "listUsers":
        response = listUsers(token);
        break;
      case "createUser":
        response = createUser(payload, token);
        break;

      // Dashboard & Reports
      case "getDashboard":
        response = getDashboardData(payload.filters, token);
        break;
      case "getReport":
        response = getReportData(payload.reportType, payload.filters, token);
        break;
      case "searchYouth":
        response = { success: true, results: searchYouthDatabase(payload.query) };
        break;
      case "getYouthProfile":
        response = getYouthFullProfile(payload.youthId, token);
        break;
      case "getTableRecords":
        response = getTableRecordsData(payload.sheetName, payload.filters, token);
        break;

      // File Upload
      case "uploadFile":
        response = uploadFileToDrive(payload);
        break;

      // Data Entry Operations
      case "addYouth":
        response = handleAddYouth(payload, token);
        break;
      case "updateYouth":
        response = handleUpdateYouth(payload, token);
        break;
      case "addMobilization":
        response = handleAddMobilization(payload, token);
        break;
      case "addMForm":
        response = handleAddMForm(payload, token);
        break;
      case "addMyBharat":
        response = handleAddMyBharat(payload, token);
        break;
      case "addCounselling":
        response = handleAddCounselling(payload, token);
        break;
      case "addSkillTraining":
        response = handleAddSkillTraining(payload, token);
        break;
      case "addEmploymentRegistered":
        response = handleAddEmploymentRegistered(payload, token);
        break;
      case "addEmploymentLinked":
        response = handleAddEmploymentLinked(payload, token);
        break;
      case "addEducation":
        response = handleAddEducation(payload, token);
        break;
      case "addEntrepreneur":
        response = handleAddEntrepreneur(payload, token);
        break;
      case "updateEntrepreneur":
        response = handleUpdateEntrepreneur(payload, token);
        break;
      case "addNavGurukul":
        response = handleAddNavGurukul(payload, token);
        break;
      case "addTraining":
        response = handleAddTraining(payload, token);
        break;
      case "addActivity":
        response = handleAddActivity(payload, token);
        break;

      default:
        response = { success: false, message: "Action not recognized: " + action };
        break;
    }
    
    return createJsonResponse(response);
  } catch (ex) {
    return createJsonResponse({
      success: false,
      message: "Server exception: " + ex.message
    });
  }
}

/**
 * Audit Logger
 */
function writeAuditLogDirect(userEmail, role, action, module, recordId, details) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAMES.AUDIT_LOG);
    if (!sheet) return;
    
    var logId = "LOG-" + new Date().getTime();
    var record = {
      Log_ID: logId,
      Timestamp: new Date(),
      User_Email: userEmail || "Anonymous",
      Role: role || "GUEST",
      Action: action,
      Module: module,
      Record_ID: recordId || "",
      Details: typeof details === "object" ? JSON.stringify(details) : String(details || "")
    };
    
    appendRecord(SHEET_NAMES.AUDIT_LOG, record);
  } catch (e) {
    // Fail silently so it doesn't block transactions
  }
}

/* ==============================================================
   DATA ENTRY HANDLERS
============================================================== */

// 1. Youth Master Handler
function handleAddYouth(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) {
    return { success: false, message: "Unauthorized: Viewers cannot create records." };
  }
  
  if (user.role === ROLES.BLOCK_USER && user.block !== "All" && data.Block !== user.block) {
    return { success: false, message: "Unauthorized: You can only register youth for block " + user.block };
  }
  
  if (!data.Youth_Name || !data.Mobile_Number || !data.Block || !data.Gram_Panchayat) {
    return { success: false, message: "Youth Name, Mobile Number, Block, and Gram Panchayat are required." };
  }
  
  if (!isValidMobile(data.Mobile_Number)) {
    return { success: false, message: "Please provide a valid 10-digit mobile number." };
  }
  
  // Duplicate check: mobile + name
  var existing = getSheetRows(SHEET_NAMES.YOUTH_MASTER);
  var cleanMobile = String(data.Mobile_Number).trim();
  var cleanName = String(data.Youth_Name).trim().toLowerCase();
  
  var isDup = existing.some(function(y) {
    return String(y.Mobile_Number).trim() === cleanMobile && String(y.Youth_Name).trim().toLowerCase() === cleanName;
  });
  
  if (isDup) {
    return { success: false, message: "A youth record with the same name and mobile number already exists." };
  }
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.YOUTH_MASTER);
  var youthId = generateYouthId(sheet);
  
  var record = {
    Youth_ID: youthId,
    Youth_Name: data.Youth_Name.trim(),
    Father_Mother_Name: data.Father_Mother_Name || "",
    Mobile_Number: cleanMobile,
    Gender: data.Gender || "Male",
    DOB_Age: data.DOB_Age || "",
    Category: data.Category || "ST",
    Qualification: data.Qualification || "10th Pass",
    Occupation: data.Occupation || "Unemployed",
    Block: data.Block,
    Gram_Panchayat: data.Gram_Panchayat,
    Village: data.Village || data.Gram_Panchayat,
    Address: data.Address || "",
    Career_Interest: data.Career_Interest || "",
    Registration_Date: data.Registration_Date || formatDate(new Date()),
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.YOUTH_MASTER, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Youth_Master", youthId, "Registered youth: " + data.Youth_Name);
  
  return { success: true, message: "Youth registered successfully.", youthId: youthId, record: record };
}

function handleUpdateYouth(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID) return { success: false, message: "Youth ID missing." };
  
  updateRecord(SHEET_NAMES.YOUTH_MASTER, "Youth_ID", data.Youth_ID, data);
  writeAuditLogDirect(user.email, user.role, "UPDATE", "Youth_Master", data.Youth_ID, "Updated youth profile");
  return { success: true, message: "Youth profile updated successfully." };
}

// 2. Mobilization Handler
function handleAddMobilization(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (user.role === ROLES.BLOCK_USER && user.block !== "All" && data.Block !== user.block) {
    return { success: false, message: "Unauthorized for block " + data.Block };
  }
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.MOBILIZATION);
  var activityId = generateRecordId("MOB", sheet);
  
  var male = Number(data.Male) || 0;
  var female = Number(data.Female) || 0;
  var other = Number(data.Other) || 0;
  var total = male + female + other;
  
  var d = data.Date ? new Date(data.Date) : new Date();
  var fy = data.Financial_Year || getFinancialYear(d);
  var mo = data.Month || DANTEWADA_CONFIG.MONTHS[d.getMonth()];
  
  var record = {
    Activity_ID: activityId,
    Date: data.Date || formatDate(new Date()),
    Financial_Year: fy,
    Month: mo,
    Block: data.Block,
    Gram_Panchayat: data.Gram_Panchayat,
    Village: data.Village || data.Gram_Panchayat,
    Activity_Name: data.Activity_Name || "Youth Outreach Camp",
    Male: male,
    Female: female,
    Other: other,
    Total_Mobilized: total,
    Remarks: data.Remarks || "",
    Photo_URL: data.Photo_URL || "",
    Drive_File_ID: data.Drive_File_ID || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.MOBILIZATION, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Mobilization", activityId, "Mobilization total: " + total);
  return { success: true, message: "Mobilization entry recorded successfully.", activityId: activityId };
}

// 3. M-Form Handler
function handleAddMForm(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.MForm_Status) return { success: false, message: "Youth ID and Status are required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.M_FORM);
  var mformId = generateRecordId("MF", sheet);
  
  var record = {
    MForm_ID: mformId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Mobile: data.Mobile || "",
    Date: data.Date || formatDate(new Date()),
    Block: data.Block || "",
    GP: data.GP || "",
    Village: data.Village || "",
    MForm_Status: data.MForm_Status,
    MForm_Reg_No: data.MForm_Reg_No || "",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.M_FORM, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "M_Form", mformId, "M-Form for " + data.Youth_ID);
  return { success: true, message: "M-Form entry saved successfully.", mformId: mformId };
}

// 4. My Bharat Handler
function handleAddMyBharat(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.Status) return { success: false, message: "Youth ID and Status required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.MY_BHARAT);
  var mbId = generateRecordId("MB", sheet);
  
  var record = {
    MyBharat_ID: mbId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Mobile: data.Mobile || "",
    Registration_Date: data.Registration_Date || formatDate(new Date()),
    Block: data.Block || "",
    GP: data.GP || "",
    Village: data.Village || "",
    MyBharat_Reg_No: data.MyBharat_Reg_No || "",
    Status: data.Status,
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.MY_BHARAT, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "My_Bharat", mbId, "My Bharat for " + data.Youth_ID);
  return { success: true, message: "My Bharat record saved successfully.", myBharatId: mbId };
}

// 5. Career Counselling Handler
function handleAddCounselling(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.Counselling_Type) return { success: false, message: "Youth ID and Counselling Type required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.COUNSELLING);
  var couId = generateRecordId("COU", sheet);
  
  var record = {
    Counselling_ID: couId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Date: data.Date || formatDate(new Date()),
    Block: data.Block || "",
    GP: data.GP || "",
    Village: data.Village || "",
    Counselling_Type: data.Counselling_Type,
    Career_Interest: data.Career_Interest || "",
    Counsellor_Name: data.Counsellor_Name || user.name,
    Counselling_Outcome: data.Counselling_Outcome || "",
    Recommended_Action: data.Recommended_Action || "",
    Follow_Up_Required: data.Follow_Up_Required || "No",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.COUNSELLING, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Counselling", couId, "Counselling for " + data.Youth_ID);
  return { success: true, message: "Career counselling record saved successfully.", counsellingId: couId };
}

// 6. Skill Training Handler
function handleAddSkillTraining(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.Training_Name) return { success: false, message: "Youth ID and Training Name required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.SKILL_TRAINING);
  var skId = generateRecordId("SKL", sheet);
  
  var record = {
    Training_Record_ID: skId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Training_Name: data.Training_Name,
    Training_Provider: data.Training_Provider || "Livelihood College",
    Course: data.Course || "",
    Start_Date: data.Start_Date || formatDate(new Date()),
    End_Date: data.End_Date || "",
    Block: data.Block || "",
    GP: data.GP || "",
    Training_Status: data.Training_Status || "Ongoing",
    Completion_Status: data.Completion_Status || "In Progress",
    Certificate_Status: data.Certificate_Status || "Pending",
    Employment_After_Training: data.Employment_After_Training || "Pending",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.SKILL_TRAINING, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Skill_Training", skId, "Skill entry for " + data.Youth_ID);
  return { success: true, message: "Skill training record saved successfully.", trainingRecordId: skId };
}

// 7. Employment Handlers (Registered & Linked)
function handleAddEmploymentRegistered(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID) return { success: false, message: "Youth ID required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.EMP_REGISTERED);
  var regId = generateRecordId("ER", sheet);
  
  var record = {
    Emp_Reg_ID: regId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Registration_Date: data.Registration_Date || formatDate(new Date()),
    Block: data.Block || "",
    GP: data.GP || "",
    Qualification: data.Qualification || "",
    Preferred_Job: data.Preferred_Job || "",
    Registration_Status: data.Registration_Status || "Active",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.EMP_REGISTERED, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Employment_Registered", regId, "Emp reg for " + data.Youth_ID);
  return { success: true, message: "Employment registered successfully.", empRegId: regId };
}

function handleAddEmploymentLinked(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.Employer_Name) return { success: false, message: "Youth ID and Employer Name required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.EMP_LINKED);
  var linkId = generateRecordId("EL", sheet);
  
  var record = {
    Emp_Link_ID: linkId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Employer_Name: data.Employer_Name,
    Job_Role: data.Job_Role || "",
    Placement_Date: data.Placement_Date || formatDate(new Date()),
    Salary: data.Salary || "",
    Employment_Type: data.Employment_Type || "Full Time",
    Location: data.Location || "",
    Status: data.Status || "Placed",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.EMP_LINKED, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Employment_Linked", linkId, "Emp link for " + data.Youth_ID);
  return { success: true, message: "Employment link recorded successfully.", empLinkId: linkId };
}

// 8. Education Linked Handler
function handleAddEducation(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID || !data.Institution_Name) return { success: false, message: "Youth ID and Institution required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.EDUCATION);
  var eduId = generateRecordId("EDU", sheet);
  
  var record = {
    Education_ID: eduId,
    Youth_ID: data.Youth_ID,
    Youth_Name: data.Youth_Name || "",
    Current_Qualification: data.Current_Qualification || "",
    Education_Goal: data.Education_Goal || "",
    Institution_Name: data.Institution_Name,
    Course: data.Course || "",
    Admission_Date: data.Admission_Date || formatDate(new Date()),
    Block: data.Block || "",
    GP: data.GP || "",
    Status: data.Status || "Admitted",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.EDUCATION, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Education", eduId, "Education for " + data.Youth_ID);
  return { success: true, message: "Education linkage recorded successfully.", educationId: eduId };
}

// 9. Entrepreneurship Handler
function handleAddEntrepreneur(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID) return { success: false, message: "Youth ID required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ENTREPRENEURS);
  var entId = generateRecordId("ENT", sheet);
  
  var record = {
    Entrepreneur_ID: entId,
    Youth_ID: data.Youth_ID,
    Name: data.Name || data.Youth_Name || "",
    Mobile: data.Mobile || "",
    Block: data.Block || "",
    GP: data.GP || "",
    Business_Idea: data.Business_Idea || "",
    Business_Category: data.Business_Category || "",
    Identification_Date: data.Identification_Date || formatDate(new Date()),
    Business_Plan_Status: data.Business_Plan_Status || "In Progress",
    DPR_Status: data.DPR_Status || "Pending",
    Counselling_Status: data.Counselling_Status || "Completed",
    Business_Name: data.Business_Name || "",
    Business_Type: data.Business_Type || "",
    Establishment_Date: data.Establishment_Date || "",
    Loan_Required: data.Loan_Required || "No",
    Loan_Applied: data.Loan_Applied || "No",
    Loan_Approved: data.Loan_Approved || "No",
    Loan_Amount: data.Loan_Amount || "",
    Bank_Name: data.Bank_Name || "",
    Loan_Scheme: data.Loan_Scheme || "",
    Stage: data.Stage || (data.Establishment_Date ? "Established" : "Identified"),
    Status: data.Status || "In Process",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.ENTREPRENEURS, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Entrepreneurs", entId, "Entrepreneur " + data.Youth_ID);
  return { success: true, message: "Entrepreneur record saved successfully.", entrepreneurId: entId };
}

function handleUpdateEntrepreneur(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Entrepreneur_ID) return { success: false, message: "Entrepreneur ID required." };
  
  updateRecord(SHEET_NAMES.ENTREPRENEURS, "Entrepreneur_ID", data.Entrepreneur_ID, data);
  writeAuditLogDirect(user.email, user.role, "UPDATE", "Entrepreneurs", data.Entrepreneur_ID, "Updated entrepreneur details");
  return { success: true, message: "Entrepreneur record updated successfully." };
}

// 10. NavGurukul Handler
function handleAddNavGurukul(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Youth_ID) return { success: false, message: "Youth ID required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.NAVGURUKUL);
  var candId = generateRecordId("NG", sheet);
  
  var record = {
    Candidate_ID: candId,
    Youth_ID: data.Youth_ID,
    Candidate_Name: data.Candidate_Name || data.Youth_Name || "",
    Mobile: data.Mobile || "",
    Block: data.Block || "",
    GP: data.GP || "",
    Qualification: data.Qualification || "",
    Registration_Date: data.Registration_Date || formatDate(new Date()),
    Selection_Status: data.Selection_Status || "Registered",
    Admission_Status: data.Admission_Status || "Pending",
    Joining_Date: data.Joining_Date || "",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.NAVGURUKUL, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "NavGurukul", candId, "NavGurukul candidate " + data.Youth_ID);
  return { success: true, message: "NavGurukul candidate saved successfully.", candidateId: candId };
}

// 11. Trainings Activity Handler
function handleAddTraining(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Training_Name) return { success: false, message: "Training Name required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.TRAININGS);
  var trgId = generateRecordId("TRG", sheet);
  
  var male = Number(data.Male_Participants) || 0;
  var female = Number(data.Female_Participants) || 0;
  var total = male + female;
  
  var record = {
    Training_ID: trgId,
    Training_Name: data.Training_Name,
    Training_Type: data.Training_Type || "Skill Training",
    Date: data.Date || formatDate(new Date()),
    Start_Date: data.Start_Date || formatDate(new Date()),
    End_Date: data.End_Date || "",
    Block: data.Block || "",
    GP: data.GP || "",
    Village: data.Village || "",
    Venue: data.Venue || "",
    Training_Provider: data.Training_Provider || "",
    Trainer_Name: data.Trainer_Name || "",
    Male_Participants: male,
    Female_Participants: female,
    Total_Participants: total,
    Training_Topic: data.Training_Topic || "",
    Outcome: data.Outcome || "",
    Photos_URL: data.Photos_URL || "",
    Documents_URL: data.Documents_URL || "",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.TRAININGS, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Trainings", trgId, "Training event: " + data.Training_Name);
  return { success: true, message: "Training event recorded successfully.", trainingId: trgId };
}

// 12. Activities Handler
function handleAddActivity(data, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role === ROLES.VIEWER) return { success: false, message: "Unauthorized" };
  if (!data.Activity_Name || !data.Activity_Type) return { success: false, message: "Activity Name and Type required." };
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ACTIVITIES);
  var actId = generateRecordId("ACT", sheet);
  
  var record = {
    Activity_ID: actId,
    Date: data.Date || formatDate(new Date()),
    Activity_Type: data.Activity_Type,
    Activity_Name: data.Activity_Name,
    Block: data.Block || "",
    GP: data.GP || "",
    Village: data.Village || "",
    Participants: Number(data.Participants) || 0,
    Description: data.Description || "",
    Outcome: data.Outcome || "",
    Photo_URL: data.Photo_URL || "",
    Document_URL: data.Document_URL || "",
    Remarks: data.Remarks || "",
    Created_By: user.email,
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.ACTIVITIES, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Activities", actId, "Activity: " + data.Activity_Name);
  return { success: true, message: "Activity event recorded successfully.", activityId: actId };
}
