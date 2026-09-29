/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * api.js - Dual-Runtime Communication Layer (Apps Script Web App & Standalone Fetch)
 */

const API = (function() {
  const STORAGE_KEY_TOKEN = "YH_DANTEWADA_TOKEN";
  const STORAGE_KEY_USER = "YH_DANTEWADA_USER";
  const STORAGE_KEY_API_URL = "YH_DANTEWADA_API_URL";
  const STORAGE_KEY_LOCAL_DB = "YH_DANTEWADA_LOCAL_DB";

  // Check if running inside Google Apps Script iframe
  const isAppsScriptEnvironment = typeof google !== "undefined" && google.script && google.script.run;

  function getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || "";
  }

  function setSession(token, user) {
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
    if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getApiUrl() {
    return localStorage.getItem(STORAGE_KEY_API_URL) || "";
  }

  function setApiUrl(url) {
    if (url) localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
  }

  /**
   * Unified dispatcher: calls google.script.run when embedded, or fetch() when standalone
   */
  async function call(action, payload = {}) {
    payload.userToken = getToken();

    // 1. Apps Script embedded execution
    if (isAppsScriptEnvironment) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((response) => {
            if (typeof response === "string") {
              try { response = JSON.parse(response); } catch (e) {}
            }
            resolve(response);
          })
          .withFailureHandler((error) => {
            reject(new Error(error.message || error.toString()));
          })
          .doPost({
            postData: {
              contents: JSON.stringify({ action, payload, token: getToken() })
            }
          });
      });
    }

    // 2. Standalone / Local / GitHub Pages execution via HTTP POST to Web App URL
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      return mockFallback(action, payload);
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain prevents CORS preflight in Apps Script
        body: JSON.stringify({ action, payload, token: getToken() })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("API Server fetch error, using local fallback state:", err);
      return mockFallback(action, payload);
    }
  }

  // Initial local DB seed
  function getLocalDB() {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_DB);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }

    const initial = {
      Youth_Master: [
        { Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Father_Mother_Name: "Laxman Mandavi", Mobile_Number: "9406123401", Gender: "Male", DOB_Age: "22", Category: "ST", Qualification: "12th Pass", Occupation: "Unemployed", Block: "Dantewada", Gram_Panchayat: "Chitalanka", Village: "Chitalanka", Career_Interest: "Automobile Technician", Registration_Date: "2026-04-05", Remarks: "Interested in technical training" },
        { Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Father_Mother_Name: "Manglu Karma", Mobile_Number: "9406123402", Gender: "Female", DOB_Age: "20", Category: "ST", Qualification: "Graduate (BA)", Occupation: "Student", Block: "Dantewada", Gram_Panchayat: "Bhansi", Village: "Bhansi", Career_Interest: "Computer Programming", Registration_Date: "2026-04-10", Remarks: "Recommended for NavGurukul" },
        { Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Father_Mother_Name: "Sukhram Kashyap", Mobile_Number: "9406123403", Gender: "Male", DOB_Age: "24", Category: "OBC", Qualification: "ITI (Electrician)", Occupation: "Self-Employed", Block: "Geedam", Gram_Panchayat: "Barsoor", Village: "Barsoor", Career_Interest: "Electrical Shop", Registration_Date: "2026-04-12", Remarks: "Wants to start enterprise" },
        { Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Father_Mother_Name: "Kamlesh Markam", Mobile_Number: "9406123404", Gender: "Female", DOB_Age: "21", Category: "ST", Qualification: "12th Pass", Occupation: "Unemployed", Block: "Geedam", Gram_Panchayat: "Haram", Village: "Haram", Career_Interest: "Retail Sales", Registration_Date: "2026-04-18", Remarks: "Seeking placement" },
        { Youth_ID: "YH-2026-00005", Youth_Name: "Manoj Telam", Father_Mother_Name: "Podia Telam", Mobile_Number: "9406123405", Gender: "Male", DOB_Age: "23", Category: "ST", Qualification: "10th Pass", Occupation: "Laborer", Block: "Katekalyan", Gram_Panchayat: "Marjum", Village: "Marjum", Career_Interest: "Driving", Registration_Date: "2026-05-02", Remarks: "Mobilized at camp" },
        { Youth_ID: "YH-2026-00006", Youth_Name: "Padmini Kunjam", Father_Mother_Name: "Dhiraj Kunjam", Mobile_Number: "9406123406", Gender: "Female", DOB_Age: "19", Category: "ST", Qualification: "12th Pass", Occupation: "Unemployed", Block: "Katekalyan", Gram_Panchayat: "Tumakpal", Village: "Tumakpal", Career_Interest: "Software & Web Development", Registration_Date: "2026-05-05", Remarks: "NavGurukul applicant" },
        { Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Father_Mother_Name: "Anil Baghel", Mobile_Number: "9406123407", Gender: "Male", DOB_Age: "25", Category: "SC", Qualification: "Diploma in Mech", Occupation: "Apprentice", Block: "Kuakonda", Gram_Panchayat: "Mailawada", Village: "Mailawada", Career_Interest: "Industrial Maintenance", Registration_Date: "2026-05-15", Remarks: "Placed at NMDC" },
        { Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Father_Mother_Name: "Bheema Sori", Mobile_Number: "9406123408", Gender: "Female", DOB_Age: "22", Category: "ST", Qualification: "Graduate (B.Com)", Occupation: "Unemployed", Block: "Kuakonda", Gram_Panchayat: "Nakulnar", Village: "Nakulnar", Career_Interest: "Banking & Accounting", Registration_Date: "2026-05-20", Remarks: "Completed Tally" },
        { Youth_ID: "YH-2026-00009", Youth_Name: "Gopal Yadav", Father_Mother_Name: "Bihari Yadav", Mobile_Number: "9406123409", Gender: "Male", DOB_Age: "26", Category: "OBC", Qualification: "12th Pass", Occupation: "Dairy Farming", Block: "Dantewada", Gram_Panchayat: "Teknar", Village: "Teknar", Career_Interest: "Dairy Processing", Registration_Date: "2026-06-02", Remarks: "PMEGP applicant" },
        { Youth_ID: "YH-2026-00010", Youth_Name: "Shanti Poyam", Father_Mother_Name: "Dhaniram Poyam", Mobile_Number: "9406123410", Gender: "Female", DOB_Age: "21", Category: "ST", Qualification: "12th Pass", Occupation: "Unemployed", Block: "Geedam", Gram_Panchayat: "Kasoli", Village: "Kasoli", Career_Interest: "Higher Education", Registration_Date: "2026-06-10", Remarks: "Enrolled in College" }
      ],
      Mobilization: [
        { Activity_ID: "MOB-2026-0001", Date: "2026-04-05", Financial_Year: "2026-27", Month: "April", Block: "Dantewada", Gram_Panchayat: "Chitalanka", Village: "Chitalanka", Activity_Name: "Gram Sabha Youth Outreach", Male: 28, Female: 34, Other: 0, Total_Mobilized: 62, Remarks: "High participation from SHG families" },
        { Activity_ID: "MOB-2026-0002", Date: "2026-04-15", Financial_Year: "2026-27", Month: "April", Block: "Geedam", Gram_Panchayat: "Barsoor", Village: "Barsoor", Activity_Name: "Weekly Haat Bazar Mobilization", Male: 45, Female: 40, Other: 1, Total_Mobilized: 86, Remarks: "Distributed youth brochures" },
        { Activity_ID: "MOB-2026-0003", Date: "2026-05-02", Financial_Year: "2026-27", Month: "May", Block: "Katekalyan", Gram_Panchayat: "Marjum", Village: "Marjum", Activity_Name: "CLF Youth Mobilization Camp", Male: 32, Female: 38, Other: 0, Total_Mobilized: 70, Remarks: "Coordinated with NRLM" },
        { Activity_ID: "MOB-2026-0004", Date: "2026-05-18", Financial_Year: "2026-27", Month: "May", Block: "Kuakonda", Gram_Panchayat: "Nakulnar", Village: "Nakulnar", Activity_Name: "Village Chopal Mobilization", Male: 36, Female: 42, Other: 0, Total_Mobilized: 78, Remarks: "Focus on IT skills" },
        { Activity_ID: "MOB-2026-0005", Date: "2026-06-08", Financial_Year: "2026-27", Month: "June", Block: "Dantewada", Gram_Panchayat: "Teknar", Village: "Teknar", Activity_Name: "Special Mobilization Drive", Male: 24, Female: 31, Other: 0, Total_Mobilized: 55, Remarks: "Mobilized for RSETI" }
      ],
      M_Form: [
        { MForm_ID: "MF-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Mobile: "9406123401", Date: "2026-04-06", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/DAN/2026/1021", Remarks: "Verified by Sarpanch" },
        { MForm_ID: "MF-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Mobile: "9406123402", Date: "2026-04-11", Block: "Dantewada", GP: "Bhansi", Village: "Bhansi", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/DAN/2026/1045", Remarks: "All documents attached" },
        { MForm_ID: "MF-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Mobile: "9406123403", Date: "2026-04-14", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/GED/2026/0890", Remarks: "Aadhaar verified" },
        { MForm_ID: "MF-2026-0004", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Mobile: "9406123404", Date: "2026-04-20", Block: "Geedam", GP: "Haram", Village: "Haram", MForm_Status: "Pending", MForm_Reg_No: "MF/CG/GED/2026/0912", Remarks: "Passbook photocopy pending" },
        { MForm_ID: "MF-2026-0005", Youth_ID: "YH-2026-00005", Youth_Name: "Manoj Telam", Mobile: "9406123405", Date: "2026-05-04", Block: "Katekalyan", GP: "Marjum", Village: "Marjum", MForm_Status: "Submitted", MForm_Reg_No: "MF/CG/KAT/2026/0411", Remarks: "Submitted at Block office" }
      ],
      My_Bharat: [
        { MyBharat_ID: "MB-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Mobile: "9406123401", Registration_Date: "2026-04-07", Block: "Dantewada", GP: "Chitalanka", Village: "Chitalanka", MyBharat_Reg_No: "MB-CG-DAN-88129", Status: "Registered", Remarks: "Profile complete" },
        { MyBharat_ID: "MB-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Mobile: "9406123402", Registration_Date: "2026-04-12", Block: "Dantewada", GP: "Bhansi", Village: "Bhansi", MyBharat_Reg_No: "MB-CG-DAN-88155", Status: "Registered", Remarks: "Volunteering chosen" },
        { MyBharat_ID: "MB-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Mobile: "9406123403", Registration_Date: "2026-04-15", Block: "Geedam", GP: "Barsoor", Village: "Barsoor", MyBharat_Reg_No: "MB-CG-GED-77402", Status: "Registered", Remarks: "Registered via Youth Hub" },
        { MyBharat_ID: "MB-2026-0004", Youth_ID: "YH-2026-00006", Youth_Name: "Padmini Kunjam", Mobile: "9406123406", Registration_Date: "2026-05-08", Block: "Katekalyan", GP: "Tumakpal", Village: "Tumakpal", MyBharat_Reg_No: "MB-CG-KAT-55110", Status: "Registered", Remarks: "Youth Club member" },
        { MyBharat_ID: "MB-2026-0005", Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Mobile: "9406123408", Registration_Date: "2026-05-22", Block: "Kuakonda", GP: "Nakulnar", Village: "Nakulnar", MyBharat_Reg_No: "", Status: "Pending", Remarks: "OTP verification pending" }
      ],
      Counselling: [
        { Counselling_ID: "COU-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Date: "2026-04-15", Block: "Dantewada", GP: "Chitalanka", Counselling_Type: "Skill Training", Career_Interest: "Automobile", Counsellor_Name: "Sanjay Verma", Counselling_Outcome: "Recommended for Livelihood College 3-Month Cert", Recommended_Action: "Enroll in Batch 12", Follow_Up_Required: "Yes" },
        { Counselling_ID: "COU-2026-0002", Youth_ID: "YH-2026-00002", Youth_Name: "Sunita Karma", Date: "2026-04-20", Block: "Dantewada", GP: "Bhansi", Counselling_Type: "NavGurukul", Career_Interest: "Programming", Counsellor_Name: "Priyanka Sahu", Counselling_Outcome: "Eligible for NavGurukul Coding", Recommended_Action: "Appear for entrance test", Follow_Up_Required: "Yes" },
        { Counselling_ID: "COU-2026-0003", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Date: "2026-04-25", Block: "Geedam", GP: "Barsoor", Counselling_Type: "Entrepreneurship", Career_Interest: "Electrical Shop", Counsellor_Name: "Rajeshwar Rao", Counselling_Outcome: "Viable business concept", Recommended_Action: "Attend RSETI EDP training", Follow_Up_Required: "Yes" },
        { Counselling_ID: "COU-2026-0004", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Date: "2026-04-28", Block: "Geedam", GP: "Haram", Counselling_Type: "Employment", Career_Interest: "Retail", Counsellor_Name: "Priyanka Sahu", Counselling_Outcome: "Ready for direct placement", Recommended_Action: "Register with Rozgar Mela", Follow_Up_Required: "No" }
      ],
      Skill_Training: [
        { Training_Record_ID: "SKL-2026-0001", Youth_ID: "YH-2026-00001", Youth_Name: "Ramesh Kumar Mandavi", Training_Name: "Automotive Service Technician", Training_Provider: "Livelihood College", Course: "4-Wheeler Service & Repair (NSQF L4)", Start_Date: "2026-05-01", End_Date: "2026-07-31", Block: "Dantewada", GP: "Chitalanka", Training_Status: "Completed", Completion_Status: "Passed", Certificate_Status: "Issued", Employment_After_Training: "Yes" },
        { Training_Record_ID: "SKL-2026-0002", Youth_ID: "YH-2026-00003", Youth_Name: "Devendra Kashyap", Training_Name: "Entrepreneurship Development (EDP)", Training_Provider: "RSETI", Course: "Micro-Enterprise Management", Start_Date: "2026-05-10", End_Date: "2026-05-25", Block: "Geedam", GP: "Barsoor", Training_Status: "Completed", Completion_Status: "Passed", Certificate_Status: "Issued", Employment_After_Training: "Self-Employed" },
        { Training_Record_ID: "SKL-2026-0003", Youth_ID: "YH-2026-00008", Youth_Name: "Mamta Sori", Training_Name: "Financial Accounting & Tally Prime", Training_Provider: "Livelihood College", Course: "Computerized Accounting (NSQF L4)", Start_Date: "2026-06-01", End_Date: "2026-08-31", Block: "Kuakonda", GP: "Nakulnar", Training_Status: "Ongoing", Completion_Status: "In Progress", Certificate_Status: "Pending", Employment_After_Training: "Pending" }
      ],
      Employment_Registered: [
        { Emp_Reg_ID: "ER-2026-0001", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Registration_Date: "2026-04-29", Block: "Geedam", GP: "Haram", Qualification: "12th Pass", Preferred_Job: "Retail Store Executive", Registration_Status: "Active", Remarks: "Willing to relocate" },
        { Emp_Reg_ID: "ER-2026-0002", Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Registration_Date: "2026-05-16", Block: "Kuakonda", GP: "Mailawada", Qualification: "Diploma Mechanical", Preferred_Job: "Plant Technician / Fitter", Registration_Status: "Active", Remarks: "1 yr experience" }
      ],
      Employment_Linked: [
        { Emp_Link_ID: "EL-2026-0001", Youth_ID: "YH-2026-00004", Youth_Name: "Pooja Markam", Employer_Name: "Bastar Fresh Retail Mart", Job_Role: "Sales & Cashier Executive", Placement_Date: "2026-05-15", Salary: "12000", Employment_Type: "Full Time", Location: "Geedam Market", Status: "Placed" },
        { Emp_Link_ID: "EL-2026-0002", Youth_ID: "YH-2026-00007", Youth_Name: "Rakesh Baghel", Employer_Name: "NMDC Allied Contractor Services", Job_Role: "Mechanical Maintenance Assistant", Placement_Date: "2026-06-01", Salary: "16500", Employment_Type: "Full Time", Location: "Kirandul / Bacheli", Status: "Placed" }
      ],
      Education: [
        { Education_ID: "EDU-2026-0001", Youth_ID: "YH-2026-00010", Youth_Name: "Shanti Poyam", Current_Qualification: "12th Pass (Bio)", Education_Goal: "B.Sc (Forestry)", Institution_Name: "Govt. Danteshwari PG College Dantewada", Course: "Bachelor of Science", Admission_Date: "2026-06-15", Block: "Geedam", GP: "Kasoli", Status: "Admitted" }
      ],
      Entrepreneurs: [
        { Entrepreneur_ID: "ENT-2026-0001", Youth_ID: "YH-2026-00009", Name: "Gopal Yadav", Mobile: "9406123409", Block: "Dantewada", GP: "Teknar", Business_Idea: "Teknar Dairy & Ghee Unit", Stage: "Identified", Loan_Scheme: "PMEGP", Loan_Amount: "250000", Status: "In Process" },
        { Entrepreneur_ID: "ENT-2026-0002", Youth_ID: "YH-2026-00003", Name: "Devendra Kashyap", Mobile: "9406123403", Block: "Geedam", GP: "Barsoor", Business_Idea: "Barsoor Solar & Electrical Hub", Stage: "Established", Loan_Scheme: "MUDRA Kishore", Loan_Amount: "200000", Status: "Operational" }
      ],
      NavGurukul: [
        { Candidate_ID: "NG-2026-0001", Youth_ID: "YH-2026-00002", Candidate_Name: "Sunita Karma", Mobile: "9406123402", Block: "Dantewada", GP: "Bhansi", Qualification: "Graduate (BA)", Registration_Date: "2026-04-22", Selection_Status: "Admitted", Admission_Status: "Joined", Joining_Date: "2026-05-10" },
        { Candidate_ID: "NG-2026-0002", Youth_ID: "YH-2026-00006", Candidate_Name: "Padmini Kunjam", Mobile: "9406123406", Block: "Katekalyan", GP: "Tumakpal", Qualification: "12th Pass", Registration_Date: "2026-05-10", Selection_Status: "Shortlisted", Admission_Status: "Pending", Joining_Date: "" }
      ],
      Trainings: [
        { Training_ID: "TRG-2026-0001", Training_Name: "Youth Entrepreneurship & Financial Literacy Bootcamp", Training_Type: "Entrepreneurship Workshop", Date: "2026-05-20", Venue: "Youth Hub Hall, Dantewada", Block: "Dantewada", Training_Provider: "EDII & Livelihood College", Total_Participants: 60, Training_Topic: "Business Model Canvas & MUDRA" },
        { Training_ID: "TRG-2026-0002", Training_Name: "Digital Skills & Cyber Safety Workshop", Training_Type: "Skill Training", Date: "2026-06-05", Venue: "Govt Higher Secondary Barsoor", Block: "Geedam", Training_Provider: "Youth Hub Tech Fellows", Total_Participants: 60, Training_Topic: "DigiLocker & Online Jobs" }
      ],
      Activities: [
        { Activity_ID: "ACT-2026-0001", Date: "2026-04-25", Activity_Type: "M-Form Registration Camp", Activity_Name: "Special M-Form Mega Camp Chitalanka", Block: "Dantewada", GP: "Chitalanka", Participants: 75, Outcome: "42 M-Forms submitted in a single day" },
        { Activity_ID: "ACT-2026-0002", Date: "2026-05-28", Activity_Type: "Career Counselling Camp", Activity_Name: "Katekalyan Youth Guidance Session", Block: "Katekalyan", GP: "Marjum", Participants: 55, Outcome: "24 youth registered for upcoming skill batches" }
      ]
    };

    localStorage.setItem(STORAGE_KEY_LOCAL_DB, JSON.stringify(initial));
    return initial;
  }

  function saveLocalDB(db) {
    localStorage.setItem(STORAGE_KEY_LOCAL_DB, JSON.stringify(db));
  }

  /**
   * Fallback for immediate UI demo when testing offline or before configuring Apps Script URL
   */
  function mockFallback(action, payload) {
    const db = getLocalDB();

    if (action === "login") {
      const mockUser = {
        userId: "DEMO-ADMIN",
        name: "Demo Admin Dantewada",
        email: payload.email || "admin@dantewada.gov.in",
        role: "ADMIN",
        block: "All",
        youthHub: "Youth Hub Dantewada"
      };
      const token = btoa(JSON.stringify(mockUser));
      setSession(token, mockUser);
      return Promise.resolve({ success: true, token, user: mockUser });
    }

    if (action === "getTableRecords") {
      const sheetName = payload.sheetName;
      const records = db[sheetName] || [];
      return Promise.resolve({
        success: true,
        sheetName,
        records: [...records].reverse()
      });
    }

    if (action === "searchYouth") {
      const q = (payload.query || "").toLowerCase();
      const results = (db.Youth_Master || []).filter(y => 
        (y.Youth_Name || "").toLowerCase().includes(q) ||
        (y.Youth_ID || "").toLowerCase().includes(q) ||
        (y.Mobile_Number || "").includes(q) ||
        (y.Block || "").toLowerCase().includes(q)
      );
      return Promise.resolve({ success: true, results });
    }

    if (action === "getYouthProfile") {
      const y = (db.Youth_Master || []).find(x => x.Youth_ID === payload.youthId);
      if (!y) return Promise.resolve({ success: false, message: "Youth not found" });

      const mforms = (db.M_Form || []).filter(x => x.Youth_ID === y.Youth_ID);
      const mybharat = (db.My_Bharat || []).filter(x => x.Youth_ID === y.Youth_ID);
      const counselling = (db.Counselling || []).filter(x => x.Youth_ID === y.Youth_ID);
      const skill = (db.Skill_Training || []).filter(x => x.Youth_ID === y.Youth_ID);
      const empReg = (db.Employment_Registered || []).filter(x => x.Youth_ID === y.Youth_ID);
      const empLinked = (db.Employment_Linked || []).filter(x => x.Youth_ID === y.Youth_ID);
      const edu = (db.Education || []).filter(x => x.Youth_ID === y.Youth_ID);
      const ent = (db.Entrepreneurs || []).filter(x => x.Youth_ID === y.Youth_ID);
      const nav = (db.NavGurukul || []).filter(x => x.Youth_ID === y.Youth_ID);

      return Promise.resolve({
        success: true,
        profile: {
          personal: y,
          mforms, mybharat, counselling, skillTraining: skill,
          employmentRegistered: empReg, employmentLinked: empLinked,
          education: edu, entrepreneurship: ent, navgurukul: nav
        }
      });
    }

    // Handlers for adding data locally
    const formSaveMap = {
      addYouth: { sheet: "Youth_Master", idPrefix: "YH-2026-", idField: "Youth_ID" },
      addMobilization: { sheet: "Mobilization", idPrefix: "MOB-2026-", idField: "Activity_ID" },
      addMForm: { sheet: "M_Form", idPrefix: "MF-2026-", idField: "MForm_ID" },
      addMyBharat: { sheet: "My_Bharat", idPrefix: "MB-2026-", idField: "MyBharat_ID" },
      addCounselling: { sheet: "Counselling", idPrefix: "COU-2026-", idField: "Counselling_ID" },
      addSkillTraining: { sheet: "Skill_Training", idPrefix: "SKL-2026-", idField: "Training_Record_ID" },
      addEmploymentRegistered: { sheet: "Employment_Registered", idPrefix: "ER-2026-", idField: "Emp_Reg_ID" },
      addEmploymentLinked: { sheet: "Employment_Linked", idPrefix: "EL-2026-", idField: "Emp_Link_ID" },
      addEducation: { sheet: "Education", idPrefix: "EDU-2026-", idField: "Education_ID" },
      addEntrepreneur: { sheet: "Entrepreneurs", idPrefix: "ENT-2026-", idField: "Entrepreneur_ID" },
      addNavGurukul: { sheet: "NavGurukul", idPrefix: "NG-2026-", idField: "Candidate_ID" },
      addTraining: { sheet: "Trainings", idPrefix: "TRG-2026-", idField: "Training_ID" },
      addActivity: { sheet: "Activities", idPrefix: "ACT-2026-", idField: "Activity_ID" }
    };

    if (formSaveMap[action]) {
      const conf = formSaveMap[action];
      if (!db[conf.sheet]) db[conf.sheet] = [];
      const count = db[conf.sheet].length + 1;
      const newId = conf.idPrefix + ("0000" + count).slice(-4);
      const record = { ...payload, [conf.idField]: newId };
      db[conf.sheet].push(record);
      saveLocalDB(db);
      return Promise.resolve({ success: true, message: "Data saved successfully.", id: newId });
    }

    if (action === "updateRecord") {
      const { sheetName, idField, idValue, updatedData } = payload;
      if (!db[sheetName]) return Promise.resolve({ success: false, message: "Module sheet not found" });
      const idx = db[sheetName].findIndex(r => r[idField] === idValue);
      if (idx === -1) return Promise.resolve({ success: false, message: "Record not found" });
      db[sheetName][idx] = { ...db[sheetName][idx], ...updatedData };
      saveLocalDB(db);
      return Promise.resolve({ success: true, message: "Record updated successfully." });
    }

    if (action === "deleteRecord") {
      const { sheetName, idField, idValue } = payload;
      if (!db[sheetName]) return Promise.resolve({ success: false, message: "Module sheet not found" });
      db[sheetName] = db[sheetName].filter(r => r[idField] !== idValue);
      saveLocalDB(db);
      return Promise.resolve({ success: true, message: "Record deleted successfully." });
    }

    if (action === "getDashboard") {
      const totMob = (db.Mobilization || []).reduce((acc, m) => acc + (Number(m.Total_Mobilized) || 0), 0);
      return Promise.resolve({
        success: true,
        kpis: {
          totalMobilized: totMob,
          mForm: (db.M_Form || []).length,
          myBharat: (db.My_Bharat || []).length,
          careerCounselling: (db.Counselling || []).length,
          skillTraining: (db.Skill_Training || []).length,
          employmentLinked: (db.Employment_Linked || []).length,
          educationLinked: (db.Education || []).length,
          entrepreneursIdentified: (db.Entrepreneurs || []).filter(e => e.Stage !== "Established").length,
          entrepreneursEstablished: (db.Entrepreneurs || []).filter(e => e.Stage === "Established").length,
          employmentRegistered: (db.Employment_Registered || []).length,
          navgurukul: (db.NavGurukul || []).length,
          trainingConducted: (db.Trainings || []).length,
          youthMasterTotal: (db.Youth_Master || []).length
        },
        charts: {
          monthlyMobilization: { labels: ["April", "May", "June", "July", "August", "September"], values: [148, 148, 55, 0, 0, 0] },
          blockPerformance: {
            labels: ["Dantewada", "Geedam", "Katekalyan", "Kuakonda"],
            mobilized: [117, 86, 70, 78], youthRegistered: [3, 3, 2, 2], mform: [2, 2, 1, 0], placed: [0, 1, 0, 1]
          },
          youthFunnel: {
            labels: ["Mobilized", "Youth Master", "M-Form", "My Bharat", "Counselling", "Skill Training", "Emp Linked", "Entrepreneurs Est."],
            data: [totMob, (db.Youth_Master || []).length, (db.M_Form || []).length, (db.My_Bharat || []).length, (db.Counselling || []).length, (db.Skill_Training || []).length, (db.Employment_Linked || []).length, (db.Entrepreneurs || []).filter(e => e.Stage === "Established").length]
          },
          skillProviders: { labels: ["Livelihood College", "RSETI"], values: [2, 1] },
          employmentComparison: {
            labels: ["Dantewada", "Geedam", "Katekalyan", "Kuakonda"],
            registered: [0, 1, 0, 1], linked: [0, 1, 0, 1]
          },
          educationGoals: { labels: ["B.Sc (Forestry)"], values: [1] },
          entrepreneursPipeline: { labels: ["Identified", "Business Plan", "Loan Applied", "Loan Approved", "Established"], counts: [2, 2, 2, 1, 1] },
          navgurukulPipeline: { labels: ["Registered", "Shortlisted", "Selected", "Admitted"], counts: [2, 1, 1, 1] },
          trainingConductedTrend: { labels: ["May", "June"], events: [1, 1], participants: [60, 60] },
          topGps: { labels: ["Barsoor", "Nakulnar", "Marjum", "Chitalanka", "Teknar"], values: [86, 78, 70, 62, 55] }
        }
      });
    }

    if (action === "getReport") {
      const records = db.Youth_Master || [];
      return Promise.resolve({
        success: true,
        report: {
          title: "Comprehensive Youth Master Directory",
          headers: ["Youth ID", "Name", "Mobile", "Block", "Gram Panchayat", "Qualification"],
          rows: records.map(r => [r.Youth_ID, r.Youth_Name, r.Mobile_Number, r.Block, r.Gram_Panchayat, r.Qualification])
        }
      });
    }

    return Promise.resolve({ success: true, message: "Operation completed." });
  }

  return {
    call,
    getToken,
    setSession,
    clearSession,
    getCurrentUser,
    getApiUrl,
    setApiUrl,
    isAppsScriptEnvironment
  };
})();
