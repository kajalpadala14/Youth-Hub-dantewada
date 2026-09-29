/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Dashboard.gs - Dynamic Analytics Engine, KPI Aggregations & Charts Data
 */

/**
 * Main dashboard data provider: computes all 12 KPIs and 10 Charts dynamically
 * filters: { financialYear, month, block, youthHub, gramPanchayat, activityType }
 */
function getDashboardData(filters, userToken) {
  var user = verifySessionToken(userToken);
  filters = filters || {};
  
  // If BLOCK USER, restrict block filter strictly to their assigned block
  if (user && user.role === ROLES.BLOCK_USER && user.block && user.block !== "All") {
    filters.block = user.block;
  }
  
  // Fetch required datasets
  var youth = getSheetRows(SHEET_NAMES.YOUTH_MASTER);
  var mobilization = getSheetRows(SHEET_NAMES.MOBILIZATION);
  var mform = getSheetRows(SHEET_NAMES.M_FORM);
  var mybharat = getSheetRows(SHEET_NAMES.MY_BHARAT);
  var counselling = getSheetRows(SHEET_NAMES.COUNSELLING);
  var skill = getSheetRows(SHEET_NAMES.SKILL_TRAINING);
  var empReg = getSheetRows(SHEET_NAMES.EMP_REGISTERED);
  var empLinked = getSheetRows(SHEET_NAMES.EMP_LINKED);
  var education = getSheetRows(SHEET_NAMES.EDUCATION);
  var entrepreneurs = getSheetRows(SHEET_NAMES.ENTREPRENEURS);
  var navgurukul = getSheetRows(SHEET_NAMES.NAVGURUKUL);
  var trainings = getSheetRows(SHEET_NAMES.TRAININGS);
  var activities = getSheetRows(SHEET_NAMES.ACTIVITIES);

  // Helper row filter
  function matchFilters(row, dateField, blockField, gpField) {
    if (filters.block && filters.block !== "All") {
      var bVal = String(row[blockField || "Block"] || "");
      if (bVal.toLowerCase() !== filters.block.toLowerCase()) return false;
    }
    if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
      var gpVal = String(row[gpField || "GP"] || row["Gram_Panchayat"] || "");
      if (gpVal.toLowerCase() !== filters.gramPanchayat.toLowerCase()) return false;
    }
    
    // Check FY and Month if date is present
    var dStr = row[dateField || "Date"] || row["Registration_Date"] || row["Start_Date"];
    if (dStr) {
      var dt = new Date(dStr);
      if (!isNaN(dt.getTime())) {
        if (filters.financialYear && filters.financialYear !== "All") {
          var rowFY = row["Financial_Year"] || getFinancialYear(dt);
          if (rowFY !== filters.financialYear) return false;
        }
        if (filters.month && filters.month !== "All") {
          var monthNames = DANTEWADA_CONFIG.MONTHS;
          var rowMonth = row["Month"] || monthNames[dt.getMonth()];
          if (rowMonth.toLowerCase() !== filters.month.toLowerCase()) return false;
        }
      }
    }
    return true;
  }

  // Filter datasets
  var filteredMob = mobilization.filter(function(r) { return matchFilters(r, "Date", "Block", "Gram_Panchayat"); });
  var filteredYouth = youth.filter(function(r) { return matchFilters(r, "Registration_Date", "Block", "Gram_Panchayat"); });
  var filteredMForm = mform.filter(function(r) { return matchFilters(r, "Date", "Block", "GP"); });
  var filteredMyBharat = mybharat.filter(function(r) { return matchFilters(r, "Registration_Date", "Block", "GP"); });
  var filteredCounselling = counselling.filter(function(r) { return matchFilters(r, "Date", "Block", "GP"); });
  var filteredSkill = skill.filter(function(r) { return matchFilters(r, "Start_Date", "Block", "GP"); });
  var filteredEmpReg = empReg.filter(function(r) { return matchFilters(r, "Registration_Date", "Block", "GP"); });
  var filteredEmpLinked = empLinked.filter(function(r) { return matchFilters(r, "Placement_Date", "Block", "GP"); });
  var filteredEdu = education.filter(function(r) { return matchFilters(r, "Admission_Date", "Block", "GP"); });
  var filteredEnt = entrepreneurs.filter(function(r) { return matchFilters(r, "Identification_Date", "Block", "GP"); });
  var filteredNav = navgurukul.filter(function(r) { return matchFilters(r, "Registration_Date", "Block", "GP"); });
  var filteredTrainings = trainings.filter(function(r) { return matchFilters(r, "Date", "Block", "GP"); });
  var filteredActivities = activities.filter(function(r) { return matchFilters(r, "Date", "Block", "GP"); });

  // 12 KPI CALCULATIONS
  // 1. Total Mobilized: sum of Total_Mobilized
  var totalMobilizedCount = filteredMob.reduce(function(sum, r) {
    return sum + (Number(r.Total_Mobilized) || (Number(r.Male) + Number(r.Female) + Number(r.Other)) || 0);
  }, 0);

  // 2. M-Form count
  var mformCount = filteredMForm.length;

  // 3. My Bharat count (Registered or all)
  var myBharatCount = filteredMyBharat.length;

  // 4. Career Counselling count
  var counsellingCount = filteredCounselling.length;

  // 5. Skill Training count
  var skillTrainingCount = filteredSkill.length;

  // 6. Employment Linked count
  var empLinkedCount = filteredEmpLinked.length;

  // 7. Education Linked count
  var educationLinkedCount = filteredEdu.length;

  // 8. Entrepreneurs Identified
  var entIdentifiedCount = filteredEnt.filter(function(r) {
    return String(r.Stage || "").toLowerCase() === "identified" || !r.Establishment_Date;
  }).length;

  // 9. Entrepreneurs Established
  var entEstablishedCount = filteredEnt.filter(function(r) {
    return String(r.Stage || "").toLowerCase() === "established" || String(r.Status || "").toLowerCase() === "operational" || (r.Establishment_Date && String(r.Establishment_Date).trim() !== "");
  }).length;

  // 10. Employment Registered
  var empRegisteredCount = filteredEmpReg.length;

  // 11. NavGurukul Candidates
  var navgurukulCount = filteredNav.length;

  // 12. Trainings Conducted
  var trainingConductedCount = filteredTrainings.length;

  // Total Registered Youth Master
  var totalYouthMasterCount = filteredYouth.length;

  // 10 CHARTS DATA PREPARATION

  // Chart 1: Monthly Mobilization Trend
  var monthsList = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  var mobMonthlyMap = {};
  monthsList.forEach(function(m) { mobMonthlyMap[m] = 0; });
  filteredMob.forEach(function(r) {
    var m = r.Month;
    if (!m && r.Date) {
      var d = new Date(r.Date);
      if (!isNaN(d.getTime())) m = DANTEWADA_CONFIG.MONTHS[d.getMonth()];
    }
    if (m && mobMonthlyMap[m] !== undefined) {
      mobMonthlyMap[m] += (Number(r.Total_Mobilized) || (Number(r.Male) + Number(r.Female) + Number(r.Other)) || 0);
    }
  });

  // Chart 2: Block-wise Performance
  var blocksList = Object.keys(DANTEWADA_CONFIG.BLOCKS);
  var blockPerf = {
    labels: blocksList,
    mobilized: blocksList.map(function(b) {
      return filteredMob.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); })
        .reduce(function(acc, cur) { return acc + (Number(cur.Total_Mobilized) || 0); }, 0);
    }),
    youthRegistered: blocksList.map(function(b) {
      return filteredYouth.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
    }),
    mform: blocksList.map(function(b) {
      return filteredMForm.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
    }),
    placed: blocksList.map(function(b) {
      return filteredEmpLinked.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
    })
  };

  // Chart 3: Youth Journey Funnel
  var funnelData = {
    labels: ["Mobilized", "Youth Master", "M-Form", "My Bharat", "Counselling", "Skill Training", "Emp Linked", "Entrepreneurs Est."],
    data: [
      totalMobilizedCount,
      totalYouthMasterCount,
      mformCount,
      myBharatCount,
      counsellingCount,
      skillTrainingCount,
      empLinkedCount,
      entEstablishedCount
    ]
  };

  // Chart 4: Skill Training Provider Breakdown & Status
  var providerMap = {};
  filteredSkill.forEach(function(r) {
    var p = r.Training_Provider || "Other";
    providerMap[p] = (providerMap[p] || 0) + 1;
  });

  // Chart 5: Employment Registered vs Linked
  var empCompare = {
    labels: blocksList,
    registered: blocksList.map(function(b) {
      return filteredEmpReg.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
    }),
    linked: blocksList.map(function(b) {
      return filteredEmpLinked.filter(function(r) { return String(r.Block).toLowerCase() === b.toLowerCase(); }).length;
    })
  };

  // Chart 6: Education Linked Goals / Status
  var eduStatusMap = {};
  filteredEdu.forEach(function(r) {
    var goal = r.Education_Goal || r.Course || "Higher Education";
    eduStatusMap[goal] = (eduStatusMap[goal] || 0) + 1;
  });

  // Chart 7: Entrepreneurs Pipeline
  var entPipeline = {
    labels: ["Identified", "Business Plan", "Loan Applied", "Loan Approved", "Established"],
    counts: [
      filteredEnt.length,
      filteredEnt.filter(function(r) { return String(r.Business_Plan_Status).toLowerCase() === "approved"; }).length,
      filteredEnt.filter(function(r) { return String(r.Loan_Applied).toLowerCase() === "yes"; }).length,
      filteredEnt.filter(function(r) { return String(r.Loan_Approved).toLowerCase() === "yes"; }).length,
      entEstablishedCount
    ]
  };

  // Chart 8: NavGurukul Pipeline
  var navPipeline = {
    labels: ["Registered", "Shortlisted", "Selected", "Admitted"],
    counts: [
      filteredNav.length,
      filteredNav.filter(function(r) { return ["shortlisted", "selected", "admitted"].indexOf(String(r.Selection_Status || "").toLowerCase()) !== -1; }).length,
      filteredNav.filter(function(r) { return ["selected", "admitted"].indexOf(String(r.Selection_Status || "").toLowerCase()) !== -1; }).length,
      filteredNav.filter(function(r) { return String(r.Selection_Status || "").toLowerCase() === "admitted" || String(r.Admission_Status || "").toLowerCase() === "joined"; }).length
    ]
  };

  // Chart 9: Training Conducted by Month
  var trainingMonthlyMap = {};
  monthsList.forEach(function(m) { trainingMonthlyMap[m] = { events: 0, participants: 0 }; });
  filteredTrainings.forEach(function(t) {
    var dt = new Date(t.Date || t.Start_Date);
    var m = !isNaN(dt.getTime()) ? DANTEWADA_CONFIG.MONTHS[dt.getMonth()] : null;
    if (m && trainingMonthlyMap[m]) {
      trainingMonthlyMap[m].events += 1;
      trainingMonthlyMap[m].participants += (Number(t.Total_Participants) || (Number(t.Male_Participants) + Number(t.Female_Participants)) || 0);
    }
  });

  // Chart 10: Top Gram Panchayat Mobilization
  var gpMobMap = {};
  filteredMob.forEach(function(m) {
    var gp = m.Gram_Panchayat || "Other";
    gpMobMap[gp] = (gpMobMap[gp] || 0) + (Number(m.Total_Mobilized) || 0);
  });
  var sortedGps = Object.keys(gpMobMap).sort(function(a, b) { return gpMobMap[b] - gpMobMap[a]; }).slice(0, 10);

  return {
    success: true,
    userRole: user ? user.role : "GUEST",
    userBlock: user ? user.block : "All",
    kpis: {
      totalMobilized: totalMobilizedCount,
      mForm: mformCount,
      myBharat: myBharatCount,
      careerCounselling: counsellingCount,
      skillTraining: skillTrainingCount,
      employmentLinked: empLinkedCount,
      educationLinked: educationLinkedCount,
      entrepreneursIdentified: entIdentifiedCount,
      entrepreneursEstablished: entEstablishedCount,
      employmentRegistered: empRegisteredCount,
      navgurukul: navgurukulCount,
      trainingConducted: trainingConductedCount,
      youthMasterTotal: totalYouthMasterCount
    },
    charts: {
      monthlyMobilization: {
        labels: monthsList,
        values: monthsList.map(function(m) { return mobMonthlyMap[m]; })
      },
      blockPerformance: blockPerf,
      youthFunnel: funnelData,
      skillProviders: {
        labels: Object.keys(providerMap),
        values: Object.values(providerMap)
      },
      employmentComparison: empCompare,
      educationGoals: {
        labels: Object.keys(eduStatusMap),
        values: Object.values(eduStatusMap)
      },
      entrepreneursPipeline: entPipeline,
      navgurukulPipeline: navPipeline,
      trainingConductedTrend: {
        labels: monthsList,
        events: monthsList.map(function(m) { return trainingMonthlyMap[m].events; }),
        participants: monthsList.map(function(m) { return trainingMonthlyMap[m].participants; })
      },
      topGps: {
        labels: sortedGps,
        values: sortedGps.map(function(gp) { return gpMobMap[gp]; })
      }
    }
  };
}
