/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Reports.gs - Consolidated Reporting Engine & 360-Degree Youth Profile Journey
 */

/**
 * Returns customized dataset for any report type with filters applied
 */
function getReportData(reportType, filters, userToken) {
  var user = verifySessionToken(userToken);
  filters = filters || {};
  
  if (user && user.role === ROLES.BLOCK_USER && user.block && user.block !== "All") {
    filters.block = user.block;
  }
  
  var result = {
    title: "",
    headers: [],
    rows: []
  };

  function matchCommonFilters(r, dateField, blockField, gpField) {
    if (filters.block && filters.block !== "All") {
      var bVal = String(r[blockField || "Block"] || "");
      if (bVal.toLowerCase() !== filters.block.toLowerCase()) return false;
    }
    if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
      var gpVal = String(r[gpField || "GP"] || r["Gram_Panchayat"] || "");
      if (gpVal.toLowerCase() !== filters.gramPanchayat.toLowerCase()) return false;
    }
    var dStr = r[dateField || "Date"] || r["Registration_Date"] || r["Start_Date"];
    if (dStr && (filters.financialYear && filters.financialYear !== "All" || filters.month && filters.month !== "All")) {
      var dt = new Date(dStr);
      if (!isNaN(dt.getTime())) {
        if (filters.financialYear && filters.financialYear !== "All") {
          var fy = r["Financial_Year"] || getFinancialYear(dt);
          if (fy !== filters.financialYear) return false;
        }
        if (filters.month && filters.month !== "All") {
          var mo = r["Month"] || DANTEWADA_CONFIG.MONTHS[dt.getMonth()];
          if (mo.toLowerCase() !== filters.month.toLowerCase()) return false;
        }
      }
    }
    return true;
  }

  switch (reportType) {
    case "overall":
    case "youth_master":
      result.title = "Youth Master Comprehensive Directory";
      result.headers = ["Youth ID", "Name", "Parent Name", "Mobile", "Gender", "Category", "Qualification", "Block", "Gram Panchayat", "Village", "Career Interest", "Reg Date"];
      var allYouth = getSheetRows(SHEET_NAMES.YOUTH_MASTER).filter(function(r) {
        return matchCommonFilters(r, "Registration_Date", "Block", "Gram_Panchayat");
      });
      result.rows = allYouth.map(function(y) {
        return [y.Youth_ID, y.Youth_Name, y.Father_Mother_Name, y.Mobile_Number, y.Gender, y.Category, y.Qualification, y.Block, y.Gram_Panchayat, y.Village, y.Career_Interest, y.Registration_Date];
      });
      break;

    case "block_wise":
      result.title = "Block-Wise Consolidated Monitoring Report";
      result.headers = ["Block Name", "Total Mobilized", "Youth Registered", "M-Form Submitted", "My Bharat", "Counselling", "Skill Trained", "Employment Linked", "Entrepreneurs Est."];
      var blocks = Object.keys(DANTEWADA_CONFIG.BLOCKS);
      if (filters.block && filters.block !== "All") {
        blocks = [filters.block];
      }
      var mobAll = getSheetRows(SHEET_NAMES.MOBILIZATION);
      var youthAll = getSheetRows(SHEET_NAMES.YOUTH_MASTER);
      var mformAll = getSheetRows(SHEET_NAMES.M_FORM);
      var mbAll = getSheetRows(SHEET_NAMES.MY_BHARAT);
      var couAll = getSheetRows(SHEET_NAMES.COUNSELLING);
      var skillAll = getSheetRows(SHEET_NAMES.SKILL_TRAINING);
      var empAll = getSheetRows(SHEET_NAMES.EMP_LINKED);
      var entAll = getSheetRows(SHEET_NAMES.ENTREPRENEURS);

      result.rows = blocks.map(function(b) {
        var bMob = mobAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); })
          .reduce(function(acc, cur) { return acc + (Number(cur.Total_Mobilized) || 0); }, 0);
        var bYouth = youthAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bMform = mformAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bMb = mbAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bCou = couAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bSkill = skillAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bEmp = empAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
        var bEnt = entAll.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase() && (r.Stage === "Established" || r.Establishment_Date); }).length;
        return [b, bMob, bYouth, bMform, bMb, bCou, bSkill, bEmp, bEnt];
      });
      break;

    case "gp_wise":
      result.title = "Gram Panchayat Wise Progress Report";
      result.headers = ["Block", "Gram Panchayat", "Total Mobilized", "M-Forms", "Skill Candidates", "Placed Youths"];
      var mobGPs = getSheetRows(SHEET_NAMES.MOBILIZATION).filter(function(r) { return matchCommonFilters(r, "Date", "Block", "Gram_Panchayat"); });
      var mfGPs = getSheetRows(SHEET_NAMES.M_FORM).filter(function(r) { return matchCommonFilters(r, "Date", "Block", "GP"); });
      var skGPs = getSheetRows(SHEET_NAMES.SKILL_TRAINING).filter(function(r) { return matchCommonFilters(r, "Start_Date", "Block", "GP"); });
      var elGPs = getSheetRows(SHEET_NAMES.EMP_LINKED).filter(function(r) { return matchCommonFilters(r, "Placement_Date", "Block", "GP"); });

      var gpGrouping = {};
      mobGPs.forEach(function(r) {
        var key = (r.Block || "") + "___" + (r.Gram_Panchayat || "");
        if (!gpGrouping[key]) gpGrouping[key] = { block: r.Block, gp: r.Gram_Panchayat, mob: 0, mf: 0, sk: 0, el: 0 };
        gpGrouping[key].mob += (Number(r.Total_Mobilized) || 0);
      });
      mfGPs.forEach(function(r) {
        var key = (r.Block || "") + "___" + (r.GP || "");
        if (!gpGrouping[key]) gpGrouping[key] = { block: r.Block, gp: r.GP, mob: 0, mf: 0, sk: 0, el: 0 };
        gpGrouping[key].mf += 1;
      });
      skGPs.forEach(function(r) {
        var key = (r.Block || "") + "___" + (r.GP || "");
        if (!gpGrouping[key]) gpGrouping[key] = { block: r.Block, gp: r.GP, mob: 0, mf: 0, sk: 0, el: 0 };
        gpGrouping[key].sk += 1;
      });
      elGPs.forEach(function(r) {
        var key = (r.Block || "") + "___" + (r.GP || "");
        if (!gpGrouping[key]) gpGrouping[key] = { block: r.Block, gp: r.GP, mob: 0, mf: 0, sk: 0, el: 0 };
        gpGrouping[key].el += 1;
      });

      result.rows = Object.values(gpGrouping).map(function(item) {
        return [item.block, item.gp, item.mob, item.mf, item.sk, item.el];
      });
      break;

    case "employment":
      result.title = "Employment Linkage & Placement Report";
      result.headers = ["Link ID", "Youth ID", "Youth Name", "Employer Name", "Job Role", "Placement Date", "Monthly Salary (₹)", "Job Type", "Location", "Status"];
      var elRows = getSheetRows(SHEET_NAMES.EMP_LINKED).filter(function(r) { return matchCommonFilters(r, "Placement_Date", "Block", "GP"); });
      result.rows = elRows.map(function(r) {
        return [r.Emp_Link_ID, r.Youth_ID, r.Youth_Name, r.Employer_Name, r.Job_Role, r.Placement_Date, r.Salary, r.Employment_Type, r.Location, r.Status];
      });
      break;

    case "skill_training":
      result.title = "Skill Training & Certification Report";
      result.headers = ["Record ID", "Youth ID", "Youth Name", "Training Provider", "Course", "Start Date", "End Date", "Status", "Completion", "Certificate Issued", "Employment Linked"];
      var skRows = getSheetRows(SHEET_NAMES.SKILL_TRAINING).filter(function(r) { return matchCommonFilters(r, "Start_Date", "Block", "GP"); });
      result.rows = skRows.map(function(r) {
        return [r.Training_Record_ID, r.Youth_ID, r.Youth_Name, r.Training_Provider, r.Course, r.Start_Date, r.End_Date, r.Training_Status, r.Completion_Status, r.Certificate_Status, r.Employment_After_Training];
      });
      break;

    case "entrepreneurship":
      result.title = "Entrepreneurship & Micro-Enterprise Report";
      result.headers = ["ID", "Youth ID", "Name", "Mobile", "Block", "Business Idea", "Category", "Loan Scheme", "Loan Amount", "Stage", "Status"];
      var entRows = getSheetRows(SHEET_NAMES.ENTREPRENEURS).filter(function(r) { return matchCommonFilters(r, "Identification_Date", "Block", "GP"); });
      result.rows = entRows.map(function(r) {
        return [r.Entrepreneur_ID, r.Youth_ID, r.Name, r.Mobile, r.Block, r.Business_Idea || r.Business_Name, r.Business_Category || r.Business_Type, r.Loan_Scheme, r.Loan_Amount, r.Stage, r.Status];
      });
      break;

    case "navgurukul":
      result.title = "NavGurukul Software Fellowship Report";
      result.headers = ["Candidate ID", "Youth ID", "Name", "Mobile", "Block", "GP", "Qualification", "Reg Date", "Selection Status", "Admission Status", "Joining Date"];
      var navRows = getSheetRows(SHEET_NAMES.NAVGURUKUL).filter(function(r) { return matchCommonFilters(r, "Registration_Date", "Block", "GP"); });
      result.rows = navRows.map(function(r) {
        return [r.Candidate_ID, r.Youth_ID, r.Candidate_Name, r.Mobile, r.Block, r.GP, r.Qualification, r.Registration_Date, r.Selection_Status, r.Admission_Status, r.Joining_Date];
      });
      break;

    case "training_activity":
      result.title = "Trainings Conducted & Capacity Building Report";
      result.headers = ["Training ID", "Training Name", "Date", "Venue", "Block", "Provider", "Trainer", "Male", "Female", "Total Participants", "Topic", "Outcome"];
      var trRows = getSheetRows(SHEET_NAMES.TRAININGS).filter(function(r) { return matchCommonFilters(r, "Date", "Block", "GP"); });
      result.rows = trRows.map(function(r) {
        return [r.Training_ID, r.Training_Name, r.Date, r.Venue, r.Block, r.Training_Provider, r.Trainer_Name, r.Male_Participants, r.Female_Participants, r.Total_Participants, r.Training_Topic, r.Outcome];
      });
      break;

    default:
      // Default to Mobilization
      result.title = "Youth Mobilization Events Report";
      result.headers = ["Activity ID", "Date", "Financial Year", "Month", "Block", "Gram Panchayat", "Village", "Activity Name", "Male", "Female", "Total Mobilized", "Remarks"];
      var mobRows = getSheetRows(SHEET_NAMES.MOBILIZATION).filter(function(r) { return matchCommonFilters(r, "Date", "Block", "Gram_Panchayat"); });
      result.rows = mobRows.map(function(r) {
        return [r.Activity_ID, r.Date, r.Financial_Year, r.Month, r.Block, r.Gram_Panchayat, r.Village, r.Activity_Name, r.Male, r.Female, r.Total_Mobilized, r.Remarks];
      });
      break;
  }

  // Audit report generation
  if (user) {
    writeAuditLogDirect(user.email, user.role, "EXPORT", "Reports", reportType, "Generated report: " + result.title);
  }

  return { success: true, report: result };
}

