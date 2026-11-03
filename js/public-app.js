/**
 * Public Website Logic
 * Dantewada Youth Development, Employment & Success Story Portal
 * Department: District Administration / Zilla Panchayat, Dantewada
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

  const maskMobile = (typeof window !== 'undefined' && window.DantewadaUtils && window.DantewadaUtils.maskMobile) || function (mobile) {
    if (!mobile) return 'N/A';
    const clean = String(mobile).replace(/\D/g, '');
    if (clean.length < 10) return 'XXXXX-' + clean.slice(-4);
    return clean.slice(0, 2) + 'XXXX-XX' + clean.slice(-2);
  };

  const i18n = {
    hi: {
      portalTitle: 'दंतेवाड़ा युवा विकास पोर्टल',
      govSubtitle: 'जिला प्रशासन / जिला पंचायत, दंतेवाड़ा (छत्तीसगढ़)',
      home: 'होम',
      about: 'पहल के बारे में',
      analytics: 'युवा सांख्यिकी',
      successStories: 'सफलता की कहानियाँ',
      visits: 'फील्ड विजिट्स',
      trainings: 'प्रशिक्षण एवं गतिविधियाँ',
      initiatives: 'स्वरोजगार एवं उद्यमिता',
      contact: 'संपर्क',
      adminPortal: 'अधिकारी लॉगिन / डैशबोर्ड',
      heroHeading: 'दंतेवाड़ा के युवाओं का सशक्तिकरण: शिक्षा, कौशल और स्वरोजगार की नई राह',
      heroSubheading: 'दंतेवाड़ा जिले के युवाओं के रोजगार, कौशल प्रशिक्षण, उद्यमिता एवं फील्ड मॉनिटरिंग का डिजिटल सार्वजनिक मंच।',
      viewAnalyticsBtn: 'सार्वजनिक आंकड़े देखें',
      readStoriesBtn: 'सफलता की कहानियाँ पढ़ें',
      totalYouth: 'कुल पंजीकृत युवा',
      employed: 'रोजगार प्राप्त युवा',
      skillTrained: 'कौशल प्रशिक्षित',
      entrepreneurs: 'चिन्हित उद्यमी व लाभार्थी',
      fieldVisits: 'फील्ड विजिट्स',
      storiesCount: 'सफलता की कहानियाँ'
    },
    en: {
      portalTitle: 'Dantewada Youth Development Portal',
      govSubtitle: 'District Administration / Zilla Panchayat, Dantewada (C.G.)',
      home: 'Home',
      about: 'About Initiative',
      analytics: 'Youth Analytics',
      successStories: 'Success Gallery',
      visits: 'Field Visits',
      trainings: 'Trainings & Activities',
      initiatives: 'Self-Employment & Schemes',
      contact: 'Contact',
      adminPortal: 'Officer Login / Dashboard',
      heroHeading: 'Empowering Dantewada Youth: Pathways to Skills, Employment & Enterprise',
      heroSubheading: 'A unified digital monitoring portal tracking youth development, vocational trainings, field visits, and inspiring success stories of South Bastar.',
      viewAnalyticsBtn: 'View Public Analytics',
      readStoriesBtn: 'Read Success Stories',
      totalYouth: 'Registered Youth',
      employed: 'Employed Youth',
      skillTrained: 'Skill Trained',
      entrepreneurs: 'Entrepreneurs & Beneficiaries',
      fieldVisits: 'Field Visits',
      storiesCount: 'Success Stories'
    }
  };

  let currentLang = 'hi';

  function init() {
    setupLanguageToggle();
    setupMobileMenu();
    setupModalBackdrops();
    // Public pages must never show browser-cached/demo rows. Clear display
    // collections in memory and repopulate them from the live Apps Script sync.
    clearPublicDataUntilLiveSync();
    renderPublicKPIs();
    renderPublicCharts();
    renderPublicStories();
    renderPublicStartups();
    renderPublicVisits();
    renderPublicTrainings();
    renderPublicInitiatives();
    setupSmoothNav();

    // Bind public startup search input
    const searchInput = document.getElementById('publicStartupSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderPublicStartups(currentStartupDistrict, e.target.value);
      });
    }

    // Always sync on page load so the public portal reflects the current sheet.
    if (window.DantewadaDB && typeof window.DantewadaDB.syncFromGoogleSheet === 'function') {
      window.DantewadaDB.syncFromGoogleSheet().then(result => {
        if (!result || !result.success) {
          const status = document.getElementById('publicDataSyncStatus');
          renderPublicKPIs();
          if (status) status.textContent = 'Backend data unavailable';
        }
      }).catch(error => {
        console.error('Live Google Sheets sync failed; public data remains empty:', error);
        renderPublicKPIs();
        renderPublicCharts();
        renderPublicStories();
        renderPublicStartups();
        renderPublicVisits();
        renderPublicTrainings();
        const status = document.getElementById('publicDataSyncStatus');
        if (status) status.textContent = 'Backend data unavailable';
      });
    }
  }

  function clearPublicDataUntilLiveSync() {
    const db = window.DantewadaDB;
    if (!db || !db.data) return;
    [
      'youth', 'placed', 'skills', 'counselling', 'navgurukul', 'loans', 'iimRaipur',
      'iimSurvey', 'myBharat', 'mFormRecords', 'youthHubTrainings', 'bastarShivir', 'trainingConducted',
      'entrepreneursIdentified', 'entrepreneurIdeas', 'startupIdeas', 'meetingsVoClfTrif',
      'rangDe', 'fieldVisits', 'successStories'
    ].forEach(key => { if (Array.isArray(db.data[key])) db.data[key] = []; });
    if (db.data.metadata) delete db.data.metadata.lastCloudSync;
  }

  function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobileNavToggleBtn');
    const menu = document.getElementById('mobileNavMenu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = menu.classList.contains('hidden') ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
        }
      });

      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.add('hidden');
          const icon = toggleBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        });
      });

      document.addEventListener('click', (e) => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
          menu.classList.add('hidden');
          const icon = toggleBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        }
      });
    }
  }

  function setupModalBackdrops() {
    ['storyModal', 'visitModal', 'startupModal'].forEach(id => {
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
        if (typeof window.closeStoryModal === 'function') window.closeStoryModal();
        if (typeof window.closeVisitModal === 'function') window.closeVisitModal();
        if (typeof window.closeStartupModal === 'function') window.closeStartupModal();
      }
    });
  }

  function setupLanguageToggle() {
    const btn = document.getElementById('langToggleBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        currentLang = currentLang === 'hi' ? 'en' : 'hi';
        btn.textContent = currentLang === 'hi' ? 'English' : 'हिन्दी';
        applyLanguage(currentLang);
      });
    }
  }

  function applyLanguage(lang) {
    const texts = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (texts[key]) {
        el.textContent = texts[key];
      }
    });
  }

  function renderPublicKPIs() {
    if (!window.DantewadaDB) return;
    const liveDataReady = Boolean(window.DantewadaDB.data.metadata && window.DantewadaDB.data.metadata.lastCloudSync);
    const kpis = window.DantewadaDB.getKPIs();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = liveDataReady ? Number(val || 0).toLocaleString('en-IN') : '—';
    };

    setVal('pub-kpi-total', kpis.totalYouth);
    setVal('pub-kpi-employed', kpis.employedYouth);
    setVal('pub-kpi-skills', kpis.skillTrainedYouth);
    setVal('pub-kpi-loans', kpis.identifiedEntrepreneurs);
    setVal('pub-kpi-visits', kpis.fieldVisitsCount);
    setVal('pub-kpi-stories', kpis.successStoriesCount);

    const modules = [
      ['Employment Registration', ['Employment_Registration', 'Employment_Registered']],
      ['Employed Youth', ['Employed', 'Employment_Linked']],
      ['Skill Linked', ['Skill_Linked', 'Skill_Training']],
      ['Education Linked', ['Education_Linked', 'Education']],
      ['Counselling', ['Counselling']], ['IIM Raipur List', ['IIM_Candidate_List']],
      ['Training Conducted', ['Training_Conducted']], ['MY Bharat', ['MY_Bharat_Registration']],
      ['Youth Hub Trainees', ['Youth_Hub_Trainee', 'Youth_Hub_Trainings']],
      ['Entrepreneur Identified', ['Entrepreneur_Identified']],
      ['PMEGP / PMFME Loan', ['PMEGP_PMFME_Loan', 'Entrepreneurs']],
      ['Startup & Ideas', ['Startup & Innovation Idea', 'Startup_Ideas']],
      ['Rang De Loan', ['Rang_De_Loan', 'RangDe_Loan', 'Rang de loan']],
      ['Bastar Munne Shivir', ['Bastar_Munne_Shivir']],
      ['VO CLF Meeting', ['VO CLF Meeting', 'Meetings_VO_CLF_TRIF']],
      ['M-Form', ['M_Form', 'M Form']]
    ];
    const grid = document.getElementById('publicModuleKpiGrid');
    if (grid) grid.innerHTML = modules.map(([label, key]) => {
      const counts = Array.isArray(key) ? key : [key];
      const stats = (window.DantewadaDB.data.metadata && window.DantewadaDB.data.metadata.syncStats) || {};
      const count = liveDataReady ? Math.max(0, ...counts.map(name => Number(stats[name] || 0))) : '—';
      return `<div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"><div class="text-xs font-semibold text-slate-500">${label}</div><div class="text-2xl font-extrabold text-blue-900 mt-1">${liveDataReady ? Number(count).toLocaleString('en-IN') : count}</div></div>`;
    }).join('');
    const syncStatus = document.getElementById('publicDataSyncStatus');
    if (syncStatus) syncStatus.textContent = liveDataReady ? 'Live backend data' : 'डेटा लोड हो रहा है…';
    updateStartupCounts(liveDataReady);
  }

  function updateStartupCounts(liveDataReady) {
    const ideas = liveDataReady && window.DantewadaDB && window.DantewadaDB.data
      ? (window.DantewadaDB.data.startupIdeas || []) : [];
    const count = ideas.length;
    const displayCount = liveDataReady ? count : '—';
    const section = document.getElementById('startups');
    if (!section) return;
    const badge = section.querySelector('.inline-flex');
    if (badge) badge.innerHTML = `<i class="fa-solid fa-rocket text-amber-600"></i> Startup Hunt | ${displayCount} Ideas`;
    const description = section.querySelector('p.text-xs');
    if (description) description.textContent = `${liveDataReady ? count : '—'} live records from the Startup & Innovation Idea backend tab.`;
    section.querySelectorAll('.startup-filter-tab').forEach(button => {
      const prefix = button.textContent.split('(')[0].trim();
      const district = button.getAttribute('onclick') || '';
      const match = district.match(/filterPublicStartups\('([^']+)'\)/);
      const selected = match ? match[1] : 'All';
      const districtCount = selected === 'All' ? count : ideas.filter(item => String(item.district || '').toLowerCase().includes(selected.toLowerCase())).length;
      button.textContent = `${prefix} (${liveDataReady ? districtCount : '—'})`;
    });
    document.querySelectorAll('a[href="#startups"] span').forEach(node => {
      if (/^(\d+|—)$/.test(node.textContent.trim())) node.textContent = liveDataReady ? String(count) : '—';
      else if (/Ideas/i.test(node.textContent)) node.textContent = node.textContent.replace(/(\d+|—)/, liveDataReady ? String(count) : '—');
    });
  }

  let blockChartInstance = null;
  let categoryChartInstance = null;

  function renderPublicCharts() {
    if (!window.DantewadaDB || typeof Chart === 'undefined') return;

    const youth = window.DantewadaDB.data.youth || [];

    // Block breakdown
    const blocks = ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'];
    const blockCounts = blocks.map(b => youth.filter(y => (y.block || '').toLowerCase() === b.toLowerCase()).length);

    const blockCtx = document.getElementById('pubBlockChart');
    if (blockCtx) {
      if (blockChartInstance) blockChartInstance.destroy();
      blockChartInstance = new Chart(blockCtx, {
        type: 'bar',
        data: {
          labels: ['दंतेवाड़ा (Dantewada)', 'गीदम (Geedam)', 'कटेकल्याण (Katekalyan)', 'कुआकोंडा (Kuakonda)'],
          datasets: [{
            label: 'पंजीकृत युवा (Youth Registered)',
            data: blockCounts,
            backgroundColor: ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa'],
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

    // Category breakdown
    const categories = ['ST', 'SC', 'OBC', 'General'];
    const catCounts = categories.map(c => youth.filter(y => (y.category || '').toUpperCase() === c).length);

    const catCtx = document.getElementById('pubCatChart');
    if (catCtx) {
      if (categoryChartInstance) categoryChartInstance.destroy();
      categoryChartInstance = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: ['अनुसूचित जनजाति (ST)', 'अनुसूचित जाति (SC)', 'अन्य पिछड़ा वर्ग (OBC)', 'सामान्य (General)'],
          datasets: [{
            data: catCounts,
            backgroundColor: ['#15803d', '#f97316', '#2563eb', '#9333ea'],
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
  }

  function renderPublicStories(filterCategory = 'All') {
    if (!window.DantewadaDB) return;
    const container = document.getElementById('publicStoriesContainer');
    if (!container) return;

    let stories = window.DantewadaDB.getSuccessStories({ isPublicOnly: true });
    if (filterCategory !== 'All') {
      stories = stories.filter(s => (s.category || '').toLowerCase() === filterCategory.toLowerCase());
    }

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <i class="fa-regular fa-folder-open text-4xl mb-3 text-slate-300"></i>
          <p>इस श्रेणी में अभी कोई प्रकाशित कहानी उपलब्ध नहीं है।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = stories.map(s => `
      <div class="gov-card flex flex-col overflow-hidden h-full">
        <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img src="${s.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'}" 
               alt="${s.youthName}" 
               class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
               onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'">
          <div class="absolute top-3 right-3">
            <span class="badge-status badge-published shadow-sm">${s.category || 'Success'}</span>
          </div>
          ${s.featured ? '<div class="absolute top-3 left-3"><span class="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"><i class="fa-solid fa-star text-xs mr-1"></i>Featured</span></div>' : ''}
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <div class="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <i class="fa-solid fa-location-dot"></i> ${s.village || 'Dantewada'}, ${s.block || 'Dantewada'}
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2 leading-snug">${s.title}</h3>
          <p class="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">${s.summary}</p>
          
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                ${(s.youthName || 'Y').slice(0, 2).toUpperCase()}
              </div>
              <span class="text-xs font-semibold text-slate-800">${s.youthName}</span>
            </div>
            <button onclick="window.openStoryModal('${s.id}')" 
                    class="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              पूरी कहानी <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderPublicVisits(filterBlock = 'All') {
    if (!window.DantewadaDB) return;
    const container = document.getElementById('publicVisitsContainer');
    if (!container) return;

    let visits = window.DantewadaDB.getFieldVisits({ isPublicOnly: true });
    if (filterBlock !== 'All') {
      visits = visits.filter(v => (v.block || '').toLowerCase() === filterBlock.toLowerCase());
    }

    if (visits.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <i class="fa-regular fa-images text-4xl mb-3 text-slate-300"></i>
          <p>कोई स्वीकृत फील्ड विजिट फोटो अभी उपलब्ध नहीं है।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = visits.map(v => {
      const primaryPhoto = (v.photos && v.photos.length > 0) ? v.photos[0].url : 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80';
      const photoCount = v.photos ? v.photos.length : 0;

      return `
        <div class="gov-card flex flex-col overflow-hidden h-full">
          <div class="relative h-48 w-full bg-slate-900 overflow-hidden cursor-pointer" onclick="window.openVisitModal('${v.id}')">
            <img src="${primaryPhoto}" 
                 alt="${v.locationName}" 
                 class="w-full h-full object-cover transition-transform duration-300 hover:scale-105 opacity-95"
                 onerror="this.src='https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80'">
            <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <i class="fa-solid fa-camera"></i> ${photoCount} Photos
            </div>
            <div class="absolute top-3 left-3">
              <span class="badge-status badge-block shadow">${v.block}</span>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <div class="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span><i class="fa-regular fa-calendar mr-1"></i>${v.date}</span>
              <span class="font-medium text-slate-700">${v.scheme || 'Field Inspection'}</span>
            </div>
            <h4 class="text-base font-bold text-slate-900 mb-1.5 leading-snug">${v.locationName}</h4>
            <p class="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">${v.purpose}</p>
            
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="truncate max-w-[170px]"><i class="fa-solid fa-user-tie mr-1 text-slate-400"></i>${v.officerName}</span>
              <button onclick="window.openVisitModal('${v.id}')" class="text-blue-700 font-semibold hover:underline">
                विवरण देखें
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderPublicTrainings() {
    if (!window.DantewadaDB) return;
    const container = document.getElementById('publicTrainingsContainer');
    if (!container) return;

    const trainings = window.DantewadaDB.data.trainingConducted || [];
    if (!trainings.length) {
      container.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500 bg-white rounded-xl border border-slate-200">कोई प्रशिक्षण रिकॉर्ड उपलब्ध नहीं है।</div>';
      return;
    }
    container.innerHTML = trainings.map(t => `
      <div class="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors">
        <h4 class="font-bold text-slate-900 text-base mb-1">${escapeHtml(t.training || '—')}</h4>
        <p class="text-xs text-slate-600 mb-1">${escapeHtml(t.institute || '—')}</p>
        <p class="text-xs text-slate-500">${escapeHtml(t.address || '—')}${t.block ? ` · ${escapeHtml(t.block)}` : ''}</p>
        ${t.name ? `<p class="text-xs text-slate-500 mt-3 border-t pt-2">${escapeHtml(t.name)}</p>` : ''}
      </div>
    `).join('');
  }

  function renderPublicInitiatives() {
    // Dynamic cards already in HTML or can be loaded here
  }

  function setupSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Global Modals accessible from HTML onclick
  window.openStoryModal = function (id) {
    if (!window.DantewadaDB) return;
    const story = window.DantewadaDB.getSuccessStoryById(id);
    if (!story) return;

    const modal = document.getElementById('storyModal');
    const content = document.getElementById('storyModalContent');
    if (!modal || !content) return;

    const isPdf = story.photoUrl && (story.photoUrl.startsWith('data:application/pdf') || story.photoUrl.toLowerCase().endsWith('.pdf'));

    content.innerHTML = `
      <div class="relative">
        <div class="h-64 sm:h-80 w-full overflow-hidden rounded-t-2xl bg-slate-900 relative">
          ${isPdf ? `
            <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white p-6">
              <i class="fa-solid fa-file-pdf text-6xl text-red-500 mb-3 animate-pulse"></i>
              <div class="text-lg font-bold">संलग्न पीडीएफ दस्तावेज (PDF Document)</div>
              <a href="${story.photoUrl}" target="_blank" download="${(story.youthName || 'story').replace(/\s+/g, '_')}_document.pdf" class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> PDF दस्तावेज नया टैब में खोलें / डाउनलोड करें
              </a>
            </div>
          ` : `
            <img src="${story.photoUrl}" alt="${story.youthName}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'">
          `}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
          <div class="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
            <span class="badge-status badge-published mb-2">${story.category}</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">${story.title}</h2>
            <p class="text-sm text-slate-200"><i class="fa-solid fa-location-dot mr-1"></i>${story.youthName} | ${story.village}, Block: ${story.block || 'Dantewada'}</p>
          </div>
          <button onclick="window.closeStoryModal()" class="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="p-6 sm:p-8 space-y-6">
          ${story.quote ? `
            <blockquote class="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-600 text-blue-950 italic text-base">
              "${story.quote}"
            </blockquote>
          ` : ''}

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">सफलता की कहानी (Full Story)</h4>
            <div class="text-slate-700 leading-relaxed text-base space-y-3">
              <p>${story.fullStory || story.summary}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span class="text-slate-400 block mb-0.5">संबंधित योजना</span>
              <strong class="text-slate-800 text-sm">${story.scheme || 'Youth Hub'}</strong>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">मासिक आय / प्रभाव</span>
              <strong class="text-green-700 text-sm">${story.monthlyIncome || 'सत्यापित'}</strong>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">उपलब्धि की तारीख</span>
              <strong class="text-slate-800 text-sm">${story.achievementDate || '2026'}</strong>
            </div>
            <div>
              <span class="text-slate-400 block mb-0.5">सत्यापनकर्ता</span>
              <strong class="text-slate-800 text-sm">${story.author || 'जिला प्रशासन'}</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeStoryModal = function () {
    const modal = document.getElementById('storyModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.openVisitModal = function (id) {
    if (!window.DantewadaDB) return;
    const visit = window.DantewadaDB.getFieldVisitById(id);
    if (!visit) return;

    const modal = document.getElementById('visitModal');
    const content = document.getElementById('visitModalContent');
    if (!modal || !content) return;

    const photos = visit.photos || [];

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="badge-status badge-block">${visit.block}</span>
              <span class="badge-status badge-published">${visit.status}</span>
              <span class="text-xs text-slate-400 font-mono">${visit.id}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">${visit.locationName}</h2>
            <p class="text-xs text-slate-500 mt-1">
              <i class="fa-regular fa-calendar mr-1"></i>${visit.date} &nbsp;|&nbsp; 
              <i class="fa-solid fa-user-tie mr-1"></i>${visit.officerName} (${visit.officerRole || 'Officer'})
            </p>
          </div>
          <button onclick="window.closeVisitModal()" class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">विजिट का उद्देश्य (Purpose)</h4>
          <p class="text-slate-800 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">${visit.purpose}</p>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">अपलोड की गई फील्ड फोटो (Photos - ${photos.length})</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${photos.map(p => `
              <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img src="${p.url}" alt="${p.caption || 'Inspection'}" class="w-full h-52 object-cover">
                <div class="p-2.5 bg-slate-900 text-white text-xs flex items-center justify-between">
                  <span class="truncate max-w-[200px] text-slate-300">${p.caption || 'Field visit verification'}</span>
                  <span class="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold">${p.type || 'Photo'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1"><i class="fa-solid fa-clipboard-check text-blue-600 mr-1"></i>मुख्य निष्कर्ष (Key Findings)</span>
            <p class="text-slate-600">${visit.findings || 'सभी मानक एवं उपकरण सत्यापित पाए गए।'}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1"><i class="fa-solid fa-arrows-spin text-amber-600 mr-1"></i>आगे की कार्रवाई (Action Required)</span>
            <p class="text-slate-600">${visit.actionRequired || 'नियमित फॉलो-अप अनुशंसित।'}</p>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeVisitModal = function () {
    const modal = document.getElementById('visitModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.filterStoriesByCategory = function (cat) {
    document.querySelectorAll('.story-tab-btn').forEach(btn => {
      btn.classList.remove('bg-blue-800', 'text-white');
      btn.classList.add('bg-white', 'text-slate-700');
    });
    const activeBtn = event.currentTarget;
    if (activeBtn) {
      activeBtn.classList.add('bg-blue-800', 'text-white');
      activeBtn.classList.remove('bg-white', 'text-slate-700');
    }
    renderPublicStories(cat);
  };

  window.filterVisitsByBlock = function (block) {
    document.querySelectorAll('.visit-tab-btn').forEach(btn => {
      btn.classList.remove('bg-blue-800', 'text-white');
      btn.classList.add('bg-white', 'text-slate-700');
    });
    const activeBtn = event.currentTarget;
    if (activeBtn) {
      activeBtn.classList.add('bg-blue-800', 'text-white');
      activeBtn.classList.remove('bg-white', 'text-slate-700');
    }
    renderPublicVisits(block);
  };

  let currentStartupDistrict = 'All';
  let currentStartupSearch = '';
  let startupDisplayLimit = 9;

  function renderPublicStartups(district = currentStartupDistrict, search = currentStartupSearch) {
    const container = document.getElementById('publicStartupsContainer');
    if (!container) return;

    currentStartupDistrict = district;
    currentStartupSearch = search;

    const allIdeas = (window.DantewadaDB && window.DantewadaDB.data && window.DantewadaDB.data.startupIdeas)
      ? window.DantewadaDB.data.startupIdeas
      : [];

    let filtered = allIdeas;
    if (district && district !== 'All') {
      filtered = filtered.filter(item => {
        const d = (item.district || '').toLowerCase();
        return d.includes(district.toLowerCase());
      });
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (item.startupName || '').toLowerCase().includes(q) ||
               (item.founderName || '').toLowerCase().includes(q) ||
               (item.address || '').toLowerCase().includes(q) ||
               (item.businessModel || '').toLowerCase().includes(q) ||
               (item.description || '').toLowerCase().includes(q) ||
               (item.problemSolved || '').toLowerCase().includes(q);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-lightbulb text-4xl text-amber-300 mb-3"></i>
          <p class="text-sm font-bold text-slate-700">कोई स्टार्टअप आइडिया नहीं मिला</p>
          <p class="text-xs text-slate-400 mt-1">कृपया अन्य जिला या कीवर्ड चुनकर पुनः प्रयास करें।</p>
        </div>
      `;
      const loadMoreBtn = document.getElementById('publicStartupPagination');
      if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
      return;
    }

    const visibleItems = filtered.slice(0, startupDisplayLimit);

    container.innerHTML = visibleItems.map(item => {
      const dist = item.district || 'Dantewada';
      let distBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      if (dist.toLowerCase().includes('sukma')) distBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      else if (dist.toLowerCase().includes('bastar')) distBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
      else if (dist.toLowerCase().includes('kondagaon')) distBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
      else if (dist.toLowerCase().includes('durg')) distBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';

      const investSought = item.investmentNeeded
        ? (item.investmentNeeded.toString().startsWith('₹') ? item.investmentNeeded : `₹${item.investmentNeeded}`)
        : '—';

      const modelShort = (item.businessModel && item.businessModel !== 'N/A')
        ? (item.businessModel.length > 90 ? item.businessModel.slice(0, 90) + '...' : item.businessModel)
        : (item.problemSolved && item.problemSolved !== 'N/A')
            ? (item.problemSolved.length > 90 ? item.problemSolved.slice(0, 90) + '...' : item.problemSolved)
        : 'विवरण उपलब्ध नहीं';

      return `
        <div class="gov-card p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 bg-white rounded-2xl">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${distBadgeClass}">
                <i class="fa-solid fa-location-dot mr-1 text-[9px]"></i>${escapeHtml(dist)}
              </span>
              <span class="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                #${escapeHtml(item.id)}${item.workType ? ` • ${escapeHtml(item.workType)}` : ''}
              </span>
            </div>

            <h3 class="font-extrabold text-slate-900 text-base mb-1 hover:text-amber-700 transition line-clamp-1">
              ${escapeHtml(item.startupName || '—')}
            </h3>
            
            <p class="text-xs text-slate-500 font-medium mb-3">
              <i class="fa-solid fa-user-astronaut text-amber-600 mr-1"></i>
              <strong>${escapeHtml(item.founderName || '—')}</strong>${item.age || item.education ? ` (${escapeHtml(item.age || '—')} वर्ष, ${escapeHtml(item.education || '—')})` : ''}
            </p>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3 text-xs text-slate-600 leading-relaxed">
              <p class="line-clamp-3">${escapeHtml(modelShort)}</p>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between text-xs mb-3">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold">निवेश मांग:</span>
                <span class="font-extrabold text-amber-900 text-xs">${escapeHtml(investSought)}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block uppercase font-bold">टीम आकार:</span>
                <span class="font-bold text-slate-700">${escapeHtml(item.teamMembers || '—')}</span>
              </div>
            </div>

            <button onclick="window.openPublicStartupDetail(${Number(item.id) || 0})" class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5">
              <span>पिच डॉसियर देखें (View Pitch)</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const loadMoreContainer = document.getElementById('publicStartupPagination');
    if (loadMoreContainer) {
      if (filtered.length > startupDisplayLimit) {
        loadMoreContainer.classList.remove('hidden');
      } else {
        loadMoreContainer.classList.add('hidden');
      }
    }
  }

  window.loadMorePublicStartups = function () {
    startupDisplayLimit += 12;
    renderPublicStartups(currentStartupDistrict, currentStartupSearch);
  };

  window.filterPublicStartups = function (district, evt) {
    document.querySelectorAll('.startup-filter-tab').forEach(btn => {
      btn.classList.remove('bg-blue-900', 'text-white', 'border-blue-900');
      btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
    });
    const activeBtn = evt ? evt.currentTarget : (typeof window !== 'undefined' && window.event ? window.event.currentTarget : null);
    if (activeBtn) {
      activeBtn.classList.add('bg-blue-900', 'text-white', 'border-blue-900');
      activeBtn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    }
    startupDisplayLimit = 9;
    renderPublicStartups(district, currentStartupSearch);
  };

  window.openPublicStartupDetail = function (id) {
    const modal = document.getElementById('startupModal');
    const content = document.getElementById('startupModalContent');
    if (!modal || !content) return;

    const allIdeas = (window.DantewadaDB && window.DantewadaDB.data && window.DantewadaDB.data.startupIdeas)
      ? window.DantewadaDB.data.startupIdeas
      : [];

    const idea = allIdeas.find(i => String(i.id) === String(id)) || allIdeas[0];
    if (!idea) return;

    const investSought = idea.investmentNeeded 
      ? (idea.investmentNeeded.toString().startsWith('₹') ? idea.investmentNeeded : `₹${idea.investmentNeeded}`) 
      : '—';

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white font-black flex items-center justify-center text-xl shadow-lg border border-amber-400/40">
              <i class="fa-solid fa-lightbulb"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Idea #${escapeHtml(idea.id)} • ${escapeHtml(idea.district || 'Dantewada')}
                </span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ${escapeHtml(idea.workType || '—')}
                </span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                ${escapeHtml(idea.startupName || '—')}
              </h3>
              <p class="text-xs text-slate-500 font-semibold mt-0.5">
                संस्थापक: <span class="text-blue-900 font-bold">${escapeHtml(idea.founderName || 'उद्यमी')}</span> • 
                आयु: ${escapeHtml(idea.age || 'N/A')} • 
                योग्यता: ${escapeHtml(idea.education || 'N/A')} • 
                पता: ${escapeHtml(idea.address || 'दंतेवाड़ा')}
              </p>
            </div>
          </div>
          <button onclick="window.closeStartupModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">अब तक निवेश</span>
            <span class="font-extrabold text-slate-800 text-sm">₹${escapeHtml(idea.investedSoFar || '0')}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">निवेश मांग (Seeking)</span>
            <span class="font-extrabold text-amber-800 text-sm">${escapeHtml(investSought)}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">टीम आकार</span>
            <span class="font-bold text-slate-800">${escapeHtml(idea.teamMembers || '1')} सदस्य</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">संपर्क / फोन</span>
            <span class="font-bold text-slate-800 font-mono">${maskMobile(idea.mobile)}</span>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div class="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <h4 class="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-info text-amber-600"></i>
              आइडिया / स्टार्टअप का विवरण (Description):
            </h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(idea.description || 'N/A')}</p>
          </div>

          <div class="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
            <h4 class="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-blue-600"></i>
              किस समस्या का समाधान करता है? (Problem Solved):
            </h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(idea.problemSolved || 'N/A')}</p>
          </div>

          <div class="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 class="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-chart-line text-emerald-600"></i>
              बिजनेस मॉडल (Business & Revenue Model):
            </h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(idea.businessModel || 'N/A')}</p>
          </div>

          <div class="p-4 bg-purple-50/60 rounded-xl border border-purple-200">
            <h4 class="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-bullseye text-purple-600"></i>
              लक्षित ग्राहक समूह (Target Customers):
            </h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(idea.targetCustomer || 'N/A')}</p>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 class="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-mountain-sun text-slate-600"></i>
              भविष्य के लक्ष्य (Future Goals):
            </h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${idea.futureGoals || 'N/A'}</p>
          </div>
        </div>

        ${(idea.socialLinks && idea.socialLinks !== 'N/A') || (idea.businessPlanLink && idea.businessPlanLink !== 'N/A') ? `
          <div class="flex flex-wrap items-center gap-3 pt-2">
            ${idea.socialLinks && idea.socialLinks !== 'N/A' ? `
              <a href="${idea.socialLinks.startsWith('http') ? idea.socialLinks : 'https://' + idea.socialLinks}" target="_blank" class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 transition">
                <i class="fa-solid fa-link"></i> सोशल मीडिया / वेबसाइट
              </a>
            ` : ''}
            ${idea.businessPlanLink && idea.businessPlanLink !== 'N/A' ? `
              <a href="${idea.businessPlanLink}" target="_blank" class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 transition">
                <i class="fa-solid fa-file-pdf"></i> बिज़नेस प्लान लिंक
              </a>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeStartupModal = function () {
    const modal = document.getElementById('startupModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.submitGrievanceForm = function (e) {
    e.preventDefault();
    const alertBox = document.getElementById('contactSuccessMsg');
    if (alertBox) {
      alertBox.classList.remove('hidden');
      setTimeout(() => alertBox.classList.add('hidden'), 5000);
      e.target.reset();
    }
  };

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('db:changed', () => {
    renderPublicKPIs();
    renderPublicCharts();
    renderPublicStories();
    renderPublicStartups();
    renderPublicVisits();
    renderPublicTrainings();
  });
})();
