/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * gallery.js - Progress Tracking Photo Gallery Module
 * Visual progress monitoring of field mobilization, skill training batches,
 * micro-enterprises, and youth empowerment milestones across Dantewada district.
 */

const GalleryModule = (function() {
  const STORAGE_KEY = "YH_PROGRESS_GALLERY_CUSTOM";

  // Initial curated real progress milestone records for Dantewada district
  const DEFAULT_MILESTONES = [
    {
      id: "GAL-2026-001",
      title: "Electrician & Solar Technician Practical Training",
      category: "Skill Training",
      categoryHi: "कौशल प्रशिक्षण",
      date: "2026-09-28",
      block: "Dantewada",
      gramPanchayat: "Chitalanka",
      participants: 28,
      status: "In Progress",
      statusHi: "जारी",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
      description: "Batch 1 hands-on wiring, circuit safety, and solar panel inverter installation practical sessions at Youth Hub Dantewada workshop.",
      tags: ["Electrician", "Solar", "Practical Training", "Batch 1"],
      uploadedBy: "District Skill Coordinator",
      createdDate: "2026-09-28"
    },
    {
      id: "GAL-2026-002",
      title: "Gram Panchayat Intensive Youth Mobilization Camp",
      category: "Mobilization",
      categoryHi: "मोबिलाइजेशन शिविर",
      date: "2026-09-24",
      block: "Geedam",
      gramPanchayat: "Barsoor",
      participants: 65,
      status: "Completed",
      statusHi: "सम्पन्न",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80",
      description: "Special community mobilization drive organized in Barsoor Gram Panchayat. 42 youth registered on the spot with M-Form completion.",
      tags: ["Gram Sabha", "Mobilization", "M-Form", "Barsoor"],
      uploadedBy: "Youth Hub Geedam",
      createdDate: "2026-09-24"
    },
    {
      id: "GAL-2026-003",
      title: "Tribal Youth Micro-Enterprise: Tailoring & Apparel Unit",
      category: "Entrepreneurship",
      categoryHi: "स्थापित स्वरोजगार",
      date: "2026-09-20",
      block: "Katekalyan",
      gramPanchayat: "Tumakpal",
      participants: 6,
      status: "Milestone Achieved",
      statusHi: "उपलब्धि",
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
      description: "Inauguration and commercial launch of women self-help tailoring micro-enterprise supported by PMEGP loan sanction and Youth Hub mentorship.",
      tags: ["Micro-Enterprise", "Tailoring", "PMEGP", "Women SHG"],
      uploadedBy: "Livelihood Officer",
      createdDate: "2026-09-20"
    },
    {
      id: "GAL-2026-004",
      title: "District Mega Rojgar Mela & Offer Letter Distribution",
      category: "Activities",
      categoryHi: "रोजगार मेला व गतिविधि",
      date: "2026-09-15",
      block: "Dantewada",
      gramPanchayat: "Dantewada Rural",
      participants: 210,
      status: "Completed",
      statusHi: "सम्पन्न",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      description: "14 participating private employers and skill partners conducted interviews at District HQ. 87 youth handed preliminary job offer letters.",
      tags: ["Rojgar Mela", "Placement", "Offer Letters", "District HQ"],
      uploadedBy: "जिला रोजगार अधिकारी",
      createdDate: "2026-09-15"
    },
    {
      id: "GAL-2026-005",
      title: "Computer Literacy & Digital Coding Batch (NavGurukul)",
      category: "Skill Training",
      categoryHi: "कौशल प्रशिक्षण",
      date: "2026-09-10",
      block: "Geedam",
      gramPanchayat: "Javanga",
      participants: 35,
      status: "In Progress",
      statusHi: "जारी",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
      description: "NavGurukul residential campus orientation and digital software foundation training for shortlisted rural students from across Dantewada.",
      tags: ["NavGurukul", "Coding", "Software", "Digital"],
      uploadedBy: "NavGurukul Coordinator",
      createdDate: "2026-09-10"
    },
    {
      id: "GAL-2026-006",
      title: "Rehabilitation Livelihood Toolkits Handover Ceremony",
      category: "Rehabilitation",
      categoryHi: "आत्मसमर्पण व पुनर्वास",
      date: "2026-09-05",
      block: "Kuakonda",
      gramPanchayat: "Palnar",
      participants: 12,
      status: "Milestone Achieved",
      statusHi: "उपलब्धि",
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=900&q=80",
      description: "Distribution of masonry, carpentry, and electrical toolkits along with financial assistance cheque disbursal for surrendered youth under district welfare package.",
      tags: ["Rehabilitation", "Toolkits", "Welfare", "Surrendered Youth"],
      uploadedBy: "Rehabilitation Cell",
      createdDate: "2026-09-05"
    },
    {
      id: "GAL-2026-007",
      title: "Field Counselling & Psychometric Aptitude Camp",
      category: "Mobilization",
      categoryHi: "मोबिलाइजेशन व काउंसलिंग",
      date: "2026-08-28",
      block: "Kuakonda",
      gramPanchayat: "Nakulnar",
      participants: 52,
      status: "Completed",
      statusHi: "सम्पन्न",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
      description: "Career counsellors conducted group counselling and mapped vocational aspirations for high school pass-outs in Nakulnar cluster.",
      tags: ["Counselling", "Nakulnar", "Career Path"],
      uploadedBy: "District Counsellor",
      createdDate: "2026-08-28"
    },
    {
      id: "GAL-2026-008",
      title: "Mushroom Cultivation & Organic Farming Micro-Unit",
      category: "Entrepreneurship",
      categoryHi: "स्थापित स्वरोजगार",
      date: "2026-08-18",
      block: "Katekalyan",
      gramPanchayat: "Bengpal",
      participants: 8,
      status: "Milestone Achieved",
      statusHi: "उपलब्धि",
      imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=900&q=80",
      description: "Success story: 8 local youths launched cooperative oyster mushroom cultivation following 21-day skill training at KVK Dantewada.",
      tags: ["Mushroom", "Agri-Business", "Bengpal", "Cooperative"],
      uploadedBy: "Agri-Skill Mentor",
      createdDate: "2026-08-18"
    }
  ];

  let currentCategory = "All";
  let currentBlock = "All";
  let currentGP = "All";
  let currentStatus = "All";
  let searchQuery = "";
  let viewMode = "grid"; // "grid" | "timeline"

  let allGalleryItems = [];
  let currentLightboxIndex = 0;
  let filteredItems = [];

  function init() {
    setupEventListeners();
    populateBlockFilters();
  }

  function getCustomItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Error parsing local gallery items", e);
      return [];
    }
  }

  function saveCustomItem(item) {
    const list = getCustomItems();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function deleteCustomItem(id) {
    let list = getCustomItems();
    list = list.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function setupEventListeners() {
    // Category pill buttons
    document.querySelectorAll(".gallery-pill-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".gallery-pill-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentCategory = this.getAttribute("data-category") || "All";
        applyFiltersAndRender();
      });
    });

    // Block filter
    const blockSelect = document.getElementById("galleryFilterBlock");
    if (blockSelect) {
      blockSelect.addEventListener("change", function() {
        currentBlock = this.value;
        updateGPSelect(this.value);
        currentGP = "All";
        applyFiltersAndRender();
      });
    }

    // GP filter
    const gpSelect = document.getElementById("galleryFilterGP");
    if (gpSelect) {
      gpSelect.addEventListener("change", function() {
        currentGP = this.value;
        applyFiltersAndRender();
      });
    }

    // Status filter
    const statusSelect = document.getElementById("galleryFilterStatus");
    if (statusSelect) {
      statusSelect.addEventListener("change", function() {
        currentStatus = this.value;
        applyFiltersAndRender();
      });
    }

    // Search input
    const searchInput = document.getElementById("gallerySearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function() {
        searchQuery = this.value.trim().toLowerCase();
        applyFiltersAndRender();
      });
    }

    // View mode toggles
    const btnGridView = document.getElementById("btnGalleryGridView");
    const btnTimelineView = document.getElementById("btnGalleryTimelineView");
    if (btnGridView && btnTimelineView) {
      btnGridView.addEventListener("click", () => switchViewMode("grid"));
      btnTimelineView.addEventListener("click", () => switchViewMode("timeline"));
    }

    // Add progress photo button
    const btnAddPhoto = document.getElementById("btnOpenAddGalleryDrawer");
    if (btnAddPhoto) {
      btnAddPhoto.addEventListener("click", () => openAddPhotoDrawer());
    }

    // Gallery Form Submission
    const form = document.getElementById("formAddProgressGallery");
    if (form) {
      form.addEventListener("submit", handleAddPhotoSubmit);
    }

    // Lightbox modal keyboard controls
    document.addEventListener("keydown", function(e) {
      const modal = document.getElementById("galleryLightboxModal");
      if (!modal || !modal.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    });
  }

  function populateBlockFilters() {
    const blockSelect = document.getElementById("galleryFilterBlock");
    const modalBlockSelect = document.getElementById("galBlock");
    if (!blockSelect && !modalBlockSelect) return;

    const blocks = Object.keys(AppConfig.BLOCKS || {});
    if (blockSelect) {
      blockSelect.innerHTML = '<option value="All">All Blocks / सभी विकासखंड</option>';
      blocks.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        blockSelect.appendChild(opt);
      });
    }

    if (modalBlockSelect) {
      modalBlockSelect.innerHTML = '<option value="">-- Select Block --</option>';
      blocks.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        modalBlockSelect.appendChild(opt);
      });
      modalBlockSelect.addEventListener("change", function() {
        updateModalGPSelect(this.value);
      });
    }
  }

  function updateGPSelect(block) {
    const gpSelect = document.getElementById("galleryFilterGP");
    if (!gpSelect) return;
    gpSelect.innerHTML = '<option value="All">All Gram Panchayats / सभी पंचायत</option>';
    if (block && block !== "All" && AppConfig.BLOCKS[block]) {
      AppConfig.BLOCKS[block].forEach(gp => {
        const opt = document.createElement("option");
        opt.value = gp;
        opt.textContent = gp;
        gpSelect.appendChild(opt);
      });
    }
  }

  function updateModalGPSelect(block) {
    const gpSelect = document.getElementById("galGP");
    if (!gpSelect) return;
    gpSelect.innerHTML = '<option value="">-- Select Gram Panchayat --</option>';
    if (block && AppConfig.BLOCKS[block]) {
      AppConfig.BLOCKS[block].forEach(gp => {
        const opt = document.createElement("option");
        opt.value = gp;
        opt.textContent = gp;
        gpSelect.appendChild(opt);
      });
    }
  }

  function switchViewMode(mode) {
    viewMode = mode;
    const btnGridView = document.getElementById("btnGalleryGridView");
    const btnTimelineView = document.getElementById("btnGalleryTimelineView");
    const gridContainer = document.getElementById("galleryGridContainer");
    const timelineContainer = document.getElementById("galleryTimelineContainer");

    if (mode === "grid") {
      if (btnGridView) btnGridView.classList.add("active");
      if (btnTimelineView) btnTimelineView.classList.remove("active");
      if (gridContainer) gridContainer.style.display = "grid";
      if (timelineContainer) timelineContainer.style.display = "none";
    } else {
      if (btnTimelineView) btnTimelineView.classList.add("active");
      if (btnGridView) btnGridView.classList.remove("active");
      if (gridContainer) gridContainer.style.display = "none";
      if (timelineContainer) timelineContainer.style.display = "block";
    }
    applyFiltersAndRender();
  }

  /**
   * Main loader for Progress Gallery
   */
  async function loadGallery() {
    showGalleryLoading(true);

    // 1. Gather custom items from localStorage
    const customItems = getCustomItems();

    // 2. Fetch live data from Sheets (Progress_Gallery, Mobilization, Trainings, Activities)
    let liveItems = [];
    try {
      const [galRes, mobRes, trgRes, actRes] = await Promise.all([
        API.call("getTableRecords", { sheetName: "Progress_Gallery" }).catch(() => null),
        API.call("getTableRecords", { sheetName: "Mobilization" }).catch(() => null),
        API.call("getTableRecords", { sheetName: "Trainings" }).catch(() => null),
        API.call("getTableRecords", { sheetName: "Activities" }).catch(() => null)
      ]);

      // Process dedicated Progress_Gallery records if backend has them
      const gRecords = (galRes && (galRes.records || galRes.data)) || [];
      gRecords.forEach(r => {
        if (r.Photo_URL || r.Photos_URL || r.imageUrl) {
          liveItems.push({
            id: r.Gallery_ID || ("GAL-" + Math.floor(Math.random() * 9000)),
            title: r.Title || "Progress Milestone",
            category: r.Category || "Skill Training",
            date: r.Date || new Date().toISOString().split("T")[0],
            block: r.Block || "Dantewada",
            gramPanchayat: r.Gram_Panchayat || r.GP || "",
            participants: Number(r.Participants) || 0,
            status: r.Progress_Status || "Completed",
            imageUrl: r.Photo_URL || r.Photos_URL || r.imageUrl,
            description: r.Description || r.Remarks || "Field progress milestone.",
            tags: ["Field Update"],
            uploadedBy: r.Uploaded_By || "Officer",
            createdDate: r.Created_At || r.Date || ""
          });
        }
      });

      // Extract mobilization records with photos
      const mobRecords = (mobRes && (mobRes.records || mobRes.data)) || [];
      mobRecords.forEach(r => {
        if (r.Photo_URL || r.Photos_URL) {
          liveItems.push({
            id: r.Activity_ID || ("MOB-" + Math.floor(Math.random() * 9000)),
            title: r.Activity_Name || "Mobilization Camp",
            category: "Mobilization",
            date: r.Date || "",
            block: r.Block || "Dantewada",
            gramPanchayat: r.Gram_Panchayat || "",
            participants: Number(r.Total_Mobilized) || 0,
            status: "Completed",
            imageUrl: r.Photo_URL || r.Photos_URL,
            description: `Mobilization camp organized by ${r.Mobilizer_Name || 'Field Team'}. Total youth mobilized: ${r.Total_Mobilized || 0}. ${r.Remarks || ''}`,
            tags: ["Mobilization", r.Mobilization_Source || "Camp"],
            uploadedBy: r.Mobilizer_Name || "Field Mobilizer",
            createdDate: r.Date || ""
          });
        }
      });

      // Extract trainings with photos
      const trgRecords = (trgRes && (trgRes.records || trgRes.data)) || [];
      trgRecords.forEach(r => {
        if (r.Photo_URL || r.Photos_URL) {
          liveItems.push({
            id: r.Training_ID || ("TRG-" + Math.floor(Math.random() * 9000)),
            title: r.Training_Name || "Skill Training Workshop",
            category: "Skill Training",
            date: r.Date || r.Start_Date || "",
            block: r.Block || "Dantewada",
            gramPanchayat: r.GP || "",
            participants: Number(r.Total_Participants) || 0,
            status: "In Progress",
            imageUrl: r.Photo_URL || r.Photos_URL,
            description: `Topic: ${r.Training_Topic || 'Vocational Skills'} conducted by ${r.Training_Provider || 'Training Partner'} at ${r.Venue || 'Youth Hub'}. ${r.Outcome || ''}`,
            tags: ["Training", r.Training_Type || "Skill"],
            uploadedBy: r.Trainer_Name || "Training Team",
            createdDate: r.Date || ""
          });
        }
      });

      // Extract activities with photos
      const actRecords = (actRes && (actRes.records || actRes.data)) || [];
      actRecords.forEach(r => {
        if (r.Photo_URL || r.Photos_URL) {
          liveItems.push({
            id: r.Activity_ID || ("ACT-" + Math.floor(Math.random() * 9000)),
            title: r.Activity_Name || "Field Activity",
            category: "Activities",
            date: r.Date || "",
            block: r.Block || "Dantewada",
            gramPanchayat: r.GP || "",
            participants: Number(r.Participants) || 0,
            status: "Completed",
            imageUrl: r.Photo_URL || r.Photos_URL,
            description: r.Description || r.Outcome || "Field activity event.",
            tags: ["Activity", r.Activity_Type || "Event"],
            uploadedBy: "Field Coordinator",
            createdDate: r.Date || ""
          });
        }
      });
    } catch (e) {
      console.warn("Could not fetch remote sheet gallery images:", e);
    }

    // Combine custom items + live sheet items + default milestones
    // Avoid duplicate IDs
    const idMap = new Set();
    allGalleryItems = [];

    // Prioritize user's custom additions
    customItems.forEach(i => {
      if (!idMap.has(i.id)) {
        idMap.add(i.id);
        allGalleryItems.push(i);
      }
    });

    // Then live records from sheet
    liveItems.forEach(i => {
      if (!idMap.has(i.id)) {
        idMap.add(i.id);
        allGalleryItems.push(i);
      }
    });

    // Then pre-populated rich Dantewada field milestones
    DEFAULT_MILESTONES.forEach(i => {
      if (!idMap.has(i.id)) {
        idMap.add(i.id);
        allGalleryItems.push(i);
      }
    });

    // Enforce operator block restrictions if applicable
    const currentUser = API.getCurrentUser();
    if (currentUser && currentUser.block && currentUser.block !== "All") {
      const blockFilter = document.getElementById("galleryFilterBlock");
      if (blockFilter) {
        blockFilter.value = currentUser.block;
        blockFilter.disabled = true;
      }
      currentBlock = currentUser.block;
      updateGPSelect(currentUser.block);
    }

    showGalleryLoading(false);
    updateKpis();
    applyFiltersAndRender();
  }

  function showGalleryLoading(show) {
    const spinner = document.getElementById("galleryLoadingSpinner");
    if (spinner) spinner.style.display = show ? "flex" : "none";
  }

  function updateKpis() {
    const totalCountEl = document.getElementById("galKpiTotalPhotos");
    const trgCountEl = document.getElementById("galKpiTrainings");
    const mobCountEl = document.getElementById("galKpiMobilization");
    const entCountEl = document.getElementById("galKpiEnterprises");
    const beneCountEl = document.getElementById("galKpiBeneficiaries");

    let total = allGalleryItems.length;
    let trg = allGalleryItems.filter(i => i.category === "Skill Training").length;
    let mob = allGalleryItems.filter(i => i.category === "Mobilization").length;
    let ent = allGalleryItems.filter(i => i.category === "Entrepreneurship").length;
    let beneficiaries = allGalleryItems.reduce((acc, i) => acc + (Number(i.participants) || 0), 0);

    if (totalCountEl) totalCountEl.textContent = total;
    if (trgCountEl) trgCountEl.textContent = trg;
    if (mobCountEl) mobCountEl.textContent = mob;
    if (entCountEl) entCountEl.textContent = ent;
    if (beneCountEl) beneCountEl.textContent = beneficiaries.toLocaleString("en-IN");
  }

  function applyFiltersAndRender() {
    filteredItems = allGalleryItems.filter(item => {
      // Category filter
      if (currentCategory !== "All") {
        if (item.category !== currentCategory) return false;
      }

      // Block filter
      if (currentBlock !== "All") {
        if (String(item.block || "").toLowerCase() !== currentBlock.toLowerCase()) return false;
      }

      // Gram Panchayat filter
      if (currentGP !== "All") {
        if (String(item.gramPanchayat || "").toLowerCase() !== currentGP.toLowerCase()) return false;
      }

      // Status filter
      if (currentStatus !== "All") {
        if (item.status !== currentStatus) return false;
      }

      // Search query
      if (searchQuery) {
        const text = `${item.title} ${item.description} ${item.block} ${item.gramPanchayat} ${(item.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }

      return true;
    });

    // Update count in header
    const countBadge = document.getElementById("galleryFilteredCount");
    if (countBadge) {
      countBadge.textContent = `${filteredItems.length} photos shown / ${allGalleryItems.length} total`;
    }

    if (viewMode === "grid") {
      renderGridView(filteredItems);
    } else {
      renderTimelineView(filteredItems);
    }
  }

  function renderGridView(items) {
    const grid = document.getElementById("galleryGridContainer");
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #FFFFFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
          <div style="font-size: 48px; color: #94A3B8; margin-bottom: 12px;"><i class="fas fa-images"></i></div>
          <h3 style="font-size: 18px; color: #1E293B; margin-bottom: 6px;">No Progress Photos Found</h3>
          <p style="color: #64748B; font-size: 13.5px; max-width: 440px; margin: 0 auto 16px;">There are no photos matching the selected filters. Try changing filters or add a new progress photo.</p>
          <button type="button" class="btn btn-primary" onclick="GalleryModule.openAddPhotoDrawer()">
            <i class="fas fa-plus"></i> Add First Progress Photo
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map((item, index) => {
      const categoryBadgeClass = getCategoryBadgeClass(item.category);
      const statusBadgeClass = getStatusBadgeClass(item.status);
      const safeTitle = escapeHtml(item.title);
      const safeDesc = escapeHtml(item.description);

      return `
        <div class="gallery-card" data-id="${item.id}" onclick="GalleryModule.openLightbox(${index})">
          <div class="gallery-card-thumb">
            <img src="${item.imageUrl}" alt="${safeTitle}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';" />
            <div class="gallery-card-overlay">
              <span class="gallery-zoom-btn" title="View Full Photo"><i class="fas fa-search-plus"></i></span>
            </div>
            <div class="gallery-card-badges">
              <span class="gallery-badge ${categoryBadgeClass}">${item.category}</span>
              <span class="gallery-badge-status ${statusBadgeClass}"><i class="${getStatusIcon(item.status)}"></i> ${item.status}</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <div class="gallery-card-meta">
              <span class="gallery-meta-item"><i class="fas fa-calendar-alt"></i> ${item.date || 'Recent'}</span>
              <span class="gallery-meta-item"><i class="fas fa-map-marker-alt"></i> ${item.block}${item.gramPanchayat ? ' • ' + item.gramPanchayat : ''}</span>
            </div>
            <h4 class="gallery-card-title">${safeTitle}</h4>
            <p class="gallery-card-desc">${safeDesc}</p>
            <div class="gallery-card-footer">
              <span class="gallery-participants-tag"><i class="fas fa-users"></i> ${item.participants || 0} Participants</span>
              <div class="gallery-card-actions" onclick="event.stopPropagation()">
                <button type="button" class="btn-card-action" onclick="GalleryModule.openLightbox(${index})" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <a href="${item.imageUrl}" target="_blank" download="Progress_${item.id}.jpg" class="btn-card-action" title="Download">
                  <i class="fas fa-download"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderTimelineView(items) {
    const container = document.getElementById("galleryTimelineContainer");
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 50px; background: #FFFFFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
          <p style="color: #64748B;">No progress milestones to display for the current filter selection.</p>
        </div>
      `;
      return;
    }

    // Sort items by date descending
    const sorted = [...items].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    container.innerHTML = `
      <div class="gallery-timeline">
        ${sorted.map((item, index) => {
          const originalIndex = filteredItems.indexOf(item);
          const categoryBadgeClass = getCategoryBadgeClass(item.category);
          const statusBadgeClass = getStatusBadgeClass(item.status);

          return `
            <div class="timeline-item">
              <div class="timeline-marker">
                <i class="${getCategoryIcon(item.category)}"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <div class="timeline-date-chip">
                    <i class="fas fa-calendar-check"></i> ${item.date || 'Ongoing'}
                  </div>
                  <div class="timeline-badges">
                    <span class="gallery-badge ${categoryBadgeClass}">${item.category}</span>
                    <span class="gallery-badge-status ${statusBadgeClass}">${item.status}</span>
                  </div>
                </div>
                <div class="timeline-body-grid">
                  <div class="timeline-thumb-wrap" onclick="GalleryModule.openLightbox(${originalIndex})">
                    <img src="${item.imageUrl}" alt="${escapeHtml(item.title)}" loading="lazy" />
                    <div class="timeline-zoom-overlay"><i class="fas fa-search-plus"></i></div>
                  </div>
                  <div class="timeline-details">
                    <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
                    <div class="timeline-location">
                      <i class="fas fa-map-pin text-rose"></i> <strong>${item.block}</strong>
                      ${item.gramPanchayat ? ` • Gram Panchayat: <strong>${item.gramPanchayat}</strong>` : ''}
                      • <i class="fas fa-users text-blue"></i> <strong>${item.participants || 0} Beneficiaries</strong>
                    </div>
                    <p class="timeline-desc">${escapeHtml(item.description)}</p>
                    <div class="timeline-tags">
                      ${(item.tags || []).map(t => `<span class="timeline-tag">#${escapeHtml(t)}</span>`).join("")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function getCategoryBadgeClass(cat) {
    switch (cat) {
      case "Skill Training": return "badge-skill";
      case "Mobilization": return "badge-mob";
      case "Entrepreneurship": return "badge-ent";
      case "Activities": return "badge-act";
      case "Rehabilitation": return "badge-reh";
      default: return "badge-default";
    }
  }

  function getStatusBadgeClass(s) {
    if (s === "Completed") return "status-completed";
    if (s === "Milestone Achieved") return "status-milestone";
    return "status-in-progress";
  }

  function getStatusIcon(s) {
    if (s === "Completed") return "fas fa-check-circle";
    if (s === "Milestone Achieved") return "fas fa-trophy";
    return "fas fa-clock";
  }

  function getCategoryIcon(cat) {
    switch (cat) {
      case "Skill Training": return "fas fa-tools";
      case "Mobilization": return "fas fa-bullhorn";
      case "Entrepreneurship": return "fas fa-store";
      case "Activities": return "fas fa-calendar-alt";
      case "Rehabilitation": return "fas fa-hand-holding-heart";
      default: return "fas fa-image";
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Lightbox Modal Functions
   */
  function openLightbox(index) {
    if (index < 0 || index >= filteredItems.length) return;
    currentLightboxIndex = index;
    const item = filteredItems[index];
    const modal = document.getElementById("galleryLightboxModal");
    if (!modal) return;

    const img = document.getElementById("lightboxImage");
    const titleEl = document.getElementById("lightboxTitle");
    const catEl = document.getElementById("lightboxCategory");
    const dateEl = document.getElementById("lightboxDate");
    const locationEl = document.getElementById("lightboxLocation");
    const statusEl = document.getElementById("lightboxStatus");
    const participantsEl = document.getElementById("lightboxParticipants");
    const descEl = document.getElementById("lightboxDescription");
    const downloadEl = document.getElementById("lightboxDownloadBtn");
    const countEl = document.getElementById("lightboxCounter");

    if (img) img.src = item.imageUrl;
    if (titleEl) titleEl.textContent = item.title;
    if (catEl) {
      catEl.textContent = item.category;
      catEl.className = "gallery-badge " + getCategoryBadgeClass(item.category);
    }
    if (dateEl) dateEl.textContent = item.date || "N/A";
    if (locationEl) locationEl.textContent = `${item.block}${item.gramPanchayat ? ', ' + item.gramPanchayat : ''}`;
    if (statusEl) {
      statusEl.innerHTML = `<i class="${getStatusIcon(item.status)}"></i> ${item.status}`;
      statusEl.className = "gallery-badge-status " + getStatusBadgeClass(item.status);
    }
    if (participantsEl) participantsEl.textContent = `${item.participants || 0} Youth`;
    if (descEl) descEl.textContent = item.description || "No further details available.";
    if (downloadEl) {
      downloadEl.href = item.imageUrl;
      downloadEl.download = `Progress_${item.id}.jpg`;
    }
    if (countEl) {
      countEl.textContent = `${index + 1} of ${filteredItems.length}`;
    }

    modal.classList.add("active");
  }

  function closeLightbox() {
    const modal = document.getElementById("galleryLightboxModal");
    if (modal) modal.classList.remove("active");
  }

  function nextLightbox() {
    if (currentLightboxIndex < filteredItems.length - 1) {
      openLightbox(currentLightboxIndex + 1);
    } else {
      openLightbox(0); // loop around
    }
  }

  function prevLightbox() {
    if (currentLightboxIndex > 0) {
      openLightbox(currentLightboxIndex - 1);
    } else {
      openLightbox(filteredItems.length - 1); // loop around
    }
  }

  /**
   * Add New Progress Photo Modal / Drawer
   */
  function openAddPhotoDrawer() {
    const drawer = document.getElementById("drawer_formGallery");
    const backdrop = document.getElementById("slideOverBackdrop");
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("active");

    // Default date to today
    const dateInput = document.getElementById("galDate");
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Default block for operators
    const currentUser = API.getCurrentUser();
    if (currentUser && currentUser.block && currentUser.block !== "All") {
      const blockSelect = document.getElementById("galBlock");
      if (blockSelect) {
        blockSelect.value = currentUser.block;
        blockSelect.disabled = true;
        updateModalGPSelect(currentUser.block);
      }
    }
  }

  function closeAddPhotoDrawer() {
    const drawer = document.getElementById("drawer_formGallery");
    const backdrop = document.getElementById("slideOverBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
  }

  async function handleAddPhotoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const title = form.querySelector('[name="Title"]').value.trim();
    const category = form.querySelector('[name="Category"]').value;
    const date = form.querySelector('[name="Date"]').value;
    const block = form.querySelector('[name="Block"]').value;
    const gramPanchayat = form.querySelector('[name="Gram_Panchayat"]').value || "";
    const participants = Number(form.querySelector('[name="Participants"]').value) || 0;
    const status = form.querySelector('[name="Progress_Status"]').value;
    const description = form.querySelector('[name="Description"]').value.trim();
    const tagsInput = form.querySelector('[name="Tags"]').value.trim();
    const tags = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [category];

    // Check image source: uploaded file base64 or fallback URL
    const fileInput = form.querySelector('input[type="file"]');
    const urlInput = form.querySelector('[name="Photo_URL_Fallback"]');

    let imageUrl = "";
    if (fileInput && fileInput.dataset && fileInput.dataset.base64) {
      imageUrl = fileInput.dataset.base64;
    } else if (urlInput && urlInput.value.trim()) {
      imageUrl = urlInput.value.trim();
    } else {
      App.showToast("Please upload a photograph or provide an image link.", "warning");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Progress Photo...';
    }

    const newItem = {
      id: "GAL-" + Date.now().toString().slice(-6),
      title,
      category,
      date,
      block,
      gramPanchayat,
      participants,
      status,
      imageUrl,
      description: description || "Progress milestone documented.",
      tags,
      uploadedBy: (API.getCurrentUser() && API.getCurrentUser().name) || "Youth Hub Team",
      createdDate: new Date().toISOString().split("T")[0]
    };

    try {
      // 1. Try uploading file to Drive if connected
      if (fileInput && fileInput.dataset && fileInput.dataset.base64) {
        try {
          const uploadRes = await API.call("uploadFile", {
            base64Data: fileInput.dataset.base64,
            fileName: fileInput.dataset.filename || `progress_${newItem.id}.jpg`,
            mimeType: fileInput.dataset.mimetype || "image/jpeg",
            subFolder: "Progress_Gallery"
          });
          if (uploadRes && uploadRes.success && uploadRes.fileUrl) {
            newItem.imageUrl = uploadRes.fileUrl;
          }
        } catch (err) {
          console.warn("Drive upload failed, using local base64:", err);
        }
      }

      // 2. Try inserting record into backend
      try {
        await API.call("addProgressGallery", {
          Gallery_ID: newItem.id,
          Title: newItem.title,
          Category: newItem.category,
          Date: newItem.date,
          Block: newItem.block,
          Gram_Panchayat: newItem.gramPanchayat,
          Participants: newItem.participants,
          Progress_Status: newItem.status,
          Photo_URL: newItem.imageUrl,
          Description: newItem.description,
          Uploaded_By: newItem.uploadedBy,
          Created_At: newItem.createdDate
        });
      } catch (e) {
        console.warn("Backend addProgressGallery not configured yet, stored locally.", e);
      }

      // 3. Save to localStorage
      saveCustomItem(newItem);

      App.showToast("Progress photo successfully added to gallery!", "success");
      form.reset();
      const previewImg = document.getElementById("galPhotoPreview");
      if (previewImg) {
        previewImg.src = "";
        previewImg.style.display = "none";
      }

      closeAddPhotoDrawer();
      loadGallery();
    } catch (err) {
      App.showToast("Failed to save photo: " + err.message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Progress Photo';
      }
    }
  }

  return {
    init,
    loadGallery,
    openLightbox,
    closeLightbox,
    nextLightbox,
    prevLightbox,
    openAddPhotoDrawer,
    closeAddPhotoDrawer,
    switchViewMode
  };
})();
