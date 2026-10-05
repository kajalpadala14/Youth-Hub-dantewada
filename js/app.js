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
    if (typeof GalleryModule !== "undefined") {
      GalleryModule.init();
    }
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
      const galBlockFilter = document.getElementById("galleryFilterBlock");
      if (galBlockFilter) {
        galBlockFilter.value = currentUser.block;
        galBlockFilter.disabled = true;
      }
    } else {
      if (blockFilter) blockFilter.disabled = false;
      if (youthHubFilter) youthHubFilter.disabled = false;
      const galBlockFilter = document.getElementById("galleryFilterBlock");
      if (galBlockFilter) galBlockFilter.disabled = false;
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
      } else if (viewName === "gallery") {
        if (typeof GalleryModule !== "undefined") {
          GalleryModule.loadGallery();
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
    /**
   * Login Handler - supports hardcoded default roles, custom dynamic users, and Apps Script backend
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
      const emailLower = (email || "").trim().toLowerCase();
      const passClean = (password || "").trim();

      // 1. Direct match with built-in default role profiles
      const matchedRole = Object.values(ROLE_PROFILES).find(p => p.email.toLowerCase() === emailLower);
      if (matchedRole) {
        const validPass = matchedRole.role === "ADMIN" ? "Admin@EO2026" 
                        : matchedRole.block === "Dantewada" ? "Dantewada@2026" 
                        : "Geedam@2026";
        if (passClean === validPass) {
          const token = "TOKEN-LIVE-" + Date.now();
          API.setSession(token, matchedRole);
          currentUser = matchedRole;
          showLoginModal(false);
          updateUserUI();
          DashboardModule.init();
          ReportsModule.init();
          showToast(`Welcome back, ${matchedRole.name}!`, "success");
          return;
        }
      }

      // 2. Check local custom users added in this session or stored locally
      const customUsers = getLocalCustomUsers();
      const matchedCustom = customUsers.find(u => u.Email.toLowerCase() === emailLower && u.Password_Hash === passClean);
      if (matchedCustom) {
        const userObj = {
          id: matchedCustom.User_ID,
          userId: matchedCustom.User_ID,
          name: matchedCustom.Name,
          email: matchedCustom.Email,
          role: matchedCustom.Role,
          block: matchedCustom.Block,
          youthHub: matchedCustom.Youth_Hub || (matchedCustom.Block !== "All" ? `Youth Hub ${matchedCustom.Block}` : "All"),
          badgeTitle: `${matchedCustom.Role === 'ADMIN' ? '👑' : '👤'} ${matchedCustom.Name} (${matchedCustom.Role})`,
          badgeClass: matchedCustom.Role === 'ADMIN' ? 'badge-admin' : 'badge-hub-dantewada',
          initials: (matchedCustom.Name || "U").substring(0, 2).toUpperCase()
        };
        const token = "TOKEN-CUSTOM-" + Date.now();
        API.setSession(token, userObj);
        currentUser = userObj;
        showLoginModal(false);
        updateUserUI();
        DashboardModule.init();
        ReportsModule.init();
        showToast(`Welcome back, ${userObj.name} (${userObj.role})!`, "success");
        return;
      }

      // 3. Fallback to Google Apps Script backend login API
      const res = await API.call("login", { email, password });
      if (res && res.success && res.user) {
        API.setSession(res.token, res.user);
        currentUser = res.user;
        showLoginModal(false);
        updateUserUI();
        DashboardModule.init();
        ReportsModule.init();
        showToast(`Welcome back, ${res.user.name}!`, "success");
      } else {
        if (errorEl) {
          errorEl.textContent = (res && res.message) ? res.message : "Authentication failed. Invalid email or password.";
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
   * =========================================================================
   * USER MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC) CONTROLLER
   * =========================================================================
   */
  const STORAGE_KEY_CUSTOM_USERS = "YH_DANTEWADA_CUSTOM_USERS";
  let cachedUsersList = [];

  function getLocalCustomUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalCustomUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn("Could not save custom users to localStorage", e);
    }
  }

  function getDefaultBuiltInUsers() {
    return [
      {
        User_ID: "USR-001",
        Name: "जिला रोजगार अधिकारी (District Employment Officer)",
        Email: "eo.dantewada@gmail.com",
        Password_Hash: "Admin@EO2026",
        Role: "ADMIN",
        Block: "All",
        Youth_Hub: "All",
        Status: "Active",
        Created_At: "2026-01-01"
      },
      {
        User_ID: "USR-002",
        Name: "Youth Hub Operator - Dantewada",
        Email: "youthhub.dantewada@gmail.com",
        Password_Hash: "Dantewada@2026",
        Role: "HUB_OPERATOR",
        Block: "Dantewada",
        Youth_Hub: "Youth Hub Dantewada",
        Status: "Active",
        Created_At: "2026-01-01"
      },
      {
        User_ID: "USR-003",
        Name: "Youth Hub Operator - Geedam",
        Email: "youthhub.geedam@gmail.com",
        Password_Hash: "Geedam@2026",
        Role: "HUB_OPERATOR",
        Block: "Geedam",
        Youth_Hub: "Youth Hub Geedam",
        Status: "Active",
        Created_At: "2026-01-01"
      }
    ];
  }

  /**
   * Load Admin Users View Table & KPI metrics
   */
  async function loadUsersTable() {
    const tbody = document.querySelector("#usersTable tbody");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748B;"><i class="fas fa-spinner fa-spin"></i> Loading users and role assignments...</td></tr>';

    try {
      let remoteUsers = [];
      try {
        const res = await API.call("listUsers");
        if (res && res.success && Array.isArray(res.users)) {
          remoteUsers = res.users;
        }
      } catch (err) {
        console.warn("Could not fetch remote users, using local cache:", err);
      }

      // Merge built-in defaults + remote users + local custom users
      const defaults = getDefaultBuiltInUsers();
      const customLocals = getLocalCustomUsers();

      const userMap = new Map();
      defaults.forEach(u => userMap.set(u.Email.toLowerCase(), u));
      remoteUsers.forEach(u => userMap.set(u.Email.toLowerCase(), { ...userMap.get(u.Email.toLowerCase()), ...u }));
      customLocals.forEach(u => userMap.set(u.Email.toLowerCase(), { ...userMap.get(u.Email.toLowerCase()), ...u }));

      cachedUsersList = Array.from(userMap.values());
      updateUserKPIs(cachedUsersList);
      renderUsersTable(cachedUsersList);
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-danger" style="text-align: center; padding: 20px;">Error loading users: ${e.message}</td></tr>`;
    }
  }

  function updateUserKPIs(users) {
    const totalEl = document.getElementById("kpiTotalUsers");
    const adminEl = document.getElementById("kpiAdminUsers");
    const hubEl = document.getElementById("kpiHubOperators");
    const dataEl = document.getElementById("kpiDataOperators");

    if (totalEl) totalEl.textContent = users.length;
    if (adminEl) adminEl.textContent = users.filter(u => u.Role === "ADMIN").length;
    if (hubEl) hubEl.textContent = users.filter(u => u.Role === "HUB_OPERATOR").length;
    if (dataEl) dataEl.textContent = users.filter(u => u.Role === "DATA_OPERATOR" || u.Role === "FIELD_MOBILIZER").length;
  }

  function renderUsersTable(usersToRender) {
    const tbody = document.querySelector("#usersTable tbody");
    if (!tbody) return;

    if (!usersToRender || usersToRender.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #94A3B8;">No user records found matching the filter criteria.</td></tr>';
      return;
    }

    tbody.innerHTML = usersToRender.map(u => {
      const isCurrent = currentUser && (currentUser.email.toLowerCase() === u.Email.toLowerCase() || currentUser.userId === u.User_ID || currentUser.id === u.User_ID);
      
      // Role badge styling
      let roleBadgeClass = "badge info";
      let roleIcon = "fa-user";
      if (u.Role === "ADMIN") {
        roleBadgeClass = "badge-role-admin";
        roleIcon = "fa-crown";
      } else if (u.Role === "HUB_OPERATOR") {
        roleBadgeClass = "badge-role-hub";
        roleIcon = "fa-building";
      } else if (u.Role === "DATA_OPERATOR") {
        roleBadgeClass = "badge-role-data";
        roleIcon = "fa-keyboard";
      } else if (u.Role === "FIELD_MOBILIZER") {
        roleBadgeClass = "badge-role-field";
        roleIcon = "fa-bullhorn";
      } else if (u.Role === "VIEWER") {
        roleBadgeClass = "badge-role-viewer";
        roleIcon = "fa-eye";
      }

      // Location badge
      const blockBadge = u.Block === "All" 
        ? '<span class="badge info" style="background:#E0E7FF; color:#3730A3;"><i class="fas fa-globe"></i> All District</span>'
        : `<span class="badge neutral" style="font-weight:600;"><i class="fas fa-map-marker-alt text-primary"></i> ${u.Block}</span>`;

      const statusBadge = u.Status === "Active" 
        ? '<span class="badge success"><i class="fas fa-check-circle"></i> Active</span>' 
        : '<span class="badge neutral"><i class="fas fa-pause-circle"></i> Inactive</span>';

      const currentIndicator = isCurrent 
        ? '<span class="badge success" style="margin-left: 6px; font-size: 10px; background: #059669; color: #fff;">Current Session</span>' 
        : '';

      return `
        <tr style="${isCurrent ? 'background-color: #F0FDF4;' : ''}">
          <td>
            <div style="font-weight: 700; color: #1E293B; font-family: monospace;">${u.User_ID || '-'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              ${escapeHtml(u.Name || 'User')}
              ${currentIndicator}
            </div>
          </td>
          <td style="color: #475569; font-size: 12.5px;">${escapeHtml(u.Email)}</td>
          <td>
            <span class="${roleBadgeClass}">
              <i class="fas ${roleIcon}"></i> ${u.Role}
            </span>
          </td>
          <td>${blockBadge}</td>
          <td style="font-size: 12px; color: #64748B;">${escapeHtml(u.Youth_Hub || (u.Block !== 'All' ? 'Youth Hub ' + u.Block : 'All Centers'))}</td>
          <td>${statusBadge}</td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: center;">
              <button type="button" class="btn-action-role" title="Switch Role / इस प्रोफाइल पर स्विच करें" onclick="App.switchUserRole('${escapeHtml(u.Email)}')">
                <i class="fas fa-exchange-alt"></i> Switch
              </button>
              <button type="button" class="btn-action-icon" title="Edit Role Assignment" onclick="App.openEditUserModal('${escapeHtml(u.Email)}')">
                <i class="fas fa-edit"></i>
              </button>
              ${u.User_ID !== 'USR-001' ? `
                <button type="button" class="btn-action-icon text-danger" title="Delete User" onclick="App.deleteUser('${escapeHtml(u.Email)}')">
                  <i class="fas fa-trash-alt"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function filterUsersTable() {
    const searchVal = (document.getElementById("usersSearchInput")?.value || "").toLowerCase().trim();
    const roleVal = document.getElementById("usersRoleFilter")?.value || "";
    const blockVal = document.getElementById("usersBlockFilter")?.value || "";

    const filtered = cachedUsersList.filter(u => {
      const matchSearch = !searchVal || 
        (u.Name && u.Name.toLowerCase().includes(searchVal)) ||
        (u.Email && u.Email.toLowerCase().includes(searchVal)) ||
        (u.User_ID && u.User_ID.toLowerCase().includes(searchVal)) ||
        (u.Youth_Hub && u.Youth_Hub.toLowerCase().includes(searchVal));

      const matchRole = !roleVal || u.Role === roleVal;
      const matchBlock = !blockVal || u.Block === blockVal;

      return matchSearch && matchRole && matchBlock;
    });

    renderUsersTable(filtered);
  }

  function openAddUserDrawer() {
    const drawer = document.getElementById("drawer_formUser");
    const backdrop = document.getElementById("slideOverBackdrop");
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    handleRoleChange('new');
  }

  function closeAddUserDrawer() {
    const drawer = document.getElementById("drawer_formUser");
    const backdrop = document.getElementById("slideOverBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  function handleRoleChange(type) {
    const prefix = type === 'new' ? 'newUser' : 'editUser';
    const roleEl = document.getElementById(`${prefix}Role`);
    const blockEl = document.getElementById(`${prefix}Block`);
    const hubEl = document.getElementById(`${prefix}YouthHub`);
    const infoEl = document.getElementById(`${prefix}RoleInfo`);

    if (!roleEl || !blockEl) return;
    const role = roleEl.value;

    if (role === "ADMIN") {
      blockEl.value = "All";
      if (hubEl) hubEl.value = "All";
      if (infoEl) infoEl.innerHTML = "• <strong>ADMIN</strong>: Full District Access. Can manage users, export all reports, see all blocks, and modify settings.";
    } else if (role === "HUB_OPERATOR") {
      if (blockEl.value === "All") blockEl.value = "Dantewada";
      handleBlockChange(type);
      if (infoEl) infoEl.innerHTML = "• <strong>HUB_OPERATOR</strong>: Locked to selected Block. Data entry and dashboard reports will auto-filter to this block.";
    } else if (role === "DATA_OPERATOR") {
      if (infoEl) infoEl.innerHTML = "• <strong>DATA_OPERATOR</strong>: Can enter and edit candidate records across assigned block, M-Forms, skill batches, and registrations.";
    } else if (role === "FIELD_MOBILIZER") {
      if (infoEl) infoEl.innerHTML = "• <strong>FIELD_MOBILIZER</strong>: Restricted to village and Gram Panchayat mobilization activities, camps, and attendance.";
    } else if (role === "VIEWER") {
      if (infoEl) infoEl.innerHTML = "• <strong>VIEWER</strong>: Read-Only access. Can inspect dashboards, milestone photos, and summaries without editing permission.";
    }
  }

  function handleBlockChange(type) {
    const prefix = type === 'new' ? 'newUser' : 'editUser';
    const blockEl = document.getElementById(`${prefix}Block`);
    const hubEl = document.getElementById(`${prefix}YouthHub`);
    if (!blockEl || !hubEl) return;

    const block = blockEl.value;
    if (block === "All") {
      hubEl.value = "All";
    } else {
      const matchOpt = Array.from(hubEl.options).find(o => o.value.toLowerCase().includes(block.toLowerCase()));
      if (matchOpt) {
        hubEl.value = matchOpt.value;
      }
    }
  }

  async function handleAddUserSubmit(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("btnSaveUser");
    const name = document.getElementById("newUserName")?.value.trim();
    const email = document.getElementById("newUserEmail")?.value.trim();
    const password = document.getElementById("newUserPassword")?.value.trim();
    const role = document.getElementById("newUserRole")?.value;
    const block = document.getElementById("newUserBlock")?.value;
    const youthHub = document.getElementById("newUserYouthHub")?.value;
    const status = document.getElementById("newUserStatus")?.value || "Active";

    if (!name || !email || !password || !role || !block) {
      showToast("कृपया सभी आवश्यक फ़ील्ड भरें (Name, Email, Password, Role, Block)", "warning");
      return;
    }

    // Check duplicate email
    if (cachedUsersList.some(u => u.Email.toLowerCase() === email.toLowerCase())) {
      showToast(`ईमेल "${email}" पहले से पंजीकृत है! कृपया भिन्न ईमेल चुनें।`, "warning");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating User...';
    }

    try {
      const userId = "USR-" + ("000" + (cachedUsersList.length + 1)).slice(-3);
      const newUserRecord = {
        User_ID: userId,
        Name: name,
        Email: email,
        Password_Hash: password,
        Role: role,
        Block: block,
        Youth_Hub: youthHub || (block !== "All" ? `Youth Hub ${block}` : "All"),
        Status: status,
        Created_At: new Date().toISOString().split("T")[0]
      };

      // 1. Try sending to Google Sheets backend
      try {
        await API.call("addUser", newUserRecord);
      } catch (err) {
        console.warn("Could not sync user to Google Sheets backend, saving locally:", err);
      }

      // 2. Save in local custom users list for instant access and persistence
      const customUsers = getLocalCustomUsers();
      customUsers.push(newUserRecord);
      saveLocalCustomUsers(customUsers);

      showToast(`उपयोगकर्ता सफलतापूर्वक जोड़ा गया: ${name} (${role})`, "success");
      closeAddUserDrawer();
      document.getElementById("formAddUser")?.reset();
      
      // Reload table
      await loadUsersTable();
    } catch (err) {
      showToast("Error creating user: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save & Assign Role';
      }
    }
  }

  function openEditUserModal(email) {
    const user = cachedUsersList.find(u => u.Email.toLowerCase() === email.toLowerCase());
    if (!user) return;

    document.getElementById("editUserId").value = user.User_ID || "";
    document.getElementById("editUserName").value = user.Name || "";
    document.getElementById("editUserEmail").value = user.Email || "";
    document.getElementById("editUserRole").value = user.Role || "HUB_OPERATOR";
    document.getElementById("editUserBlock").value = user.Block || "Dantewada";
    document.getElementById("editUserYouthHub").value = user.Youth_Hub || "All";
    document.getElementById("editUserStatus").value = user.Status || "Active";

    const modal = document.getElementById("editUserModal");
    if (modal) modal.classList.add("active");
  }

  function closeEditUserModal() {
    const modal = document.getElementById("editUserModal");
    if (modal) modal.classList.remove("active");
  }

  async function handleEditUserSubmit(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("btnUpdateUser");
    const userId = document.getElementById("editUserId").value;
    const email = document.getElementById("editUserEmail").value;
    const name = document.getElementById("editUserName").value.trim();
    const role = document.getElementById("editUserRole").value;
    const block = document.getElementById("editUserBlock").value;
    const youthHub = document.getElementById("editUserYouthHub").value;
    const status = document.getElementById("editUserStatus").value;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    }

    try {
      const updatedFields = {
        Name: name,
        Role: role,
        Block: block,
        Youth_Hub: youthHub,
        Status: status
      };

      // 1. Sync update to backend
      try {
        await API.call("updateRecord", {
          sheetName: "Users",
          idField: "Email",
          idValue: email,
          updatedData: updatedFields
        });
      } catch (err) {
        console.warn("Backend update error:", err);
      }

      // 2. Update local custom users
      let customUsers = getLocalCustomUsers();
      const idx = customUsers.findIndex(u => u.Email.toLowerCase() === email.toLowerCase());
      if (idx !== -1) {
        customUsers[idx] = { ...customUsers[idx], ...updatedFields };
        saveLocalCustomUsers(customUsers);
      }

      // 3. If currently logged in as this user, update active session
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        currentUser = {
          ...currentUser,
          name: name,
          role: role,
          block: block,
          youthHub: youthHub
        };
        API.setSession(API.getToken(), currentUser);
        updateUserUI();
      }

      showToast(`User ${name} updated successfully!`, "success");
      closeEditUserModal();
      await loadUsersTable();
    } catch (err) {
      showToast("Error updating user: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Update User';
      }
    }
  }

  async function deleteUser(email) {
    if (!confirm(`क्या आप निश्चित रूप से उपयोगकर्ता "${email}" को हटाना चाहते हैं?`)) {
      return;
    }

    try {
      // 1. Backend delete
      try {
        await API.call("deleteRecord", {
          sheetName: "Users",
          idField: "Email",
          idValue: email
        });
      } catch (err) {
        console.warn("Backend delete error:", err);
      }

      // 2. Remove from local storage
      let customUsers = getLocalCustomUsers();
      customUsers = customUsers.filter(u => u.Email.toLowerCase() !== email.toLowerCase());
      saveLocalCustomUsers(customUsers);

      showToast(`उपयोगकर्ता "${email}" हटाया गया।`, "info");
      await loadUsersTable();
    } catch (err) {
      showToast("Error deleting user: " + err.message, "error");
    }
  }

  /**
   * 1-Click Role Switcher directly from the User Table
   */
  function switchUserRole(email) {
    const user = cachedUsersList.find(u => u.Email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showToast("उपयोगकर्ता नहीं मिला", "warning");
      return;
    }

    const sessionUser = {
      id: user.User_ID,
      userId: user.User_ID,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      block: user.Block,
      youthHub: user.Youth_Hub || (user.Block !== "All" ? `Youth Hub ${user.Block}` : "All"),
      badgeTitle: `${user.Role === 'ADMIN' ? '👑' : '👤'} ${user.Name} (${user.Role})`,
      badgeClass: user.Role === 'ADMIN' ? 'badge-admin' : 'badge-hub-dantewada',
      initials: (user.Name || "U").substring(0, 2).toUpperCase()
    };

    const token = "TOKEN-SWITCH-" + Date.now();
    API.setSession(token, sessionUser);
    currentUser = sessionUser;

    showToast(`सक्रिय प्रोफाइल स्विच की गई: ${user.Name} (${user.Role} - ${user.Block})`, "success");
    updateUserUI();

    // Re-render users table to show new active indicator
    renderUsersTable(cachedUsersList);

    // Refresh dashboard and reports with block restrictions
    if (window.DashboardModule && DashboardModule.loadDashboard) {
      DashboardModule.loadDashboard();
    }
    if (window.ReportsModule && ReportsModule.loadActiveReport) {
      ReportsModule.loadActiveReport();
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    init,
    switchView,
    showToast,
    handleLogin,
    handleLogout,
    showLoginModal,
    quickRoleLogin,
    loadUsersTable,
    filterUsersTable,
    openAddUserDrawer,
    closeAddUserDrawer,
    handleRoleChange,
    handleBlockChange,
    handleAddUserSubmit,
    openEditUserModal,
    closeEditUserModal,
    handleEditUserSubmit,
    deleteUser,
    switchUserRole
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

  // Add User Form submit handler
  const formAddUser = document.getElementById("formAddUser");
  if (formAddUser) {
    formAddUser.addEventListener("submit", (e) => {
      App.handleAddUserSubmit(e);
    });
  }

  // Edit User Form submit handler
  const formEditUser = document.getElementById("formEditUser");
  if (formEditUser) {
    formEditUser.addEventListener("submit", (e) => {
      App.handleEditUserSubmit(e);
    });
  }
});
