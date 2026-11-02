/**
 * Comprehensive Admin Dashboard Application
 * Dantewada Youth Development, Employment & Success Story Portal
 * District Administration / Zilla Panchayat, Dantewada
 */

(function () {
  const escapeHtml = (typeof window !== 'undefined' && window.DantewadaUtils && window.DantewadaUtils.escapeHtml) || function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  let activeTab = 'dashboard';
  let charts = {};
  let currentUploadedPhotos = [];
  let currentImportPreview = null;

  function getCloudSheetName(sheetKey) {
    const map = {
      Youth_Hub_Trainings: 'Youth_Hub_Trainee',
      youth_hub_trainings: 'Youth_Hub_Trainee',
      Youth_Hub_Trainees: 'Youth_Hub_Trainee',
      Meetings_VO_CLF_TRIF: 'VO CLF Meeting',
      meetings_vo_clf_trif: 'VO CLF Meeting',
      Startup_District_Ideas: 'Entrepreneur_Identified',
      startup_district_ideas: 'Entrepreneur_Identified',
      Bastar_Munne_Report: 'Bastar_Munne_Shivir',
      bastar_munne_report: 'Bastar_Munne_Shivir',
      Rang_De_Loan: 'Rang de loan',
      rang_de_loan: 'Rang de loan',
      M_Form: 'M Form',
      m_form: 'M Form'
    };
    return map[sheetKey] || sheetKey;
  }
  if (typeof window !== 'undefined') window.getCloudSheetName = getCloudSheetName;

  function prepareSingleRecordForCloud(sheetKey, record) {
    if (!record || typeof record !== 'object') return {};
    const clean = {};
    for (const [k, v] of Object.entries(record)) {
      if (!k.startsWith('_')) {
        clean[k] = v;
      }
    }

    // Sheet specific dual-key and alias expansion
    if (sheetKey === 'Entrepreneur_Identified' || sheetKey === 'Startup_District_Ideas') {
      const founder = clean['FOUNDER NAME'] || clean['founderName'] || clean['NAME'] || clean['name'] || clean['First Name'] || '';
      const startup = clean['STARTUP / IDEA NAME'] || clean['startupName'] || clean['BUSSINESS'] || clean['BUSINESS'] || clean['business'] || '';
      const investment = clean['INVESTMENT NEEDED'] || clean['investmentNeeded'] || clean['LOAN AMOUNT'] || clean['loanAmount'] || '';
      const address = clean['ADDRESS'] || clean['address'] || clean['VILLAGE'] || clean['village'] || '';
      const district = clean['DISTRICT'] || clean['district'] || clean['BLOCK'] || clean['block'] || '';
      const phone = clean['MOBILE NO.'] || clean['mobile'] || clean['MOBILE NUMBER'] || '';
      const edu = clean['EDUCATION'] || clean['education'] || clean['QUALIFICATION'] || '';
      const workType = clean['WORK TYPE'] || clean['workType'] || '';
      const bizModel = clean['BUSINESS MODEL / PROBLEM'] || clean['businessModel'] || clean['BUSINESS MODEL'] || '';

      if (founder) { clean['FOUNDER NAME'] = founder; clean['NAME'] = founder; }
      if (startup) { clean['STARTUP / IDEA NAME'] = startup; clean['BUSSINESS'] = startup; clean['BUSINESS'] = startup; }
      if (investment) { clean['INVESTMENT NEEDED'] = investment; clean['LOAN AMOUNT'] = investment; }
      if (address) { clean['ADDRESS'] = address; clean['VILLAGE'] = address; }
      if (district) { clean['DISTRICT'] = district; clean['BLOCK'] = district; }
      if (phone) { clean['MOBILE NO.'] = phone; clean['MOBILE NUMBER'] = phone; }
      if (edu) { clean['EDUCATION'] = edu; clean['QUALIFICATION'] = edu; }
      if (workType) { clean['WORK TYPE'] = workType; }
      if (bizModel) { clean['BUSINESS MODEL / PROBLEM'] = bizModel; }
    } else if (sheetKey === 'Education_Linked') {
      const father = clean['Faather Name'] || clean['Father Name'] || clean['fatherName'] || clean["Father's Name / Husband's Name"] || '';
      if (father) { clean['Faather Name'] = father; clean['Father Name'] = father; }
      const phone = clean['Phone Number'] || clean['Phone'] || clean['Mobile Number'] || clean['MOBILE NO.'] || '';
      if (phone) { clean['Phone Number'] = phone; clean['Mobile Number'] = phone; }
    } else if (sheetKey === 'PMEGP_PMFME_Loan') {
      const biz = clean['BUSSINESS'] || clean['BUSINESS'] || clean['business'] || '';
      if (biz) { clean['BUSSINESS'] = biz; clean['BUSINESS'] = biz; }
    } else if (sheetKey === 'Employed' || sheetKey === 'Skill_Linked' || sheetKey === 'Training_Conducted' || sheetKey === 'IIM_Candidate_List') {
      const nm = clean['NAME '] || clean['NAME'] || clean['name'] || '';
      if (nm) { clean['NAME '] = nm; clean['NAME'] = nm; }
      const mob = clean['MOBILE N0.'] || clean['MOBILE NO, '] || clean['MOBILE NO.'] || clean['mobile'] || '';
      if (mob) { clean['MOBILE N0.'] = mob; clean['MOBILE NO, '] = mob; clean['MOBILE NO.'] = mob; }
    }

    return clean;
  }
  if (typeof window !== 'undefined') window.prepareSingleRecordForCloud = prepareSingleRecordForCloud;

  function prepareRecordsForCloud(sheetKey, rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(r => prepareSingleRecordForCloud(sheetKey, r));
  }
  if (typeof window !== 'undefined') window.prepareRecordsForCloud = prepareRecordsForCloud;

  function init() {
    setupRoleSwitcher();
    setupNavigation();
    setupAdminModalBackdrops();
    setupEventListeners();
    renderActiveTab();
    updateSidebarBadgeCounts();
  }

  function setupAdminModalBackdrops() {
    const modalIds = [
      'youthModal', 'youthDossierModal', 'villageCandidatesModal', 
      'sheetRecordModal', 'bulkUploadModal', 'createStoryModal', 
      'storyModal', 'visitModal'
    ];
    modalIds.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalIds.forEach(id => {
          const modal = document.getElementById(id);
          if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
        });
      }
    });
  }

  // -------------------------------------------------------------
  // Role & Permissions Setup
  // -------------------------------------------------------------
  function setupRoleSwitcher() {
    const roleSelect = document.getElementById('roleSwitcherSelect');
    const roleSelectMobile = document.getElementById('roleSwitcherSelectMobile');
    if (!window.DantewadaAuth) return;

    const users = window.DantewadaAuth.getAllPresetUsers();
    const currentUser = window.DantewadaAuth.getCurrentUser();

    const optionsHtml = users.map(u => {
      const roleDetails = window.DantewadaAuth.getRoleDetails(u.role);
      const isSelected = currentUser && currentUser.id === u.id ? 'selected' : '';
      return `<option value="${u.id}" ${isSelected}>${u.name} — [${roleDetails.name}]</option>`;
    }).join('');

    if (roleSelect) {
      roleSelect.innerHTML = optionsHtml;
      roleSelect.addEventListener('change', (e) => handleUserSwitch(e.target.value));
    }

    if (roleSelectMobile) {
      roleSelectMobile.innerHTML = optionsHtml;
      roleSelectMobile.addEventListener('change', (e) => handleUserSwitch(e.target.value));
    }

    updateUserUI();
  }

  function handleUserSwitch(userId) {
    if (!window.DantewadaAuth) return;
    const switched = window.DantewadaAuth.switchUser(userId);
    if (switched) {
      const roleSelect = document.getElementById('roleSwitcherSelect');
      const roleSelectMobile = document.getElementById('roleSwitcherSelectMobile');
      if (roleSelect) roleSelect.value = userId;
      if (roleSelectMobile) roleSelectMobile.value = userId;
      updateUserUI();
      renderActiveTab();
    }
  }

  function updateUserUI() {
    if (!window.DantewadaAuth) return;
    const user = window.DantewadaAuth.getCurrentUser();
    const roleDetails = window.DantewadaAuth.getRoleDetails(user.role);

    const userNameEl = document.getElementById('adminCurrentUserName');
    const userRoleEl = document.getElementById('adminCurrentUserRole');
    const userAvatarEl = document.getElementById('adminUserAvatar');
    const blockBadgeEl = document.getElementById('adminUserBlockBadge');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = `${roleDetails.name} (${roleDetails.nameHi})`;
    if (userAvatarEl) {
      const parts = (user.name || '').trim().split(/\s+/).filter(Boolean);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (user.name || 'AV').slice(0, 2).toUpperCase();
      userAvatarEl.textContent = initials;
    }

    if (blockBadgeEl) {
      if (window.DantewadaAuth.isBlockRestricted()) {
        blockBadgeEl.textContent = `Block: ${user.block}`;
        blockBadgeEl.classList.remove('hidden');
      } else {
        blockBadgeEl.classList.add('hidden');
      }
    }

    // Restrict navigation menu items based on RBAC
    updateNavRestrictions();
  }

  function updateNavRestrictions() {
    if (!window.DantewadaAuth) return;
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      const tab = item.getAttribute('data-tab');
      let allowed = true;

      if (tab === 'audit' && !window.DantewadaAuth.can('audit_logs')) allowed = false;
      if (tab === 'importer' && !window.DantewadaAuth.can('import')) allowed = false;
      if (tab === 'stories' && !window.DantewadaAuth.can('story_read')) allowed = false;
      if (tab === 'gallery' && !window.DantewadaAuth.can('visit_read')) allowed = false;

      if (allowed) {
        item.classList.remove('opacity-40', 'pointer-events-none');
      } else {
        item.classList.add('opacity-40', 'pointer-events-none');
      }
    });
  }

  // -------------------------------------------------------------
  // Navigation & Mobile Drawer Controls
  // -------------------------------------------------------------
  const BREADCRUMB_MAP = {
    dashboard: { group: 'CORE / मुख्य', active: 'Dashboard (डैशबोर्ड)' },
    'sheet-viewer': { group: '11 SHEETS DATA / 11 शीट्स डेटा', active: '11 Sheets Data Viewer (पैरामीटर्स तालिका)' },
    stories: { group: 'CORE / मुख्य', active: 'Success Gallery (सफलता गैलरी)' },
    gallery: { group: 'CORE / मुख्य', active: 'Visit Gallery (विजिट गैलरी)' },
    youth: { group: 'DATA ENTRY / डेटा प्रविष्टि', active: 'Youth Profiles (युवा प्रबंधन)' },
    importer: { group: 'DATA ENTRY / डेटा प्रविष्टि', active: 'Excel 11-Sheets Import (डेटा आयात)' },
    visits: { group: 'DATA ENTRY / डेटा प्रविष्टि', active: 'Field Visit & Photos (फील्ड विजिट)' },
    monitoring: { group: 'ANALYTICS / विश्लेषण', active: 'Visit Monitoring & Follow-up (फॉलो-अप)' },
    reports: { group: 'ANALYTICS / विश्लेषण', active: 'Reports & Analytics (रिपोर्ट्स)' },
    audit: { group: 'ADMINISTRATION / प्रशासन', active: 'Audit Logs & System (ऑडिट लॉग)' }
  };

  function closeMobileSidebar() {
    const sidebar = document.getElementById('adminSidebar') || document.querySelector('aside');
    const backdrop = document.getElementById('adminSidebarBackdrop');
    if (sidebar) {
      sidebar.classList.remove('sidebar-open');
    }
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.classList.remove('active');
    }
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById('adminSidebar') || document.querySelector('aside');
    const backdrop = document.getElementById('adminSidebarBackdrop');
    if (sidebar) {
      sidebar.classList.add('sidebar-open');
    }
    if (backdrop) {
      backdrop.classList.remove('hidden');
      backdrop.classList.add('active');
    }
  }

  function toggleSidebar() {
    const isMobile = window.innerWidth < 1024;
    const sidebar = document.getElementById('adminSidebar') || document.querySelector('aside');
    if (isMobile) {
      if (sidebar && sidebar.classList.contains('sidebar-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    } else {
      if (sidebar) {
        sidebar.classList.toggle('hidden');
      }
    }
  }

  function setupNavigation() {
    document.querySelectorAll('.admin-nav-item, .bilingual-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
        if (window.innerWidth < 1024) {
          closeMobileSidebar();
        }
      });
    });

    // Mobile Header Toggle
    const mobileToggleBtn = document.getElementById('adminMobileSidebarToggle');
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Mobile Drawer Close Button
    const closeBtn = document.getElementById('adminCloseSidebarBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeMobileSidebar();
      });
    }

    // Backdrop Click
    const backdrop = document.getElementById('adminSidebarBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        closeMobileSidebar();
      });
    }

    // Content Bar Toggle Button
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileSidebar();
      }
    });

    updateTopBarAlerts();
  }

  function updateTopBarAlerts() {
    if (!window.DantewadaDB) return;
    const visits = window.DantewadaDB.getFieldVisits();
    const followUpsDue = visits.filter(v => v.status === 'Follow-up Required' || v.status === 'Action in Progress').length;
    const pill = document.getElementById('topBarPendingFollowups');
    if (pill) pill.textContent = followUpsDue;
  }

  function switchTab(tabId) {
    activeTab = tabId;

    if (window.innerWidth < 1024) {
      closeMobileSidebar();
    }

    document.querySelectorAll('.admin-nav-item, .bilingual-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-tab-content').forEach(view => {
      if (view.id === `tab-${tabId}`) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    // Update horizontal breadcrumb navigation bar
    const info = BREADCRUMB_MAP[tabId] || { group: 'CORE', active: tabId };
    const groupEl = document.getElementById('adminNavBreadcrumbGroup');
    const activeEl = document.getElementById('adminNavBreadcrumbActive');
    if (groupEl) groupEl.textContent = info.group;
    if (activeEl) activeEl.textContent = info.active;

    renderActiveTab();
  }

  window.switchTab = switchTab;

  function renderActiveTab() {
    switch (activeTab) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'sheet-viewer':
        renderSheetViewer();
        break;
      case 'importer':
        renderImporter();
        break;
      case 'youth':
        renderYouthTable();
        break;
      case 'visits':
        renderVisitForm();
        break;
      case 'gallery':
        renderVisitGallery();
        break;
      case 'stories':
        renderSuccessStories();
        break;
      case 'monitoring':
        renderMonitoring();
        break;
      case 'reports':
        renderReports();
        break;
      case 'audit':
        renderAuditLogs();
        break;
    }
  }

  // -------------------------------------------------------------
  // 1. Dashboard Overview
  // -------------------------------------------------------------
  function updateSidebarBadgeCounts() {
    if (!window.DantewadaDB) return;
    const buttons = document.querySelectorAll('button[data-sheet]');
    buttons.forEach(btn => {
      const key = btn.getAttribute('data-sheet');
      const badge = btn.querySelector('.sheet-count-badge') || btn.querySelector('span:last-child');
      if (!badge || !key) return;

      if (key === 'Startup_District_Ideas') {
        const ideas = window.DantewadaDB.data.entrepreneurIdeas || [];
        const dists = new Set(ideas.map(i => (i.district || '').trim()).filter(Boolean));
        badge.textContent = `${dists.size} Dist`;
      } else if (key === 'Bastar_Munne_Report') {
        const rep = window.DantewadaDB.getSheetData('Bastar_Munne_Report') || [];
        const vCount = rep.filter(r => r.sr !== 'TOTAL' && !(r.village || '').includes('TOTAL')).length;
        badge.textContent = `${vCount} Villages`;
      } else {
        const list = window.DantewadaDB.getSheetData(key) || [];
        badge.textContent = list.length;
      }
    });
  }

  function renderDashboard() {
    if (!window.DantewadaDB) return;

    let filterBlock = 'All';
    if (window.DantewadaAuth && window.DantewadaAuth.isBlockRestricted()) {
      filterBlock = window.DantewadaAuth.getRestrictedBlock();
    } else {
      const select = document.getElementById('dashBlockFilter');
      if (select) filterBlock = select.value;
    }

    const kpis = window.DantewadaDB.getKPIs(filterBlock);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Number(val || 0).toLocaleString('en-IN');
    };

    setVal('kpi-total-youth', kpis.totalYouth);
    setVal('kpi-employed-youth', kpis.employedYouth);
    setVal('kpi-skills-youth', kpis.skillTrainedYouth);
    setVal('kpi-edu-youth', kpis.educationLinked);
    setVal('kpi-entrepreneurs', kpis.identifiedEntrepreneurs);
    setVal('kpi-loans', (kpis.identifiedEntrepreneurs || 0) + (kpis.schemeBeneficiaries || 0));
    setVal('kpi-trainings', kpis.trainingsConducted || 0);
    setVal('kpi-my-bharat', kpis.myBharatRegistered);
    setVal('kpi-youth-hub', kpis.youthHubTrainees);
    setVal('kpi-visits', kpis.fieldVisitsCount);
    setVal('kpi-photos', kpis.visitPhotosCount);
    setVal('kpi-stories', kpis.successStoriesCount);

    // Update the 11 Database Category Module KPI Cards
    const sheetKpis = [
      { id: 'kpi-card-val-employment-registration', key: 'Employment_Registration' },
      { id: 'kpi-card-val-employed', key: 'Employed' },
      { id: 'kpi-card-val-skill-linked', key: 'Skill_Linked' },
      { id: 'kpi-card-val-education-linked', key: 'Education_Linked' },
      { id: 'kpi-card-val-entrepreneur-identified', key: 'Entrepreneur_Identified' },
      { id: 'kpi-card-val-pmegp-pmfme-loan', key: 'PMEGP_PMFME_Loan' },
      { id: 'kpi-card-val-rang-de-loan', key: 'Rang_De_Loan' },
      { id: 'kpi-card-val-iim-candidate-list', key: 'IIM_Candidate_List' },
      { id: 'kpi-card-val-training-conducted', key: 'Training_Conducted' },
      { id: 'kpi-card-val-my-bharat-registration', key: 'MY_Bharat_Registration' },
      { id: 'kpi-card-val-youth-hub-trainings', key: 'Youth_Hub_Trainings' },
      { id: 'kpi-card-val-bastar-munne-shivir', key: 'Bastar_Munne_Shivir' },
      { id: 'kpi-card-val-meetings-vo-clf-trif', key: 'Meetings_VO_CLF_TRIF' }
    ];

    sheetKpis.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        const count = (window.DantewadaDB.getSheetData(item.key, { block: filterBlock }) || []).length;
        el.textContent = Number(count).toLocaleString('en-IN');
      }
    });

    renderDashboardCharts(filterBlock);
    updateSidebarBadgeCounts();
  }

  function renderDashboardCharts(filterBlock) {
    if (typeof Chart === 'undefined' || !window.DantewadaDB) return;

    const youth = window.DantewadaDB.getYouth({ block: filterBlock });

    // Block breakdown chart
    const blockCtx = document.getElementById('adminBlockChart');
    if (blockCtx) {
      if (charts.block) charts.block.destroy();
      const blocks = ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'];
      const counts = blocks.map(b => youth.filter(y => (y.block || '').toLowerCase() === b.toLowerCase()).length);

      charts.block = new Chart(blockCtx, {
        type: 'bar',
        data: {
          labels: ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'],
          datasets: [{
            label: 'Registered Youth',
            data: counts,
            backgroundColor: '#1e3a8a',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Gender ratio chart
    const genderCtx = document.getElementById('adminGenderChart');
    if (genderCtx) {
      if (charts.gender) charts.gender.destroy();
      const mCount = youth.filter(y => (y.gender || '').toLowerCase() === 'male').length;
      const fCount = youth.filter(y => (y.gender || '').toLowerCase() === 'female').length;

      charts.gender = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
          labels: ['Male / पुरुष', 'Female / महिला'],
          datasets: [{
            data: [mCount, fCount],
            backgroundColor: ['#2563eb', '#ec4899'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // Qualification chart
    const qualCtx = document.getElementById('adminQualChart');
    if (qualCtx) {
      if (charts.qual) charts.qual.destroy();
      const quals = ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'ITI / Diploma'];
      const qCounts = quals.map(q => youth.filter(y => (y.qualification || '').toLowerCase().includes(q.toLowerCase().split(' ')[0])).length);

      charts.qual = new Chart(qualCtx, {
        type: 'pie',
        data: {
          labels: quals,
          datasets: [{
            data: qCounts,
            backgroundColor: ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
          }
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 2. Excel/CSV 11-Sheets Importer
  // -------------------------------------------------------------
  function renderImporter() {
    const fileInput = document.getElementById('importerFileInput');
    const sheetSelect = document.getElementById('importerSheetSelect');
    const dropzone = document.getElementById('importerDropzone');

    if (!fileInput || !dropzone) return;

    function updateSheetColumnGuide() {
      const sheetName = sheetSelect ? sheetSelect.value : 'Employment_Registration';
      const cols = SHEET_COLUMNS_SPEC[sheetName] || [];
      const badgeContainer = document.getElementById('sheetColumnBadges');
      const countEl = document.getElementById('sheetColCount');
      if (countEl) countEl.textContent = `${cols.length} Columns`;
      if (badgeContainer) {
        badgeContainer.innerHTML = cols.map(c => `
          <span class="bg-white/90 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-mono">
            ${c}
          </span>
        `).join('');
      }
    }

    if (sheetSelect) {
      sheetSelect.onchange = updateSheetColumnGuide;
      updateSheetColumnGuide();
    }

    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };

    dropzone.ondragleave = () => {
      dropzone.classList.remove('dragover');
    };

    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleImportFile(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = (e) => {
      if (e.target.files.length > 0) {
        handleImportFile(e.target.files[0]);
      }
    };
  }

  const SHEET_COLUMNS_SPEC = {
    Employment_Registration: [
      "Unnamed: 0", "First Name", "Last Name", "Father's Name / Husband's Name", "Grampanchayat", "Block Name", "Mobile Number", "Gender", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ],
    Employed: [
      "SR. NO.", "NAME", "FATHER NAME", "ADDRESS", "BLOCK", "DISTRICT", "MOBILE NO.", "ORGANISATION", "DATE OF JOINING", "SALARY"
    ],
    Skill_Linked: [
      "NAME", "VILLAGE", "MOBILE NO.", "INSTITUTE", "SKILL TRAINING"
    ],
    Education_Linked: [
      "Name", "Faather Name", "Mother Name", "Email", "Gender", "Education", "Phone Number", "Address"
    ],
    Entrepreneur_Identified: [
      "SR. NO.", "STARTUP / IDEA NAME", "DISTRICT", "FOUNDER NAME", "AGE", "ADDRESS", "EDUCATION", "MOBILE NO.", "INVESTMENT NEEDED", "WORK TYPE", "BUSINESS MODEL / PROBLEM"
    ],
    Startup_District_Ideas: [
      "SR. NO.", "STARTUP / IDEA NAME", "DISTRICT", "FOUNDER NAME", "AGE", "ADDRESS", "EDUCATION", "MOBILE NO.", "INVESTMENT NEEDED", "WORK TYPE", "BUSINESS MODEL / PROBLEM"
    ],
    PMEGP_PMFME_Loan: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "LOAN AMOUNT", "YOJNA", "BUSSINESS"
    ],
    Rang_De_Loan: [
      "SR. NO.", "NAME", "ADDRESS", "MOBILE NO.", "ACTIVITY", "AMOUNT (₹)", "2ND (₹)"
    ],
    IIM_Candidate_List: [
      "SR", "NAME", "FATHER NAME", "GENDER", "AGE", "CAST", "GP", "BLOCK", "DISTRICT", "MOBILE NO.", "EDUCATION", "PERCENT", "AGE_2"
    ],
    Training_Conducted: [
      "NAME", "ADDRESS", "MOBILE NO.", "INSTITUTE", "TRAINING"
    ],
    MY_Bharat_Registration: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB", "GENDER", "MOBILE NO.", "CATEGORY", "CURRENT OCCUPATION", "REMARK"
    ],
    Youth_Hub_Trainings: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB", "GENDER", "MOBILE NO.", "REMARK"
    ],
    Bastar_Munne_Shivir: [
      "NAME", "FATHER NAME", "VILLAGE", "BLOCK", "DOB", "GENDER", "MOBILE NO.", "AADHAR", "CATEGORY", "REMARK"
    ],
    Meetings_VO_CLF_TRIF: [
      "DATE", "VILLAGE", "BLOCK", "VO / CLF NAME", "ADHAYAKSH / SACHIV", "DISCUSS POINT", "REMARKS", "PHOTO"
    ],
    M_Form: [
      "SR. NO.", "Block Name", "Grampanchayat", "First Name", "Last Name", "Mobile Number", "Gender", "Email", "Pin Code", "Father's Name / Husband's Name", "Mother's Name", "Category", "Highest Qualification", "Current Occupation", "Aspired Career"
    ],
    Field_Visits: [
      "VISIT ID", "DATE", "OFFICER NAME", "BLOCK", "GRAM PANCHAYAT", "LOCATION", "PURPOSE", "SCHEME", "FINDINGS", "STATUS"
    ]
  };

  function handleImportFile(file) {
    if (!file) return;

    const sheetSelect = document.getElementById('importerSheetSelect');
    const sheetName = sheetSelect ? sheetSelect.value : 'Employment_Registration';

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      if (typeof XLSX === 'undefined') {
        alert('XLSX library loading... please try in a moment.');
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: 'array' });
        // Pick sheet: matching sheet name or first sheet
        let targetSheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];

        // Auto-detect header row to handle extra title or empty top rows (e.g. in Entrepreneur_Identified)
        const rawAOA = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: '' });
        let headerRowIndex = 0;
        for (let r = 0; r < Math.min(rawAOA.length, 5); r++) {
          const rowVals = (rawAOA[r] || []).map(c => String(c).trim().toUpperCase());
          if (rowVals.includes('NAME') || rowVals.includes('FIRST NAME') || rowVals.includes('SR') || rowVals.includes('SR. NO.') || rowVals.includes('UNNAMED: 0')) {
            headerRowIndex = r;
            break;
          }
        }

        const rows = XLSX.utils.sheet_to_json(targetSheet, { range: headerRowIndex, defval: '' });

        currentImportPreview = window.DantewadaDB.previewImport(sheetName, rows);
        displayImportPreview(currentImportPreview);
      } catch (err) {
        alert('Error reading Excel/CSV file: ' + err.message);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function displayImportPreview(preview) {
    const container = document.getElementById('importerPreviewArea');
    if (!container || !preview) return;

    container.classList.remove('hidden');

    const summaryEl = document.getElementById('importerStatsSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-center">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span class="text-xs text-slate-500 uppercase font-bold block">कुल पंक्तियाँ (Total)</span>
            <strong class="text-xl text-slate-800">${preview.totalCount}</strong>
          </div>
          <div class="p-3 bg-green-50 border border-green-200 rounded-xl">
            <span class="text-xs text-green-700 uppercase font-bold block">सत्यापित (Valid)</span>
            <strong class="text-xl text-green-700">${preview.validRows.length}</strong>
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="text-xs text-amber-700 uppercase font-bold block">डुप्लीकेट (Duplicates)</span>
            <strong class="text-xl text-amber-700">${preview.duplicateRows.length}</strong>
          </div>
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <span class="text-xs text-rose-700 uppercase font-bold block">अमान्य (Invalid)</span>
            <strong class="text-xl text-rose-700">${preview.invalidRows.length}</strong>
          </div>
        </div>
      `;
    }

    // Preview table
    const tableBody = document.getElementById('importerPreviewTableBody');
    if (tableBody) {
      const sampleRows = preview.validRows.slice(0, 10);
      tableBody.innerHTML = sampleRows.map((r, i) => `
        <tr class="hover:bg-slate-50 border-b border-slate-100">
          <td class="p-3 text-xs font-mono text-slate-400">${i + 1}</td>
          <td class="p-3 text-sm font-semibold text-slate-800">${r._normalized.name}</td>
          <td class="p-3 text-xs text-slate-600">${r._normalized.mobile || 'N/A'}</td>
          <td class="p-3 text-xs text-slate-600">${r._normalized.block}</td>
          <td class="p-3 text-xs text-slate-600">${r._normalized.village}</td>
          <td class="p-3 text-xs"><span class="badge-status badge-active">Ready</span></td>
        </tr>
      `).join('');
    }

    // Duplicate warnings list
    const dupContainer = document.getElementById('importerDuplicatesList');
    if (dupContainer) {
      if (preview.duplicateRows.length > 0) {
        dupContainer.innerHTML = preview.duplicateRows.slice(0, 5).map(d => `
          <div class="p-2.5 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-900 mb-1.5">
            <strong>Row #${d.row._rowNum}: ${d.row._normalized.name}</strong> — ${d.reason}
          </div>
        `).join('');
      } else {
        dupContainer.innerHTML = `<p class="text-xs text-slate-400">कोई डुप्लीकेट रिकॉर्ड नहीं मिला। डेटा सुरक्षित है।</p>`;
      }
    }
  }

  window.commitCurrentImport = async function () {
    if (!currentImportPreview || currentImportPreview.validRows.length === 0) {
      alert('इंपोर्ट करने के लिए कोई मान्य रिकॉर्ड नहीं है।');
      return;
    }

    const sheetKey = currentImportPreview.sheetName;
    const res = window.DantewadaDB.commitImport(sheetKey, currentImportPreview.validRows);
    if (!res.success) {
      alert('डेटा आयात विफल: ' + (res.error || 'Unknown storage error'));
      return;
    }

    const count = res.insertedCount ?? res.count ?? currentImportPreview.validRows.length;
    let cloudMsg = '';

    // Synchronize to Google Apps Script Backend
    if (typeof API !== 'undefined' && API.call && currentImportPreview.validRows.length > 0) {
      try {
        const targetCloudSheet = getCloudSheetName(sheetKey);
        const recordsToSend = prepareRecordsForCloud(sheetKey, currentImportPreview.validRows);
        const cloudRes = await API.call('bulkInsert', {
          sheetName: targetCloudSheet,
          records: recordsToSend
        });
        if (cloudRes && cloudRes.success) {
          cloudMsg = ` (Google Sheet [${targetCloudSheet}] में भी ${cloudRes.insertedCount || count} पंक्तियां सफलतापूर्वक जुड़ गईं!)`;
        } else if (cloudRes && cloudRes.message) {
          cloudMsg = ` (Google Sheet सूचना: ${cloudRes.message})`;
        }
      } catch (err) {
        console.warn('Cloud bulkInsert notice for commitCurrentImport:', err.message);
        cloudMsg = ` (Google Sheet सिंक सूचना: ${err.message})`;
      }
    }

    alert(`सफल! ${count} नए रिकॉर्ड सफलतापूर्वक डेटाबेस में सुरक्षित किए गए।${cloudMsg}`);
    document.getElementById('importerPreviewArea').classList.add('hidden');
    currentImportPreview = null;
    renderActiveTab();
  };

  window.downloadSampleTemplate = function () {
    const sheetSelect = document.getElementById('importerSheetSelect');
    const sheetName = sheetSelect ? sheetSelect.value : 'Employment_Registration';

    const cols = SHEET_COLUMNS_SPEC[sheetName] || SHEET_COLUMNS_SPEC.Employment_Registration;
    const ws = XLSX.utils.aoa_to_sheet([cols]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `Template_${sheetName}_Dantewada.xlsx`);
  };

  // -------------------------------------------------------------
  // 3. Youth Profiles Management
  // -------------------------------------------------------------
  function renderYouthTable() {
    if (!window.DantewadaDB) return;

    const searchInput = document.getElementById('youthSearchInput');
    const blockSelect = document.getElementById('youthBlockFilter');
    const genderSelect = document.getElementById('youthGenderFilter');
    const catSelect = document.getElementById('youthCategoryFilter');

    const options = {
      search: searchInput ? searchInput.value : '',
      block: blockSelect ? blockSelect.value : 'All',
      gender: genderSelect ? genderSelect.value : 'All',
      category: catSelect ? catSelect.value : 'All'
    };

    const youthList = window.DantewadaDB.getYouth(options);

    const countEl = document.getElementById('youthRecordCount');
    if (countEl) countEl.textContent = youthList.length;

    const tbody = document.getElementById('youthTableBody');
    if (!tbody) return;

    if (youthList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="py-12 text-center text-slate-400">
            <i class="fa-solid fa-users-slash text-4xl mb-2 text-slate-300"></i>
            <p>कोई युवा रिकॉर्ड नहीं मिला। खोज मापदंड बदलें।</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = youthList.slice(0, 50).map((y, idx) => `
      <tr class="hover:bg-blue-50/40 border-b border-slate-100 transition-colors">
        <td class="p-3 text-xs font-mono text-slate-400">${idx + 1}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900 text-sm">${escapeHtml(y.name)}</div>
          <div class="text-[11px] text-slate-500">पिता/पति: ${escapeHtml(y.fatherHusband || 'N/A')}</div>
        </td>
        <td class="p-3 text-xs font-mono text-slate-700">${escapeHtml(y.mobile || 'N/A')}</td>
        <td class="p-3 text-xs">
          <div class="font-semibold text-slate-800">${escapeHtml(y.block || 'Dantewada')}</div>
          <div class="text-slate-500 text-[11px]">${escapeHtml(y.gramPanchayat || y.village || 'N/A')}</div>
        </td>
        <td class="p-3 text-xs">
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 mr-1">${escapeHtml(y.gender || 'Male')}</span>
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">${escapeHtml(y.category || 'ST')}</span>
        </td>
        <td class="p-3 text-xs">
          <div class="font-medium text-slate-800">${escapeHtml(y.qualification || 'N/A')}</div>
          <div class="text-slate-500 text-[11px]">${escapeHtml(y.employmentStatus || 'N/A')}</div>
        </td>
        <td class="p-3 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <i class="fa-solid fa-compass text-emerald-600"></i>
            ${escapeHtml(y.aspiredCareer || 'Direct Formal Jobs')}
          </span>
        </td>
        <td class="p-3 text-xs text-right space-x-1">
          <button onclick="window.viewYouthProfile('${y.id}')" title="डिजिटल प्रोफाइल व इतिहास देखें" class="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button onclick="window.editYouthProfile('${y.id}')" title="एडिट करें" class="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button onclick="window.deleteYouthProfile('${y.id}')" title="हटाएं" class="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.openAddYouthModal = function () {
    const form = document.getElementById('youthForm');
    if (form) form.reset();
    document.getElementById('youthFormId').value = '';
    document.getElementById('youthModalTitle').textContent = 'नया युवा रिकॉर्ड जोड़ें (Add Youth Profile)';
    const modal = document.getElementById('youthModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeYouthModal = function () {
    const modal = document.getElementById('youthModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.saveYouthForm = function (e) {
    e.preventDefault();
    const id = document.getElementById('youthFormId').value;
    const profile = {
      id: id || undefined,
      name: document.getElementById('youthFormName').value,
      fatherHusband: document.getElementById('youthFormFather').value,
      mobile: document.getElementById('youthFormMobile').value,
      block: document.getElementById('youthFormBlock').value,
      gramPanchayat: document.getElementById('youthFormGP').value,
      village: document.getElementById('youthFormVillage').value,
      gender: document.getElementById('youthFormGender').value,
      category: document.getElementById('youthFormCategory').value,
      qualification: document.getElementById('youthFormQual').value,
      employmentStatus: document.getElementById('youthFormStatus').value,
      aspiredCareer: document.getElementById('youthFormCareer').value,
      scheme: document.getElementById('youthFormScheme').value,
      remarks: document.getElementById('youthFormRemarks').value
    };

    window.DantewadaDB.saveYouth(profile);
    window.closeYouthModal();
    renderYouthTable();

    // Async push to Google Sheets backend
    const apiUrl = (window.ENV && window.ENV.GOOGLE_SCRIPT_URL) || localStorage.getItem('YH_DANTEWADA_API_URL') || '';
    if (apiUrl) {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addEmploymentRegistered',
          payload: {
            Youth_Name: profile.name,
            Father_Husband_Name: profile.fatherHusband,
            Mobile_Number: profile.mobile,
            Block: profile.block,
            Gram_Panchayat: profile.gramPanchayat,
            Village: profile.village,
            Gender: profile.gender,
            Category: profile.category,
            Qualification: profile.qualification,
            Preferred_Job: profile.aspiredCareer,
            Registration_Status: profile.employmentStatus,
            Remarks: profile.remarks
          }
        })
      }).then(r => r.json()).then(d => {
        if (d && d.success) {
          console.log('✅ Google Sheet में रिकॉर्ड सुरक्षित हो गया:', d.id);
        }
      }).catch(err => console.warn('Google Sheet background push notice:', err.message));
    }
  };

  window.viewYouthProfile = function (id) {
    const y = window.DantewadaDB.getYouthById(id);
    if (!y) return;

    const modal = document.getElementById('youthDossierModal');
    const content = document.getElementById('youthDossierContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-800 text-white font-bold flex items-center justify-center text-xl shadow">
              ${(y.name || 'Y').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-status badge-block">${y.block}</span>
                <span class="badge-status badge-published">${y.status || 'Active'}</span>
                <span class="text-xs text-slate-400 font-mono">ID: ${y.id}</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-900">${y.name}</h2>
              <p class="text-xs text-slate-500">पिता/पति: ${y.fatherHusband || 'N/A'} | ग्राम: ${y.village || y.gramPanchayat}</p>
            </div>
          </div>
          <button onclick="window.closeYouthDossierModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span class="text-slate-400 block mb-0.5">मोबाइल नंबर</span>
            <strong class="text-slate-800 font-mono text-sm">${y.mobile}</strong>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">लिंग व श्रेणी</span>
            <strong class="text-slate-800 text-sm">${y.gender} | ${y.category}</strong>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">उच्चतम योग्यता</span>
            <strong class="text-slate-800 text-sm">${y.qualification}</strong>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">वर्तमान स्थिति</span>
            <strong class="text-blue-700 text-sm">${y.employmentStatus}</strong>
          </div>
          <div class="col-span-2 sm:col-span-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <span class="text-emerald-700 font-bold block mb-0.5 text-[11px]">इच्छित करियर (Aspired)</span>
            <strong class="text-emerald-900 text-xs flex items-center gap-1">
              <i class="fa-solid fa-compass text-emerald-600"></i>
              ${y.aspiredCareer || 'Direct Formal Jobs'}
            </strong>
          </div>
        </div>

        <!-- Linked Timeline Modules -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <i class="fa-solid fa-clock-rotate-left mr-1"></i>एकीकृत डिजिटल इतिहास व संबंधित रिकॉर्ड (Linked Modules)
          </h4>

          <div class="space-y-3">
            ${(y.linkedPlaced && y.linkedPlaced.length > 0) ? `
              <div class="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <i class="fa-solid fa-briefcase text-green-700 text-xl"></i>
                <div class="text-xs text-green-950">
                  <strong>रोजगार लिंकेज (Employed):</strong> ${y.linkedPlaced[0].organisation} में पदस्थापित (Joining: ${y.linkedPlaced[0].joiningDate || 'Confirmed'}).
                </div>
              </div>
            ` : ''}

            ${(y.linkedSkills && y.linkedSkills.length > 0) ? `
              <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <i class="fa-solid fa-graduation-cap text-blue-700 text-xl"></i>
                <div class="text-xs text-blue-950">
                  <strong>कौशल प्रशिक्षण (Skill Linked):</strong> ${y.linkedSkills[0].skillTraining} — ${y.linkedSkills[0].institute}.
                </div>
              </div>
            ` : ''}

            ${(y.linkedLoans && y.linkedLoans.length > 0) ? `
              <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <i class="fa-solid fa-coins text-amber-700 text-xl"></i>
                <div class="text-xs text-amber-950">
                  <strong>स्वरोजगार / ऋण योजना:</strong> ${y.linkedLoans[0].scheme} के तहत ₹${y.linkedLoans[0].amount} स्वीकृत (${y.linkedLoans[0].business})।
                </div>
              </div>
            ` : ''}

            ${(y.linkedVisits && y.linkedVisits.length > 0) ? `
              <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                <i class="fa-solid fa-camera text-purple-700 text-xl"></i>
                <div class="text-xs text-purple-950">
                  <strong>फील्ड विजिट रिकॉर्ड:</strong> ${y.linkedVisits[0].date} को ${y.linkedVisits[0].officerName} द्वारा सत्यापन विजिट किया गया।
                </div>
              </div>
            ` : ''}

            ${(!y.linkedPlaced?.length && !y.linkedSkills?.length && !y.linkedLoans?.length && !y.linkedVisits?.length) ? `
              <p class="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
                इस युवा के लिए अभी कोई अन्य मॉड्यूल रिकॉर्ड (जैसे ऋण या फील्ड विजिट) लिंक नहीं है।
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeYouthDossierModal = function () {
    const modal = document.getElementById('youthDossierModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.editYouthProfile = function (id) {
    const y = window.DantewadaDB.getYouthById(id);
    if (!y) return;

    document.getElementById('youthFormId').value = y.id;
    document.getElementById('youthFormName').value = y.name || '';
    document.getElementById('youthFormFather').value = y.fatherHusband || '';
    document.getElementById('youthFormMobile').value = y.mobile || '';
    document.getElementById('youthFormBlock').value = y.block || 'Dantewada';
    document.getElementById('youthFormGP').value = y.gramPanchayat || '';
    document.getElementById('youthFormVillage').value = y.village || '';
    document.getElementById('youthFormGender').value = y.gender || 'Male';
    document.getElementById('youthFormCategory').value = y.category || 'ST';
    document.getElementById('youthFormQual').value = y.qualification || '12th Pass';
    document.getElementById('youthFormStatus').value = y.employmentStatus || 'Unemployed';
    document.getElementById('youthFormCareer').value = y.aspiredCareer || '';
    document.getElementById('youthFormScheme').value = y.scheme || '';
    document.getElementById('youthFormRemarks').value = y.remarks || '';

    document.getElementById('youthModalTitle').textContent = 'युवा प्रोफाइल संपादित करें (Edit Profile)';
    const modal = document.getElementById('youthModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.deleteYouthProfile = async function (id) {
    if (confirm('क्या आप निश्चित रूप से इस युवा का रिकॉर्ड हटाना चाहते हैं? यह Google Sheet से भी डिलीट हो जाएगा।')) {
      const y = window.DantewadaDB.getYouthById(id);
      window.DantewadaDB.deleteYouth(id);
      renderYouthTable();

      if (typeof API !== 'undefined' && API.call) {
        try {
          const res = await API.call('deleteRecord', {
            sheetName: 'Employment_Registration',
            idValue: (y && y.name) || id,
            rowData: y
          });
          console.log('✅ Google Sheet delete response:', res);
          if (res && res.success) {
            alert(`✅ Google Sheet से भी रिकॉर्ड सफलतापूर्वक हटा दिया गया!`);
          }
        } catch (err) {
          console.warn('Google Sheet delete notice:', err.message);
        }
      }
    }
  };

  window.exportYouthExcel = function () {
    const youth = window.DantewadaDB.getYouth();
    const rows = youth.map(y => ({
      "ID": y.id,
      "Name": y.name,
      "Father/Husband": y.fatherHusband,
      "Mobile": y.mobile,
      "Block": y.block,
      "Gram Panchayat": y.gramPanchayat,
      "Village": y.village,
      "Gender": y.gender,
      "Category": y.category,
      "Qualification": y.qualification,
      "Employment Status": y.employmentStatus,
      "Scheme": y.scheme,
      "Registered Date": y.registeredDate
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Youth_Profiles");
    XLSX.writeFile(wb, `Youth_Profiles_Dantewada_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // -------------------------------------------------------------
  // 4. Field Visit Entry & Photo Upload
  // -------------------------------------------------------------
  function renderVisitForm() {
    const count = (window.DantewadaDB.data.fieldVisits || []).length + 1;
    const idField = document.getElementById('visitAutoId');
    if (idField) idField.value = `VIS-2026-${String(count).padStart(4, '0')}`;

    const dateField = document.getElementById('visitDateInput');
    if (dateField && !dateField.value) {
      dateField.value = new Date().toISOString().split('T')[0];
    }

    const officerField = document.getElementById('visitOfficerInput');
    if (officerField && window.DantewadaAuth) {
      officerField.value = window.DantewadaAuth.getCurrentUser().name;
    }

    currentUploadedPhotos = [];
    renderPhotoThumbnails();
  }

  window.handlePhotoFiles = function (files) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function (e) {
        currentUploadedPhotos.push({
          id: 'p_' + Date.now() + '_' + i,
          url: e.target.result,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          type: 'Inspection',
          uploadedBy: window.DantewadaAuth.getCurrentUser().name,
          timestamp: new Date().toLocaleString()
        });
        renderPhotoThumbnails();
      };
      reader.readAsDataURL(file);
    }
  };

  function renderPhotoThumbnails() {
    const container = document.getElementById('visitPhotoPreviewGrid');
    if (!container) return;

    if (currentUploadedPhotos.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-3 col-span-full">कोई फोटो अपलोड नहीं की गई।</p>`;
      return;
    }

    container.innerHTML = currentUploadedPhotos.map((p, idx) => `
      <div class="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
        <img src="${p.url}" class="w-full h-32 object-cover">
        <div class="p-2 bg-slate-900 text-white text-xs space-y-1">
          <input type="text" value="${p.caption}" onchange="window.updatePhotoCaption(${idx}, this.value)" 
                 placeholder="फोटो विवरण/कैप्शन" class="w-full bg-slate-800 text-[11px] px-1.5 py-0.5 rounded border border-slate-700">
          <select onchange="window.updatePhotoType(${idx}, this.value)" class="w-full bg-slate-800 text-[11px] px-1.5 py-0.5 rounded border border-slate-700">
            <option value="Inspection" ${p.type === 'Inspection' ? 'selected' : ''}>Inspection (निरीक्षण)</option>
            <option value="Before" ${p.type === 'Before' ? 'selected' : ''}>Before (कार्य पूर्व)</option>
            <option value="After" ${p.type === 'After' ? 'selected' : ''}>After (कार्य पश्चात)</option>
            <option value="Interaction" ${p.type === 'Interaction' ? 'selected' : ''}>Interaction (हितग्राही संवाद)</option>
          </select>
        </div>
        <button type="button" onclick="window.removeUploadedPhoto(${idx})" class="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  window.updatePhotoCaption = function (idx, val) {
    if (currentUploadedPhotos[idx]) currentUploadedPhotos[idx].caption = val;
  };

  window.updatePhotoType = function (idx, val) {
    if (currentUploadedPhotos[idx]) currentUploadedPhotos[idx].type = val;
  };

  window.removeUploadedPhoto = function (idx) {
    currentUploadedPhotos.splice(idx, 1);
    renderPhotoThumbnails();
  };

  window.saveFieldVisitForm = function (e) {
    e.preventDefault();

    const visit = {
      id: document.getElementById('visitAutoId').value,
      date: document.getElementById('visitDateInput').value,
      officerName: document.getElementById('visitOfficerInput').value,
      officerRole: window.DantewadaAuth.getCurrentUser().role,
      block: document.getElementById('visitBlockSelect').value,
      gramPanchayat: document.getElementById('visitGPInput').value,
      locationName: document.getElementById('visitLocationInput').value,
      purpose: document.getElementById('visitPurposeInput').value,
      scheme: document.getElementById('visitSchemeSelect').value,
      linkedYouthName: document.getElementById('visitYouthInput').value,
      description: document.getElementById('visitDescInput').value,
      findings: document.getElementById('visitFindingsInput').value,
      issuesFaced: document.getElementById('visitIssuesInput').value,
      actionRequired: document.getElementById('visitActionInput').value,
      followUpDate: document.getElementById('visitFollowUpInput').value,
      status: document.getElementById('visitStatusSelect').value,
      photos: [...currentUploadedPhotos]
    };

    window.DantewadaDB.saveFieldVisit(visit);
    alert('फील्ड विजिट एवं फोटो सफलतापूर्वक दर्ज की गई! विजिट ID: ' + visit.id);
    e.target.reset();
    currentUploadedPhotos = [];
    renderVisitForm();
    switchTab('gallery');
  };

  // -------------------------------------------------------------
  // 5. Visit Gallery & Review
  // -------------------------------------------------------------
  function renderVisitGallery() {
    if (!window.DantewadaDB) return;

    const blockSelect = document.getElementById('galleryBlockFilter');
    const statusSelect = document.getElementById('galleryStatusFilter');

    const visits = window.DantewadaDB.getFieldVisits({
      block: blockSelect ? blockSelect.value : 'All',
      status: statusSelect ? statusSelect.value : 'All'
    });

    const grid = document.getElementById('adminVisitGalleryGrid');
    if (!grid) return;

    if (visits.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <i class="fa-regular fa-image text-4xl mb-2 text-slate-300"></i>
          <p>कोई फील्ड विजिट रिकॉर्ड उपलब्ध नहीं है।</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = visits.map(v => {
      const pCount = v.photos ? v.photos.length : 0;
      const primaryPhoto = (v.photos && v.photos[0]) ? v.photos[0].url : 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80';

      return `
        <div class="gov-card flex flex-col overflow-hidden">
          <div class="relative h-44 bg-slate-900 cursor-pointer" onclick="window.openVisitModal('${v.id}')">
            <img src="${primaryPhoto}" class="w-full h-full object-cover">
            <div class="absolute top-2 left-2 flex gap-1">
              <span class="badge-status badge-block">${v.block}</span>
              <span class="badge-status ${v.isPublic ? 'badge-published' : 'badge-draft'}">
                ${v.isPublic ? 'Public' : 'Internal'}
              </span>
            </div>
            <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
              <i class="fa-solid fa-camera"></i> ${pCount}
            </div>
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <div class="text-[11px] text-slate-500 mb-1 flex justify-between">
              <span>${v.date}</span>
              <span class="font-mono text-slate-400">${v.id}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-sm mb-1 leading-snug">${v.locationName}</h4>
            <p class="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">${v.purpose}</p>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 truncate max-w-[140px]">${v.officerName}</span>
              <div class="space-x-1">
                ${window.DantewadaAuth.can('visit_approve') ? `
                  <button onclick="window.toggleVisitPublic('${v.id}')" 
                          class="px-2 py-1 rounded text-[11px] font-semibold ${v.isPublic ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}">
                    ${v.isPublic ? 'Unpublish' : 'Approve & Publish'}
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleVisitPublic = function (id) {
    const visit = window.DantewadaDB.getFieldVisitById(id);
    if (!visit) return;
    const newPublic = !visit.isPublic;
    const newApproval = newPublic ? 'Approved' : 'Pending Approval';
    window.DantewadaDB.updateVisitApproval(id, newApproval, newPublic);
    renderVisitGallery();
  };

  // -------------------------------------------------------------
  // 6. Success Stories Management
  // -------------------------------------------------------------
  function renderSuccessStories() {
    if (!window.DantewadaDB) return;

    const stories = window.DantewadaDB.getSuccessStories();
    const tbody = document.getElementById('storiesTableBody');
    if (!tbody) return;

    tbody.innerHTML = stories.map((s, idx) => `
      <tr class="hover:bg-slate-50 border-b border-slate-100">
        <td class="p-3 text-xs font-mono text-slate-400">${idx + 1}</td>
        <td class="p-3">
          <div class="flex items-center gap-3">
            ${s.photoUrl && (s.photoUrl.startsWith('data:application/pdf') || s.photoUrl.toLowerCase().endsWith('.pdf'))
              ? `<div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex flex-col items-center justify-center shrink-0"><i class="fa-solid fa-file-pdf text-base"></i><span class="text-[7px] font-bold">PDF</span></div>`
              : `<img src="${s.photoUrl}" class="w-10 h-10 rounded-lg object-cover shrink-0" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'">`
            }
            <div>
              <div class="font-bold text-slate-900 text-sm">${s.youthName}</div>
              <div class="text-xs text-slate-500">${s.village}, ${s.block || 'Dantewada'}</div>
            </div>
          </div>
        </td>
        <td class="p-3 text-xs font-medium text-slate-800">${s.title}</td>
        <td class="p-3 text-xs"><span class="badge-status badge-block">${s.category}</span></td>
        <td class="p-3 text-xs">
          <span class="badge-status ${s.status === 'Published' ? 'badge-published' : (s.status === 'Approved' ? 'badge-resolved' : 'badge-draft')}">
            ${s.status}
          </span>
        </td>
        <td class="p-3 text-xs text-right space-x-1">
          ${window.DantewadaAuth.can('story_approve') ? `
            <button onclick="window.cycleStoryStatus('${s.id}')" title="स्थिति बदलें" class="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          ` : ''}
          <button onclick="window.openStoryModal('${s.id}')" title="देखें" class="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button onclick="window.deleteStory('${s.id}')" title="हटाएं (Delete)" class="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.cycleStoryStatus = function (id) {
    const s = window.DantewadaDB.getSuccessStoryById(id);
    if (!s) return;

    const flow = ['Draft', 'Pending Approval', 'Approved', 'Published'];
    const currentIdx = flow.indexOf(s.status);
    const nextStatus = flow[(currentIdx + 1) % flow.length];

    window.DantewadaDB.updateStoryStatus(id, nextStatus);
    renderSuccessStories();
  };

  window.deleteStory = function (id) {
    if (!confirm('क्या आप निश्चित हैं कि यह सफलता कहानी हटाना चाहते हैं?')) return;
    if (window.DantewadaDB.data.stories) {
      window.DantewadaDB.data.stories = window.DantewadaDB.data.stories.filter(s => s.id !== id);
      window.DantewadaDB.persist();
      renderSuccessStories();
    }
  };

  window.openCreateStoryModal = function () {
    const modal = document.getElementById('createStoryModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeCreateStoryModal = function () {
    const modal = document.getElementById('createStoryModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (typeof window.clearStoryFile === 'function') {
      window.clearStoryFile();
    }
  };

  window.handleStoryFileSelected = function (input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const previewBox = document.getElementById('storyFilePreviewBox');
    const urlInput = document.getElementById('storyPhotoUrl');
    const clearBtn = document.getElementById('storyClearFileBtn');
    const statusText = document.getElementById('storyFileStatus');

    if (file.size > 15 * 1024 * 1024) {
      alert('फ़ाइल साइज़ 15MB से कम होनी चाहिए।');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      if (urlInput) urlInput.value = dataUrl;
      if (clearBtn) clearBtn.classList.remove('hidden');

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        if (previewBox) {
          previewBox.innerHTML = `
            <div class="flex flex-col items-center justify-center p-1 text-red-600">
              <i class="fa-solid fa-file-pdf text-3xl"></i>
              <span class="text-[9px] font-bold mt-1 uppercase">PDF फ़ाइल</span>
            </div>
          `;
        }
        if (statusText) statusText.innerHTML = `<span class="text-emerald-700 font-bold">✓ PDF चयनित: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>`;
      } else {
        if (previewBox) {
          previewBox.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover rounded-xl" alt="Preview">`;
        }
        if (statusText) statusText.innerHTML = `<span class="text-emerald-700 font-bold">✓ फोटो चयनित: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>`;
      }
    };
    reader.readAsDataURL(file);
  };

  window.clearStoryFile = function () {
    const fileInput = document.getElementById('storyFileInput');
    const urlInput = document.getElementById('storyPhotoUrl');
    const previewBox = document.getElementById('storyFilePreviewBox');
    const clearBtn = document.getElementById('storyClearFileBtn');
    const statusText = document.getElementById('storyFileStatus');

    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    if (previewBox) {
      previewBox.innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
        <span class="text-[9px] mt-1 text-slate-400 font-bold uppercase">फोटो / PDF</span>
      `;
    }
    if (statusText) statusText.textContent = 'PNG, JPG, WEBP या PDF (अधिकतम 15MB)';
  };

  window.saveStoryForm = function (e) {
    e.preventDefault();
    const youthName = (document.getElementById('storyYouthName').value || '').trim() || 'सफल युवा प्रतिभागी';
    const title = (document.getElementById('storyTitle').value || '').trim() || 'सफलता की कहानी';
    const village = (document.getElementById('storyVillage').value || '').trim() || 'दंतेवाड़ा';
    const summary = (document.getElementById('storySummary').value || '').trim() || title;
    const fullStory = (document.getElementById('storyFull').value || '').trim() || summary;

    const story = {
      youthName: youthName,
      village: village,
      block: document.getElementById('storyBlock').value || 'Dantewada',
      title: title,
      category: document.getElementById('storyCategory').value || 'Employment',
      scheme: (document.getElementById('storyScheme').value || '').trim() || '-',
      photoUrl: (document.getElementById('storyPhotoUrl').value || '').trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
      summary: summary,
      fullStory: fullStory,
      quote: (document.getElementById('storyQuote').value || '').trim() || '',
      achievementDate: document.getElementById('storyDate').value || new Date().toISOString().split('T')[0],
      featured: document.getElementById('storyFeatured').checked,
      status: 'Pending Approval',
      author: (window.DantewadaAuth && window.DantewadaAuth.getCurrentUser()) ? window.DantewadaAuth.getCurrentUser().name : 'Admin'
    };

    window.DantewadaDB.saveSuccessStory(story);
    window.closeCreateStoryModal();
    renderSuccessStories();
    alert('Success Story सफलतापूर्वक जोड़ दी गई!');
  };

  // -------------------------------------------------------------
  // 7. Visit Monitoring & Follow-up
  // -------------------------------------------------------------
  function renderMonitoring() {
    if (!window.DantewadaDB) return;

    const visits = window.DantewadaDB.getFieldVisits();

    const pendingReports = visits.filter(v => v.status === 'Report Pending').length;
    const followUpsDue = visits.filter(v => v.status === 'Follow-up Required').length;
    const completed = visits.filter(v => v.status === 'Visit Completed').length;
    const resolved = visits.filter(v => v.status === 'Resolved' || v.status === 'Closed').length;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('mon-pending', pendingReports);
    setVal('mon-followup', followUpsDue);
    setVal('mon-completed', completed);
    setVal('mon-resolved', resolved);

    const tbody = document.getElementById('monitoringTableBody');
    if (!tbody) return;

    tbody.innerHTML = visits.map((v, i) => `
      <tr class="hover:bg-slate-50 border-b border-slate-100">
        <td class="p-3 text-xs font-mono text-slate-400">${v.id}</td>
        <td class="p-3 text-xs font-medium text-slate-900">${v.locationName} (${v.block})</td>
        <td class="p-3 text-xs text-slate-600">${v.officerName}</td>
        <td class="p-3 text-xs text-slate-600">${v.actionRequired || 'No immediate action'}</td>
        <td class="p-3 text-xs font-mono ${v.followUpDate ? 'text-amber-700 font-bold' : 'text-slate-400'}">${v.followUpDate || 'None'}</td>
        <td class="p-3 text-xs">
          <select onchange="window.updateVisitStatusQuick('${v.id}', this.value)" class="text-xs bg-white border border-slate-300 rounded px-2 py-1">
            <option value="Planned" ${v.status === 'Planned' ? 'selected' : ''}>Planned</option>
            <option value="Visit Completed" ${v.status === 'Visit Completed' ? 'selected' : ''}>Visit Completed</option>
            <option value="Report Pending" ${v.status === 'Report Pending' ? 'selected' : ''}>Report Pending</option>
            <option value="Follow-up Required" ${v.status === 'Follow-up Required' ? 'selected' : ''}>Follow-up Required</option>
            <option value="Action in Progress" ${v.status === 'Action in Progress' ? 'selected' : ''}>Action in Progress</option>
            <option value="Resolved" ${v.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Closed" ${v.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  window.updateVisitStatusQuick = function (id, status) {
    window.DantewadaDB.updateVisitStatus(id, status);
    renderMonitoring();
  };

  // -------------------------------------------------------------
  // 8. Reports & Analytics
  // -------------------------------------------------------------
  function renderReports() {
    const reportTypeSelect = document.getElementById('reportTypeSelect');
    const type = reportTypeSelect ? reportTypeSelect.value : 'block_summary';
    const blockFilter = document.getElementById('reportBlockFilter') ? document.getElementById('reportBlockFilter').value : 'All';

    const data = window.DantewadaDB.generateReport(type, blockFilter);

    const thead = document.getElementById('reportsTableHeader');
    const tbody = document.getElementById('reportsTableBody');

    if (!thead || !tbody || data.length === 0) return;

    const headers = Object.keys(data[0]);

    thead.innerHTML = `
      <tr class="bg-slate-100 text-slate-700 text-xs uppercase font-bold">
        ${headers.map(h => `<th class="p-3 text-left">${h.replace(/([A-Z])/g, ' $1')}</th>`).join('')}
      </tr>
    `;

    tbody.innerHTML = data.map(row => `
      <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
        ${headers.map(h => `<td class="p-3">${row[h]}</td>`).join('')}
      </tr>
    `).join('');
  }

  window.exportCurrentReportExcel = function () {
    const reportTypeSelect = document.getElementById('reportTypeSelect');
    const type = reportTypeSelect ? reportTypeSelect.value : 'block_summary';
    const data = window.DantewadaDB.generateReport(type);

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `Report_${type}_Dantewada.xlsx`);
  };

  // -------------------------------------------------------------
  // 9. Audit Logs & System Reset
  // -------------------------------------------------------------
  function renderAuditLogs() {
    if (!window.DantewadaDB) return;
    const logs = window.DantewadaDB.getAuditLogs();
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = logs.map(l => `
      <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
        <td class="p-3 font-mono text-slate-400">${l.timestamp}</td>
        <td class="p-3 font-semibold text-slate-800">${l.userName} (${l.userRole})</td>
        <td class="p-3"><span class="badge-status badge-block">${l.action}</span></td>
        <td class="p-3 text-slate-600">${l.module}</td>
        <td class="p-3 font-medium text-slate-800">${l.target}</td>
        <td class="p-3 text-slate-500">${l.details}</td>
      </tr>
    `).join('');
  }

  window.clearDatabaseToEmpty = function () {
    if (confirm('चेतावनी: क्या आप पोर्टल से सभी मॉक डेटा हटाकर डेटाबेस को शून्य (0 Records) पर रीसेट करना चाहते हैं?\n\nइसके बाद पोर्टल पूरी तरह खाली हो जाएगा और केवल आपके द्वारा एक्सेल बल्क अपलोड किए गए वास्तविक रिकॉर्ड्स ही सहेजे जाएंगे।')) {
      window.DantewadaDB.clearAllData();
      alert('डेटाबेस सफलतापूर्वक खाली कर दिया गया है (0 Records)। अब आप बल्क अपलोड से अपना एक्सेल डेटा अपलोड कर सकते हैं।');
      location.reload();
    }
  };

  window.resetDatabaseToFactory = function () {
    if (confirm('चेतावनी: क्या आप सैंपल मॉक डेटा (Demo Baseline Seed) लोड करना चाहते हैं?')) {
      window.DantewadaDB.resetToDefaults();
      alert('सैंपल डेटाबेस सफलतापूर्वक लोड कर दिया गया।');
      location.reload();
    }
  };

  function setupEventListeners() {
    const dashFilter = document.getElementById('dashBlockFilter');
    if (dashFilter) dashFilter.onchange = renderDashboard;

    const ySearch = document.getElementById('youthSearchInput');
    if (ySearch) ySearch.oninput = renderYouthTable;

    const yBlock = document.getElementById('youthBlockFilter');
    if (yBlock) yBlock.onchange = renderYouthTable;

    const yGender = document.getElementById('youthGenderFilter');
    if (yGender) yGender.onchange = renderYouthTable;

    const yCat = document.getElementById('youthCategoryFilter');
    if (yCat) yCat.onchange = renderYouthTable;

    const repType = document.getElementById('reportTypeSelect');
    if (repType) repType.onchange = renderReports;

    const repBlock = document.getElementById('reportBlockFilter');
    if (repBlock) repBlock.onchange = renderReports;

    const galBlock = document.getElementById('galleryBlockFilter');
    if (galBlock) galBlock.onchange = renderVisitGallery;

    const galStatus = document.getElementById('galleryStatusFilter');
    if (galStatus) galStatus.onchange = renderVisitGallery;
  }

  // -------------------------------------------------------------
  // 11 Specific Sheets Data Viewer with Exact Parameters
  // -------------------------------------------------------------
  let currentActiveSheet = 'Employment_Registration';

  const SHEET_CONFIGS = {
    Employment_Registration: {
      num: 1,
      titleEn: "1. Employment_Registration",
      titleHi: "रोजगार पंजीकरण",
      desc: "दंतेवाड़ा जिले के रोजगार पंजीकृत युवाओं का संपूर्ण डेटाबेस।",
      collection: "youth",
      params: [
        "SR. NO.",
        "First Name",
        "Last Name",
        "Father's Name / Husband's Name",
        "Grampanchayat",
        "Block Name",
        "Mobile Number",
        "Gender",
        "Category",
        "Highest Qualification",
        "Current Occupation",
        "Aspired Career"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.firstName || (item.name ? item.name.split(' ')[0] : 'N/A'),
        item.lastName || (item.name ? item.name.split(' ').slice(1).join(' ') : ''),
        item.fatherHusband || item.fatherName || 'N/A',
        item.gramPanchayat || item.village || 'N/A',
        item.block || 'Dantewada',
        item.mobile || 'N/A',
        item.gender || 'Male',
        item.category || 'ST',
        item.qualification || item.highestQualification || '12th Pass',
        item.occupation || item.employmentStatus || item.currentOccupation || 'Unemployed',
        item.aspiredCareer || 'Direct Formal Jobs'
      ],
      saveRecord: (formData) => {
        const firstName = formData['First Name'] || '';
        const lastName = formData['Last Name'] || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Youth Record';
        if (!window.DantewadaDB.data.youth) window.DantewadaDB.data.youth = [];
        window.DantewadaDB.data.youth.unshift({
          id: String(Date.now()),
          name: fullName,
          fatherHusband: formData["Father's Name / Husband's Name"] || 'N/A',
          gramPanchayat: formData['Grampanchayat'] || 'N/A',
          block: formData['Block Name'] || 'Dantewada',
          mobile: formData['Mobile Number'] || 'N/A',
          gender: formData['Gender'] || 'Male',
          category: formData['Category'] || 'ST',
          qualification: formData['Highest Qualification'] || '12th Pass',
          employmentStatus: formData['Current Occupation'] || 'Unemployed',
          aspiredCareer: formData['Aspired Career'] || 'Direct Formal Jobs',
          status: 'Active',
          registeredDate: new Date().toISOString().split('T')[0]
        });
        window.DantewadaDB.persist();
      }
    },
    Employed: {
      num: 2,
      titleEn: "2. Employed",
      titleHi: "रोजगार प्राप्त युवा",
      desc: "रोजगार प्राप्त युवाओं का विवरण: पदस्थापना संस्था, कार्यभार ग्रहण तिथि एवं मासिक वेतन।",
      collection: "placed",
      params: [
        "SR. NO.",
        "NAME",
        "FATHER NAME",
        "ADDRESS",
        "BLOCK",
        "DISTRICT",
        "MOBILE NO.",
        "ORGANISATION",
        "DATE OF JOINING",
        "SALARY"
      ],
      mapRow: (item, idx) => [
        item.id || idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.address || 'Dantewada',
        item.block || 'Dantewada',
        item.district || 'Dantewada',
        item.mobile || 'N/A',
        item.organisation || 'N/A',
        item.joiningDate || '2026-05-15',
        item.salary ? (item.salary.toString().startsWith('₹') ? item.salary : `₹${item.salary}`) : '₹12,000'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.placed) window.DantewadaDB.data.placed = [];
        window.DantewadaDB.data.placed.unshift({
          id: window.DantewadaDB.data.placed.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          address: formData['ADDRESS'],
          block: formData['BLOCK'],
          district: formData['DISTRICT'] || 'Dantewada',
          mobile: formData['MOBILE NO.'],
          organisation: formData['ORGANISATION'],
          joiningDate: formData['DATE OF JOINING'],
          salary: formData['SALARY']
        });
        window.DantewadaDB.persist();
      }
    },
    Skill_Linked: {
      num: 3,
      titleEn: "3. Skill_Linked",
      titleHi: "कौशल प्रशिक्षण से जुड़े युवा",
      desc: "कौशल विकास केंद्र एवं लाइवलीहुड कॉलेज से संबद्ध युवाओं की सूची।",
      collection: "skills",
      params: [
        "SR. NO.",
        "NAME",
        "VILLAGE",
        "MOBILE NO.",
        "INSTITUTE",
        "SKILL TRAINING"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.village || 'N/A',
        item.mobile || 'N/A',
        item.institute || 'District Livelihood College',
        item.skillTraining || item.trade || 'Skill Training'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.skills) window.DantewadaDB.data.skills = [];
        window.DantewadaDB.data.skills.unshift({
          id: window.DantewadaDB.data.skills.length + 1,
          name: formData['NAME'],
          village: formData['VILLAGE'],
          mobile: formData['MOBILE NO.'],
          institute: formData['INSTITUTE'],
          skillTraining: formData['SKILL TRAINING']
        });
        window.DantewadaDB.persist();
      }
    },
    Education_Linked: {
      num: 4,
      titleEn: "4. Education_Linked",
      titleHi: "शिक्षा से जुड़े युवा",
      desc: "उच्च शिक्षा, कंप्यूटर कोडिंग, डिप्लोमा एवं स्नातक से जुड़े युवाओं का विवरण। (Faather Name typo handled)",
      collection: "navgurukul",
      params: [
        "SR. NO.",
        "Name",
        "Faather Name",
        "Mother Name",
        "Email",
        "Gender",
        "Education",
        "Phone Number",
        "Address"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.motherName || 'N/A',
        item.email || 'N/A',
        item.gender || 'F',
        item.education || '12th Pass',
        item.phone || item.mobile || 'N/A',
        item.address || 'Dantewada'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.navgurukul) window.DantewadaDB.data.navgurukul = [];
        window.DantewadaDB.data.navgurukul.unshift({
          id: window.DantewadaDB.data.navgurukul.length + 1,
          name: formData['Name'],
          fatherName: formData['Faather Name'],
          motherName: formData['Mother Name'],
          email: formData['Email'],
          gender: formData['Gender'] || 'Female',
          education: formData['Education'],
          phone: formData['Phone Number'],
          address: formData['Address']
        });
        window.DantewadaDB.persist();
      }
    },
    Counselling: {
      num: 5,
      titleEn: "5. Counselling",
      titleHi: "काउंसलिंग एवं करियर मार्गदर्शन",
      desc: "काउंसलिंग एवं करियर मार्गदर्शन अंतर्गत पंजीकृत युवाओं का संपूर्ण डेटाबेस।",
      collection: "counselling",
      params: [
        "SR. NO.",
        "Block Name",
        "Grampanchayat",
        "First Name",
        "Last Name",
        "Mobile Number",
        "Gender",
        "Email",
        "Pin Code",
        "Father's Name / Husband's Name",
        "Mother's Name",
        "Category",
        "Highest Qualification",
        "Current Occupation",
        "Aspired Career"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.block || item['Block Name'] || 'Dantewada',
        item.gramPanchayat || item.Grampanchayat || item.village || 'N/A',
        item.firstName || item['First Name'] || (item.name ? item.name.split(' ')[0] : 'N/A'),
        item.lastName || item['Last Name'] || (item.name ? item.name.split(' ').slice(1).join(' ') : ''),
        item.mobile || item['Mobile Number'] || 'N/A',
        item.gender || item.Gender || 'Male',
        item.email || item.Email || '',
        item.pinCode || item['Pin Code'] || '494441',
        item.fatherHusband || item["Father's Name / Husband's Name"] || item.fatherName || 'N/A',
        item.motherName || item["Mother's Name"] || 'N/A',
        item.category || item.Category || 'ST',
        item.qualification || item['Highest Qualification'] || '12th Pass',
        item.currentOccupation || item['Current Occupation'] || item.occupation || 'Student / Job Seeker',
        item.aspiredCareer || item['Aspired Career'] || 'Direct Formal Jobs'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.counselling) window.DantewadaDB.data.counselling = [];
        window.DantewadaDB.data.counselling.unshift({
          id: window.DantewadaDB.data.counselling.length + 1,
          block: formData['Block Name'] || 'Dantewada',
          gramPanchayat: formData['Grampanchayat'] || 'N/A',
          firstName: formData['First Name'] || 'N/A',
          lastName: formData['Last Name'] || '',
          name: ((formData['First Name'] || '') + ' ' + (formData['Last Name'] || '')).trim() || 'N/A',
          mobile: formData['Mobile Number'] || 'N/A',
          gender: formData['Gender'] || 'Male',
          email: formData['Email'] || '',
          pinCode: formData['Pin Code'] || '494441',
          fatherHusband: formData["Father's Name / Husband's Name"] || 'N/A',
          motherName: formData["Mother's Name"] || 'N/A',
          category: formData['Category'] || 'ST',
          qualification: formData['Highest Qualification'] || '12th Pass',
          currentOccupation: formData['Current Occupation'] || 'Student / Job Seeker',
          aspiredCareer: formData['Aspired Career'] || 'Direct Formal Jobs'
        });
        window.DantewadaDB.persist();
      }
    },
    Entrepreneur_Identified: {
      num: 10,
      titleEn: "10. Startup Hunt",
      titleHi: "स्टार्टअप हंट (चयनित उद्यमी एवं स्टार्टअप विचार)",
      desc: "दंतेवाड़ा एवं बस्तर संभाग के चयनित युवा उद्यमी, उनके स्टार्टअप विचार, बिज़नेस मॉडल, लक्षित ग्राहक, आवश्यक निवेश एवं पिच डेक की संपूर्ण सूची।",
      collection: "entrepreneurIdeas",
      params: [
        "SR. NO.",
        "STARTUP / IDEA NAME",
        "DISTRICT",
        "FOUNDER NAME",
        "AGE",
        "ADDRESS",
        "EDUCATION",
        "MOBILE NO.",
        "INVESTMENT NEEDED",
        "WORK TYPE",
        "BUSINESS MODEL / PROBLEM"
      ],
      mapRow: (item, idx) => [
        item.id || idx + 1,
        item.startupName || 'Startup Idea',
        item.district || 'Dantewada',
        item.founderName || item.name || 'N/A',
        item.age || 'N/A',
        item.address || 'Dantewada',
        item.education || '12th',
        item.mobile || 'N/A',
        item.investmentNeeded ? (item.investmentNeeded.toString().startsWith('₹') ? item.investmentNeeded : `₹${item.investmentNeeded}`) : '₹5 Lakh',
        item.workType || 'FULL TIME',
        item.businessModel && item.businessModel !== 'N/A' 
          ? (item.businessModel.length > 55 ? item.businessModel.slice(0, 55) + '...' : item.businessModel)
          : (item.problemSolved && item.problemSolved !== 'N/A' ? (item.problemSolved.length > 55 ? item.problemSolved.slice(0, 55) + '...' : item.problemSolved) : 'Direct Selling / Service')
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.entrepreneurIdeas) window.DantewadaDB.data.entrepreneurIdeas = [];
        window.DantewadaDB.data.entrepreneurIdeas.unshift({
          id: window.DantewadaDB.data.entrepreneurIdeas.length + 1,
          startupName: formData['STARTUP / IDEA NAME'] || 'New Startup',
          founderName: formData['FOUNDER NAME'] || 'N/A',
          district: formData['DISTRICT'] || 'Dantewada',
          age: formData['AGE'] || 'N/A',
          address: formData['ADDRESS'] || 'Dantewada',
          education: formData['EDUCATION'] || 'N/A',
          mobile: formData['MOBILE NO.'] || 'N/A',
          investmentNeeded: formData['INVESTMENT NEEDED'] || '₹5 Lakh',
          workType: formData['WORK TYPE'] || 'FULL TIME',
          businessModel: formData['BUSINESS MODEL / PROBLEM'] || 'Direct Selling'
        });
        window.DantewadaDB.persist();
      }
    },
    Startup_District_Ideas: {
      num: "12-B",
      titleEn: "Startup Ideas by District",
      titleHi: "जिलावार स्टार्टअप विचार एवं संभाग सारांश",
      desc: "दंतेवाड़ा, सुकमा, बस्तर, कोण्डागांव एवं दुर्ग के युवा स्टार्टअप व नवाचार प्रस्तावों का जिलावार विश्लेषण।",
      collection: "startupDistrictIdeas",
      params: [
        "SR. NO.",
        "DISTRICT (जिला)",
        "TOTAL PROPOSALS",
        "SHORTLISTED",
        "KEY SECTORS / DOMAINS",
        "FLAGSHIP STARTUP PROPOSALS",
        "INVESTMENT SOUGHT",
        "ACTION"
      ],
      mapRow: (item, idx) => [
        item.sr,
        item.district,
        item.totalIdeas,
        item.shortlisted,
        item.keySectors,
        item.topIdeas,
        item.totalInvestment,
        item.sr === 'TOTAL' ? 'Summary' : 'Filter Startups'
      ],
      saveRecord: () => {}
    },
    PMEGP_PMFME_Loan: {
      num: 11,
      titleEn: "11. PMEGP_PMFME_Loan",
      titleHi: "ऋण एवं योजना विवरण",
      desc: "PMEGP, PMFME, MUDRA ऋण योजनांतर्गत स्वीकृत व लाभान्वित युवाओं की सूची।",
      collection: "loans",
      params: [
        "SR. NO.",
        "NAME",
        "FATHER NAME",
        "VILLAGE",
        "BLOCK",
        "LOAN AMOUNT",
        "YOJNA",
        "BUSSINESS"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.village || 'N/A',
        item.block || 'Dantewada',
        item.amount ? (item.amount.toString().startsWith('₹') ? item.amount : `₹${item.amount}`) : '₹1,00,000',
        item.yojna || item.scheme || 'PMEGP',
        item.business || 'Micro Enterprise'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.loans) window.DantewadaDB.data.loans = [];
        window.DantewadaDB.data.loans.unshift({
          id: window.DantewadaDB.data.loans.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          village: formData['VILLAGE'],
          block: formData['BLOCK'],
          amount: formData['LOAN AMOUNT'],
          scheme: formData['YOJNA'] || 'PMEGP',
          business: formData['BUSSINESS']
        });
        window.DantewadaDB.persist();
      }
    },
    Rang_De_Loan: {
      num: 12,
      titleEn: "12. Rang_De_Loan",
      titleHi: "रंग दे पीयर-टू-पीयर माइक्रो लोन",
      desc: "Social investment & peer-to-peer micro-credit linkages for Dantewada rural youth, SHGs & entrepreneurs.",
      collection: "rangDe",
      params: [
        "SR. NO.",
        "NAME",
        "ADDRESS",
        "MOBILE NO.",
        "ACTIVITY",
        "AMOUNT (₹)",
        "2ND (₹)"
      ],
      mapRow: (item, idx) => {
        const amt = item.amount || item['AMOUNT (₹)'] || item.loanAmount;
        const fmtAmt = amt ? (amt.toString().startsWith('₹') ? amt : `₹${Number(amt).toLocaleString('en-IN')}`) : '-';
        return [
          idx + 1,
          item.name || 'N/A',
          item.address || 'Dantewada',
          item.mobile || '-',
          item.activity || item.business || 'Retail Business',
          fmtAmt,
          item.secondAmount || item['2ND (₹)'] || item.secondTranche || '-'
        ];
      },
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.rangDe) {
          window.DantewadaDB.data.rangDe = window.DantewadaDB.getSheetData('Rang_De_Loan');
        }
        window.DantewadaDB.data.rangDe.unshift({
          id: window.DantewadaDB.data.rangDe.length + 1,
          name: formData['NAME'],
          address: formData['ADDRESS'],
          mobile: formData['MOBILE NO.'] || '-',
          activity: formData['ACTIVITY'],
          amount: formData['AMOUNT (₹)'],
          secondAmount: formData['2ND (₹)'] || '-',
          block: (formData['ADDRESS'] || '').includes('Geedam') ? 'Geedam' : ((formData['ADDRESS'] || '').includes('Kuakonda') ? 'Kuakonda' : ((formData['ADDRESS'] || '').includes('Katekalyan') ? 'Katekalyan' : 'Dantewada'))
        });
        window.DantewadaDB.persist();
      }
    },
    IIM_Candidate_List: {
      num: 6,
      titleEn: "6. IIM_Candidate_List",
      titleHi: "IIM Raipur Candidate List 2025",
      desc: "IIM रायपुर उद्यमिता एवं इन्क्यूबेशन कार्यक्रम 2025 हेतु चयनित युवा। (दोहरा AGE कॉलम नियंत्रित)",
      collection: "iimRaipur",
      params: [
        "SR",
        "NAME",
        "FATHER NAME",
        "GENDER",
        "AGE",
        "CAST",
        "GP",
        "BLOCK",
        "DISTRICT",
        "MOBILE NO.",
        "EDUCATION",
        "PERCENT",
        "AGE (2)"
      ],
      mapRow: (item, idx) => [
        item.id || idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.gender || 'M',
        item.age || '22',
        item.category || item.cast || 'ST',
        item.gp || item.village || 'N/A',
        item.block || 'Dantewada',
        item.district || 'Dantewada',
        item.mobile || 'N/A',
        item.education || 'Graduate',
        item.percent || '65%',
        item.age2 || item.age || '22'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.iimRaipur) window.DantewadaDB.data.iimRaipur = [];
        window.DantewadaDB.data.iimRaipur.unshift({
          id: window.DantewadaDB.data.iimRaipur.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          gender: formData['GENDER'] || 'Male',
          age: formData['AGE'],
          category: formData['CAST'],
          gp: formData['GP'],
          block: formData['BLOCK'],
          district: formData['DISTRICT'] || 'Dantewada',
          mobile: formData['MOBILE NO.'],
          education: formData['EDUCATION'],
          percent: formData['PERCENT']
        });
        window.DantewadaDB.persist();
      }
    },
    Training_Conducted: {
      num: 7,
      titleEn: "7. Training_Conducted",
      titleHi: "आयोजित प्रशिक्षण",
      desc: "विभिन्न प्रशिक्षण संस्थानों द्वारा युवाओं को दिए गए कौशल प्रशिक्षण का विवरण।",
      collection: "trainingConducted",
      params: [
        "SR. NO.",
        "NAME",
        "ADDRESS",
        "MOBILE NO.",
        "INSTITUTE",
        "TRAINING"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || item.title || 'Candidate Name',
        item.address || item.venue || 'Dantewada',
        item.mobile || '9876543210',
        item.institute || item.trainer || 'Livelihood College Dantewada',
        item.training || item.category || 'Skill Training'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.trainingConducted) window.DantewadaDB.data.trainingConducted = [];
        window.DantewadaDB.data.trainingConducted.unshift({
          id: `TC-${Date.now().toString().slice(-4)}`,
          name: formData['NAME'],
          address: formData['ADDRESS'],
          mobile: formData['MOBILE NO.'],
          institute: formData['INSTITUTE'],
          training: formData['TRAINING']
        });
        window.DantewadaDB.persist();
      }
    },
    MY_Bharat_Registration: {
      num: 8,
      titleEn: "8. MY_Bharat_Registration",
      titleHi: "MY Bharat पंजीकरण",
      desc: "राष्ट्रीय युवा पोर्टल 'MY Bharat' पर पंजीकृत युवाओं का विवरण।",
      collection: "myBharat",
      params: [
        "SR. NO.",
        "NAME",
        "FATHER NAME",
        "VILLAGE",
        "BLOCK",
        "DOB",
        "GENDER",
        "MOBILE NO.",
        "CATEGORY",
        "CURRENT OCCUPATION",
        "REMARK"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.village || 'N/A',
        item.block || 'Dantewada',
        item.dob || '2002-05-14',
        item.gender || 'Male',
        item.mobile || 'N/A',
        item.category || 'ST',
        item.currentOccupation || 'Student / Job Seeker',
        item.remark || 'Active Registered'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.myBharat) window.DantewadaDB.data.myBharat = [];
        window.DantewadaDB.data.myBharat.unshift({
          id: window.DantewadaDB.data.myBharat.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          village: formData['VILLAGE'],
          block: formData['BLOCK'],
          dob: formData['DOB'],
          gender: formData['GENDER'] || 'Male',
          mobile: formData['MOBILE NO.'],
          category: formData['CATEGORY'],
          currentOccupation: formData['CURRENT OCCUPATION'],
          remark: formData['REMARK'] || 'Registered'
        });
        window.DantewadaDB.persist();
      }
    },
    Youth_Hub_Trainings: {
      num: 9,
      titleEn: "9. Youth Hub Trainees",
      titleHi: "यूथ हब प्रशिक्षणार्थी (Youth Hub Trainees)",
      desc: "दंतेवाड़ा यूथ हब केंद्र में ओरिएंटेशन एवं क्षमता विकास प्रशिक्षण प्राप्त युवा।",
      collection: "youthHubTrainings",
      params: [
        "SR. NO.",
        "NAME",
        "FATHER NAME",
        "VILLAGE",
        "BLOCK",
        "DOB",
        "GENDER",
        "MOBILE NO.",
        "REMARK"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.village || 'N/A',
        item.block || 'Dantewada',
        item.dob || '2001-11-20',
        item.gender || 'Male',
        item.mobile || 'N/A',
        item.remark || 'Training Completed'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.youthHubTrainings) window.DantewadaDB.data.youthHubTrainings = [];
        window.DantewadaDB.data.youthHubTrainings.unshift({
          id: window.DantewadaDB.data.youthHubTrainings.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          village: formData['VILLAGE'],
          block: formData['BLOCK'],
          dob: formData['DOB'],
          gender: formData['GENDER'] || 'Male',
          mobile: formData['MOBILE NO.'],
          remark: formData['REMARK'] || 'Completed'
        });
        window.DantewadaDB.persist();
      }
    },
    Bastar_Munne_Shivir: {
      num: 13,
      titleEn: "13. Bastar_Munne_Shivir",
      titleHi: "बस्तर मुन्ने शिविर में पंजीकृत युवा",
      desc: "बस्तर मुन्ने शिविर एवं कौशल प्रशिक्षण मेले में पंजीकृत युवाओं का आधार सहित विवरण।",
      collection: "bastarShivir",
      params: [
        "SR. NO.",
        "NAME",
        "FATHER NAME",
        "VILLAGE",
        "BLOCK",
        "DOB",
        "GENDER",
        "MOBILE NO.",
        "AADHAR",
        "CATEGORY",
        "INTERESTED TRADE (इच्छुक ट्रेड)"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.name || 'N/A',
        item.fatherName || 'N/A',
        item.village || 'N/A',
        item.block || 'Dantewada',
        item.dob || '2003-04-12',
        item.gender || 'Male',
        item.mobile || 'N/A',
        item.aadhar ? (typeof window.DantewadaDB.maskAadhaar === 'function' ? window.DantewadaDB.maskAadhaar(item.aadhar) : item.aadhar) : 'XXXXXXXX7890',
        item.category || 'ST',
        item.training || item.remark || 'RAJMISTRI'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.bastarShivir) window.DantewadaDB.data.bastarShivir = [];
        window.DantewadaDB.data.bastarShivir.unshift({
          id: window.DantewadaDB.data.bastarShivir.length + 1,
          name: formData['NAME'],
          fatherName: formData['FATHER NAME'],
          village: formData['VILLAGE'],
          block: formData['BLOCK'],
          dob: formData['DOB'],
          gender: formData['GENDER'] || 'Male',
          mobile: formData['MOBILE NO.'],
          aadhar: formData['AADHAR'],
          category: formData['CATEGORY'],
          training: formData['INTERESTED TRADE (इच्छुक ट्रेड)'] || 'RAJMISTRI',
          remark: formData['INTERESTED TRADE (इच्छुक ट्रेड)'] || 'Registered'
        });
        window.DantewadaDB.persist();
      }
    },
    Bastar_Munne_Report: {
      num: "RPT",
      titleEn: "Bastar Munne Shivir Report",
      titleHi: "बस्तर मुन्ने शिविर ग्रामवार रिपोर्ट",
      desc: "बस्तर मुन्ने शिविर अंतर्गत 36 गांवों से 441 युवाओं का ट्रेडवार प्रशिक्षण सारांश (राजमिस्त्री 236, ड्राइविंग 101, सिलाई 71, इलेक्ट्रीशियन 32, कंप्यूटर 30, वेल्डिंग 21, प्लंबर 9, सोलर 3)।",
      collection: "bastarMunneVillageReport",
      params: [
        "S. NO.",
        "VILLAGE NAME",
        "NO. OF YOUTH FOR TRAININGS",
        "RAJMISTRI",
        "DRIVING",
        "WELDING",
        "SOLAR",
        "ELECTRICIAL",
        "SILAI",
        "PLUMBER",
        "COMPUTER"
      ],
      mapRow: (item, idx) => [
        item.sr,
        item.village,
        item.total,
        item.rajmistri || 0,
        item.driving || 0,
        item.welding || 0,
        item.solar || 0,
        item.electrical || 0,
        item.silai || 0,
        item.plumber || 0,
        item.computer || 0
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.bastarMunneVillageReport) {
          window.DantewadaDB.data.bastarMunneVillageReport = window.DantewadaDB.getSheetData('Bastar_Munne_Report');
        }
        window.DantewadaDB.data.bastarMunneVillageReport.unshift({
          sr: window.DantewadaDB.data.bastarMunneVillageReport.length,
          village: formData['VILLAGE NAME'],
          total: formData['NO. OF YOUTH FOR TRAININGS'] || '0',
          rajmistri: formData['RAJMISTRI'] || '0',
          driving: formData['DRIVING'] || '0',
          welding: formData['WELDING'] || '0',
          solar: formData['SOLAR'] || '0',
          electrical: formData['ELECTRICIAL'] || '0',
          silai: formData['SILAI'] || '0',
          plumber: formData['PLUMBER'] || '0',
          computer: formData['COMPUTER'] || '0'
        });
        window.DantewadaDB.persist();
      }
    },
    Meetings_VO_CLF_TRIF: {
      num: 14,
      titleEn: "14. VO CLF Meeting",
      titleHi: "VO / CLF बैठकें (ग्राम संगठन व संकुल संघ)",
      desc: "ग्राम संगठन (VO) एवं संकुल स्तरीय परिसंघ (CLF) की आजीविका, युवा सहभागिता एवं समीक्षा बैठकों का संपूर्ण विवरण व फोटो गैलरी।",
      collection: "meetingsVoClfTrif",
      params: [
        "SR. NO.",
        "DATE",
        "VILLAGE",
        "BLOCK",
        "VO / CLF NAME",
        "ADHAYAKSH / SACHIV",
        "DISCUSS POINT",
        "REMARKS",
        "PHOTO UPLOAD"
      ],
      mapRow: (item, idx) => [
        item.id || idx + 1,
        item.date || '2026-03-01',
        item.village || item.gp || 'Dantewada',
        item.block || 'Dantewada',
        item.voClfName || item.orgName || 'Prerna Mahila Gram Sangathan',
        item.adhayakshSachiv || item.chairedBy || 'N/A',
        item.discussPoint || item.agenda || 'Youth Livelihood Mobilization',
        item.remarks || item.decisions || 'Action Plan Finalized',
        item.photo || item.photoUrl || ''
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.meetingsVoClfTrif) window.DantewadaDB.data.meetingsVoClfTrif = [];
        const photoVal = formData['PHOTO UPLOAD'] || formData['PHOTO'] || formData['Photo'] || '';
        window.DantewadaDB.data.meetingsVoClfTrif.unshift({
          id: window.DantewadaDB.data.meetingsVoClfTrif.length + 1,
          date: formData['DATE'] || new Date().toISOString().split('T')[0],
          village: formData['VILLAGE'] || 'Dantewada',
          block: formData['BLOCK'] || 'Dantewada',
          voClfName: formData['VO / CLF NAME'] || 'Prerna Mahila Gram Sangathan',
          adhayakshSachiv: formData['ADHAYAKSH / SACHIV'] || 'N/A',
          discussPoint: formData['DISCUSS POINT'] || 'Youth livelihood and training mobilization',
          remarks: formData['REMARKS'] || 'Completed',
          photo: photoVal
        });
        window.DantewadaDB.persist();
      }
    },
    M_Form: {
      num: 15,
      titleEn: "15. M-Form", // titleEn: "17. M-Form"
      titleHi: "एम-फॉर्म सर्वे (M-Form Registration)",
      desc: "दंतेवाड़ा जिले के ग्राम-वार एम-फॉर्म सर्वे में पंजीकृत युवाओं का संपूर्ण डेटाबेस।",
      collection: "mFormRecords",
      params: [
        "SR. NO.",
        "Block Name",
        "Grampanchayat",
        "First Name",
        "Last Name",
        "Mobile Number",
        "Gender",
        "Email",
        "Pin Code",
        "Father's Name / Husband's Name",
        "Mother's Name",
        "Category",
        "Highest Qualification",
        "Current Occupation",
        "Aspired Career"
      ],
      mapRow: (item, idx) => [
        idx + 1,
        item.block || item['Block Name'] || 'Dantewada',
        item.gramPanchayat || item.gp || item['Grampanchayat'] || '',
        item.firstName || item['First Name'] || (item.name ? item.name.split(' ')[0] : ''),
        item.lastName || item['Last Name'] || (item.name ? item.name.split(' ').slice(1).join(' ') : ''),
        item.mobile || item['Mobile Number'] || item['Mobile'] || '',
        item.gender || item['Gender'] || 'Male',
        item.email || item['Email'] || '',
        item.pinCode || item['Pin Code'] || '',
        item.fatherHusband || item["Father's Name / Husband's Name"] || item.fatherName || '',
        item.motherName || item["Mother's Name"] || '',
        item.category || item['Category'] || 'ST',
        item.qualification || item['Highest Qualification'] || '12th Pass',
        item.currentOccupation || item['Current Occupation'] || item.occupation || 'Candidate',
        item.aspiredCareer || item['Aspired Career'] || 'Direct Formal Jobs'
      ],
      saveRecord: (formData) => {
        if (!window.DantewadaDB.data.mFormRecords) window.DantewadaDB.data.mFormRecords = [];
        window.DantewadaDB.data.mFormRecords.unshift({
          id: window.DantewadaDB.data.mFormRecords.length + 1,
          block: formData['Block Name'] || 'Dantewada',
          gramPanchayat: formData['Grampanchayat'] || '',
          firstName: formData['First Name'] || '',
          lastName: formData['Last Name'] || '',
          mobile: formData['Mobile Number'] || '',
          gender: formData['Gender'] || 'Male',
          email: formData['Email'] || '',
          pinCode: formData['Pin Code'] || '',
          fatherHusband: formData["Father's Name / Husband's Name"] || '',
          motherName: formData["Mother's Name"] || '',
          category: formData['Category'] || 'ST',
          qualification: formData['Highest Qualification'] || '12th Pass',
          currentOccupation: formData['Current Occupation'] || 'Candidate',
          aspiredCareer: formData['Aspired Career'] || 'Direct Formal Jobs'
        });
        window.DantewadaDB.persist();
      }
    }
  };

  window.filterDashCategory = function(cat, btn) {
    const cards = document.querySelectorAll('.dash-module-card');
    cards.forEach(card => {
      if (cat === 'all' || card.getAttribute('data-dash-cat') === cat) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.cat-pill').forEach(p => {
          p.className = 'cat-pill px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition';
        });
        btn.className = 'cat-pill active px-3 py-1 text-xs font-bold rounded-lg bg-white text-blue-900 shadow-xs border border-slate-200 transition';
      }
    }
  };

  window.openSheetViewer = function (sheetKey) {
    if (SHEET_CONFIGS[sheetKey]) {
      currentActiveSheet = sheetKey;
    }
    switchTab('sheet-viewer');
    renderSheetViewer();
    updateSidebarBadgeCounts();

    // Highlight matching sidebar button
    document.querySelectorAll('.bilingual-nav-btn[data-sheet]').forEach(btn => {
      if (btn.getAttribute('data-sheet') === currentActiveSheet) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  function renderSheetViewer() {
    const cfg = SHEET_CONFIGS[currentActiveSheet] || SHEET_CONFIGS['Employment_Registration'];

    // Render Pills Bar
    const pillsContainer = document.getElementById('sheetPillSelector');
    if (pillsContainer) {
      pillsContainer.innerHTML = Object.keys(SHEET_CONFIGS).map(k => {
        const item = SHEET_CONFIGS[k];
        const isActive = k === currentActiveSheet;
        return `
          <button onclick="window.openSheetViewer('${k}')" class="px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${isActive ? 'bg-blue-600 text-white shadow-md font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}">
            <span class="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">${item.num}</span>
            <span>${item.titleEn.split(' ')[1] || item.titleEn}</span>
          </button>
        `;
      }).join('');
    }

    // Update Header
    const numEl = document.getElementById('sheetHeaderNum');
    const titleEl = document.getElementById('sheetHeaderTitle');
    const countEl = document.getElementById('sheetHeaderColCount');
    const descEl = document.getElementById('sheetHeaderDesc');
    const badgeEl = document.getElementById('sheetViewerActiveBadge');

    if (numEl) numEl.textContent = cfg.num;
    if (titleEl) titleEl.textContent = `${cfg.titleEn} — ${cfg.titleHi}`;
    if (countEl) countEl.textContent = `${cfg.params.length} कॉलम्स`;
    if (descEl) descEl.textContent = cfg.desc;
    if (badgeEl) badgeEl.textContent = `Active: ${cfg.titleEn}`;

    // Update Parameter Pills Showcase
    const paramsPillsEl = document.getElementById('sheetParameterPills');
    if (paramsPillsEl) {
      paramsPillsEl.innerHTML = cfg.params.map((p, idx) => `
        <span class="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs">
          <span class="font-mono text-[10px] text-blue-500 font-bold">#${idx + 1}</span>
          <span>${p}</span>
        </span>
      `).join('');
    }

    // Toggle Bastar Munne Trade Filter Bar
    const tradeBar = document.getElementById('bastarTradeFilterBar');
    if (tradeBar) {
      if (currentActiveSheet === 'Bastar_Munne_Shivir') {
        tradeBar.classList.remove('hidden');
      } else {
        tradeBar.classList.add('hidden');
      }
    }

    // Toggle Startup Ideas District Quick Filter Bar
    const distBar = document.getElementById('startupDistrictFilterBar');
    if (distBar) {
      if (currentActiveSheet === 'Entrepreneur_Identified' || currentActiveSheet === 'Startup_District_Ideas') {
        distBar.classList.remove('hidden');
      } else {
        distBar.classList.add('hidden');
      }
    }

    renderSheetTable();
  }

  window.filterBastarTrade = function (trade) {
    const searchInput = document.getElementById('sheetSearchInput');
    if (searchInput) {
      searchInput.value = trade;
      renderSheetTable();
    }
  };

  window.filterEntrepreneurByDistrict = function (districtKey) {
    if (currentActiveSheet !== 'Entrepreneur_Identified') {
      window.openSheetViewer('Entrepreneur_Identified');
    }
    const searchInput = document.getElementById('sheetSearchInput');
    if (searchInput) {
      searchInput.value = (districtKey === 'All' || !districtKey) ? '' : districtKey;
      renderSheetTable();
    }
  };

  function renderSheetTable() {
    const cfg = SHEET_CONFIGS[currentActiveSheet] || SHEET_CONFIGS['Employment_Registration'];
    if (!window.DantewadaDB) return;

    const searchInput = document.getElementById('sheetSearchInput');
    const blockSelect = document.getElementById('sheetBlockFilter');

    const options = {
      search: searchInput ? searchInput.value : '',
      block: blockSelect ? blockSelect.value : 'All'
    };

    const rawRecords = window.DantewadaDB.getSheetData(currentActiveSheet, options);

    const recordCountEl = document.getElementById('sheetRecordCount');
    if (recordCountEl) recordCountEl.textContent = rawRecords.length;

    // Render Table Head
    const thead = document.getElementById('sheetTableHead');
    if (thead) {
      thead.innerHTML = `
        <tr>
          ${cfg.params.map(p => `<th class="p-3 whitespace-nowrap">${p}</th>`).join('')}
          <th class="p-3 text-right whitespace-nowrap">कार्रवाई</th>
        </tr>
      `;
    }

    updateSidebarBadgeCounts();

    // Render Table Body
    const tbody = document.getElementById('sheetTableBody');
    if (!tbody) return;

    if (rawRecords.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${cfg.params.length + 1}" class="py-14 text-center bg-slate-50/50">
            <div class="max-w-md mx-auto p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-200">
                <i class="fa-solid fa-file-excel"></i>
              </div>
              <h4 class="font-extrabold text-slate-800 text-sm mb-1">इस शीट में कोई रिकॉर्ड नहीं है (0 Records)</h4>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                यह शीट वर्तमान में खाली है। आप <strong class="text-emerald-700 font-bold">"बल्क अपलोड (Bulk Upload)"</strong> बटन पर क्लिक करके एक्सेल (.xlsx) फ़ाइल सीधे अपलोड कर सकते हैं।
              </p>
              <div class="flex items-center justify-center gap-2">
                <button onclick="window.openBulkUploadModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition">
                  <i class="fa-solid fa-file-arrow-up"></i> एक्सेल बल्क अपलोड करें
                </button>
                <button onclick="window.downloadSheetExcelTemplate(currentActiveSheet)" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition">
                  <i class="fa-solid fa-file-arrow-down"></i> टेम्पलेट डाउनलोड
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const tradeColors = {
      'RAJMISTRI': 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      'DRIVING': 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
      'SILAI': 'bg-pink-100 text-pink-900 border border-pink-300 font-bold',
      'COMPUTER': 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
      'ELECTRICIAN': 'bg-orange-100 text-orange-900 border border-orange-300 font-bold',
      'WELDING': 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
      'PLUMBER': 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold'
    };

    tbody.innerHTML = rawRecords.slice(0, 100).map((item, idx) => {
      const rowValues = cfg.mapRow(item, idx);

      // Custom Interactive Click-to-Details Table for Bastar Munne Village Report
      if (currentActiveSheet === 'Bastar_Munne_Report') {
        const isTotalRow = item.sr === 'TOTAL' || (item.village && item.village.includes('TOTAL'));
        const rowBg = isTotalRow ? 'bg-amber-50/90 font-bold border-t-2 border-amber-300' : 'hover:bg-blue-50/40 border-b border-slate-100';

        const tradesMap = [
          null, // 0: S.NO
          null, // 1: VILLAGE
          null, // 2: TOTAL YOUTH
          'RAJMISTRI',   // 3
          'DRIVING',     // 4
          'WELDING',     // 5
          'SOLAR',       // 6
          'ELECTRICIAN', // 7
          'SILAI',       // 8
          'PLUMBER',     // 9
          'COMPUTER'     // 10
        ];

        return `
          <tr class="${rowBg} transition-colors">
            ${rowValues.map((val, colIdx) => {
              if (colIdx === 0) {
                return `<td class="p-3 font-mono font-bold text-slate-500">${val}</td>`;
              }
              if (colIdx === 1) {
                if (isTotalRow) {
                  return `<td class="p-3 font-black text-amber-950 uppercase tracking-wide">${val}</td>`;
                }
                return `
                  <td class="p-3">
                    <button onclick="window.openVillageCandidateModal('${item.village}', 'ALL')" title="${val} के सभी पंजीकृत उम्मीदवार देखें" class="font-extrabold text-blue-900 hover:text-blue-700 hover:underline flex items-center gap-1.5 text-left transition">
                      <i class="fa-solid fa-tree-city text-emerald-600 text-xs"></i>
                      <span>${val}</span>
                    </button>
                  </td>
                `;
              }
              if (colIdx === 2) {
                const btnClass = isTotalRow 
                  ? 'bg-blue-900 text-white font-black px-3 py-1 shadow-md hover:bg-blue-800'
                  : 'bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2.5 py-0.5 hover:bg-blue-600 hover:text-white';
                return `
                  <td class="p-3">
                    <button onclick="window.openVillageCandidateModal('${item.village}', 'ALL')" title="${item.village} के सभी ${val} उम्मीदवार देखें" class="rounded-lg text-xs transition cursor-pointer shadow-2xs ${btnClass}">
                      ${val}
                    </button>
                  </td>
                `;
              }
              // Trade columns 3 to 10
              const tradeName = tradesMap[colIdx];
              const numVal = Number(val || 0);
              if (numVal > 0) {
                const pillColor = tradeColors[tradeName] || 'bg-slate-100 text-slate-800 border border-slate-300 font-bold';
                return `
                  <td class="p-3">
                    <button onclick="window.openVillageCandidateModal('${item.village}', '${tradeName}')" title="${item.village} • ${tradeName} के ${numVal} उम्मीदवार विवरण देखें" class="px-2.5 py-0.5 rounded-lg text-xs font-black shadow-2xs transition hover:scale-110 cursor-pointer ${pillColor}">
                      ${val}
                    </button>
                  </td>
                `;
              }
              return `<td class="p-3 text-slate-300 font-mono">-</td>`;
            }).join('')}
            <td class="p-3 text-right whitespace-nowrap">
              <button onclick="window.openVillageCandidateModal('${item.village}', 'ALL')" title="${item.village} के उम्मीदवारों की विस्तृत सूची खोलें" class="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm inline-flex">
                <i class="fa-solid fa-users-viewfinder"></i> <span>विवरण</span>
              </button>
            </td>
          </tr>
        `;
      }

      // Custom Interactive Click-to-Details Table for Startup Ideas by District
      if (currentActiveSheet === 'Startup_District_Ideas') {
        const isTotalRow = item.sr === 'TOTAL' || (item.district && item.district.includes('TOTAL'));
        const rowBg = isTotalRow ? 'bg-amber-50/90 font-bold border-t-2 border-amber-300' : 'hover:bg-blue-50/40 border-b border-slate-100';

        return `
          <tr class="${rowBg} transition-colors">
            <td class="p-3 font-mono font-bold text-slate-500">${item.sr}</td>
            <td class="p-3 font-black ${isTotalRow ? 'text-amber-950' : 'text-slate-900'}">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-location-dot ${isTotalRow ? 'text-amber-600' : 'text-blue-600'}"></i>
                <span>${item.district}</span>
              </div>
            </td>
            <td class="p-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200">
                ${item.totalIdeas} Ideas
              </span>
            </td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ${item.shortlisted} Shortlisted
              </span>
            </td>
            <td class="p-3 text-xs text-slate-600 font-medium max-w-xs">${item.keySectors}</td>
            <td class="p-3 text-xs text-slate-800 font-semibold max-w-sm">${item.topIdeas}</td>
            <td class="p-3 text-xs font-extrabold text-amber-900 font-mono">${item.totalInvestment}</td>
            <td class="p-3 text-right whitespace-nowrap">
              ${isTotalRow ? `
                <button onclick="window.filterEntrepreneurByDistrict('All')" class="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5">
                  <i class="fa-solid fa-layer-group"></i> <span>सभी 119 विचार</span>
                </button>
              ` : `
                <button onclick="window.filterEntrepreneurByDistrict('${item.districtKey}')" class="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5">
                  <i class="fa-solid fa-lightbulb"></i> <span>विचार देखें</span>
                </button>
              `}
            </td>
          </tr>
        `;
      }

      return `
        <tr class="hover:bg-blue-50/40 border-b border-slate-100 transition-colors">
          ${rowValues.map((val, colIdx) => {
            const isFirst = colIdx === 0;
            if (isFirst) {
              return `<td class="p-3 font-mono text-slate-400 text-xs font-semibold">${escapeHtml(val)}</td>`;
            }
            if (val && typeof val === 'string' && tradeColors[val]) {
              return `<td class="p-3"><span class="px-2.5 py-1 rounded-lg text-[11px] ${tradeColors[val]} shadow-2xs">${escapeHtml(val)}</span></td>`;
            }
            const isPill = (val && typeof val === 'string' && (val.includes('₹') || val === 'Male' || val === 'Female' || val === 'ST' || val === 'SC'));
            if (isPill) {
              return `<td class="p-3"><span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">${escapeHtml(val)}</span></td>`;
            }
            const isPhoto = (val && typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http://') || val.startsWith('https://') || val.includes('.jpg') || val.includes('.png') || val.includes('.jpeg')));
            if (isPhoto) {
              return `
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <img src="${escapeHtml(val)}" onclick="window.previewPhotoModal('${escapeHtml(val)}')" class="w-9 h-9 object-cover rounded-lg border border-purple-300 shadow-2xs cursor-pointer hover:scale-110 transition" alt="Photo" title="बड़ा फोटो देखने के लिए क्लिक करें">
                    <span class="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">फोटो</span>
                  </div>
                </td>
              `;
            }
            if (cfg.params[colIdx] && cfg.params[colIdx].toLowerCase().includes('photo')) {
              return `<td class="p-3 text-slate-300 text-xs font-mono"><i class="fa-regular fa-image mr-1"></i>No Photo</td>`;
            }
            return `<td class="p-3 text-slate-800">${escapeHtml(val) || '-'}</td>`;
          }).join('')}
          <td class="p-3 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1">
              <button onclick="window.viewSheetRowDetail('${currentActiveSheet}', ${idx})" title="पूर्ण विवरण देखें (View Dossier)" class="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition">
                <i class="fa-solid fa-id-card"></i>
              </button>
              <button onclick="window.editSheetRow('${currentActiveSheet}', ${idx})" title="संपादित करें (Edit)" class="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="window.deleteSheetRow('${currentActiveSheet}', ${idx})" title="हटाएं (Delete)" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // BASTAR MUNNE VILLAGE CANDIDATE DIRECTORY MODAL CONTROLLER
  // -------------------------------------------------------------
  let currentVillageModal = {
    village: 'ALL',
    trade: 'ALL'
  };

  window.openVillageCandidateModal = function (villageName = 'ALL', tradeName = 'ALL') {
    currentVillageModal.village = villageName;
    currentVillageModal.trade = tradeName;

    const modal = document.getElementById('villageCandidatesModal');
    if (!modal) return;

    const isAll = !villageName || villageName === 'ALL' || villageName.includes('TOTAL');
    const titleEl = document.getElementById('villageModalTitle');
    const blockEl = document.getElementById('villageModalBlock');
    const searchInput = document.getElementById('villageModalSearchInput');
    if (searchInput) searchInput.value = '';

    if (titleEl) {
      titleEl.textContent = isAll 
        ? 'समस्त 36 ग्राम पंचायतें — बस्तर मुन्ने शिविर पंजीकृत युवा' 
        : `ग्राम: ${villageName} — बस्तर मुन्ने शिविर पंजीकृत युवा`;
    }

    if (blockEl) {
      const VILLAGE_BLOCKS = {
        'PADHAPUR': 'Dantewada', 'BADEBACHELI': 'Dantewada', 'BADEKAMELI': 'Dantewada', 'NERLI': 'Dantewada',
        'MULLER': 'Dantewada', 'JHIRKA': 'Dantewada', 'MOLASNAR': 'Dantewada', 'MANGNAR': 'Dantewada',
        'BENPAL': 'Dantewada', 'KODENAR LAVA': 'Katekalyan', 'CHERPAL': 'Dantewada', 'REKA': 'Katekalyan',
        'BHATPAL': 'Dantewada', 'BADEKARLI': 'Katekalyan', 'MUNDENAR': 'Katekalyan', 'PAHURNAR': 'Katekalyan',
        'NELGODA': 'Katekalyan', 'GUMALNAR': 'Dantewada', 'KANDAKARKA': 'Dantewada', 'HIROLI': 'Dantewada',
        'KOKODI': 'Kuakonda', 'NAHADI': 'Kuakonda', 'GUMIYAPAL': 'Kuakonda', 'REWALI': 'Kuakonda',
        'BARREM': 'Kuakonda', 'KUTREM': 'Kuakonda', 'POTALI': 'Kuakonda', 'ARANPUR': 'Kuakonda',
        'FULNAR': 'Kuakonda', 'PONDUM': 'Kuakonda', 'KAWAD GAON': 'Kuakonda', 'MUSKEL': 'Katekalyan',
        'KAWALNAR': 'Katekalyan', 'TOYLANKA': 'Kuakonda', 'BHOGAM': 'Kuakonda', 'KUNDELI': 'Dantewada'
      };
      blockEl.textContent = isAll ? 'समस्त विकासखंड (All Blocks)' : `Block: ${VILLAGE_BLOCKS[villageName] || 'Dantewada'}`;
    }

    renderVillageTradePills();
    renderVillageCandidatesTable();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeVillageCandidateModal = function () {
    const modal = document.getElementById('villageCandidatesModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  function renderVillageTradePills() {
    const pillsContainer = document.getElementById('villageModalTradePills');
    if (!pillsContainer || !window.DantewadaDB) return;

    const allForVillage = window.DantewadaDB.getVillageReportCandidates(currentVillageModal.village, 'ALL', '');
    const counts = {};
    allForVillage.forEach(c => {
      const t = (c.training || c.remark || 'OTHER').toUpperCase();
      counts[t] = (counts[t] || 0) + 1;
    });

    const tradesList = [
      { key: 'ALL', label: 'सभी ट्रेड्स', count: allForVillage.length },
      { key: 'RAJMISTRI', label: 'राजमिस्त्री', count: counts['RAJMISTRI'] || 0 },
      { key: 'DRIVING', label: 'ड्राइविंग', count: counts['DRIVING'] || 0 },
      { key: 'SILAI', label: 'सिलाई', count: counts['SILAI'] || 0 },
      { key: 'ELECTRICIAN', label: 'इलेक्ट्रीशियन', count: counts['ELECTRICIAN'] || 0 },
      { key: 'COMPUTER', label: 'कंप्यूटर', count: counts['COMPUTER'] || 0 },
      { key: 'WELDING', label: 'वेल्डिंग', count: counts['WELDING'] || 0 },
      { key: 'PLUMBER', label: 'प्लंबर', count: counts['PLUMBER'] || 0 },
      { key: 'SOLAR', label: 'सोलर', count: counts['SOLAR'] || 0 }
    ].filter(t => t.key === 'ALL' || t.count > 0);

    pillsContainer.innerHTML = tradesList.map(t => {
      const isActive = currentVillageModal.trade.toUpperCase() === t.key.toUpperCase();
      return `
        <button onclick="window.setVillageModalTrade('${t.key}')" class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${isActive ? 'bg-blue-800 text-white shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}">
          <span>${t.label}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/30 text-white font-mono' : 'bg-slate-200 text-slate-800 font-mono'}">${t.count}</span>
        </button>
      `;
    }).join('');

    const badgeEl = document.getElementById('villageModalTradeBadge');
    if (badgeEl) {
      badgeEl.textContent = currentVillageModal.trade === 'ALL' ? 'ट्रेड: सभी' : `ट्रेड: ${currentVillageModal.trade}`;
    }
  }

  window.setVillageModalTrade = function (trade) {
    currentVillageModal.trade = trade;
    renderVillageTradePills();
    renderVillageCandidatesTable();
  };

  window.renderVillageCandidatesTable = function () {
    if (!window.DantewadaDB) return;

    const searchInput = document.getElementById('villageModalSearchInput');
    const query = searchInput ? searchInput.value : '';

    const list = window.DantewadaDB.getVillageReportCandidates(
      currentVillageModal.village,
      currentVillageModal.trade,
      query
    );

    const countEl = document.getElementById('villageModalCandidateCount');
    if (countEl) countEl.textContent = list.length;

    const tbody = document.getElementById('villageModalCandidatesBody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-user-slash text-3xl mb-2 text-slate-300"></i>
            <p class="font-semibold text-xs">इस फ़िल्टर अनुसार कोई उम्मीदवार नहीं मिला।</p>
          </td>
        </tr>
      `;
      return;
    }

    const tradeColors = {
      'RAJMISTRI': 'bg-amber-100 text-amber-900 border border-amber-300',
      'DRIVING': 'bg-blue-100 text-blue-900 border border-blue-300',
      'SILAI': 'bg-pink-100 text-pink-900 border border-pink-300',
      'COMPUTER': 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      'ELECTRICIAN': 'bg-orange-100 text-orange-900 border border-orange-300',
      'WELDING': 'bg-purple-100 text-purple-900 border border-purple-300',
      'PLUMBER': 'bg-cyan-100 text-cyan-900 border border-cyan-300',
      'SOLAR': 'bg-yellow-100 text-yellow-900 border border-yellow-300'
    };

    tbody.innerHTML = list.map((c, idx) => {
      const maskedAadhar = c.aadhar 
        ? (typeof window.DantewadaDB.maskAadhaar === 'function' ? window.DantewadaDB.maskAadhaar(c.aadhar) : c.aadhar)
        : 'XXXXXXXX7890';
      const color = tradeColors[c.training] || 'bg-slate-100 text-slate-800';

      return `
        <tr class="hover:bg-blue-50/40 border-b border-slate-100 transition-colors">
          <td class="p-3 font-mono text-slate-400 text-xs font-bold">${idx + 1}</td>
          <td class="p-3">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                ${(c.name || 'Y').slice(0, 2).toUpperCase()}
              </span>
              <span class="font-bold text-slate-900">${c.name || 'N/A'}</span>
            </div>
          </td>
          <td class="p-3 text-slate-700">${c.fatherName || 'N/A'}</td>
          <td class="p-3">
            <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${color}">${c.training}</span>
          </td>
          <td class="p-3 text-slate-600 font-mono text-xs">${c.dob || 'N/A'}</td>
          <td class="p-3">
            <a href="tel:${c.mobile}" class="font-bold text-blue-800 hover:underline flex items-center gap-1 font-mono">
              <i class="fa-solid fa-phone text-[10px] text-blue-600"></i> ${c.mobile || 'N/A'}
            </a>
          </td>
          <td class="p-3 font-mono text-slate-600 text-xs">
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-shield-halved text-emerald-600 text-[10px]"></i> ${maskedAadhar}
            </span>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </td>
          <td class="p-3 text-right">
            <div class="inline-flex items-center gap-1">
              ${c.mobile ? `
                <a href="https://wa.me/91${c.mobile.replace(/\D/g, '')}" target="_blank" title="WhatsApp" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                </a>
              ` : ''}
              <button onclick="window.viewCandidateDossierDirect(${JSON.stringify(c).replace(/"/g, '&quot;')})" title="पूर्ण डोजियर देखें (View Dossier)" class="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition">
                <i class="fa-solid fa-id-card text-xs"></i>
              </button>
              <button onclick="window.deleteVillageCandidate('${escapeHtml(c.name)}', '${c.mobile || ''}')" title="हटाएं (Delete)" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.deleteVillageCandidate = async function (name, mobile) {
    if (!confirm(`क्या आप निश्चित हैं कि उम्मीदवार '${name}' को हटाना चाहते हैं? यह Google Sheet से भी डिलीट हो जाएगा।`)) return;
    if (window.DantewadaDB.data.bastarShivir) {
      window.DantewadaDB.data.bastarShivir = window.DantewadaDB.data.bastarShivir.filter(c => !(c.name === name && (!mobile || c.mobile === mobile)));
      window.DantewadaDB.persist();
      window.openVillageCandidateModal(currentVillageModal.village, currentVillageModal.trade);
    }
    if (typeof API !== 'undefined' && API.call) {
      API.call('deleteRecord', {
        sheetName: 'Bastar_Munne_Shivir',
        idField: 'NAME',
        idValue: name
      }).then(r => console.log('Village candidate cloud delete:', r)).catch(err => console.warn('Failed cloud delete:', err));
    }
  };

  window.viewCandidateDossierDirect = function (item) {
    if (!item) return;
    const modal = document.getElementById('youthDossierModal');
    const content = document.getElementById('youthDossierContent');
    if (!modal || !content) return;

    const maskedAadhar = item.aadhar 
      ? (typeof window.DantewadaDB.maskAadhaar === 'function' ? window.DantewadaDB.maskAadhaar(item.aadhar) : item.aadhar)
      : 'XXXXXXXX7890';

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-900 text-white font-extrabold flex items-center justify-center text-xl shadow-lg border border-indigo-500/40">
              ${(item.name || 'Y').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="badge-status badge-block font-bold">${item.block || 'Dantewada'}</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">${item.training}</span>
                <span class="badge-status badge-published font-semibold">Registered (पंजीकृत)</span>
                <span class="text-xs text-slate-400 font-mono">ID: #${item.id}</span>
              </div>
              <h2 class="text-2xl font-black text-slate-900">${item.name || 'N/A'}</h2>
              <p class="text-xs text-slate-500">पिता का नाम: <strong class="text-slate-700">${item.fatherName || 'N/A'}</strong> | ग्राम: <strong class="text-slate-700">${item.village || 'N/A'}</strong></p>
            </div>
          </div>
          <button onclick="window.closeYouthDossierModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">जन्म तिथि (DOB)</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.dob || 'N/A'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">लिंग / Gender</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.gender || 'Male'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">वर्ग / Category</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.category || 'ST'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">इच्छुक ट्रेड (Training Trade)</div>
            <div class="font-extrabold text-blue-900 text-sm mt-0.5">${item.training}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-address-card text-blue-600"></i> पहचान एवं संपर्क (Identity & Contact)
            </h4>
            <div class="text-xs space-y-1.5 pt-1">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">मोबाइल नंबर:</span>
                <a href="tel:${item.mobile}" class="font-bold text-blue-800 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-phone text-[10px]"></i> ${item.mobile || 'N/A'}
                </a>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">आधार संख्या (Masked):</span>
                <span class="font-mono font-bold text-slate-800 flex items-center gap-1">
                  <i class="fa-solid fa-shield-halved text-emerald-600 text-[10px]"></i> ${maskedAadhar}
                </span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">पंजीकरण मॉड्यूल:</span>
                <span class="font-medium text-slate-700">बस्तर मुन्ने शिविर 2026</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-location-dot text-rose-600"></i> भौगोलिक स्थान (Location Details)
            </h4>
            <div class="text-xs space-y-1.5 pt-1">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">ग्राम (Village):</span>
                <span class="font-bold text-slate-800">${item.village || 'N/A'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">विकासखंड (Block):</span>
                <span class="font-bold text-slate-800">${item.block || 'Dantewada'}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">जिला (District):</span>
                <span class="font-medium text-slate-700">दक्षिण बस्तर दंतेवाड़ा</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-200">
          <div class="text-[11px] text-slate-400">
            दंतेवाड़ा युवा विकास एवं रोजगार मिशन — बस्तर मुन्ने शिविर
          </div>
          <div class="flex items-center gap-2">
            ${item.mobile ? `
              <a href="https://wa.me/91${item.mobile.replace(/\D/g, '')}" target="_blank" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
              </a>
              <a href="tel:${item.mobile}" class="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-solid fa-phone text-xs"></i> Call
              </a>
            ` : ''}
            <button onclick="window.closeYouthDossierModal()" class="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
              बंद करें (Close)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.exportVillageCandidatesExcel = function () {
    if (typeof XLSX === 'undefined' || !window.DantewadaDB) {
      alert('Excel export library not available.');
      return;
    }

    const searchInput = document.getElementById('villageModalSearchInput');
    const query = searchInput ? searchInput.value : '';

    const list = window.DantewadaDB.getVillageReportCandidates(
      currentVillageModal.village,
      currentVillageModal.trade,
      query
    );

    const exportData = list.map((c, i) => ({
      'क्र.': i + 1,
      'उम्मीदवार का नाम': c.name,
      'पिता का नाम': c.fatherName,
      'इच्छुक ट्रेड': c.training,
      'ग्राम': c.village,
      'ब्लॉक': c.block,
      'जन्म तिथि': c.dob,
      'लिंग': c.gender,
      'मोबाइल नंबर': c.mobile,
      'आधार संख्या': c.aadhar,
      'वर्ग': c.category,
      'स्थिति': 'पंजीकृत'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'उम्मीदवार विवरण');
    const fileName = `Bastar_Munne_${currentVillageModal.village}_${currentVillageModal.trade}_Candidates.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  window.viewSheetRowDetail = function (sheetKey, index) {
    const cfg = SHEET_CONFIGS[sheetKey];
    if (!cfg || !window.DantewadaDB) return;

    const searchInput = document.getElementById('sheetSearchInput');
    const blockSelect = document.getElementById('sheetBlockFilter');
    const options = {
      search: searchInput ? searchInput.value : '',
      block: blockSelect ? blockSelect.value : 'All'
    };
    const list = window.DantewadaDB.getSheetData(sheetKey, options);
    const item = list[index];
    if (!item) return;

    const modal = document.getElementById('youthDossierModal');
    const content = document.getElementById('youthDossierContent');
    if (!modal || !content) return;

    // Special Startup Pitch Dossier for Entrepreneur Identified
    if (sheetKey === 'Entrepreneur_Identified' || item.startupName) {
      const driveLinks = (item.businessPlanLink && item.businessPlanLink !== 'N/A' && item.businessPlanLink !== 'No')
        ? item.businessPlanLink.split(',').map(l => l.trim()).filter(l => l.startsWith('http'))
        : [];

      content.innerHTML = `
        <div class="p-6 sm:p-8 space-y-6">
          <div class="flex items-start justify-between border-b border-slate-200 pb-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white font-black flex items-center justify-center text-xl shadow-lg border border-amber-400/40">
                <i class="fa-solid fa-rocket text-2xl"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="badge-status badge-block font-bold">${escapeHtml(item.district || 'Dantewada')}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ${escapeHtml(item.workType || 'FULL TIME')}
                  </span>
                  <span class="badge-status badge-published font-semibold">Startup Hunt #119</span>
                  <span class="text-xs text-slate-400 font-mono">Sr: #${item.id || index + 1}</span>
                </div>
                <h2 class="text-2xl font-black text-slate-900">${escapeHtml(item.startupName || 'Startup Idea')}</h2>
                <p class="text-xs text-slate-500">
                  संस्थापक (Founder): <strong class="text-slate-800">${escapeHtml(item.founderName || item.name || 'N/A')}</strong> 
                  | आयु: <strong class="text-slate-800">${escapeHtml(item.age || 'N/A')}</strong> 
                  | योग्यता: <strong class="text-slate-800">${escapeHtml(item.education || 'N/A')}</strong>
                  | जिला: <strong class="text-blue-900 font-bold">${escapeHtml(item.district || 'Dantewada')}</strong>
                </p>
              </div>
            </div>
            <button onclick="window.closeYouthDossierModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
            <div>
              <div class="text-[10px] text-amber-800 uppercase font-bold">निवेश आवश्यकता (Needed)</div>
              <div class="font-black text-amber-950 text-sm mt-0.5">${escapeHtml(item.investmentNeeded || 'N/A')}</div>
            </div>
            <div>
              <div class="text-[10px] text-amber-800 uppercase font-bold">अब तक निवेश (Invested)</div>
              <div class="font-bold text-slate-800 text-sm mt-0.5">${escapeHtml(item.investedSoFar || '0')}</div>
            </div>
            <div>
              <div class="text-[10px] text-amber-800 uppercase font-bold">टीम सदस्य (Team)</div>
              <div class="font-bold text-slate-800 text-sm mt-0.5">${escapeHtml(item.teamMembers || '1')} Member(s)</div>
            </div>
            <div>
              <div class="text-[10px] text-amber-800 uppercase font-bold">कार्य प्रणाली (Work Type)</div>
              <div class="font-extrabold text-blue-900 text-sm mt-0.5">${escapeHtml(item.workType || 'FULL TIME')}</div>
            </div>
          </div>

          <!-- Problem & Idea Cards -->
          <div class="space-y-4 text-xs">
            <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <h4 class="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-bullseye text-rose-600"></i> आइडिया / स्टार्टअप का विवरण (Description):
              </h4>
              <p class="text-slate-700 leading-relaxed whitespace-pre-line text-[13px]">${escapeHtml(item.description || item.startupName)}</p>
            </div>

            ${item.problemSolved && item.problemSolved !== 'N/A' ? `
              <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs space-y-1.5">
                <h4 class="font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-screwdriver-wrench text-blue-600"></i> किस समस्या का समाधान करता है? (Problem Solved):
                </h4>
                <p class="text-slate-700 leading-relaxed whitespace-pre-line text-[13px]">${escapeHtml(item.problemSolved)}</p>
              </div>
            ` : ''}

            ${item.businessModel && item.businessModel !== 'N/A' ? `
              <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-1.5">
                <h4 class="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-chart-line text-emerald-600"></i> बिजनेस मॉडल (Business Model):
                </h4>
                <p class="text-slate-700 leading-relaxed whitespace-pre-line text-[13px]">${escapeHtml(item.businessModel)}</p>
              </div>
            ` : ''}

            ${item.futureGoals && item.futureGoals !== 'N/A' ? `
              <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs space-y-1.5">
                <h4 class="font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-rocket text-purple-600"></i> भविष्य के लक्ष्य (Future Goals):
                </h4>
                <p class="text-slate-700 leading-relaxed whitespace-pre-line text-[13px]">${escapeHtml(item.futureGoals)}</p>
              </div>
            ` : ''}
          </div>

          <!-- Contact & Location Box -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
              <h4 class="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-address-book text-blue-600"></i> संपर्क जानकारी (Contact):
              </h4>
              <div class="space-y-1.5 pt-1">
                <div class="flex justify-between py-1 border-b border-slate-200">
                  <span class="text-slate-500">मोबाइल:</span>
                  <a href="tel:${escapeHtml(item.mobile)}" class="font-bold text-blue-800 hover:underline flex items-center gap-1">
                    <i class="fa-solid fa-phone text-[10px]"></i> ${escapeHtml(item.mobile)}
                  </a>
                </div>
                ${item.email && item.email !== 'N/A' ? `
                  <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">ईमेल:</span>
                    <a href="mailto:${escapeHtml(item.email)}" class="font-medium text-slate-800 hover:underline">${escapeHtml(item.email)}</a>
                  </div>
                ` : ''}
                ${item.targetCustomer && item.targetCustomer !== 'N/A' ? `
                  <div class="py-1">
                    <span class="text-slate-500 block mb-0.5">लक्षित ग्राहक (Target Customers):</span>
                    <span class="font-semibold text-slate-800">${escapeHtml(item.targetCustomer.length > 100 ? item.targetCustomer.slice(0, 100) + '...' : item.targetCustomer)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
              <h4 class="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-map-pin text-rose-600"></i> स्थान एवं लिंक्स (Location & Links):
              </h4>
              <div class="space-y-1.5 pt-1">
                <div class="flex justify-between py-1 border-b border-slate-200">
                  <span class="text-slate-500">पता (Address):</span>
                  <span class="font-bold text-slate-800">${escapeHtml(item.address || 'Dantewada')}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                  <span class="text-slate-500">जिला (District):</span>
                  <span class="font-bold text-slate-800">${escapeHtml(item.district || 'Dantewada')}</span>
                </div>
                ${item.socialLinks && item.socialLinks !== 'N/A' && item.socialLinks !== 'No' ? `
                  <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">वेब / सोशल:</span>
                    <a href="${item.socialLinks.startsWith('http') ? escapeHtml(item.socialLinks) : 'https://' + escapeHtml(item.socialLinks)}" target="_blank" class="font-bold text-blue-700 hover:underline flex items-center gap-1">
                      <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> विजिट करें
                    </a>
                  </div>
                ` : ''}
                ${driveLinks.length > 0 ? `
                  <div class="py-1">
                    <span class="text-slate-500 block mb-1">बिजनेस प्लान / अटैचमेंट्स:</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${driveLinks.map((link, lIdx) => `
                        <a href="${escapeHtml(link)}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold transition inline-flex items-center gap-1 border border-emerald-300 shadow-2xs">
                          <i class="fa-brands fa-google-drive text-emerald-700"></i> प्लान दस्तावेज़ #${lIdx + 1}
                        </a>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-200">
            <div class="text-[11px] text-slate-400">
              दंतेवाड़ा युवा स्टार्टअप एवं नवाचार मिशन 2026
            </div>
            <div class="flex items-center gap-2">
              ${item.mobile && item.mobile !== 'N/A' ? `
                <a href="https://wa.me/91${item.mobile.replace(/\D/g, '')}" target="_blank" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5">
                  <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                </a>
                <a href="tel:${item.mobile}" class="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5">
                  <i class="fa-solid fa-phone text-xs"></i> Call
                </a>
              ` : ''}
              <button onclick="window.closeYouthDossierModal()" class="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      return;
    }

    // Special View for VO / CLF Meetings
    if (sheetKey === 'Meetings_VO_CLF_TRIF' || item.orgName || item.voClfName) {
      const voClfName = item.voClfName || item.orgName || 'VO / CLF Meeting';
      const village = item.village || item.gp || 'Dantewada';
      const block = item.block || 'Dantewada';
      const date = item.date || 'N/A';
      const adhayakshSachiv = item.adhayakshSachiv || item.chairedBy || 'N/A';
      const discussPoint = item.discussPoint || item.agenda || 'Livelihood & Mobilization Review';
      const remarks = item.remarks || item.decisions || 'Action Plan Finalized';
      const photo = item.photo || item.photoUrl || '';

      content.innerHTML = `
        <div class="p-6 sm:p-8 space-y-6">
          <div class="flex items-start justify-between border-b border-slate-200 pb-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-black flex items-center justify-center text-xl shadow-lg border border-purple-500/40">
                <i class="fa-solid fa-users-rectangle text-2xl"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="badge-status badge-block font-bold">${escapeHtml(block)}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                    VO / CLF बैठक
                  </span>
                  <span class="text-xs text-slate-400 font-mono">Sr: #${item.id || index + 1}</span>
                </div>
                <h2 class="text-2xl font-black text-slate-900">${escapeHtml(voClfName)}</h2>
                <p class="text-xs text-slate-500">
                  ग्राम: <strong class="text-slate-800">${escapeHtml(village)}</strong> 
                  | ब्लॉक: <strong class="text-slate-800">${escapeHtml(block)}</strong> 
                  | दिनांक: <strong class="text-slate-800">${escapeHtml(date)}</strong>
                </p>
              </div>
            </div>
            <button onclick="window.closeYouthDossierModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <!-- 4 Core Meeting Attributes -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
            <div>
              <div class="text-[10px] text-purple-800 uppercase font-bold">1. दिनांक (Date)</div>
              <div class="font-black text-purple-950 text-sm mt-0.5">${escapeHtml(date)}</div>
            </div>
            <div>
              <div class="text-[10px] text-purple-800 uppercase font-bold">2. ग्राम (Village)</div>
              <div class="font-bold text-slate-800 text-sm mt-0.5">${escapeHtml(village)}</div>
            </div>
            <div>
              <div class="text-[10px] text-purple-800 uppercase font-bold">3. ब्लॉक (Block)</div>
              <div class="font-bold text-slate-800 text-sm mt-0.5">${escapeHtml(block)}</div>
            </div>
            <div>
              <div class="text-[10px] text-purple-800 uppercase font-bold">4. अध्यक्ष / सचिव (Adhayaksh/Sachiv)</div>
              <div class="font-extrabold text-indigo-900 text-sm mt-0.5">${escapeHtml(adhayakshSachiv)}</div>
            </div>
          </div>

          <!-- Meeting Discussion & Remarks -->
          <div class="space-y-4 text-xs">
            <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <h4 class="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-comments text-purple-600"></i> 6. चर्चा के मुख्य बिंदु (Discuss Point):
              </h4>
              <p class="text-slate-700 leading-relaxed text-[13px] whitespace-pre-line">${escapeHtml(discussPoint)}</p>
            </div>

            <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-1.5">
              <h4 class="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-circle-check text-emerald-600"></i> 7. रिमार्क्स एवं निर्णय (Remarks):
              </h4>
              <p class="text-slate-700 leading-relaxed text-[13px] whitespace-pre-line">${escapeHtml(remarks)}</p>
            </div>
          </div>

          <!-- Photo Upload Section -->
          <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
            <h4 class="font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <i class="fa-solid fa-camera text-purple-600"></i> 8. बैठक फोटो (Meeting Photo):
            </h4>
            ${photo ? `
              <div class="relative group max-w-md rounded-xl overflow-hidden border border-purple-300 shadow-md">
                <img src="${escapeHtml(photo)}" alt="Meeting Photo" class="w-full h-56 object-cover cursor-pointer hover:scale-105 transition" onclick="window.previewPhotoModal('${escapeHtml(photo)}')">
                <div class="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <i class="fa-solid fa-expand"></i> बड़ा करके देखें
                </div>
              </div>
            ` : `
              <div class="p-6 rounded-xl border border-dashed border-slate-300 text-center bg-white/70">
                <i class="fa-regular fa-image text-slate-300 text-3xl mb-1 block"></i>
                <span class="text-xs text-slate-400 font-medium">कोई फोटो संलग्न नहीं है (No Photo Attached)</span>
              </div>
            `}
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-200">
            <div class="text-[11px] text-slate-400">
              दंतेवाड़ा युवा विकास मिशन — VO, CLF बैठक विवरण
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-solid fa-print text-xs"></i> प्रिंट कार्यवाही
              </button>
              <button onclick="window.closeYouthDossierModal()" class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition">
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      return;
    }

    const maskedAadhar = item.aadhar 
      ? (typeof window.DantewadaDB.maskAadhaar === 'function' ? window.DantewadaDB.maskAadhaar(item.aadhar) : item.aadhar)
      : 'XXXXXXXX7890';

    const trade = item.training || item.remark || 'Skill Training';

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-900 text-white font-extrabold flex items-center justify-center text-xl shadow-lg border border-indigo-500/40">
              ${(item.name || 'Y').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="badge-status badge-block font-bold">${item.block || 'Dantewada'}</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">${trade}</span>
                <span class="badge-status badge-published font-semibold">Registered (पंजीकृत)</span>
                <span class="text-xs text-slate-400 font-mono">Sr: #${index + 1}</span>
              </div>
              <h2 class="text-2xl font-black text-slate-900">${item.name || 'N/A'}</h2>
              <p class="text-xs text-slate-500">पिता का नाम: <strong class="text-slate-700">${item.fatherName || 'N/A'}</strong> | ग्राम: <strong class="text-slate-700">${item.village || 'N/A'}</strong></p>
            </div>
          </div>
          <button onclick="window.closeYouthDossierModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">जन्म तिथि (DOB)</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.dob || 'N/A'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">लिंग / Gender</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.gender || 'Male'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">वर्ग / Category</div>
            <div class="font-bold text-slate-800 text-sm mt-0.5">${item.category || 'ST'}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">इच्छुक ट्रेड (Training Trade)</div>
            <div class="font-extrabold text-blue-900 text-sm mt-0.5">${trade}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-address-card text-blue-600"></i> पहचान एवं संपर्क (Identity & Contact)
            </h4>
            <div class="text-xs space-y-1.5 pt-1">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">मोबाइल नंबर:</span>
                <a href="tel:${item.mobile}" class="font-bold text-blue-800 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-phone text-[10px]"></i> ${item.mobile || 'N/A'}
                </a>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">आधार संख्या (Masked):</span>
                <span class="font-mono font-bold text-slate-800 flex items-center gap-1">
                  <i class="fa-solid fa-shield-halved text-emerald-600 text-[10px]"></i> ${maskedAadhar}
                </span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">पंजीकरण मॉड्यूल:</span>
                <span class="font-medium text-slate-700">${cfg.titleEn}</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-location-dot text-rose-600"></i> भौगोलिक स्थान (Location Details)
            </h4>
            <div class="text-xs space-y-1.5 pt-1">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">ग्राम (Village):</span>
                <span class="font-bold text-slate-800">${item.village || 'N/A'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">विकासखंड (Block):</span>
                <span class="font-bold text-slate-800">${item.block || 'Dantewada'}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500">जिला (District):</span>
                <span class="font-medium text-slate-700">दक्षिण बस्तर दंतेवाड़ा</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-200">
          <div class="text-[11px] text-slate-400">
            दंतेवाड़ा युवा विकास एवं रोजगार मिशन — बस्तर मुन्ने शिविर डेटाबेस
          </div>
          <div class="flex items-center gap-2">
            ${item.mobile && item.mobile !== 'N/A' ? `
              <a href="https://wa.me/91${item.mobile.replace(/\D/g, '')}" target="_blank" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
              </a>
              <a href="tel:${item.mobile}" class="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-solid fa-phone text-xs"></i> Call
              </a>
            ` : ''}
            <button onclick="window.closeYouthDossierModal()" class="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
              बंद करें (Close)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.deleteSheetRow = async function (sheetKey, index) {
    if (!confirm('क्या आप निश्चित हैं कि यह रिकॉर्ड हटाना चाहते हैं? यह Google Sheet से भी डिलीट हो जाएगा।')) return;
    const cfg = SHEET_CONFIGS[sheetKey];
    let rowToDelete = null;
    if (cfg && window.DantewadaDB.data[cfg.collection]) {
      rowToDelete = window.DantewadaDB.data[cfg.collection][index];
      window.DantewadaDB.data[cfg.collection].splice(index, 1);
      window.DantewadaDB.persist();
      renderSheetTable();
    }

    // Cloud backend delete
    if (typeof API !== 'undefined' && API.call) {
      const idVal = rowToDelete ? (rowToDelete.name || rowToDelete.NAME || rowToDelete.founderName || rowToDelete.startupName || rowToDelete.title || rowToDelete.Candidate_Name || rowToDelete.id || rowToDelete['SR. NO.'] || rowToDelete.sNo || '') : '';
      try {
        const res = await API.call('deleteRecord', {
          sheetName: getCloudSheetName(sheetKey),
          rowIndex: index,
          idValue: idVal,
          rowData: rowToDelete
        });
        console.log('Cloud deleteRecord result:', res);
        if (res && res.success) {
          alert(`✅ सफलतापूर्वक Google Sheet से भी '${idVal || 'रिकॉर्ड'}' हटा दिया गया!`);
        } else if (res && !res.success) {
          if ((res.message || '').toLowerCase().includes('no data rows')) {
            alert(`ℹ️ सूचना: आपकी Google Sheet में इस शीट के अंदर कोई डेटा पंक्ति नहीं मिली (शीट पहले से खाली है)। रिकॉर्ड पोर्टल से हटा दिया गया है।`);
          } else if ((res.message || '').includes('Unknown action')) {
            alert(`⚠️ चेतावनी: Google Apps Script में Code.gs का नया कोड Deploy नहीं किया गया है।`);
          } else {
            alert(`ℹ️ Google Sheet सूचना: ${res.message}`);
          }
        }
      } catch (err) {
        console.warn('Cloud deleteRecord failed:', err);
      }
    }
  };

  window.editSheetRow = function (sheetKey, index) {
    const cfg = SHEET_CONFIGS[sheetKey];
    if (!cfg) return;

    window.openAddSheetRecordModal();

    const titleEl = document.getElementById('sheetRecordModalTitle');
    const subtitleEl = document.getElementById('sheetRecordModalSubtitle');
    const form = document.getElementById('sheetRecordForm');

    if (titleEl) titleEl.textContent = `✎ ${cfg.titleEn} रिकॉर्ड संपादित करें`;
    if (subtitleEl) subtitleEl.textContent = `${cfg.titleHi} — विवरण अपडेट करें`;
    if (form) form.setAttribute('data-edit-index', index);

    // Populate existing values
    const list = window.DantewadaDB.getSheetData(sheetKey) || [];
    const item = list[index];
    if (item && form) {
      cfg.params.forEach((param) => {
        const input = form.querySelector(`[name="${param}"]`);
        if (input) {
          let val = item[param];
          if (val === undefined) {
            const cleanP = param.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const [k, v] of Object.entries(item)) {
              if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanP) {
                val = v;
                break;
              }
            }
          }
          if (val !== undefined && val !== null) {
            input.value = val;
          }
        }
      });
    }
  };

  window.openAddSheetRecordModal = function () {
    const cfg = SHEET_CONFIGS[currentActiveSheet] || SHEET_CONFIGS['Employment_Registration'];
    const titleEl = document.getElementById('sheetRecordModalTitle');
    const subtitleEl = document.getElementById('sheetRecordModalSubtitle');
    const fieldsContainer = document.getElementById('sheetRecordFormFields');
    const form = document.getElementById('sheetRecordForm');
    if (form) {
      form.reset();
      form.removeAttribute('data-edit-index');
    }

    if (titleEl) titleEl.textContent = `+ ${cfg.titleEn} में नया रिकॉर्ड जोड़ें`;
    if (subtitleEl) subtitleEl.textContent = `${cfg.titleHi} — सभी आवश्यक विवरण दर्ज करें`;

    if (fieldsContainer) {
      // Exclude serial number from form inputs
      const editableParams = cfg.params.filter(p => !p.toLowerCase().includes('unnamed') && !p.toLowerCase().includes('sr'));
      fieldsContainer.innerHTML = editableParams.map(param => {
        let inputType = 'text';
        let placeholder = `दर्ज करें (${param})`;
        if (param.toLowerCase().includes('mobile') || param.toLowerCase().includes('phone')) {
          inputType = 'tel';
          placeholder = '10 अंकों का मोबाइल नंबर';
        } else if (param.toLowerCase().includes('email')) {
          inputType = 'email';
          placeholder = 'ईमेल पता...';
        } else if (param.toLowerCase().includes('date') || param.toLowerCase().includes('dob')) {
          inputType = 'date';
        }

        if (param.toLowerCase().includes('photo') || param.toLowerCase().includes('doc') || param.toLowerCase().includes('file') || param.toLowerCase().includes('pdf')) {
          return `
            <div class="col-span-full">
              <label class="block font-bold text-slate-700 mb-1">${param} (फोटो अथवा PDF दस्तावेज अपलोड / URL)</label>
              <div class="flex flex-col sm:flex-row items-center gap-3 p-3 bg-purple-50/50 border-2 border-dashed border-purple-200 rounded-xl">
                <div id="photoRecordPreviewBox" class="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
                  <i class="fa-solid fa-file-arrow-up text-xl text-purple-600"></i>
                </div>
                <div class="flex-1 w-full space-y-1.5">
                  <input type="file" accept="image/*,application/pdf,.pdf" id="sheetRecordPhotoFileInput" onchange="window.handleSheetRecordPhotoSelected(this)" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer">
                  <input type="text" name="${param}" id="sheetRecordPhotoValue" placeholder="या इमेज/PDF URL अथवा Base64 यहाँ दर्ज करें..." class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                </div>
              </div>
            </div>
          `;
        }

        return `
          <div>
            <label class="block font-bold text-slate-700 mb-1">${param}</label>
            <input type="${inputType}" name="${param}" placeholder="${placeholder}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium text-slate-800">
          </div>
        `;
      }).join('');
    }

    const modal = document.getElementById('sheetRecordModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.handleSheetRecordPhotoSelected = function(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        const valInput = document.getElementById('sheetRecordPhotoValue');
        if (valInput) valInput.value = base64;
        const box = document.getElementById('photoRecordPreviewBox');
        if (box) {
          if (isPdf) {
            box.innerHTML = `
              <div class="flex flex-col items-center justify-center p-1 text-red-600">
                <i class="fa-solid fa-file-pdf text-2xl"></i>
                <span class="text-[8px] font-bold mt-0.5">PDF</span>
              </div>
            `;
          } else {
            box.innerHTML = `<img src="${base64}" class="w-full h-full object-cover rounded-lg" alt="Preview">`;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  window.previewPhotoModal = function(src) {
    let modal = document.getElementById('meetingPhotoPreviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'meetingPhotoPreviewModal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs';
      modal.onclick = () => modal.remove();
      modal.innerHTML = `
        <div class="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/20" onclick="event.stopPropagation()">
          <button onclick="document.getElementById('meetingPhotoPreviewModal').remove()" class="absolute top-4 right-4 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <img id="meetingPhotoPreviewImg" src="${escapeHtml(src)}" class="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" alt="Preview">
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      const img = document.getElementById('meetingPhotoPreviewImg');
      if (img) img.src = src;
      modal.classList.remove('hidden');
    }
  };

  window.closeSheetRecordModal = function () {
    const modal = document.getElementById('sheetRecordModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    const form = document.getElementById('sheetRecordForm');
    if (form) {
      form.removeAttribute('data-edit-index');
    }
  };

  window.saveSheetRecord = async function (e) {
    e.preventDefault();
    const cfg = SHEET_CONFIGS[currentActiveSheet];
    if (!cfg) return;

    const form = document.getElementById('sheetRecordForm');
    if (!form) return;

    const formData = {};
    new FormData(form).forEach((val, key) => {
      formData[key] = val;
    });

    const editIndex = form.getAttribute('data-edit-index');

    if (editIndex !== null && editIndex !== undefined && editIndex !== '') {
      // UPDATE mode
      const idx = parseInt(editIndex, 10);
      const collection = cfg.collection;
      if (window.DantewadaDB.data[collection] && window.DantewadaDB.data[collection][idx]) {
        Object.assign(window.DantewadaDB.data[collection][idx], formData);
        window.DantewadaDB.persist();
      }
      form.removeAttribute('data-edit-index');
      window.closeSheetRecordModal();
      renderSheetTable();

      // Cloud backend update
      if (typeof API !== 'undefined' && API.call) {
        API.call('updateRecord', {
          sheetName: getCloudSheetName(currentActiveSheet),
          rowIndex: idx,
          updatedData: prepareSingleRecordForCloud(currentActiveSheet, formData)
        }).then(res => {
          console.log('Cloud update result:', res);
        }).catch(err => {
          console.warn('Cloud update failed:', err);
        });
      }
      alert(`सफलतापूर्वक ${cfg.titleEn} में रिकॉर्ड अपडेट कर दिया गया!`);
      return;
    }

    // CREATE mode
    if (typeof cfg.saveRecord === 'function') {
      cfg.saveRecord(formData);
    }
    window.closeSheetRecordModal();
    renderSheetTable();

    // Cloud backend create
    if (typeof API !== 'undefined' && API.call) {
      API.call('addRecord', {
        sheetName: getCloudSheetName(currentActiveSheet),
        data: prepareSingleRecordForCloud(currentActiveSheet, formData)
      }).then(res => {
        console.log('Cloud addRecord result:', res);
      }).catch(err => {
        console.warn('Cloud addRecord failed:', err);
      });
    }

    alert(`सफलतापूर्वक ${cfg.titleEn} में नया रिकॉर्ड जोड़ दिया गया!`);
  };

  window.exportActiveSheetExcel = function () {
    const cfg = SHEET_CONFIGS[currentActiveSheet] || SHEET_CONFIGS['Employment_Registration'];
    if (typeof XLSX === 'undefined') {
      alert('XLSX Library लोड हो रही है...');
      return;
    }

    const searchInput = document.getElementById('sheetSearchInput');
    const blockSelect = document.getElementById('sheetBlockFilter');
    const options = {
      search: searchInput ? searchInput.value : '',
      block: blockSelect ? blockSelect.value : 'All'
    };

    const rawRecords = window.DantewadaDB.getSheetData(currentActiveSheet, options);
    const rows = rawRecords.map((item, idx) => cfg.mapRow(item, idx));

    const ws = XLSX.utils.aoa_to_sheet([cfg.params, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentActiveSheet.slice(0, 31));
    XLSX.writeFile(wb, `${currentActiveSheet}_dantewada_portal.xlsx`);
  };

  // =============================================================
  // BULK UPLOAD CONTROLLER & PARSER (CSV / Excel Format Integration)
  // =============================================================
  let currentBulkSheet = 'Employment_Registration';
  let currentBulkMode = 'file';
  let currentBulkPreview = null;

  window.openBulkUploadModal = function (targetSheet) {
    currentBulkSheet = targetSheet || currentActiveSheet || 'Employment_Registration';
    if (currentBulkSheet === 'Startup_District_Ideas') currentBulkSheet = 'Entrepreneur_Identified';

    // Populate sheet select dropdown with all available sheets
    const selectEl = document.getElementById('bulkUploadSheetSelect');
    if (selectEl) {
      selectEl.innerHTML = Object.keys(SHEET_CONFIGS).filter(k => k !== 'Startup_District_Ideas' && k !== 'Bastar_Munne_Report').map(k => {
        const item = SHEET_CONFIGS[k];
        return `<option value="${k}" ${k === currentBulkSheet ? 'selected' : ''}>${item.titleEn} — ${item.titleHi}</option>`;
      }).join('');
    }

    window.updateBulkFormatDisplay();
    window.switchBulkUploadMode('file');

    // Reset preview
    const previewContainer = document.getElementById('bulkPreviewContainer');
    if (previewContainer) previewContainer.classList.add('hidden');
    const commitBtn = document.getElementById('bulkCommitBtn');
    if (commitBtn) commitBtn.disabled = true;
    const commitText = document.getElementById('bulkCommitBtnText');
    if (commitText) commitText.textContent = 'डेटाबेस में आयात करें (Import 0 Records)';

    const modal = document.getElementById('bulkUploadModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    initBulkUploadDropzone();
  };

  window.closeBulkUploadModal = function () {
    const modal = document.getElementById('bulkUploadModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.switchBulkUploadMode = function (mode) {
    currentBulkMode = mode;
    const fileSec = document.getElementById('bulkModeFileSection');
    const pasteSec = document.getElementById('bulkModePasteSection');
    const btnFile = document.getElementById('bulkTabBtnFile');
    const btnPaste = document.getElementById('bulkTabBtnPaste');

    if (mode === 'file') {
      if (fileSec) fileSec.classList.remove('hidden');
      if (pasteSec) pasteSec.classList.add('hidden');
      if (btnFile) {
        btnFile.className = 'px-3.5 py-1.5 rounded-xl font-bold bg-blue-900 text-white shadow-xs';
      }
      if (btnPaste) {
        btnPaste.className = 'px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
      }
    } else {
      if (fileSec) fileSec.classList.add('hidden');
      if (pasteSec) pasteSec.classList.remove('hidden');
      if (btnFile) {
        btnFile.className = 'px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
      }
      if (btnPaste) {
        btnPaste.className = 'px-3.5 py-1.5 rounded-xl font-bold bg-blue-900 text-white shadow-xs';
      }
    }
  };

  window.updateBulkFormatDisplay = function () {
    const selectEl = document.getElementById('bulkUploadSheetSelect');
    if (selectEl) currentBulkSheet = selectEl.value;

    const cfg = SHEET_CONFIGS[currentBulkSheet] || SHEET_CONFIGS['Employment_Registration'];
    const subtitleEl = document.getElementById('bulkModalSheetSubtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `चयनित शीट: ${cfg.titleEn} (${cfg.titleHi}) | अपेक्षित फील्ड्स`;
    }

    const headers = SHEET_COLUMNS_SPEC[currentBulkSheet] || cfg.params.filter(p => !p.toLowerCase().includes('unnamed') && !p.toLowerCase().includes('sr'));
    const countEl = document.getElementById('bulkUploadColCount');
    if (countEl) countEl.textContent = `${headers.length} Columns`;

    const headersContainer = document.getElementById('bulkUploadFormatHeaders');
    if (headersContainer) {
      headersContainer.innerHTML = headers.map((h, i) => `
        <span class="px-2 py-0.5 bg-white text-blue-900 border border-blue-200 rounded-md font-mono text-[11px] shadow-2xs">
          #${i+1} <strong>${h}</strong>
        </span>
      `).join('');
    }
  };

  function getSheetSampleRows(sheetKey, headers) {
    const row1 = headers.map(h => {
      const lower = h.toLowerCase();
      if (lower.includes('name') && lower.includes('first')) return 'Manisha';
      if (lower.includes('name') && lower.includes('last')) return 'Yadav';
      if (lower.includes('father') || lower.includes('faather')) return 'Girdhar';
      if (lower.includes('mother')) return 'Kamla Devi';
      if (lower.includes('gram') || lower.includes('gp') || lower.includes('village')) return 'HIRANAR';
      if (lower.includes('block')) return 'Geedam';
      if (lower.includes('mobile') || lower.includes('phone')) return '9754000000';
      if (lower.includes('gender')) return 'Female';
      if (lower.includes('cat') || lower.includes('cast')) return 'OBC';
      if (lower.includes('qual') || lower.includes('edu')) return 'Graduate';
      if (lower.includes('occup')) return 'Unemployed';
      if (lower.includes('career')) return 'Direct Formal Jobs';
      if (lower.includes('amount')) return '50000';
      if (lower.includes('buss') || lower.includes('bus')) return 'Kirana Store';
      if (lower.includes('org')) return 'SBI Mitra';
      if (lower.includes('salary')) return '12000';
      if (lower.includes('institute')) return 'Livelihood College';
      if (lower.includes('training')) return 'Computer Operator';
      if (lower.includes('yojna') || lower.includes('scheme')) return 'PMEGP';
      if (lower.includes('percent')) return '65%';
      if (lower.includes('age')) return '22';
      if (lower.includes('dob')) return '2002-05-14';
      if (lower.includes('date')) return '2026-03-01';
      if (lower.includes('clf') || lower.includes('vo')) return 'Prerna Mahila Gram Sangathan';
      if (lower.includes('adhayaksh') || lower.includes('sachiv')) return 'Smt. Jamuna Bai (Adhayaksh)';
      if (lower.includes('discuss')) return 'SHG youth mobilization for skill training & credit linkage';
      if (lower.includes('remark')) return 'Resolution passed unanimously';
      if (lower.includes('photo')) return 'https://images.unsplash.com/photo-1577495508048-b635879837f1';
      if (lower.includes('aadhar')) return '987654321012';
      if (lower.includes('sr')) return '1';
      return 'Dantewada';
    });

    const row2 = headers.map(h => {
      const lower = h.toLowerCase();
      if (lower.includes('name') && lower.includes('first')) return 'Naresh';
      if (lower.includes('name') && lower.includes('last')) return 'Thakur';
      if (lower.includes('father') || lower.includes('faather')) return 'Madhusudhan';
      if (lower.includes('mother')) return 'Shanti Devi';
      if (lower.includes('gram') || lower.includes('gp') || lower.includes('village')) return 'RONJE';
      if (lower.includes('block')) return 'Geedam';
      if (lower.includes('mobile') || lower.includes('phone')) return '9771000000';
      if (lower.includes('gender')) return 'Male';
      if (lower.includes('cat') || lower.includes('cast')) return 'ST';
      if (lower.includes('qual') || lower.includes('edu')) return '12th Pass';
      if (lower.includes('occup')) return 'Unemployed';
      if (lower.includes('career')) return 'Direct Formal Jobs';
      if (lower.includes('amount')) return '100000';
      if (lower.includes('buss') || lower.includes('bus')) return 'Dairy Farming';
      if (lower.includes('org')) return 'Danexx Factory';
      if (lower.includes('salary')) return '15000';
      if (lower.includes('institute')) return 'District Livelihood College';
      if (lower.includes('training')) return 'Electrician';
      if (lower.includes('yojna') || lower.includes('scheme')) return 'PMFME';
      if (lower.includes('percent')) return '72%';
      if (lower.includes('age')) return '24';
      if (lower.includes('dob')) return '2001-08-20';
      if (lower.includes('date')) return '2026-03-05';
      if (lower.includes('clf') || lower.includes('vo')) return 'Ujala Sankul Sangathan (CLF)';
      if (lower.includes('adhayaksh') || lower.includes('sachiv')) return 'Smt. Devki Netam (Sachiv)';
      if (lower.includes('discuss')) return 'Youth Hub entrepreneurship support & PMEGP linkage';
      if (lower.includes('remark')) return 'Action plan finalized for 20 candidates';
      if (lower.includes('photo')) return 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca';
      if (lower.includes('aadhar')) return '987654321099';
      if (lower.includes('sr')) return '2';
      return 'Geedam';
    });

    return [row1, row2];
  }

  window.downloadSheetExcelTemplate = function () {
    const selectEl = document.getElementById('bulkUploadSheetSelect');
    const sheetKey = selectEl ? selectEl.value : currentBulkSheet;
    const cfg = SHEET_CONFIGS[sheetKey] || SHEET_CONFIGS['Employment_Registration'];
    const headers = SHEET_COLUMNS_SPEC[sheetKey] || cfg.params;

    if (typeof XLSX === 'undefined') {
      alert('XLSX Library लोड हो रही है, कृपया पुनः प्रयास करें।');
      return;
    }

    const [row1, row2] = getSheetSampleRows(sheetKey, headers);
    const wsData = [headers, row1, row2];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply readable column widths
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 16) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetKey.slice(0, 31));
    XLSX.writeFile(wb, `${sheetKey}_template.xlsx`);
  };

  window.downloadMasterExcelTemplate = function () {
    if (typeof XLSX === 'undefined') {
      alert('XLSX Library लोड हो रही है, कृपया पुनः प्रयास करें।');
      return;
    }

    const wb = XLSX.utils.book_new();
    const sheetKeys = Object.keys(SHEET_CONFIGS).filter(k => k !== 'Startup_District_Ideas' && k !== 'Bastar_Munne_Report');

    sheetKeys.forEach(sheetKey => {
      const cfg = SHEET_CONFIGS[sheetKey];
      const headers = SHEET_COLUMNS_SPEC[sheetKey] || cfg.params;
      const [row1, row2] = getSheetSampleRows(sheetKey, headers);
      const wsData = [headers, row1, row2];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 16) }));
      XLSX.utils.book_append_sheet(wb, ws, sheetKey.slice(0, 31));
    });

    XLSX.writeFile(wb, 'dantewada_master_database_template.xlsx');
  };

  window.downloadSheetCsvTemplate = window.downloadSheetExcelTemplate;

  window.clearBulkPasteText = function () {
    const textarea = document.getElementById('bulkPasteTextarea');
    if (textarea) textarea.value = '';
    const previewContainer = document.getElementById('bulkPreviewContainer');
    if (previewContainer) previewContainer.classList.add('hidden');
    const commitBtn = document.getElementById('bulkCommitBtn');
    if (commitBtn) commitBtn.disabled = true;
  };

  function parseCSVRowsToObjects(csvText, targetSheet) {
    if (!csvText || !csvText.trim()) return [];

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    let startLine = 0;

    // Detect section markers if pasted text is multi-section
    const sectionKeywords = {
      Employment_Registration: ['first name', 'aspired career', 'grampanchayat'],
      Employed: ['organisation', 'date of joining', 'salary'],
      Skill_Linked: ['skill training', 'institute', 'village'],
      Education_Linked: ['faather name', 'mother name', 'email'],
      Entrepreneur_Identified: ['startup / idea name', 'founder name', 'investment needed', 'business model'],
      PMEGP_PMFME_Loan: ['loan amount', 'yojna', 'bussiness'],
      Rang_De_Loan: ['rang de', '2nd (₹)', 'activity'],
      IIM_Candidate_List: ['candidate list iim raipur', 'education,percent', 'cast,gp', 'mobile no, '],
      Training_Conducted: ['training', 'institute', 'address'],
      MY_Bharat_Registration: ['my bharat', 'current occupation,remark'],
      Youth_Hub_Trainings: ['youths attended trainings', 'dob,gender,mobile no.,remark'],
      Bastar_Munne_Shivir: ['bastar munne', 'aadhar,category,remark'],
      Meetings_VO_CLF_TRIF: ['vo / clf name', 'adhayaksh sachiv', 'discuss point', 'remarks', 'photo'],
      M_Form: ['m-form', 'm form', 'aspired career', 'highest qualification', 'grampanchayat']
    };

    const keywords = sectionKeywords[targetSheet] || [];
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      const match = keywords.some(k => lineLower.includes(k));
      if (match) {
        startLine = i;
        break;
      }
    }

    // Tokenizer supporting both Excel copy-paste (Tabs) and CSV (Commas with quotes)
    function tokenizeCSV(line) {
      if (line.includes('\t')) {
        return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
      }
      const tokens = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          tokens.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      tokens.push(current.trim());
      return tokens;
    }

    let headerTokens = tokenizeCSV(lines[startLine]);
    // If header has empty first token (e.g. ,First Name,... or ,NAME,...), name it SR. NO.
    if (headerTokens[0] === '' && headerTokens.length > 1) {
      headerTokens[0] = 'SR. NO.';
    }

    const objects = [];
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.replace(/,/g, '').trim();
      if (!trimmed) continue;

      // Check if we hit the next section in a multi-section export
      const lineLower = line.toLowerCase();
      const isNextSection = Object.keys(sectionKeywords).some(k => {
        if (k === targetSheet) return false;
        return sectionKeywords[k].some(kw => lineLower.includes(kw));
      });
      if (isNextSection && objects.length > 0) {
        break;
      }

      const values = tokenizeCSV(line);
      const rowObj = {};
      headerTokens.forEach((header, idx) => {
        if (header) {
          rowObj[header] = values[idx] !== undefined ? values[idx] : '';
        }
      });

      if (Object.values(rowObj).some(v => v !== '')) {
        objects.push(rowObj);
      }
    }

    return objects;
  }

  window.parseBulkPasteData = function () {
    const textarea = document.getElementById('bulkPasteTextarea');
    if (!textarea || !textarea.value.trim()) {
      alert('कृपया CSV या टेक्स्ट डेटा पेस्ट करें।');
      return;
    }

    const selectEl = document.getElementById('bulkUploadSheetSelect');
    const sheetKey = selectEl ? selectEl.value : currentBulkSheet;
    const rawObjects = parseCSVRowsToObjects(textarea.value, sheetKey);

    if (rawObjects.length === 0) {
      alert('कोई डेटा पंक्ति नहीं मिली। कृपया कॉलम हेडर्स एवं डेटा चेक करें।');
      return;
    }

    displayBulkPreview(rawObjects, sheetKey, 'Pasted CSV Data');
  };

  function initBulkUploadDropzone() {
    const dropzone = document.getElementById('bulkDropzone');
    const fileInput = document.getElementById('bulkFileInput');
    if (!dropzone || !fileInput) return;

    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('border-emerald-600', 'bg-emerald-50/40');
    };
    dropzone.ondragleave = () => {
      dropzone.classList.remove('border-emerald-600', 'bg-emerald-50/40');
    };
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-emerald-600', 'bg-emerald-50/40');
      if (e.dataTransfer.files.length > 0) {
        handleBulkUploadFile(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = (e) => {
      if (e.target.files.length > 0) {
        handleBulkUploadFile(e.target.files[0]);
      }
    };
  }

  function handleBulkUploadFile(file) {
    if (!file) return;
    const selectEl = document.getElementById('bulkUploadSheetSelect');
    const sheetKey = selectEl ? selectEl.value : currentBulkSheet;

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rawObjects = parseCSVRowsToObjects(text, sheetKey);
        displayBulkPreview(rawObjects, sheetKey, file.name);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        if (typeof XLSX === 'undefined') {
          alert('XLSX Library लोड हो रही है, कृपया पुनः प्रयास करें।');
          return;
        }
        try {
          const workbook = XLSX.read(data, { type: 'array' });
          const targetSheet = workbook.Sheets[sheetKey] || workbook.Sheets[workbook.SheetNames[0]];
          const rawAOA = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: '' });
          let headerRowIndex = 0;
          for (let r = 0; r < Math.min(rawAOA.length, 5); r++) {
            const rowVals = (rawAOA[r] || []).map(c => String(c).trim().toUpperCase());
            if (rowVals.includes('NAME') || rowVals.includes('FIRST NAME') || rowVals.includes('SR') || rowVals.includes('SR. NO.') || rowVals.some(v => v.includes('NAME') || v.includes('STARTUP') || v.includes('DATE') || v.includes('BLOCK') || v.includes('VILLAGE'))) {
              headerRowIndex = r;
              break;
            }
          }
          const rows = XLSX.utils.sheet_to_json(targetSheet, { range: headerRowIndex, defval: '' });
          displayBulkPreview(rows, sheetKey, file.name);
        } catch (err) {
          alert('Excel फ़ाइल पढ़ने में त्रुटि: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  function displayBulkPreview(rows, sheetKey, sourceName) {
    currentBulkPreview = window.DantewadaDB.previewImport(sheetKey, rows);
    const container = document.getElementById('bulkPreviewContainer');
    if (!container) return;

    container.classList.remove('hidden');

    const badge = document.getElementById('bulkParsedFileBadge');
    if (badge) badge.textContent = `${sourceName} • ${rows.length} Rows`;

    const totalEl = document.getElementById('bulkStatTotal');
    const validEl = document.getElementById('bulkStatValid');
    const dupEl = document.getElementById('bulkStatDuplicates');
    const invEl = document.getElementById('bulkStatInvalid');

    if (totalEl) totalEl.textContent = currentBulkPreview.totalCount;
    if (validEl) validEl.textContent = currentBulkPreview.validRows.length;
    if (dupEl) dupEl.textContent = currentBulkPreview.duplicateRows.length;
    if (invEl) invEl.textContent = currentBulkPreview.invalidRows.length;

    const thead = document.getElementById('bulkPreviewThead');
    const tbody = document.getElementById('bulkPreviewTbody');

    if (thead && tbody && rows.length > 0) {
      const sample = rows.slice(0, 8);
      const cols = Object.keys(sample[0] || {}).filter(c => !c.startsWith('_'));
      thead.innerHTML = `<tr>${cols.map(c => `<th class="p-2.5 text-[11px] whitespace-nowrap bg-slate-100">${c}</th>`).join('')}</tr>`;
      tbody.innerHTML = sample.map(r => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          ${cols.map(c => `<td class="p-2 text-[11px] text-slate-800 whitespace-nowrap">${r[c] || '-'}</td>`).join('')}
        </tr>
      `).join('');
    }

    const commitBtn = document.getElementById('bulkCommitBtn');
    const commitText = document.getElementById('bulkCommitBtnText');
    if (commitBtn && commitText) {
      if (currentBulkPreview.validRows.length > 0) {
        commitBtn.disabled = false;
        commitText.textContent = `डेटाबेस में आयात करें (Import ${currentBulkPreview.validRows.length} Records)`;
      } else {
        commitBtn.disabled = true;
        commitText.textContent = 'कोई मान्य रिकॉर्ड नहीं (0 Valid Records)';
      }
    }
  }

  window.commitBulkUpload = async function () {
    if (!currentBulkPreview || !currentBulkPreview.validRows || currentBulkPreview.validRows.length === 0) {
      alert('आयात करने के लिए कोई मान्य पंक्ति नहीं है।');
      return;
    }

    const selectEl = document.getElementById('bulkUploadSheetSelect');
    const sheetKey = selectEl ? selectEl.value : currentBulkSheet;
    const commitBtn = document.getElementById('bulkCommitBtn');
    const commitText = document.getElementById('bulkCommitBtnText');
    const originalText = commitText ? commitText.textContent : '';

    if (commitBtn) commitBtn.disabled = true;
    if (commitText) commitText.textContent = '⏳ Google Sheet एवं डेटाबेस में सहेजा जा रहा है...';

    // 1. Commit to Local Database first
    const result = window.DantewadaDB.commitImport(sheetKey, currentBulkPreview.validRows);
    const count = result.insertedCount ?? result.count ?? currentBulkPreview.validRows.length;

    // 2. Prepare clean records for Google Apps Script Cloud bulkInsert
    const targetCloudSheet = getCloudSheetName(sheetKey);
    const recordsToSend = prepareRecordsForCloud(sheetKey, currentBulkPreview.validRows);

    let cloudMessage = '';

    // 3. Send to Google Apps Script Backend
    if (typeof API !== 'undefined' && API.call && recordsToSend.length > 0) {
      try {
        const cloudRes = await API.call('bulkInsert', {
          sheetName: targetCloudSheet,
          records: recordsToSend
        });
        console.log('Cloud bulkInsert response:', cloudRes);
        if (cloudRes && cloudRes.success) {
          cloudMessage = ` (Google Sheet में भी ${cloudRes.insertedCount || count} पंक्तियां सफलतापूर्वक जुड़ गईं!)`;
        } else if (cloudRes && cloudRes.message) {
          cloudMessage = ` (Google Sheet सूचना: ${cloudRes.message})`;
        }
      } catch (err) {
        console.warn('Cloud bulkInsert notice:', err.message);
        cloudMessage = ` (Google Sheet सिंक चेतावनी: ${err.message})`;
      }
    }

    if (commitBtn) commitBtn.disabled = false;
    if (commitText) commitText.textContent = originalText;

    if (result && result.success) {
      window.closeBulkUploadModal();
      if (currentActiveSheet === sheetKey) {
        renderSheetTable();
      }
      renderDashboard();
      alert(`सफलतापूर्वक ${count} रिकॉर्ड्स [${sheetKey}] में आयात किए गए!${cloudMessage}`);
    } else {
      alert('डेटा आयात विफल: ' + (result ? (result.error || result.message) : 'Unknown error') + cloudMessage);
    }
  };

  // Attach search & filter listeners for Sheet Data Viewer
  function initSheetViewerEvents() {
    const searchInput = document.getElementById('sheetSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderSheetTable();
      });
    }

    const blockFilter = document.getElementById('sheetBlockFilter');
    if (blockFilter) {
      blockFilter.addEventListener('change', () => {
        renderSheetTable();
      });
    }
  }

  window.filterYouthBySpecial = function (type) {
    window.openSheetViewer(type);
  };

  window.showPerformanceView = function () {
    switchTab('dashboard');
    const dashBlock = document.getElementById('dashBlockFilter');
    if (dashBlock) {
      dashBlock.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.showBlockWiseSummary = function () {
    switchTab('reports');
    const repType = document.getElementById('reportTypeSelect');
    if (repType) {
      repType.value = 'block_summary';
      renderReports();
    }
  };

  // -------------------------------------------------------------
  // Live Google Sheet Cloud Sync Service & Diagnostics Modal
  // -------------------------------------------------------------
  window.openBackendStatusModal = function () {};
  window.closeBackendStatusModal = function () {};

  window.saveNewBackendUrl = async function () {
    const input = document.getElementById('backendModalUrlInput');
    if (!input || !input.value.trim()) {
      alert('कृपया मान्य Apps Script Web App URL दर्ज करें।');
      return;
    }
    const newUrl = input.value.trim();
    if (!newUrl.startsWith('https://script.google.com/macros/s/')) {
      alert('⚠️ अमान्य URL!\n\nApps Script URL "https://script.google.com/macros/s/..." से शुरू होना चाहिए।');
      return;
    }
    localStorage.setItem('YH_DANTEWADA_API_URL', newUrl);
    if (window.ENV) window.ENV.GOOGLE_SCRIPT_URL = newUrl;
    alert('✅ नया URL सफलतापूर्वक सुरक्षित हो गया!\n\nअब सीधे आपकी Google Sheet से सिंक किया जा रहा है...');
    await window.syncGoogleSheetData(true);
  };

  window.testBackendPing = async function () {
    const btn = document.getElementById('btnPingBackend');
    const badge = document.getElementById('backendModalStatusBadge');
    const text = document.getElementById('backendModalStatusText');
    const url = (window.ENV && window.ENV.GOOGLE_SCRIPT_URL) || localStorage.getItem('YH_DANTEWADA_API_URL') || '';

    if (btn) btn.disabled = true;
    if (text) text.textContent = 'पिंग परीक्षण हो रहा है...';

    try {
      const start = Date.now();
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=ping');
      const timeMs = Date.now() - start;
      const data = await res.json();

      if (data && data.success) {
        if (badge) {
          badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        }
        if (text) text.textContent = `Online (${timeMs}ms - 200 OK)`;
        alert(`✅ पिंग टेस्ट सफल!\n\nसर्वर स्थिति: ऑनलाइन (Online)\nरिस्पॉन्स समय: ${timeMs}ms\nमैसेज: ${data.message || 'Google Apps Script Live'}`);
      } else {
        throw new Error(data ? data.message : 'Invalid response');
      }
    } catch (err) {
      if (badge) {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
      }
      if (text) text.textContent = 'कनेक्शन विफल (Offline)';
      alert(`❌ पिंग टेस्ट विफल:\n\n${err.message}\nकृपया जांचें कि Apps Script Web App URL सही है और एक्सेस 'Anyone' पर सेट है।`);
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  window.syncGoogleSheetData = async function (showNotice = true) {
    const syncBtn = document.getElementById('cloudSyncBtn');
    const syncIcon = document.getElementById('cloudSyncIcon');
    const syncLabel = document.getElementById('cloudSyncLabel');
    const liveStatusText = document.getElementById('headerLiveStatusText');

    if (syncBtn) syncBtn.disabled = true;
    if (syncIcon) syncIcon.classList.add('fa-spin');
    if (syncLabel) syncLabel.textContent = 'सिंक हो रहा है...';
    if (liveStatusText) liveStatusText.textContent = 'सिंक जारी...';

    try {
      const res = await window.DantewadaDB.syncFromGoogleSheet();
      if (res && res.success) {
        renderDashboard();
        renderActiveTab();
        updateTopBarAlerts();
        
        if (syncLabel) syncLabel.textContent = `सिंक पूर्ण (${res.totalSynced})`;
        if (liveStatusText) liveStatusText.textContent = `Google Sheet कनेक्टेड (${res.totalSynced})`;

        if (showNotice) {
          alert(`✅ सफलता!\n\nगूगल शीट से कुल ${res.totalSynced} लाइव रिकॉर्ड्स सफलतापूर्वक सिंक हो गए हैं।\n\nडैशबोर्ड और 16 शीट्स डेटा लाइव अपडेट हो चुका है।`);
        }
      } else {
        if (syncLabel) syncLabel.textContent = 'सिंक विफल';
        if (liveStatusText) liveStatusText.textContent = 'सिंक विफल';
        if (showNotice) {
          alert('❌ गूगल शीट सिंक विफल:\n\n' + (res ? res.message : 'कृपया अपना Apps Script Web App URL चेक करें।'));
        }
      }
    } catch (err) {
      if (syncLabel) syncLabel.textContent = 'त्रुटि';
      if (liveStatusText) liveStatusText.textContent = 'कनेक्शन त्रुटि';
      if (showNotice) {
        alert('❌ कनेक्शन त्रुटि: ' + err.message);
      }
    } finally {
      if (syncBtn) syncBtn.disabled = false;
      if (syncIcon) syncIcon.classList.remove('fa-spin');
      setTimeout(() => {
        if (syncLabel && !syncLabel.textContent.includes('त्रुटि')) {
          syncLabel.textContent = 'लाइव शीट सिंक';
        }
      }, 5000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    init();
    initSheetViewerEvents();

    // Auto-sync live Google Sheet data on page load
    window.syncGoogleSheetData(false);
  });
  window.addEventListener('db:changed', () => {
    renderActiveTab();
    updateSidebarBadgeCounts();
  });
})();
