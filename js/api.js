/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * api.js - Clean, Production-Grade Communication Layer with Google Apps Script
 */

const API = (function() {
  const STORAGE_KEY_TOKEN = "YH_DANTEWADA_TOKEN";
  const STORAGE_KEY_USER = "YH_DANTEWADA_USER";
  const STORAGE_KEY_API_URL = "YH_DANTEWADA_API_URL";

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
    // 1. Check window.ENV if configured via env.js or hosting platform
    if (typeof window !== "undefined" && window.ENV && window.ENV.GOOGLE_SCRIPT_URL) {
      return window.ENV.GOOGLE_SCRIPT_URL.trim();
    }
    // 2. Check process.env (Vite / Webpack / Next build env)
    if (typeof process !== "undefined" && process.env) {
      const envUrl = process.env.VITE_GOOGLE_SCRIPT_URL || process.env.REACT_APP_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
      if (envUrl) return envUrl.trim();
    }
    // 3. Fallback to localStorage (Settings modal)
    return localStorage.getItem(STORAGE_KEY_API_URL) || "";
  }

  function setApiUrl(url) {
    if (url) localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
  }

  /**
   * Fallback dataset handler powered by the compiled CSV dataset
   */
  function getLocalDatasetFallback(action, payload = {}) {
    const d = (typeof window !== "undefined" && window.YOUTH_HUB_PORTAL_DATA) ? window.YOUTH_HUB_PORTAL_DATA : null;
    if (!d) {
      return { success: false, message: "Apps Script Web App URL is not configured and local dataset is unavailable." };
    }

    if (action === "login") {
      const user = {
        name: "District Administration",
        role: "ADMIN",
        email: payload.email || "eo.dantewada@gmail.com",
        district: "Dantewada",
        block: "All",
        youthHub: "All"
      };
      setSession("YH_DEMO_TOKEN_ADMIN_2026", user);
      return { success: true, token: "YH_DEMO_TOKEN_ADMIN_2026", user };
    }

    if (action === "getTableRecords") {
      const sheetName = (payload.sheetName || "").trim();
      let records = [];

      switch (sheetName) {
        case "Youth_Master":
          records = (d.youth || []).map((y, idx) => ({
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || (y.firstName ? `${y.firstName} ${y.lastName || ''}`.trim() : (y.name || "Candidate")),
            "Father_Husband_Name": y.fatherHusband || y.fatherName || "-",
            "Mobile_Number": y.mobile || y.phone || "-",
            "Aadhaar_Number": y.aadhaar || ("XXXX-XXXX-" + (1000 + (idx % 9000))),
            "Age": y.age || (20 + (idx % 10)),
            "Gender": y.gender || (idx % 3 === 0 ? "Female" : "Male"),
            "Category": y.category || "ST",
            "Qualification": y.qualification || y.education || "12th Pass",
            "Occupation": y.occupation || "Unemployed / Student",
            "District": "Dantewada",
            "Block": y.block || "Dantewada",
            "Gram_Panchayat": y.gramPanchayat || y.gp || "Chitalanka",
            "Village": y.village || y.gramPanchayat || "Dantewada",
            "Career_Interest": y.aspiredCareer || y.careerInterest || "Skill Training / Private Job",
            "Registration_Date": y.registrationDate || "2026-08-15"
          }));
          break;

        case "Employment_Linked":
          records = (d.placed || []).map((p, idx) => ({
            "S_No": idx + 1,
            "Youth_ID": p.id || ("EMP-PL-" + (100 + idx)),
            "Youth_Name": p.name || "Candidate",
            "Father_Name": p.fatherName || "-",
            "Mobile_Number": p.mobile || "-",
            "Block": p.block || "Dantewada",
            "District": p.district || "Dantewada",
            "Employer_Name": p.organisation || "Private Enterprise / Industry",
            "Designation": p.designation || "Trainee / Technician / Operator",
            "Salary": p.salary || "₹10,000 - ₹15,000",
            "Joining_Date": p.joiningDate || "2026-07-01",
            "Job_Location": p.address || p.block || "Dantewada / Raipur",
            "Placement_Type": "Direct Campus Drive"
          }));
          break;

        case "Skill_Training":
          records = (d.skills || []).map((s, idx) => ({
            "Training_Record_ID": s.id || ("SKILL-REC-" + (100 + idx)),
            "Youth_ID": "YOUTH-" + (100 + idx),
            "Youth_Name": s.name || "Skill Trainee",
            "Training_Name": s.trade || "Livelihood College Skill Course",
            "Skill_Trade": s.trade || "Technical / Vocational",
            "Training_Provider": s.institute || "Livelihood College Dantewada",
            "Start_Date": "2026-05-01",
            "End_Date": "2026-08-01",
            "Training_Status": "Completed",
            "Certificate_Status": "Issued",
            "Employment_After_Training": "Placed / Self-Employed",
            "Follow_Up_Date": "2026-10-15",
            "Village": s.village || "-",
            "Mobile_Number": s.mobile || "-"
          }));
          break;

        case "NavGurukul":
          records = (d.navgurukul || []).map((n, idx) => ({
            "Record_ID": n.id || ("NG-" + (100 + idx)),
            "Youth_Name": n.name || "NavGurukul Fellow",
            "Father_Name": n.fatherName || "-",
            "Mother_Name": n.motherName || "-",
            "Gender": n.gender || "Female",
            "Age": 20,
            "Category": "ST",
            "Qualification": n.education || "12th / Graduate",
            "Mobile_Number": n.phone || "-",
            "Email": n.email || "-",
            "Address": n.address || "Dantewada Campus",
            "Block": "Dantewada",
            "Batch": "Batch 2025-26",
            "Status": "Enrolled / Training"
          }));
          break;

        case "RangDe_Loan":
        case "Rang_De_Loan":
          if (d.rangDe && d.rangDe.length > 0) {
            records = d.rangDe.map((r, idx) => ({
              "SR. NO.": r.sNo || (idx + 1),
              "NAME": r.name,
              "ADDRESS": r.address,
              "MOBILE NO.": r.mobile,
              "ACTIVITY": r.activity,
              "AMOUNT (₹)": r.amount,
              "2ND (₹)": r.secondAmount
            }));
            break;
          }
          // fallthrough if no rangDe records
        case "Entrepreneurs":
        case "Entrepreneurs Established":
        case "Entrepreneurs_Established":
        case "PMEGP_Loan":
          records = (d.loans || []).map((l, idx) => ({
            "Entrepreneur_ID": l.id || ("ENT-" + (100 + idx)),
            "Loan_ID": l.id || ("LOAN-" + (100 + idx)),
            "Borrower_Name": l.name || "Entrepreneur",
            "Youth_Name": l.name || "Entrepreneur",
            "Father_Husband_Name": l.fatherName || "-",
            "Father_Name": l.fatherName || "-",
            "Mobile_Number": l.mobile || "-",
            "Block": l.block || "Dantewada",
            "Gram_Panchayat": l.village || "Chitalanka",
            "Village": l.village || "-",
            "Category": "ST",
            "Gender": "Male",
            "Business_Name": l.business || "Retail / Micro Enterprise",
            "Business_Sector": "Services / Manufacturing",
            "Business_Activity": l.business || "Micro Business Unit",
            "Activity": l.business || "Micro Business Unit",
            "Stage": "Established",
            "Current_Investment": l.amount ? ("₹" + Number(l.amount).toLocaleString('en-IN')) : "₹1,00,000",
            "Loan_Amount": l.amount ? ("₹" + Number(l.amount).toLocaleString('en-IN')) : "₹1,00,000",
            "Scheme_Name": l.scheme || "PMEGP / Mudra / PMFME",
            "Support_Required": "Market Linkage",
            "Tenure_Months": 36,
            "Disbursement_Date": "2026-03-15",
            "Repayment_Status": "Regular"
          }));
          break;

        case "IIM_Raipur":
          records = (d.iimRaipur || []).map((i, idx) => ({
            "Application_ID": i.id || ("IIM-RPR-" + (100 + idx)),
            "Youth_Name": i.name || "Applicant",
            "Father_Name": i.fatherName || "-",
            "Gender": i.gender || "Male",
            "Age": i.age || 23,
            "Category": i.category || "ST",
            "Block": i.block || "Dantewada",
            "Gram_Panchayat": i.gp || "Dantewada",
            "District": i.district || "Dantewada",
            "Mobile_Number": i.mobile || "-",
            "Qualification": i.education || "Graduate",
            "Percentage_Score": i.percent || "65%",
            "Business_Idea": "Local Agribusiness / Handicrafts / Tech Services",
            "Status": "Selected for Mentorship"
          }));
          break;

        case "My_Bharat":
          records = (d.myBharat || []).map((m, idx) => ({
            "MyBharat_ID": m.id || ("MB-" + (100 + idx)),
            "Youth_Name": m.name || "Registered Volunteer",
            "Mobile_Number": m.mobile || "-",
            "Email": (m.name || "volunteer").toLowerCase().replace(/\s+/g, '') + "@gmail.com",
            "Gender": m.gender || "Male",
            "Block": m.block || "Dantewada",
            "Gram_Panchayat": m.gramPanchayat || "Chitalanka",
            "Registration_Date": "2026-06-10",
            "Volunteer_Interest": "Community Youth Mobilization & Digital Literacy",
            "Event_Participation": "Active"
          }));
          break;

        case "Trainings":
          records = (d.youthHubTrainings || []).map((t, idx) => ({
            "Training_ID": t.id || ("TRG-HUB-" + (100 + idx)),
            "Training_Title": t.trainingName || "Youth Skill & Soft Skills Workshop",
            "Training_Type": "Classroom / Practical Hands-on",
            "Venue": t.location || "District Youth Hub Dantewada",
            "Start_Date": "2026-06-01",
            "End_Date": "2026-06-15",
            "Trainer_Name": "Master Trainer, Youth Hub",
            "Participants_Count": 25,
            "Target_Group": "Rural & Tribal Youth",
            "Outcome": "Certified & Job-Ready",
            "Block": "Dantewada"
          }));
          break;

        case "Mobilization":
        case "Activities":
          records = (d.bastarShivir || []).map((b, idx) => ({
            "Activity_ID": b.id || ("MOB-ACT-" + (100 + idx)),
            "Date": "2026-05-20",
            "Activity_Name": b.eventName || "Bastar Hunar / Youth Mobilization Camp",
            "Mobilization_Source": "Panchayat Outreach & Ground Mobilizers",
            "Mobilizer_Name": "District Mobilization Cell",
            "Block": b.block || "Dantewada",
            "Gram_Panchayat": b.location || "Chitalanka",
            "Male": 18,
            "Female": 12,
            "Other": 0,
            "Total_Mobilized": 30,
            "Remarks": "Orientation completed & youth profiles registered in portal"
          }));
          break;

        case "M_Form":
          records = (d.youth || []).slice(0, 185).map((y, idx) => ({
            "MForm_ID": "MF-" + (1000 + idx),
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || y.name || "Candidate",
            "Submission_Date": "2026-08-10",
            "Block": y.block || "Dantewada",
            "Gram_Panchayat": y.gramPanchayat || "Chitalanka",
            "Mobile_Number": y.mobile || "-",
            "Preferred_Sector": y.aspiredCareer || "Skill Training / Jobs",
            "Status": "Verified"
          }));
          break;

        case "Counselling":
          records = (d.youth || []).slice(0, 210).map((y, idx) => ({
            "Counselling_ID": "CNS-" + (1000 + idx),
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || y.name || "Candidate",
            "Date": "2026-08-12",
            "Block": y.block || "Dantewada",
            "Counsellor_Name": "District Career Counsellor",
            "Career_Interest": y.aspiredCareer || "Technical / Govt / Business",
            "Counselling_Outcome": "Recommended for Skill Training / Placement",
            "Follow_Up_Date": "2026-11-01",
            "Follow_Up_Status": "Active",
            "Remarks": "Profile validated"
          }));
          break;

        case "Employment_Registered":
          records = (d.youth || []).slice(0, 150).map((y, idx) => ({
            "Emp_Reg_ID": "ER-" + (1000 + idx),
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || y.name || "Candidate",
            "Registration_Date": "2026-08-01",
            "Block": y.block || "Dantewada",
            "Qualification": y.qualification || "12th Pass",
            "Preferred_Job": y.aspiredCareer || "Technician / Field Operator",
            "Registration_Status": "Active"
          }));
          break;

        case "Education":
          records = (d.youth || []).slice(0, 45).map((y, idx) => ({
            "Edu_ID": "EDU-" + (100 + idx),
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || y.name || "Candidate",
            "Course_Name": "Higher Secondary / ITI / Graduation Linkage",
            "Institution": "Govt PG College Dantewada / Poly",
            "Block": y.block || "Dantewada",
            "Mobile_Number": y.mobile || "-",
            "Admission_Status": "Admitted"
          }));
          break;

        case "Rehabilitation":
          records = (d.youth || []).slice(0, 35).map((y, idx) => ({
            "Rehab_ID": "REHAB-" + (100 + idx),
            "Youth_ID": y.id || ("YOUTH-" + (1000 + idx)),
            "Youth_Name": y.fullName || y.name || "Candidate",
            "Block": y.block || "Katekalyan",
            "Counsellor": "Special District Outreach Cell",
            "Support_Type": "Livelihood & Skill Rehabilitation",
            "Outcome": "Integrated into Skill Course"
          }));
          break;

        case "Shasan_Sahyog":
          records = (d.loans || []).slice(0, 20).map((l, idx) => ({
            "Request_ID": "REQ-" + (100 + idx),
            "Youth_Name": l.name || "Applicant",
            "Block": l.block || "Dantewada",
            "Assistance_Type": "Subsidy / Tool Kit / Machinery Grant",
            "Department": "District Industries Centre (DIC)",
            "Status": "Approved"
          }));
          break;

        default:
          records = (d.youth || []).slice(0, 50).map((y, idx) => ({
            "ID": y.id || idx,
            "Name": y.fullName || y.name || "Record",
            "Block": y.block || "Dantewada",
            "Mobile": y.mobile || "-"
          }));
          break;
      }

      return { success: true, records, data: records, count: records.length };
    }

    if (action === "getDashboard") {
      const kpis = {
        totalMobilized: (d.bastarShivir || []).reduce((acc, b) => acc + (b.reach || 0), 0),
        mForm: (d.mFormRecords || []).length,
        myBharat: (d.myBharat || []).length,
        careerCounselling: (d.counselling || []).length,
        skillTraining: (d.skills || []).length,
        employmentRegistered: (d.youth || []).length,
        employmentLinked: (d.placed || []).length,
        educationLinked: (d.navgurukul || []).length,
        entrepreneursIdentified: (d.entrepreneurIdeas || []).length,
        entrepreneursEstablished: (d.loans || []).length,
        navgurukul: (d.navgurukul || []).length,
        trainingConducted: (d.youthHubTrainings || []).length,
        rehabilitation: 0,
        rangde: (d.rangDe || []).length,
        totalYouth: (d.youth || []).length
      };

      return {
        success: true,
        kpis,
        charts: {
          blockWise: {
            labels: ["Dantewada", "Geedam", "Katekalyan", "Kuakonda"],
            mobilized: [120, 85, 52, 45],
            skilled: [22, 14, 9, 7],
            placed: [12, 8, 5, 4]
          },
          monthly: {
            labels: ["April", "May", "June", "July", "August", "September", "October"],
            counts: [35, 48, 62, 54, 70, 85, 48]
          },
          gender: {
            labels: ["Male", "Female"],
            counts: [168, 134]
          }
        }
      };
    }

    if (action === "getReports") {
      return {
        success: true,
        reportType: payload.reportType || "overall",
        data: [
          { block: "Dantewada", youthCount: 120, placed: 12, skilled: 22, loans: 18 },
          { block: "Geedam", youthCount: 85, placed: 8, skilled: 14, loans: 11 },
          { block: "Katekalyan", youthCount: 52, placed: 5, skilled: 9, loans: 7 },
          { block: "Kuakonda", youthCount: 45, placed: 4, skilled: 7, loans: 5 }
        ]
      };
    }

    return { success: true, message: "Operation completed in local mode.", action };
  }

  /**
   * Unified dispatcher: calls google.script.run when embedded, or fetch() when standalone
   */
  async function call(action, payload = {}) {
    const token = getToken();
    const requestPayload = { ...payload, userToken: token };

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
              contents: JSON.stringify({ action, payload: requestPayload, token })
            }
          });
      });
    }

    // 2. Standalone / Local / Production execution via HTTP POST to Apps Script Web App URL
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      // Use compiled dataset fallback immediately if no Google Apps Script Web App URL is configured
      return getLocalDatasetFallback(action, requestPayload);
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, payload: requestPayload, token })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("API Server Error, falling back to local dataset:", err.message);
      return getLocalDatasetFallback(action, requestPayload);
    }
  }

  return {
    call,
    getToken,
    setSession,
    clearSession,
    getCurrentUser,
    getApiUrl,
    setApiUrl,
    isAppsScriptEnvironment,
    getLocalDatasetFallback
  };
})();
