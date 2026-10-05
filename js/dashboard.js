/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * dashboard.js - Dynamic Analytics, 12 KPI Cards & 10 Chart.js Visualizations
 */

const DashboardModule = (function() {
  const charts = {};

  function init() {
    setupFilterListeners();
    loadDashboard();
  }

  function setupFilterListeners() {
    const filterIds = ["filterFY", "filterMonth", "filterBlock", "filterGP", "filterYouthHub"];
    filterIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => loadDashboard());
      }
    });

    const refreshBtn = document.getElementById("btnRefreshDashboard");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => loadDashboard());
    }

    // Dynamic block to GP filter cascading
    const blockSelect = document.getElementById("filterBlock");
    if (blockSelect) {
      blockSelect.addEventListener("change", () => {
        updateGramPanchayatFilterOptions(blockSelect.value);
      });
    }
  }

  function updateGramPanchayatFilterOptions(block) {
    const gpSelect = document.getElementById("filterGP");
    if (!gpSelect) return;

    gpSelect.innerHTML = '<option value="All">All Gram Panchayats</option>';
    if (block && block !== "All" && AppConfig.BLOCKS[block]) {
      AppConfig.BLOCKS[block].forEach(gp => {
        const opt = document.createElement("option");
        opt.value = gp;
        opt.textContent = gp;
        gpSelect.appendChild(opt);
      });
    }
  }

  function getActiveFilters() {
    const currentUser = API.getCurrentUser();
    let blockVal = document.getElementById("filterBlock") ? document.getElementById("filterBlock").value : "All";
    let hubVal = document.getElementById("filterYouthHub") ? document.getElementById("filterYouthHub").value : "All";

    // Enforce operator block restrictions
    if (currentUser && currentUser.block && currentUser.block !== "All") {
      blockVal = currentUser.block;
      if (currentUser.youthHub && currentUser.youthHub !== "All") {
        hubVal = currentUser.youthHub;
      }
    }

    return {
      financialYear: document.getElementById("filterFY") ? document.getElementById("filterFY").value : "All",
      month: document.getElementById("filterMonth") ? document.getElementById("filterMonth").value : "All",
      block: blockVal,
      gramPanchayat: document.getElementById("filterGP") ? document.getElementById("filterGP").value : "All",
      youthHub: hubVal
    };
  }

  async function loadDashboard() {
    try {
      showLoading(true);
      const filters = getActiveFilters();
      let res = await API.call("getDashboard", { filters });

      if (res && res.success && res.kpis) {
        updateKpiCards(res.kpis);
        if (res.charts) {
          renderCharts(res.charts);
          return;
        }
      }

      // Live Sheet Data: Fetch all core tables directly from Google Sheets
      const [ymRes, mobRes, mfRes, mbRes, couRes, sklRes, erRes, elRes, eduRes, entRes, ngRes, trgRes, rehRes] = await Promise.all([
        API.call("getTableRecords", { sheetName: "Youth_Master" }),
        API.call("getTableRecords", { sheetName: "Mobilization" }),
        API.call("getTableRecords", { sheetName: "M_Form" }),
        API.call("getTableRecords", { sheetName: "My_Bharat" }),
        API.call("getTableRecords", { sheetName: "Counselling" }),
        API.call("getTableRecords", { sheetName: "Skill_Training" }),
        API.call("getTableRecords", { sheetName: "Employment_Registered" }),
        API.call("getTableRecords", { sheetName: "Employment_Linked" }),
        API.call("getTableRecords", { sheetName: "Education" }),
        API.call("getTableRecords", { sheetName: "Entrepreneurs" }),
        API.call("getTableRecords", { sheetName: "NavGurukul" }),
        API.call("getTableRecords", { sheetName: "Trainings" }),
        API.call("getTableRecords", { sheetName: "Rehabilitation" })
      ]);

      let ymList = (ymRes && (ymRes.data || ymRes.records)) || [];
      let mobList = (mobRes && (mobRes.data || mobRes.records)) || [];
      let mfList = (mfRes && (mfRes.data || mfRes.records)) || [];
      let mbList = (mbRes && (mbRes.data || mbRes.records)) || [];
      let couList = (couRes && (couRes.data || couRes.records)) || [];
      let sklList = (sklRes && (sklRes.data || sklRes.records)) || [];
      let erList = (erRes && (erRes.data || erRes.records)) || [];
      let elList = (elRes && (elRes.data || elRes.records)) || [];
      let eduList = (eduRes && (eduRes.data || eduRes.records)) || [];
      let entList = (entRes && (entRes.data || entRes.records)) || [];
      let ngList = (ngRes && (ngRes.data || ngRes.records)) || [];
      let trgList = (trgRes && (trgRes.data || trgRes.records)) || [];
      let rehList = (rehRes && (rehRes.data || rehRes.records)) || [];

      if (filters.block && filters.block !== "All") {
        const b = filters.block.toLowerCase();
        const fBlock = list => list.filter(item => String(item.Block || "").toLowerCase() === b);
        ymList = fBlock(ymList);
        mobList = fBlock(mobList);
        mfList = fBlock(mfList);
        mbList = fBlock(mbList);
        couList = fBlock(couList);
        sklList = fBlock(sklList);
        erList = fBlock(erList);
        elList = fBlock(elList);
        eduList = fBlock(eduList);
        entList = fBlock(entList);
        ngList = fBlock(ngList);
        trgList = fBlock(trgList);
        rehList = fBlock(rehList);
      }

      if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
        const gp = filters.gramPanchayat.toLowerCase();
        const fGP = list => list.filter(item => String(item.Gram_Panchayat || item.GP || "").toLowerCase() === gp);
        ymList = fGP(ymList);
        mobList = fGP(mobList);
        mfList = fGP(mfList);
        mbList = fGP(mbList);
        entList = fGP(entList);
        ngList = fGP(ngList);
        trgList = fGP(trgList);
        rehList = fGP(rehList);
      }

      const totalMob = mobList.reduce((acc, m) => acc + (Number(m.Total_Mobilized) || 0), 0) || ymList.length;

      const computedKpis = {
        totalMobilized: totalMob,
        mForm: mfList.length,
        myBharat: mbList.length,
        careerCounselling: couList.length,
        skillTraining: sklList.length,
        employmentRegistered: erList.length,
        employmentLinked: elList.length,
        educationLinked: eduList.length,
        entrepreneursIdentified: entList.length,
        entrepreneursEstablished: entList.filter(e => String(e.Stage || "").toLowerCase() === "established").length,
        navgurukul: ngList.length,
        trainingConducted: trgList.length,
        rehabilitation: rehList.length
      };

      updateKpiCards(computedKpis);

      // Build and render 100% dynamic charts from the live sheet tables
      const dynamicCharts = buildChartsFromSheetData({
        ymList, mobList, mfList, mbList, couList, sklList, erList, elList, eduList, entList, ngList, trgList, rehList, totalMob
      });
      renderCharts(dynamicCharts);

    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      showLoading(false);
    }
  }

  function updateKpiCards(kpis) {
    if (!kpis) return;
    const formatNumber = num => (num || 0).toLocaleString("en-IN");

    setCardValue("kpiMobilized", formatNumber(kpis.totalMobilized !== undefined ? kpis.totalMobilized : (kpis.totalRegistered || 0)));
    setCardValue("kpiMForm", formatNumber(kpis.mForm !== undefined ? kpis.mForm : (kpis.totalMForm || 0)));
    setCardValue("kpiMyBharat", formatNumber(kpis.myBharat !== undefined ? kpis.myBharat : (kpis.totalMyBharat || 0)));
    setCardValue("kpiCounselling", formatNumber(kpis.careerCounselling !== undefined ? kpis.careerCounselling : (kpis.totalCounselled || 0)));
    setCardValue("kpiSkill", formatNumber(kpis.skillTraining !== undefined ? kpis.skillTraining : (kpis.totalSkillTrained || 0)));
    setCardValue("kpiEmpLinked", formatNumber(kpis.employmentLinked !== undefined ? kpis.employmentLinked : (kpis.totalEmployed || 0)));
    setCardValue("kpiEduLinked", formatNumber(kpis.educationLinked !== undefined ? kpis.educationLinked : (kpis.totalEducation || 0)));
    setCardValue("kpiEntIdentified", formatNumber(kpis.entrepreneursIdentified !== undefined ? kpis.entrepreneursIdentified : (kpis.totalEntrepreneurs || 0)));
    setCardValue("kpiEntEstablished", formatNumber(kpis.entrepreneursEstablished || 0));
    setCardValue("kpiEmpRegistered", formatNumber(kpis.employmentRegistered || 0));
    setCardValue("kpiNavgurukul", formatNumber(kpis.navgurukul || 0));
    setCardValue("kpiTrainings", formatNumber(kpis.trainingConducted || 0));
    setCardValue("kpiRehabilitation", formatNumber(kpis.rehabilitation !== undefined ? kpis.rehabilitation : (kpis.totalRehabilitated || 0)));
  }

  /**
   * Build 100% dynamic chart datasets directly from connected sheet rows (Zero Hardcoding)
   */
  function buildChartsFromSheetData(data) {
    const { ymList, mobList, mfList, mbList, couList, sklList, erList, elList, eduList, entList, ngList, trgList, rehList, totalMob } = data;
    const blocks = ["Dantewada", "Geedam", "Katekalyan", "Kuakonda"];
    const allMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    // 1. Monthly Mobilization Trend
    const mobByMonth = {};
    allMonths.forEach(m => mobByMonth[m] = 0);
    mobList.forEach(m => {
      if (m.Date) {
        const d = new Date(m.Date);
        if (!isNaN(d.getTime())) {
          const mon = d.toLocaleString("en-US", { month: "short" });
          if (mobByMonth[mon] !== undefined) mobByMonth[mon] += (Number(m.Total_Mobilized) || 1);
        }
      }
    });
    if (Object.values(mobByMonth).every(v => v === 0)) {
      ymList.forEach(y => {
        if (y.Registration_Date) {
          const d = new Date(y.Registration_Date);
          if (!isNaN(d.getTime())) {
            const mon = d.toLocaleString("en-US", { month: "short" });
            if (mobByMonth[mon] !== undefined) mobByMonth[mon]++;
          }
        }
      });
    }
    const activeMobMonths = allMonths.filter(m => mobByMonth[m] > 0);
    const displayMobMonths = activeMobMonths.length ? activeMobMonths : ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

    // 2. Block-wise Performance
    const blockPerformance = {
      labels: blocks,
      mobilized: blocks.map(b => mobList.filter(m => String(m.Block || "").toLowerCase() === b.toLowerCase()).reduce((sum, m) => sum + (Number(m.Total_Mobilized) || 0), 0)),
      youthRegistered: blocks.map(b => ymList.filter(y => String(y.Block || "").toLowerCase() === b.toLowerCase()).length),
      mform: blocks.map(b => mfList.filter(m => String(m.Block || "").toLowerCase() === b.toLowerCase()).length),
      placed: blocks.map(b => elList.filter(e => String(e.Block || "").toLowerCase() === b.toLowerCase()).length)
    };

    // 3. Youth Funnel
    const youthFunnel = {
      labels: ["Mobilized", "Youth Master", "M-Form", "My Bharat", "Counselling", "Skill Trained", "Employed", "Established"],
      data: [
        totalMob,
        ymList.length,
        mfList.length,
        mbList.length,
        couList.length,
        sklList.length,
        elList.length,
        entList.filter(e => String(e.Stage || "").toLowerCase() === "established").length
      ]
    };

    // 4. Skill Providers
    const providerMap = {};
    sklList.forEach(s => {
      const p = s.Training_Provider || s.Provider || "Other";
      providerMap[p] = (providerMap[p] || 0) + 1;
    });
    const spLabels = Object.keys(providerMap);
    const skillProviders = {
      labels: spLabels.length ? spLabels : ["No Training Records"],
      values: spLabels.length ? spLabels.map(k => providerMap[k]) : [0]
    };

    // 5. Employment Comparison
    const employmentComparison = {
      labels: blocks,
      registered: blocks.map(b => erList.filter(r => String(r.Block || "").toLowerCase() === b.toLowerCase()).length),
      linked: blocks.map(b => elList.filter(l => String(l.Block || "").toLowerCase() === b.toLowerCase()).length)
    };

    // 6. Education Goals
    const eduMap = {};
    eduList.forEach(e => {
      const c = e.Course || e.Institution_Name || "Higher Education";
      eduMap[c] = (eduMap[c] || 0) + 1;
    });
    const eduLabels = Object.keys(eduMap);
    const educationGoals = {
      labels: eduLabels.length ? eduLabels : ["No Education Records"],
      values: eduLabels.length ? eduLabels.map(k => eduMap[k]) : [0]
    };

    // 7. Entrepreneurs Pipeline
    const entStages = ["Identified", "Business Plan", "Loan Applied", "Loan Sanctioned", "Established"];
    const entrepreneursPipeline = {
      labels: entStages,
      counts: entStages.map(st => {
        return entList.filter(e => {
          const combined = (String(e.Stage || "") + " " + String(e.Business_Status || "") + " " + String(e.Loan_Status || "")).toLowerCase();
          return combined.includes(st.toLowerCase());
        }).length;
      })
    };

    // 8. NavGurukul Pipeline
    const navStages = ["Registered", "Shortlisted", "Selected", "Admitted"];
    const navgurukulPipeline = {
      labels: navStages,
      counts: navStages.map(st => {
        return ngList.filter(n => {
          const combined = (String(n.Selection_Status || "") + " " + String(n.Admission_Status || "")).toLowerCase();
          return combined.includes(st.toLowerCase());
        }).length;
      })
    };

    // 9. Training Trend
    const trgMonths = {};
    trgList.forEach(t => {
      const d = new Date(t.Date || t.Start_Date);
      const mon = isNaN(d.getTime()) ? "Current" : d.toLocaleString("en-US", { month: "short" });
      if (!trgMonths[mon]) trgMonths[mon] = { events: 0, participants: 0 };
      trgMonths[mon].events++;
      trgMonths[mon].participants += (Number(t.Total_Participants) || 0);
    });
    const trgLabels = Object.keys(trgMonths);
    const trainingConductedTrend = {
      labels: trgLabels.length ? trgLabels : ["No Training Records"],
      events: trgLabels.length ? trgLabels.map(k => trgMonths[k].events) : [0],
      participants: trgLabels.length ? trgLabels.map(k => trgMonths[k].participants) : [0]
    };

    // 10. Top GPs
    const gpCounts = {};
    mobList.forEach(m => {
      const gp = m.Gram_Panchayat || m.GP;
      if (gp) gpCounts[gp] = (gpCounts[gp] || 0) + (Number(m.Total_Mobilized) || 1);
    });
    ymList.forEach(y => {
      const gp = y.Gram_Panchayat || y.GP;
      if (gp) gpCounts[gp] = (gpCounts[gp] || 0) + 1;
    });
    const sortedGps = Object.keys(gpCounts).sort((a, b) => gpCounts[b] - gpCounts[a]).slice(0, 6);
    const topGps = {
      labels: sortedGps.length ? sortedGps : ["No GP Records"],
      values: sortedGps.length ? sortedGps.map(k => gpCounts[k]) : [0]
    };

    return {
      monthlyMobilization: {
        labels: displayMobMonths,
        values: displayMobMonths.map(m => mobByMonth[m] || 0)
      },
      blockPerformance,
      youthFunnel,
      skillProviders,
      employmentComparison,
      educationGoals,
      entrepreneursPipeline,
      navgurukulPipeline,
      trainingConductedTrend,
      topGps
    };
  }

  function setCardValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
  }

  function showLoading(isLoading) {
    const spinner = document.getElementById("dashboardSpinner");
    if (spinner) {
      spinner.style.display = isLoading ? "inline-block" : "none";
    }
  }

  /**
   * Render or update all 10 Chart.js instances
   */
  function renderCharts(data) {
    if (!data || typeof Chart === "undefined") return;

    // Common Chart Defaults
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#475569";

    // 1. Monthly Mobilization Trend
    renderChart("chartMonthlyMob", {
      type: "line",
      data: {
        labels: data.monthlyMobilization.labels,
        datasets: [{
          label: "Youth Mobilized",
          data: data.monthlyMobilization.values,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: "#2563EB",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 2. Block-wise Performance
    const bp = data.blockPerformance;
    renderChart("chartBlockPerf", {
      type: "bar",
      data: {
        labels: bp.labels,
        datasets: [
          { label: "Mobilized", data: bp.mobilized, backgroundColor: "#3B82F6" },
          { label: "Youth Master", data: bp.youthRegistered, backgroundColor: "#10B981" },
          { label: "M-Forms", data: bp.mform, backgroundColor: "#F59E0B" },
          { label: "Placed", data: bp.placed, backgroundColor: "#8B5CF6" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 3. Youth Journey Funnel
    renderChart("chartYouthFunnel", {
      type: "bar",
      data: {
        labels: data.youthFunnel.labels,
        datasets: [{
          label: "Candidates",
          data: data.youthFunnel.data,
          backgroundColor: [
            "#3B82F6", "#0284C7", "#0D9488", "#10B981",
            "#F59E0B", "#8B5CF6", "#059669", "#D97706"
          ],
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 4. Skill Training Providers & Status
    renderChart("chartSkillProviders", {
      type: "doughnut",
      data: {
        labels: data.skillProviders.labels.length ? data.skillProviders.labels : ["No Data"],
        datasets: [{
          data: data.skillProviders.values.length ? data.skillProviders.values : [1],
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } }
      }
    });

    // 5. Employment Registered vs Linked
    renderChart("chartEmpComparison", {
      type: "bar",
      data: {
        labels: data.employmentComparison.labels,
        datasets: [
          { label: "Registered", data: data.employmentComparison.registered, backgroundColor: "#93C5FD" },
          { label: "Linked / Placed", data: data.employmentComparison.linked, backgroundColor: "#059669" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 6. Education Linked Streams
    renderChart("chartEducationGoals", {
      type: "bar",
      data: {
        labels: data.educationGoals.labels.length ? data.educationGoals.labels : ["No Data"],
        datasets: [{
          label: "Students",
          data: data.educationGoals.values.length ? data.educationGoals.values : [0],
          backgroundColor: "#6366F1",
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 7. Entrepreneurs Identified vs Established Pipeline
    renderChart("chartEntPipeline", {
      type: "bar",
      data: {
        labels: data.entrepreneursPipeline.labels,
        datasets: [{
          label: "Entrepreneurs",
          data: data.entrepreneursPipeline.counts,
          backgroundColor: "#F59E0B",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 8. NavGurukul Pipeline
    renderChart("chartNavPipeline", {
      type: "bar",
      data: {
        labels: data.navgurukulPipeline.labels,
        datasets: [{
          label: "Candidates",
          data: data.navgurukulPipeline.counts,
          backgroundColor: "#8B5CF6",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });

    // 9. Training Conducted by Month
    renderChart("chartTrainingTrend", {
      type: "bar",
      data: {
        labels: data.trainingConductedTrend.labels,
        datasets: [
          {
            type: "bar",
            label: "Events",
            data: data.trainingConductedTrend.events,
            backgroundColor: "#0EA5E9",
            yAxisID: "y"
          },
          {
            type: "line",
            label: "Participants",
            data: data.trainingConductedTrend.participants,
            borderColor: "#D97706",
            borderWidth: 2,
            pointBackgroundColor: "#D97706",
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { type: "linear", position: "left", beginAtZero: true },
          y1: { type: "linear", position: "right", beginAtZero: true, grid: { drawOnChartArea: false } }
        }
      }
    });

    // 10. Top GP-wise Mobilization
    renderChart("chartTopGps", {
      type: "bar",
      data: {
        labels: data.topGps.labels.length ? data.topGps.labels : ["No Data"],
        datasets: [{
          label: "Total Mobilized",
          data: data.topGps.values.length ? data.topGps.values : [0],
          backgroundColor: "#10B981",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: "#F1F5F9" } } }
      }
    });
  }

  function renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }
    charts[canvasId] = new Chart(canvas, config);
  }

  return {
    init,
    loadDashboard,
    updateGramPanchayatFilterOptions
  };
})();
