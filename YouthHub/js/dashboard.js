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
    return {
      financialYear: document.getElementById("filterFY") ? document.getElementById("filterFY").value : "All",
      month: document.getElementById("filterMonth") ? document.getElementById("filterMonth").value : "All",
      block: document.getElementById("filterBlock") ? document.getElementById("filterBlock").value : "All",
      gramPanchayat: document.getElementById("filterGP") ? document.getElementById("filterGP").value : "All",
      youthHub: document.getElementById("filterYouthHub") ? document.getElementById("filterYouthHub").value : "All"
    };
  }

  async function loadDashboard() {
    try {
      showLoading(true);
      const filters = getActiveFilters();
      const res = await API.call("getDashboard", { filters });

      if (res && res.success) {
        updateKpiCards(res.kpis);
        renderCharts(res.charts);
      } else {
        App.showToast(res.message || "Failed to load dashboard data.", "error");
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
      App.showToast("Connection error while loading analytics.", "error");
    } finally {
      showLoading(false);
    }
  }

  function updateKpiCards(kpis) {
    if (!kpis) return;
    const formatNumber = num => (num || 0).toLocaleString("en-IN");

    setCardValue("kpiMobilized", formatNumber(kpis.totalMobilized));
    setCardValue("kpiMForm", formatNumber(kpis.mForm));
    setCardValue("kpiMyBharat", formatNumber(kpis.myBharat));
    setCardValue("kpiCounselling", formatNumber(kpis.careerCounselling));
    setCardValue("kpiSkill", formatNumber(kpis.skillTraining));
    setCardValue("kpiEmpLinked", formatNumber(kpis.employmentLinked));
    setCardValue("kpiEduLinked", formatNumber(kpis.educationLinked));
    setCardValue("kpiEntIdentified", formatNumber(kpis.entrepreneursIdentified));
    setCardValue("kpiEntEstablished", formatNumber(kpis.entrepreneursEstablished));
    setCardValue("kpiEmpRegistered", formatNumber(kpis.employmentRegistered));
    setCardValue("kpiNavgurukul", formatNumber(kpis.navgurukul));
    setCardValue("kpiTrainings", formatNumber(kpis.trainingConducted));
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
