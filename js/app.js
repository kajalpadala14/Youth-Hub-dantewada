/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * app.js - Master Application Controller, Router & Authentication Handler
 */

const AppConfig = {
  DISTRICT: "Dantewada",
  BLOCKS: {
    "Dantewada": ["Chitalanka", "Bhansi", "Teknar", "Balpet", "Dantewada Rural", "Kamlur", "Madkamiras", "Gadhpal"],
    "Geedam": ["Barsoor", "Haram", "Gumalnar", "Kasoli", "Geedam Rural", "Pondum", "Javanga", "Karli"],
    "Katekalyan": ["Marjum", "Parcheli", "Tumakpal", "Bengpal", "Katekalyan Rural", "Bodenar", "Telam", "Gatam"],
    "Kuakonda": ["Mailawada", "Nakulnar", "Sameli", "Palnar", "Kuakonda Rural", "Bacheli Rural", "Hitawar", "Durgapur"]
  },
  YOUTH_HUBS: [
    "Youth Hub Dantewada (District HQ)",
    "Youth Hub Geedam (Skill & Innovation)",
    "Youth Hub Katekalyan",
    "Youth Hub Kuakonda"
  ],
  FINANCIAL_YEARS: ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"]
};

const App = (function() {
  let currentUser = null;

  function init() {
    checkAuth();
    setupNavigation();
    setupGlobalSearch();
    setupModals();
    setupMobileSidebar();
    setupSettingsHandlers();
    Forms.init();
  }

  const ROLE_PROFILES = {
    ADMIN: {
      id: "USR-001",
      name: "जिला रोजगार अधिकारी",
      email: "eo.dantewada@gmail.com",
      role: "ADMIN",
      block: "All",
      youthHub: "All",
      badgeTitle: "👑 जिला रोजगार अधिकारी (Admin)",
      badgeClass: "badge-admin",
      initials: "EO"
    },
    DANTEWADA: {
      id: "USR-002",
      name: "Youth Hub Dantewada",
      email: "youthhub.dantewada@gmail.com",
      role: "HUB_OPERATOR",
      block: "Dantewada",
      youthHub: "Youth Hub Dantewada",
      badgeTitle: "🏢 Youth Hub Dantewada (दंतेवाड़ा)",
      badgeClass: "badge-hub-dantewada",
      initials: "DH"
    },
    GEEDAM: {
      id: "USR-003",
      name: "Youth Hub Geedam",
      email: "youthhub.geedam@gmail.com",
      role: "HUB_OPERATOR",
      block: "Geedam",
      youthHub: "Youth Hub Geedam",
      badgeTitle: "💡 Youth Hub Geedam (गीदम)",
      badgeClass: "badge-hub-geedam",
      initials: "GH"
    }
  };

  /**
   * Authentication Verification & UI Setup
   */
  function checkAuth() {
    currentUser = API.getCurrentUser();
    let token = API.getToken();

    if (!token || !currentUser) {
      window.location.href = "login.html";
      return;
    }

    showLoginModal(false);
    updateUserUI();
    // Initialize core modules
    DashboardModule.init();
    ReportsModule.init();
  }

  function updateUserUI() {
    if (!currentUser) return;

    const nameEl = document.getElementById("navUserName");
    const roleEl = document.getElementById("navUserRole");
    const avatarEl = document.getElementById("navUserAvatar");

    if (nameEl) nameEl.textContent = currentUser.name || currentUser.email;
    
    let displayRole = currentUser.role;
    let initials = (currentUser.name || "U").substring(0, 2).toUpperCase();

    if (currentUser.role === "ADMIN") {
      displayRole = "👑 जिला रोजगार अधिकारी (Admin)";
      initials = "EO";
    } else if (currentUser.block === "Dantewada") {
      displayRole = "🏢 Youth Hub Dantewada";
      initials = "DH";
    } else if (currentUser.block === "Geedam") {
      displayRole = "💡 Youth Hub Geedam";
      initials = "GH";
    } else if (currentUser.block && currentUser.block !== "All") {
      displayRole = `Operator (${currentUser.block})`;
    }

    if (roleEl) roleEl.textContent = displayRole;
    if (avatarEl) avatarEl.textContent = initials;

    // Role-based visibility for Admin Users view
    const usersNav = document.querySelector('[data-view="users"]');
    if (usersNav) {
      usersNav.style.display = currentUser.role === "ADMIN" ? "flex" : "none";
    }

    // Block Filter Lock for Hub Operators
    const blockFilter = document.getElementById("filterBlock");
    const youthHubFilter = document.getElementById("filterYouthHub");

    if (currentUser.block && currentUser.block !== "All") {
      if (blockFilter) {
        blockFilter.value = currentUser.block;
        blockFilter.disabled = true;
        DashboardModule.updateGramPanchayatFilterOptions(currentUser.block);
      }
      if (youthHubFilter && currentUser.youthHub && currentUser.youthHub !== "All") {
        for (let i = 0; i < youthHubFilter.options.length; i++) {
          if (youthHubFilter.options[i].text.toLowerCase().includes(currentUser.block.toLowerCase())) {
            youthHubFilter.selectedIndex = i;
            break;
          }
        }
        youthHubFilter.disabled = true;
      }
    } else {
      if (blockFilter) blockFilter.disabled = false;
      if (youthHubFilter) youthHubFilter.disabled = false;
    }
  }

  function quickRoleLogin(roleKey) {
    const profile = ROLE_PROFILES[roleKey];
    if (!profile) return;

    const token = "TOKEN-LIVE-" + Date.now();
    API.setSession(token, profile);
    currentUser = profile;
    showLoginModal(false);
    updateUserUI();
    showToast(`स्विच किया गया: ${profile.name} (${profile.role})`, "success");

    // Refresh active views
    DashboardModule.loadDashboard();
    ReportsModule.loadActiveReport();
    
    // Refresh current visible table if on a module view
    const activeSection = document.querySelector(".page-section.active");
    if (activeSection && activeSection.id.startsWith("view_")) {
      const viewKey = activeSection.id.replace("view_", "");
      if (viewKey !== "dashboard" && viewKey !== "reports" && viewKey !== "users") {
        Forms.loadTabTable(viewKey);
      }
    }
  }

  function showLoginModal(show) {
    const modal = document.getElementById("loginModal");
    if (modal) {
      if (show) modal.classList.add("active");
      else modal.classList.remove("active");
    }
  }

  /**
   * Navigation router between SPA views
   */
  function setupNavigation() {
    // 1. Top-level Nav Items & Dropdown Toggles
    const navItems = document.querySelectorAll(".nav-item[data-view]");
    navItems.forEach(item => {
      item.addEventListener("click", function(e) {
        // If this is an expandable dropdown toggle
        if (this.classList.contains("nav-dropdown-toggle")) {
          const parentDropdown = this.closest(".nav-dropdown");
          if (parentDropdown) {
            const isCurrentlyOpen = parentDropdown.classList.contains("open");
            parentDropdown.classList.toggle("open");
            // If opening, switch to default parent view
            if (!isCurrentlyOpen) {
              const viewName = this.getAttribute("data-view");
              switchView(viewName);
            }
          }
          return;
        }

        const viewName = this.getAttribute("data-view");
        const scrollTarget = this.getAttribute("data-scroll");
        switchView(viewName, null, null, scrollTarget);
        closeMobileSidebar();
      });
    });

    // 2. Submenu Items
    const subItems = document.querySelectorAll(".nav-sub-item");
    subItems.forEach(sub => {
      sub.addEventListener("click", function(e) {
        e.stopPropagation();
        const viewName = this.getAttribute("data-view");
        const subView = this.getAttribute("data-subview");
        const reportType = this.getAttribute("data-report-type");
        switchView(viewName, subView, reportType);
        closeMobileSidebar();
      });
    });

    // Logout Button
    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (backdrop) backdrop.classList.remove("active");
  }

  function switchView(viewName, subView = null, reportType = null, scrollTargetId = null) {
    // Reset active states
    document.querySelectorAll(".nav-item, .nav-sub-item").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-dropdown-toggle").forEach(el => el.classList.remove("has-active-child"));

    // Find and highlight active navigation item
    if (subView) {
      const activeSub = document.querySelector(`.nav-sub-item[data-subview="${subView}"]`);
      if (activeSub) {
        activeSub.classList.add("active");
        const parentDropdown = activeSub.closest(".nav-dropdown");
        if (parentDropdown) {
          parentDropdown.classList.add("open");
          const toggle = parentDropdown.querySelector(".nav-dropdown-toggle");
          if (toggle) toggle.classList.add("has-active-child");
        }
      }
    } else if (reportType) {
      const activeSub = document.querySelector(`.nav-sub-item[data-report-type="${reportType}"]`);
      if (activeSub) {
        activeSub.classList.add("active");
        const parentDropdown = activeSub.closest(".nav-dropdown");
        if (parentDropdown) {
          parentDropdown.classList.add("open");
          const toggle = parentDropdown.querySelector(".nav-dropdown-toggle");
          if (toggle) toggle.classList.add("has-active-child");
        }
      }
    } else if (scrollTargetId) {
      const activeScrollItem = document.querySelector(`.nav-item[data-scroll="${scrollTargetId}"]`);
      if (activeScrollItem) {
        activeScrollItem.classList.add("active");
      }
    } else {
      const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]:not([data-scroll])`);
      if (activeNav) {
        activeNav.classList.add("active");
        const parentDropdown = activeNav.closest(".nav-dropdown");
        if (parentDropdown && !parentDropdown.classList.contains("open")) {
          parentDropdown.classList.add("open");
        }
      }
    }

    // Hide all view sections
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));

    // Show target section
    const target = document.getElementById(`view_${viewName}`);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (viewName === "dashboard") {
        DashboardModule.loadDashboard();
        if (scrollTargetId) {
          setTimeout(() => {
            const chartEl = document.getElementById(scrollTargetId);
            if (chartEl) {
              const card = chartEl.closest(".chart-card") || chartEl;
              card.scrollIntoView({ behavior: "smooth", block: "center" });
              card.classList.remove("highlight-target");
              void card.offsetWidth; // trigger reflow
              card.classList.add("highlight-target");
              setTimeout(() => card.classList.remove("highlight-target"), 1800);
            }
          }, 350);
        }
      } else if (viewName === "reports") {
        if (reportType) {
          const reportSelect = document.getElementById("selectReportType");
          if (reportSelect) {
            let found = false;
            for (let i = 0; i < reportSelect.options.length; i++) {
              if (reportSelect.options[i].value === reportType) {
                reportSelect.value = reportType;
                found = true;
                break;
              }
            }
            if (!found) {
              reportSelect.value = "overall";
            }
          }
        }
        ReportsModule.loadActiveReport();
      } else if (viewName === "users") {
        loadUsersTable();
      } else if (viewName === "employment") {
        Forms.loadTabTable("emp_registered");
        Forms.loadTabTable("emp_linked");
        if (subView === "emp_registered") {
          setTimeout(() => {
            const el = document.getElementById("tblEmpRegistered") ? document.getElementById("tblEmpRegistered").closest(".form-card") : null;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        } else if (subView === "emp_linked") {
          setTimeout(() => {
            const el = document.getElementById("tblEmpLinked") ? document.getElementById("tblEmpLinked").closest(".form-card") : null;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } else if (viewName === "entrepreneurship") {
        Forms.loadTabTable(viewName);
        if (subView === "identified") {
          const stageSelect = document.querySelector("#formEntrepreneur select[name='Stage']");
          if (stageSelect) stageSelect.value = "Identified";
          setTimeout(() => {
            const el = document.getElementById("tblEntrepreneurs") ? document.getElementById("tblEntrepreneurs").closest(".form-card") : null;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        } else if (subView === "loan") {
          setTimeout(() => {
            const el = document.getElementById("tblEntrepreneurs") ? document.getElementById("tblEntrepreneurs").closest(".form-card") : null;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 150);
        } else if (subView === "established") {
          const stageSelect = document.querySelector("#formEntrepreneur select[name='Stage']");
          if (stageSelect) stageSelect.value = "Established";
          setTimeout(() => {
            const el = document.getElementById("tblEntrepreneurs") ? document.getElementById("tblEntrepreneurs").closest(".form-card") : null;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } else {
        Forms.loadTabTable(viewName);
      }
    }
  }

  /**
   * Global Search in Header
   */
  function setupGlobalSearch() {
    const searchInput = document.getElementById("globalSearchInput");
    if (searchInput) {
      searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = this.value.trim();
          if (query) {
            Forms.openYouthSearchModal("ym");
            const qInput = document.getElementById("youthSearchQuery");
            if (qInput) {
              qInput.value = query;
              Forms.performYouthSearch();
            }
          }
        }
      });
    }

    const modalSearchBtn = document.getElementById("btnExecuteYouthSearch");
    if (modalSearchBtn) {
      modalSearchBtn.addEventListener("click", () => Forms.performYouthSearch());
    }

    const modalSearchInput = document.getElementById("youthSearchQuery");
    if (modalSearchInput) {
      modalSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          Forms.performYouthSearch();
        }
      });
    }
  }

  /**
   * Modal overlays & close buttons
   */
  function setupModals() {
    document.querySelectorAll(".modal-close-btn, [data-modal-close]").forEach(btn => {
      btn.addEventListener("click", function() {
        const modal = this.closest(".modal-overlay");
        if (modal && modal.id !== "loginModal") {
          modal.classList.remove("active");
        }
      });
    });

    // Close on background backdrop click
    document.querySelectorAll(".modal-overlay").forEach(modal => {
      modal.addEventListener("click", function(e) {
        if (e.target === this && this.id !== "loginModal") {
          this.classList.remove("active");
        }
      });
    });
  }

  /**
   * Sidebar controls: Desktop Collapse & Mobile Off-Canvas Drawer
   */
  function setupMobileSidebar() {
    const toggleBtn = document.getElementById("btnSidebarToggle");
    const collapseBtn = document.getElementById("btnSidebarCollapse");
    const closeMobileBtn = document.getElementById("btnSidebarCloseMobile");
    const backdrop = document.getElementById("sidebarBackdrop");
    const sidebar = document.getElementById("appSidebar");

    // Restore desktop collapsed state on page load
    const savedCollapsed = localStorage.getItem("youthhub_sidebar_collapsed");
    if (savedCollapsed === "1" && window.innerWidth > 900) {
      if (sidebar) sidebar.classList.add("collapsed");
      document.body.classList.add("sidebar-collapsed");
    }

    function toggleDesktopCollapse() {
      if (!sidebar) return;
      const isCollapsed = sidebar.classList.toggle("collapsed");
      document.body.classList.toggle("sidebar-collapsed", isCollapsed);
      localStorage.setItem("youthhub_sidebar_collapsed", isCollapsed ? "1" : "0");
    }

    function toggleMobileDrawer() {
      if (!sidebar) return;
      const isOpen = sidebar.classList.toggle("mobile-open");
      if (backdrop) {
        if (isOpen) backdrop.classList.add("active");
        else backdrop.classList.remove("active");
      }
    }

    // Header toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          toggleMobileDrawer();
        } else {
          toggleDesktopCollapse();
        }
      });
    }

    // Sidebar internal collapse button (Desktop)
    if (collapseBtn) {
      collapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDesktopCollapse();
      });
    }

    // Mobile close button (Inside drawer)
    if (closeMobileBtn) {
      closeMobileBtn.addEventListener("click", closeMobileSidebar);
    }

    // Backdrop click
    if (backdrop) {
      backdrop.addEventListener("click", closeMobileSidebar);
    }

    // Window resize handler
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMobileSidebar();
        const state = localStorage.getItem("youthhub_sidebar_collapsed");
        if (state === "1") {
          if (sidebar) sidebar.classList.add("collapsed");
          document.body.classList.add("sidebar-collapsed");
        } else {
          if (sidebar) sidebar.classList.remove("collapsed");
          document.body.classList.remove("sidebar-collapsed");
        }
      }
    });
  }

  /**
   * Settings & Setup Handlers
   */
  function setupSettingsHandlers() {
    // Save API URL
    const btnSaveUrl = document.getElementById("btnSaveApiUrl");
    const inputUrl = document.getElementById("settingApiUrl");
    if (inputUrl) inputUrl.value = API.getApiUrl();

    if (btnSaveUrl) {
      btnSaveUrl.addEventListener("click", () => {
        const url = inputUrl ? inputUrl.value : "";
        API.setApiUrl(url);
        showToast("Apps Script Web App URL updated.", "success");
      });
    }

    // Run setupDatabase
    const btnSetupDb = document.getElementById("btnSetupDatabase");
    if (btnSetupDb) {
      btnSetupDb.addEventListener("click", async () => {
        btnSetupDb.disabled = true;
        btnSetupDb.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Sheets...';
        try {
          const res = await API.call("setupDatabase");
          showToast(res.message || "Database initialized successfully!", res.success ? "success" : "error");
        } catch (e) {
          showToast("Setup failed: " + e.message, "error");
        } finally {
          btnSetupDb.disabled = false;
          btnSetupDb.innerHTML = '<i class="fas fa-database"></i> Initialize Google Sheets Database';
        }
      });
    }
  }

  /**
   * Toast Notification Controller
   */
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle";
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Login Handler
   */
  async function handleLogin(email, password) {
    const loginBtn = document.getElementById("btnLoginSubmit");
    const errorEl = document.getElementById("loginErrorMsg");
    if (errorEl) errorEl.style.display = "none";

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    }

    try {
      const res = await API.call("login", { email, password });
      if (res && res.success) {
        API.setSession(res.token, res.user);
        currentUser = res.user;
        showLoginModal(false);
        updateUserUI();
        DashboardModule.init();
        ReportsModule.init();
        showToast(`Welcome back, ${res.user.name}!`, "success");
      } else {
        if (errorEl) {
          errorEl.textContent = res.message || "Authentication failed.";
          errorEl.style.display = "block";
        }
      }
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = "Server connection error: " + e.message;
        errorEl.style.display = "block";
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to System';
      }
    }
  }

  function handleLogout() {
    API.clearSession();
    currentUser = null;
    showToast("You have been signed out.", "info");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 400);
  }

  /**
   * Load Admin Users View
   */
  async function loadUsersTable() {
    const tbody = document.querySelector("#usersTable tbody");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';

    try {
      const res = await API.call("listUsers");
      if (res && res.success && res.users) {
        tbody.innerHTML = res.users.map(u => `
          <tr>
            <td><strong>${u.User_ID}</strong></td>
            <td>${u.Name}</td>
            <td>${u.Email}</td>
            <td><span class="badge info">${u.Role}</span></td>
            <td>${u.Block}</td>
            <td><span class="badge ${u.Status === 'Active' ? 'success' : 'neutral'}">${u.Status}</span></td>
            <td>${u.Created_At || '-'}</td>
          </tr>
        `).join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger" style="text-align: center;">${res.message || "Failed to load users."}</td></tr>`;
      }
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-danger" style="text-align: center;">Error fetching user list.</td></tr>';
    }
  }

  return {
    init,
    switchView,
    showToast,
    handleLogin,
    handleLogout,
    showLoginModal,
    quickRoleLogin
  };
})();

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();

  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const pass = document.getElementById("loginPassword").value;
      App.handleLogin(email, pass);
    });
  }
});