/**
 * 360-Degree Complete Youth Profile Journey
 * Fetches all timeline entries linked to this unique Youth_ID
 */
function getYouthFullProfile(youthId, userToken) {
  var user = verifySessionToken(userToken);
  if (!youthId) return { success: false, message: "Youth ID required." };
  
  var youthList = getSheetRows(SHEET_NAMES.YOUTH_MASTER);
  var youth = null;
  for (var i = 0; i < youthList.length; i++) {
    if (String(youthList[i].Youth_ID).trim().toLowerCase() === String(youthId).trim().toLowerCase()) {
      youth = youthList[i];
      break;
    }
  }
  
  if (!youth) {
    return { success: false, message: "Youth profile not found for ID: " + youthId };
  }
  
  var mforms = getSheetRows(SHEET_NAMES.M_FORM).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var mybharat = getSheetRows(SHEET_NAMES.MY_BHARAT).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var counselling = getSheetRows(SHEET_NAMES.COUNSELLING).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var skill = getSheetRows(SHEET_NAMES.SKILL_TRAINING).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var empReg = getSheetRows(SHEET_NAMES.EMP_REGISTERED).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var empLinked = getSheetRows(SHEET_NAMES.EMP_LINKED).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var education = getSheetRows(SHEET_NAMES.EDUCATION).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var entrepreneur = getSheetRows(SHEET_NAMES.ENTREPRENEURS).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });
  var navgurukul = getSheetRows(SHEET_NAMES.NAVGURUKUL).filter(function(r) { return String(r.Youth_ID) === youth.Youth_ID; });

  return {
    success: true,
    profile: {
      personal: youth,
      mforms: mforms,
      mybharat: mybharat,
      counselling: counselling,
      skillTraining: skill,
      employmentRegistered: empReg,
      employmentLinked: empLinked,
      education: education,
      entrepreneurship: entrepreneur,
      navgurukul: navgurukul
    }
  };
}
