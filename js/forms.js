/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * forms.js - Unified Form Controller for All 13 Data Entry Modules with Embedded Real-Time Data Tables,
 * Smart Live Auto-fill, Real-time Validation, Duplicate Detection, Save & Add Another, Inline Table Actions, and CSV Exports.
 */

const Forms = (function() {
  const TAB_TABLE_CONFIGS = {
    youth_master: {
      sheetName: "Youth_Master",
      tableId: "tblYouthMaster",
      searchId: "searchTblYouthMaster",
      countId: "countTblYouthMaster",
      idField: "Youth_ID",
      columns: [
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Name" },
        { key: "Father_Husband_Name", label: "Father / Husband" },
        { key: "Mobile_Number", label: "Mobile" },
        { key: "Aadhaar_Number", label: "Aadhaar" },
        { key: "Age", label: "Age" },
        { key: "Gender", label: "Gender" },
        { key: "Category", label: "Category" },
        { key: "Qualification", label: "Qualification" },
        { key: "Occupation", label: "Occupation" },
        { key: "District", label: "District" },
        { key: "Block", label: "Block" },
        { key: "Gram_Panchayat", label: "Gram Panchayat" },
        { key: "Village", label: "Village" },
        { key: "Career_Interest", label: "Career Interest" },
        { key: "Registration_Date", label: "Reg Date" }
      ]
    },
    mobilization: {
      sheetName: "Mobilization",
      tableId: "tblMobilization",
      searchId: "searchTblMobilization",
      countId: "countTblMobilization",
      idField: "Activity_ID",
      columns: [
        { key: "Activity_ID", label: "Activity ID" },
        { key: "Date", label: "Date" },
        { key: "Activity_Name", label: "Camp / Event Name" },
        { key: "Mobilization_Source", label: "Source" },
        { key: "Mobilizer_Name", label: "Mobilizer" },
        { key: "Block", label: "Block" },
        { key: "Gram_Panchayat", label: "Gram Panchayat" },
        { key: "Male", label: "Male" },
        { key: "Female", label: "Female" },
        { key: "Other", label: "Other" },
        { key: "Total_Mobilized", label: "Total Mobilized", isBadge: "info" },
        { key: "Remarks", label: "Remarks" }
      ]
    },
    mform: {
      sheetName: "M_Form",
      tableId: "tblMForm",
      searchId: "searchTblMForm",
      countId: "countTblMForm",
      idField: "MForm_ID",
      columns: [
        { key: "MForm_ID", label: "M-Form ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Candidate Name" },
        { key: "Mobile", label: "Mobile" },
        { key: "Date", label: "M-Form Date" },
        { key: "Block", label: "Block" },
        { key: "GP", label: "Gram Panchayat" },
        { key: "MForm_Status", label: "Status", isStatusBadge: true },
        { key: "Follow_Up_Status", label: "Follow-up" },
        { key: "MForm_Reg_No", label: "Reg Number" },
        { key: "Remarks", label: "Remarks" }
      ]
    },
    mybharat: {
      sheetName: "My_Bharat",
      tableId: "tblMyBharat",
      searchId: "searchTblMyBharat",
      countId: "countTblMyBharat",
      idField: "MyBharat_ID",
      columns: [
        { key: "MyBharat_ID", label: "My Bharat ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Youth Name" },
        { key: "Mobile", label: "Mobile" },
        { key: "Registration_Date", label: "Reg Date" },
        { key: "Block", label: "Block" },
        { key: "GP", label: "GP" },
        { key: "Status", label: "Status", isStatusBadge: true },
        { key: "MyBharat_Reg_No", label: "My Bharat No." },
        { key: "Remarks", label: "Remarks" }
      ]
    },
    counselling: {
      sheetName: "Counselling",
      tableId: "tblCounselling",
      searchId: "searchTblCounselling",
      countId: "countTblCounselling",
      idField: "Counselling_ID",
      columns: [
        { key: "Counselling_ID", label: "Counselling ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Youth Name" },
        { key: "Date", label: "Counselling Date" },
        { key: "Block", label: "Block" },
        { key: "Counsellor_Name", label: "Counsellor" },
        { key: "Career_Interest", label: "Career Interest" },
        { key: "Counselling_Outcome", label: "Outcome" },
        { key: "Follow_Up_Date", label: "Follow-up Date" },
        { key: "Follow_Up_Status", label: "Follow-up Status" },
        { key: "Pending_Issue", label: "Pending Issue" },
        { key: "Remarks", label: "Remarks" }
      ]
    },
    skill_training: {
      sheetName: "Skill_Training",
      tableId: "tblSkillTraining",
      searchId: "searchTblSkillTraining",
      countId: "countTblSkillTraining",
      idField: "Training_Record_ID",
      columns: [
        { key: "Training_Record_ID", label: "Record ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Candidate" },
        { key: "Training_Name", label: "Training Name" },
        { key: "Skill_Trade", label: "Skill / Trade" },
        { key: "Training_Provider", label: "Institute" },
        { key: "Start_Date", label: "Start Date" },
        { key: "End_Date", label: "End Date" },
        { key: "Training_Status", label: "Status", isStatusBadge: true },
        { key: "Certificate_Status", label: "Certificate" },
        { key: "Employment_After_Training", label: "Job Placed" },
        { key: "Follow_Up_Date", label: "Follow-up Date" }
      ]
    },
    emp_registered: {
      sheetName: "Employment_Registered",
      tableId: "tblEmpRegistered",
      searchId: "searchTblEmpRegistered",
      countId: "countTblEmpRegistered",
      idField: "Emp_Reg_ID",
      columns: [
        { key: "Emp_Reg_ID", label: "Reg ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Youth Name" },
        { key: "Registration_Date", label: "Reg Date" },
        { key: "Block", label: "Block" },
        { key: "Qualification", label: "Qualification" },
        { key: "Preferred_Job", label: "Preferred Job" },
        { key: "Registration_Status", label: "Status", isStatusBadge: true }
      ]
    },
    emp_linked: {
      sheetName: "Employment_Linked",
      tableId: "tblEmpLinked",
      searchId: "searchTblEmpLinked",
      countId: "countTblEmpLinked",
      idField: "Emp_Link_ID",
      columns: [
        { key: "Emp_Link_ID", label: "Link ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Youth Name" },
        { key: "Employer_Name", label: "Employer / Org" },
        { key: "Job_Role", label: "Job Role" },
        { key: "Placement_Date", label: "Employment Date" },
        { key: "Salary", label: "Monthly Income (₹)", isMoney: true },
        { key: "Status", label: "Status", isStatusBadge: true },
        { key: "Follow_Up_Date", label: "Follow-up Date" },
        { key: "Follow_Up_Status", label: "Follow-up Status" }
      ]
    },
    education: {
      sheetName: "Education",
      tableId: "tblEducation",
      searchId: "searchTblEducation",
      countId: "countTblEducation",
      idField: "Education_ID",
      columns: [
        { key: "Education_ID", label: "Edu ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Youth_Name", label: "Candidate" },
        { key: "Education_Goal", label: "Goal" },
        { key: "Institution_Name", label: "Institution" },
        { key: "Course", label: "Course" },
        { key: "Admission_Date", label: "Date" },
        { key: "Status", label: "Status", isStatusBadge: true }
      ]
    },
    entrepreneurship: {
      sheetName: "Entrepreneurs",
      tableId: "tblEntrepreneurs",
      searchId: "searchTblEntrepreneurs",
      countId: "countTblEntrepreneurs",
      idField: "Entrepreneur_ID",
      columns: [
        { key: "S_No", label: "S.NO", isSerial: true },
        { key: "Block", label: "BLOCK" },
        { key: "Name", label: "NAME" },
        { key: "Father_Name", label: "FATHER NAME" },
        { key: "Village", label: "VILLAGE" },
        { key: "Block_2", label: "BLOCK" },
        { key: "Mobile", label: "MOBILE NO." },
        { key: "Business", label: "BUSINESS" },
        { key: "Loan_Amount", label: "LONE AMOUNT", isMoney: true },
        { key: "Udyam_Registration", label: "UDHYAM REGISTRATION", isStatusBadge: true },
        { key: "Bank_Documents", label: "BANK DOCUMENTS", isStatusBadge: true },
        { key: "Pan_Card", label: "PAN CARD", isStatusBadge: true },
        { key: "Aadhar_Card", label: "ADHAR CARD", isStatusBadge: true },
        { key: "Voter_Card", label: "VOTER CARD", isStatusBadge: true },
        { key: "Quotation", label: "QUOTATION", isStatusBadge: true },
        { key: "Remarks", label: "REMARK" },
        { key: "Updates", label: "UPDATES" }
      ]
    },
    navgurukul: {
      sheetName: "NavGurukul",
      tableId: "tblNavGurukul",
      searchId: "searchTblNavGurukul",
      countId: "countTblNavGurukul",
      idField: "Candidate_ID",
      columns: [
        { key: "Candidate_ID", label: "Candidate ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Candidate_Name", label: "Candidate Name" },
        { key: "Mobile", label: "Mobile" },
        { key: "Block", label: "Block" },
        { key: "Qualification", label: "Qualification" },
        { key: "Registration_Date", label: "Date" },
        { key: "Selection_Status", label: "Pipeline Stage", isStatusBadge: true },
        { key: "Admission_Status", label: "Admission" }
      ]
    },
    trainings: {
      sheetName: "Trainings",
      tableId: "tblTrainings",
      searchId: "searchTblTrainings",
      countId: "countTblTrainings",
      idField: "Training_ID",
      columns: [
        { key: "Training_ID", label: "Training ID" },
        { key: "Training_Name", label: "Training Name" },
        { key: "Training_Type", label: "Type" },
        { key: "Date", label: "Date" },
        { key: "Venue", label: "Venue" },
        { key: "Block", label: "Block" },
        { key: "Training_Provider", label: "Provider" },
        { key: "Total_Participants", label: "Total Participants", isBadge: "info" },
        { key: "Training_Topic", label: "Topic" }
      ]
    },
    activities: {
      sheetName: "Activities",
      tableId: "tblActivities",
      searchId: "searchTblActivities",
      countId: "countTblActivities",
      idField: "Activity_ID",
      columns: [
        { key: "Activity_ID", label: "Activity ID" },
        { key: "Date", label: "Date" },
        { key: "Activity_Type", label: "Activity Type", isBadge: "info" },
        { key: "Activity_Name", label: "Activity Name" },
        { key: "Block", label: "Block" },
        { key: "GP", label: "Gram Panchayat" },
        { key: "Participants", label: "Participants" },
        { key: "Outcome", label: "Outcome" }
      ]
    },
    rehabilitation: {
      sheetName: "Rehabilitation",
      tableId: "tblRehabilitation",
      searchId: "searchTblRehabilitation",
      countId: "countTblRehabilitation",
      idField: "Rehab_ID",
      columns: [
        { key: "Rehab_ID", label: "Rehab ID" },
        { key: "Youth_ID", label: "Youth ID", isLink: true },
        { key: "Candidate_Name", label: "Name" },
        { key: "Father_Husband_Name", label: "Guardian" },
        { key: "Mobile", label: "Mobile" },
        { key: "Block", label: "Block" },
        { key: "Surrender_Date", label: "Surrender Date" },
        { key: "Rehabilitation_Status", label: "Rehab Status", isStatusBadge: true },
        { key: "Assistance_Type", label: "Assistance Type" },
        { key: "Assistance_Amount", label: "Amount (₹)", isMoney: true },
        { key: "Scheme_Linked", label: "Scheme Linked" },
        { key: "Employment_Status", label: "Employment" },
        { key: "Current_Status", label: "Current Status", isBadge: "info" },
        { key: "Follow_Up_Date", label: "Follow-up Date" },
        { key: "Pending_Issue", label: "Pending Issue" }
      ]
    },
    iim_raipur: {
      sheetName: "IIM_Raipur",
      tableId: "tblIIMRaipur",
      searchId: "searchTblIIMRaipur",
      countId: "countTblIIMRaipur",
      idField: "IIM_ID",
      columns: [
        { key: "IIM_ID", label: "ID" },
        { key: "Candidate_Name", label: "Candidate Name" },
        { key: "Father_Husband_Name", label: "Father / Husband" },
        { key: "Mobile_Number", label: "Mobile" },
        { key: "Block", label: "Block" },
        { key: "Village", label: "Village" },
        { key: "Stream_Subject", label: "Stream / Qual." },
        { key: "Raipur_Stay_3Months", label: "3Mo Raipur Stay" },
        { key: "Selection_Status", label: "Selection Status", isStatusBadge: true },
        { key: "Batch", label: "Batch" },
        { key: "Activity_Name", label: "Activity / Unit" },
        { key: "Financial_Assistance_Amount", label: "Assistance (₹)", isMoney: true },
        { key: "Installment_2nd", label: "2nd Installment" },
        { key: "Remarks", label: "Remarks" }
      ]
    },
    shasan_sahyog: {
      sheetName: "Shasan_Sahyog",
      tableId: "tblShasanSahyog",
      searchId: "searchTblShasanSahyog",
      countId: "countTblShasanSahyog",
      idField: "Demand_ID",
      columns: [
        { key: "Demand_ID", label: "Demand ID" },
        { key: "Name", label: "Name" },
        { key: "Father_Husband_Name", label: "Father / Husband" },
        { key: "DOB", label: "DOB" },
        { key: "Mobile_Number", label: "Mobile" },
        { key: "Block", label: "Block" },
        { key: "Address", label: "Address / Village" },
        { key: "Assistance_Required", label: "शासन से सहयोग (Demand)" },
        { key: "Status", label: "Status", isStatusBadge: true },
        { key: "Remarks", label: "Remarks" }
      ]
    }
  };

  // Cache table records for client search
  const tableDataCache = {};

  const SERVICE_FORM_PREFIXES = ["mf", "mb", "cou", "skl", "er", "el", "edu", "ent", "ng", "reh", "iim", "ss"];

  function init() {
    initializeDateDefaults();
    setupYouthSearchListeners();
    setupLiveYouthLookup();
    setupMobileDuplicateCheck();
    setupCalculations();
    setupFileUploads();
    setupBlockGPCascades();
    bindFormSubmissions();
    setupSaveAndAddAnotherButtons();
    setupTableSearchInputs();
    setupTableExportButtons();
    setupBulkUploadButtons();
    setupBulkUploadModal();
    setupQuickEditModal();
  }

  /**
   * Set dynamic default date to today for all date inputs
   */
  function initializeDateDefaults() {
    const today = new Date().toISOString().split("T")[0];
    document.querySelectorAll('input[type="date"]').forEach(inp => {
      if (!inp.value) {
        inp.value = today;
      }
    });
  }

  /**
   * Block to Gram Panchayat dynamic dropdown cascading for all forms
   */
  function setupBlockGPCascades() {
    document.querySelectorAll("select[data-block-select]").forEach(select => {
      select.addEventListener("change", function() {
        const targetGpId = this.getAttribute("data-gp-target");
        const gpSelect = document.getElementById(targetGpId);
        if (!gpSelect) return;

        const block = this.value;
        gpSelect.innerHTML = '<option value="">Select Gram Panchayat</option>';
        if (block && AppConfig.BLOCKS[block]) {
          AppConfig.BLOCKS[block].forEach(gp => {
            const opt = document.createElement("option");
            opt.value = gp;
            opt.textContent = gp;
            gpSelect.appendChild(opt);
          });
        }
      });
    });
  }

  /**
   * Auto calculations (e.g. Male + Female + Other = Total)
   */
  function setupCalculations() {
    const mobMale = document.getElementById("mobMale");
    const mobFemale = document.getElementById("mobFemale");
    const mobOther = document.getElementById("mobOther");
    const mobTotal = document.getElementById("mobTotal");

    function calcMobTotal() {
      if (mobTotal) {
        const m = parseInt(mobMale ? mobMale.value : 0, 10) || 0;
        const f = parseInt(mobFemale ? mobFemale.value : 0, 10) || 0;
        const o = parseInt(mobOther ? mobOther.value : 0, 10) || 0;
        mobTotal.value = m + f + o;
      }
    }

    if (mobMale) mobMale.addEventListener("input", calcMobTotal);
    if (mobFemale) mobFemale.addEventListener("input", calcMobTotal);
    if (mobOther) mobOther.addEventListener("input", calcMobTotal);

    const trgMale = document.getElementById("trgMale");
    const trgFemale = document.getElementById("trgFemale");
    const trgTotal = document.getElementById("trgTotal");

    function calcTrgTotal() {
      if (trgTotal) {
        const m = parseInt(trgMale ? trgMale.value : 0, 10) || 0;
        const f = parseInt(trgFemale ? trgFemale.value : 0, 10) || 0;
        trgTotal.value = m + f;
      }
    }

    if (trgMale) trgMale.addEventListener("input", calcTrgTotal);
    if (trgFemale) trgFemale.addEventListener("input", calcTrgTotal);

    // DOB to Age Auto-calculation
    const ymDob = document.getElementById("ymDOB");
    const ymAge = document.getElementById("ymAge");
    if (ymDob && ymAge) {
      ymDob.addEventListener("change", function() {
        if (this.value) {
          const birthDate = new Date(this.value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age >= 0 && age < 100) {
            ymAge.value = age;
          }
        }
      });
    }
  }

  /**
   * Base64 file upload and preview handling
   */
  function setupFileUploads() {
    document.querySelectorAll('input[type="file"][data-preview]').forEach(input => {
      input.addEventListener("change", function() {
        const previewId = this.getAttribute("data-preview");
        const previewImg = document.getElementById(previewId);
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            if (previewImg) {
              previewImg.src = e.target.result;
              previewImg.style.display = "block";
            }
            input.dataset.base64 = e.target.result;
            input.dataset.filename = file.name;
            input.dataset.mimetype = file.type;
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  /**
   * Search Existing Youth helper modal triggers
   */
  function setupYouthSearchListeners() {
    document.querySelectorAll(".btn-search-youth").forEach(btn => {
      btn.addEventListener("click", function() {
        const formPrefix = this.getAttribute("data-prefix");
        openYouthSearchModal(formPrefix);
      });
    });
  }

  /**
   * Live Instant Youth Lookup on typing Youth ID or Mobile in service forms
   */
  function setupLiveYouthLookup() {
    SERVICE_FORM_PREFIXES.forEach(p => {
      const input = document.getElementById(`${p}YouthId`);
      if (!input) return;

      let debounceTimer = null;
      input.addEventListener("input", function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (query.length === 0) {
          removeYouthVerifiedCard(p);
          return;
        }

        if (query.length >= 3) {
          debounceTimer = setTimeout(async () => {
            try {
              const res = await API.call("searchYouth", { query });
              if (res && res.success && res.results && res.results.length > 0) {
                // Check if exact ID match or mobile match
                const exactMatch = res.results.find(y => 
                  y.Youth_ID.toLowerCase() === query.toLowerCase() ||
                  y.Mobile_Number === query
                ) || res.results[0];

                if (exactMatch) {
                  selectYouthForForm(exactMatch, p, false);
                }
              } else {
                removeYouthVerifiedCard(p);
              }
            } catch (e) {
              console.error("Live youth lookup error:", e);
            }
          }, 250);
        }
      });
    });
  }

  /**
   * Real-time mobile validation & duplicate detection in Youth Master
   */
  function setupMobileDuplicateCheck() {
    const mobInput = document.getElementById("ymMobile");
    if (!mobInput) return;

    let debounceTimer = null;
    mobInput.addEventListener("input", function() {
      clearTimeout(debounceTimer);
      const val = this.value.trim();

      // Remove existing warning
      const formGroup = mobInput.closest(".form-group");
      const existingWarn = formGroup ? formGroup.querySelector(".duplicate-warning") : null;
      if (existingWarn) existingWarn.remove();

      if (val.length === 10) {
        debounceTimer = setTimeout(async () => {
          try {
            const res = await API.call("searchYouth", { query: val });
            if (res && res.success && res.results) {
              const dup = res.results.find(y => y.Mobile_Number === val);
              if (dup && formGroup) {
                const warn = document.createElement("div");
                warn.className = "duplicate-warning";
                warn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Caution: Mobile <strong>${val}</strong> is already registered under <strong>${dup.Youth_Name}</strong> (${dup.Youth_ID} - ${dup.Block}).`;
                formGroup.appendChild(warn);
              }
            }
          } catch (e) {
            console.error("Duplicate mobile check error:", e);
          }
        }, 200);
      }
    });
  }

  let activeSearchPrefix = "";
  function openYouthSearchModal(prefix) {
    activeSearchPrefix = prefix;
    const modal = document.getElementById("youthSearchModal");
    const input = document.getElementById("youthSearchQuery");
    const list = document.getElementById("youthSearchResults");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 100);
    }
    if (list) list.innerHTML = '<p class="text-muted" style="padding: 10px;">Type name, mobile, or Youth ID to search...</p>';
    if (modal) modal.classList.add("active");
  }

  async function performYouthSearch() {
    const input = document.getElementById("youthSearchQuery");
    const list = document.getElementById("youthSearchResults");
    const query = input ? input.value.trim() : "";
    if (!query) return;

    list.innerHTML = '<p class="text-muted" style="padding: 10px;"><i class="fas fa-spinner fa-spin"></i> Searching database...</p>';

    try {
      const res = await API.call("searchYouth", { query });
      if (res && res.success && res.results && res.results.length > 0) {
        list.innerHTML = "";
        res.results.forEach(y => {
          const item = document.createElement("div");
          item.className = "search-result-item";
          item.style.cssText = "padding: 10px 14px; border-bottom: 1px solid #E2E8F0; cursor: pointer; display: flex; justify-content: space-between; align-items: center;";
          item.innerHTML = `
            <div>
              <div style="font-weight: 600; color: #0B2545;">${y.Youth_Name} <span style="font-size: 11px; background: #DBEAFE; color: #1E40AF; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">${y.Youth_ID}</span></div>
              <div style="font-size: 12px; color: #64748B;">📱 ${y.Mobile_Number} | Block: ${y.Block} | GP: ${y.Gram_Panchayat}</div>
            </div>
            <button type="button" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11.5px;">Select</button>
          `;
          item.addEventListener("click", () => selectYouthForForm(y, activeSearchPrefix, true));
          list.appendChild(item);
        });
      } else {
        list.innerHTML = '<p class="text-muted" style="padding: 10px;">No youth records found matching query.</p>';
      }
    } catch (e) {
      list.innerHTML = '<p class="text-danger" style="padding: 10px;">Search failed. Please try again.</p>';
    }
  }

  function selectYouthForForm(youth, customPrefix = null, closeModal = true) {
    const p = customPrefix || activeSearchPrefix;
    if (!p) return;

    setFormVal(`${p}YouthId`, youth.Youth_ID);
    setFormVal(`${p}YouthName`, youth.Youth_Name);
    setFormVal(`${p}Mobile`, youth.Mobile_Number);
    setFormVal(`${p}Block`, youth.Block);
    
    const blockSelect = document.getElementById(`${p}Block`);
    if (blockSelect) {
      const event = new Event("change");
      blockSelect.dispatchEvent(event);
      setTimeout(() => {
        setFormVal(`${p}GP`, youth.Gram_Panchayat);
        setFormVal(`${p}Village`, youth.Village);
      }, 50);
    } else {
      setFormVal(`${p}GP`, youth.Gram_Panchayat);
      setFormVal(`${p}Village`, youth.Village);
    }

    if (document.getElementById(`${p}Parent`)) setFormVal(`${p}Parent`, youth.Father_Husband_Name || youth.Father_Mother_Name || "");
    if (document.getElementById(`${p}FatherName`)) setFormVal(`${p}FatherName`, youth.Father_Husband_Name || youth.Father_Mother_Name || "");
    if (document.getElementById(`${p}Qualification`)) setFormVal(`${p}Qualification`, youth.Qualification);
    if (document.getElementById(`${p}CareerInterest`)) setFormVal(`${p}CareerInterest`, youth.Career_Interest);

    if (p === "iim") {
      const form = document.getElementById("formIIMRaipur");
      if (form) {
        if (youth.Age && form.querySelector("[name='Age']")) form.querySelector("[name='Age']").value = youth.Age;
        if (youth.Category && form.querySelector("[name='Category']")) form.querySelector("[name='Category']").value = youth.Category;
        if (youth.Aadhaar_Number && form.querySelector("[name='Aadhaar_Number']")) form.querySelector("[name='Aadhaar_Number']").value = youth.Aadhaar_Number;
        if (youth.Address && form.querySelector("[name='Address']")) form.querySelector("[name='Address']").value = youth.Address;
      }
    }

    // Show verified mini candidate badge
    renderYouthVerifiedCard(p, youth);

    if (closeModal) {
      const modal = document.getElementById("youthSearchModal");
      if (modal) modal.classList.remove("active");
      App.showToast(`Selected youth: ${youth.Youth_Name} (${youth.Youth_ID})`, "success");
    }
  }

  function renderYouthVerifiedCard(prefix, youth) {
    const youthIdInput = document.getElementById(`${prefix}YouthId`);
    if (!youthIdInput) return;
    const formGroup = youthIdInput.closest(".form-group");
    if (!formGroup) return;

    removeYouthVerifiedCard(prefix);

    const card = document.createElement("div");
    card.className = "youth-verified-card";
    card.id = `${prefix}VerifiedCard`;
    const initial = (youth.Youth_Name || "Y").charAt(0).toUpperCase();
    card.innerHTML = `
      <div class="verified-avatar">${initial}</div>
      <div class="verified-details">
        <div class="verified-name">
          <strong>${youth.Youth_Name}</strong>
          <span class="badge success" style="font-size: 10px; padding: 1px 6px;"><i class="fas fa-check-circle"></i> Verified Candidate</span>
          <span class="text-muted" style="font-size: 11px;">ID: ${youth.Youth_ID}</span>
        </div>
        <div class="verified-meta">
          <span><i class="fas fa-phone"></i> ${youth.Mobile_Number || 'N/A'}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${youth.Block || ''} • ${youth.Gram_Panchayat || ''}</span>
          ${youth.Qualification ? `<span><i class="fas fa-graduation-cap"></i> ${youth.Qualification}</span>` : ''}
        </div>
      </div>
    `;
    formGroup.appendChild(card);
  }

  function removeYouthVerifiedCard(prefix) {
    const youthIdInput = document.getElementById(`${prefix}YouthId`);
    if (!youthIdInput) return;
    const formGroup = youthIdInput.closest(".form-group");
    if (!formGroup) return;
    const card = formGroup.querySelector(".youth-verified-card");
    if (card) card.remove();
  }

  function setFormVal(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && value !== undefined && value !== null) el.value = value;
  }

  /**
   * Real-Time Embedded Table Data Engine for each Tab
   */
  async function loadTabTable(moduleKey) {
    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config) return;

    const table = document.getElementById(config.tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" style="text-align: center; padding: 20px; color: #64748B;"><i class="fas fa-spinner fa-spin"></i> Loading records...</td></tr>`;
    }

    try {
      const res = await API.call("getTableRecords", { sheetName: config.sheetName });
      let recordList = res && (res.records || res.data);
      if (res && res.success && Array.isArray(recordList)) {
        // Role-based block filtering for Hub Operators
        const currentUser = API.getCurrentUser();
        if (currentUser && currentUser.block && currentUser.block !== "All") {
          const userBlock = currentUser.block.toLowerCase();
          recordList = recordList.filter(rec => {
            const rowBlock = String(rec.Block || rec.block || "").toLowerCase();
            return !rowBlock || rowBlock === userBlock;
          });
        }
        tableDataCache[moduleKey] = recordList;
        renderTabTable(moduleKey, recordList);
      } else {
        if (tbody) tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" style="text-align: center; padding: 20px; color: #94A3B8;">No records found.</td></tr>`;
      }
    } catch (e) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" style="text-align: center; padding: 20px; color: #DC2626;">Error loading records.</td></tr>`;
    }
  }

  /**
   * Helper to retrieve value for any record column with multi-field alias support & serial numbering
   */
  function getRecordColValue(rec, col, idx) {
    if (!rec) return "-";

    // 1. Serial Number
    if (col.isSerial || col.key === "S_No" || col.label === "S.NO") {
      const sno = rec["S.NO"] || rec["S.No"] || rec["S_No"] || rec.S_No || rec.SNO || rec.sno || rec.serial;
      return sno !== undefined && sno !== null && sno !== "" ? sno : (idx !== undefined ? idx + 1 : 1);
    }

    // Direct key match
    let val = rec[col.key];

    // Case-insensitive / clean match fallback
    if (val === undefined || val === null || val === "") {
      const targetClean = col.label.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      for (const k of Object.keys(rec)) {
        if (k.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === targetClean) {
          val = rec[k];
          break;
        }
      }
    }

    // Specific field fallbacks for entrepreneurship & common aliases
    if (val === undefined || val === null || val === "") {
      switch (col.key) {
        case "Block_2":
          val = rec.Block_2 || rec["BLOCK_2"] || rec.GP || rec.Gram_Panchayat || rec.Block || rec.BLOCK || "";
          break;
        case "Block":
          val = rec.Block || rec.BLOCK || rec.block || "";
          break;
        case "Name":
          val = rec.Name || rec.NAME || rec.Youth_Name || rec.Candidate_Name || "";
          break;
        case "Father_Name":
          val = rec.Father_Name || rec["FATHER NAME"] || rec.Father_Husband_Name || rec["Father Name"] || "";
          break;
        case "Village":
          val = rec.Village || rec.VILLAGE || rec.village || "";
          break;
        case "Mobile":
          val = rec.Mobile || rec["MOBILE NO."] || rec["Mobile No"] || rec.Mobile_Number || rec.Mobile_No || rec.mobile || "";
          break;
        case "Business":
          val = rec.Business || rec["BUSINESS"] || rec.Business_Idea || rec.Business_Type || rec.Business_Name || "";
          break;
        case "Loan_Amount":
          val = rec.Loan_Amount || rec["LONE AMOUNT"] || rec["LOAN AMOUNT"] || rec.Lone_Amount || rec.loan_amount || rec.Loan || "";
          break;
        case "Udyam_Registration":
          val = rec.Udyam_Registration || rec["UDHYAM REGISTRATION"] || rec["UDYAM REGISTRATION"] || rec.Udhyam_Registration || rec.Udyam_Reg || "";
          break;
        case "Bank_Documents":
          val = rec.Bank_Documents || rec["BANK DOCUMENTS"] || rec.Bank_Docs || rec.Bank_Doc || "";
          break;
        case "Pan_Card":
          val = rec.Pan_Card || rec["PAN CARD"] || rec.PAN_Card || rec.Pan || "";
          break;
        case "Aadhar_Card":
          val = rec.Aadhar_Card || rec["ADHAR CARD"] || rec["AADHAR CARD"] || rec.Adhar_Card || rec.Aadhaar_Number || rec.Aadhar || "";
          break;
        case "Voter_Card":
          val = rec.Voter_Card || rec["VOTER CARD"] || rec.Voter_ID || rec.Voter || "";
          break;
        case "Quotation":
          val = rec.Quotation || rec["QUOTATION"] || rec.quotation || "";
          break;
        case "Remarks":
          val = rec.Remarks || rec["REMARK"] || rec["REMARKS"] || rec.Remark || rec.remarks || rec.remark || "";
          break;
        case "Updates":
          val = rec.Updates || rec["UPDATES"] || rec.Loan_Updates || rec.updates || "";
          break;
      }
    }

    if (val === undefined || val === null || val === "") return "-";
    return val;
  }

  function renderTabTable(moduleKey, records) {
    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config) return;

    const table = document.getElementById(config.tableId);
    if (!table) return;

    const countEl = document.getElementById(config.countId);
    if (countEl) countEl.textContent = `${records.length} records`;

    const thead = table.querySelector("thead");
    if (thead) {
      let ths = "<tr>";
      config.columns.forEach(col => { ths += `<th>${col.label}</th>`; });
      ths += `<th style="text-align: center; width: 105px;">Actions / कार्यवाही</th>`;
      ths += "</tr>";
      thead.innerHTML = ths;
    }

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" style="text-align: center; padding: 20px; color: #94A3B8;">No records to display.</td></tr>`;
      return;
    }

    const currentUser = API.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === "ADMIN";

    let rowsHtml = "";
    records.forEach((rec, idx) => {
      rowsHtml += "<tr>";
      config.columns.forEach(col => {
        let val = getRecordColValue(rec, col, idx);

        if (col.isLink && typeof val === "string" && val.startsWith("YH-")) {
          val = `<a href="javascript:void(0)" onclick="ReportsModule.openYouthProfileModal('${val}')" style="font-weight: 700; color: #2563EB; text-decoration: underline;">${val}</a>`;
        } else if (col.isStatusBadge && val !== "-") {
          const s = String(val).toLowerCase().trim();
          let cls = "neutral";
          if (["submitted", "registered", "placed", "completed", "established", "passed", "admitted", "joined", "available", "verified", "yes"].includes(s)) cls = "success";
          else if (["pending", "in progress", "shortlisted", "applied"].includes(s)) cls = "warning";
          else if (["rejected", "dropped", "failed", "inactive", "incomplete", "no"].includes(s)) cls = "danger";
          val = `<span class="badge ${cls}">${val}</span>`;
        } else if (col.isBadge && val !== "-") {
          val = `<span class="badge ${col.isBadge}">${val}</span>`;
        } else if (col.isMoney && !isNaN(val) && val !== "-") {
          val = "₹" + Number(val).toLocaleString("en-IN");
        }

        rowsHtml += `<td>${val}</td>`;
      });

      // Actions column (View, Edit, Delete only for Admin)
      const recId = rec[config.idField] || rec.Entrepreneur_ID || rec.Youth_ID || (idx + 1);
      const youthId = rec.Youth_ID || "";
      rowsHtml += `
        <td style="text-align: center; white-space: nowrap;">
          ${youthId ? `<button type="button" class="btn-action-icon view" onclick="ReportsModule.openYouthProfileModal('${youthId}')" title="360° Profile"><i class="fas fa-id-card"></i></button>` : ''}
          <button type="button" class="btn-action-icon edit" onclick="Forms.openEditModal('${moduleKey}', '${recId}')" title="Edit Record"><i class="fas fa-edit"></i></button>
          ${isAdmin ? `<button type="button" class="btn-action-icon delete" onclick="Forms.confirmDeleteRecord('${moduleKey}', '${recId}')" title="Delete Record (Admin Only)"><i class="fas fa-trash-alt"></i></button>` : ''}
        </td>
      `;
      rowsHtml += "</tr>";
    });

    tbody.innerHTML = rowsHtml;
  }

  function setupTableSearchInputs() {
    Object.keys(TAB_TABLE_CONFIGS).forEach(moduleKey => {
      const config = TAB_TABLE_CONFIGS[moduleKey];
      const searchInput = document.getElementById(config.searchId);
      if (searchInput) {
        searchInput.addEventListener("input", function() {
          const query = this.value.toLowerCase().trim();
          const allRecords = tableDataCache[moduleKey] || [];
          if (!query) {
            renderTabTable(moduleKey, allRecords);
            return;
          }
          const filtered = allRecords.filter((rec, idx) => {
            return config.columns.some(col => {
              const val = String(getRecordColValue(rec, col, idx) || "").toLowerCase();
              return val.includes(query);
            });
          });
          renderTabTable(moduleKey, filtered);
        });
      }
    });
  }

  /**
   * Add CSV Export buttons above each table
   */
  function setupTableExportButtons() {
    Object.keys(TAB_TABLE_CONFIGS).forEach(moduleKey => {
      const config = TAB_TABLE_CONFIGS[moduleKey];
      const table = document.getElementById(config.tableId);
      if (!table) return;
      const card = table.closest(".form-card");
      if (!card) return;

      let btn = card.querySelector(".btn-table-export-csv");
      if (!btn) {
        const toolbar = card.querySelector(".table-actions") || card.querySelector(".table-header-toolbar") || card.querySelector(".form-header > div:last-child");
        if (toolbar) {
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn-tb-secondary btn-table-export-csv";
          btn.innerHTML = '<i class="fas fa-file-csv text-emerald"></i> <span>Export CSV</span>';
          btn.title = "Export all records to CSV file";
          const drawerBtn = toolbar.querySelector(".btn-open-drawer");
          if (drawerBtn) {
            toolbar.insertBefore(btn, drawerBtn);
          } else {
            toolbar.appendChild(btn);
          }
        }
      }

      if (btn && !btn.getAttribute("data-export-bound")) {
        btn.setAttribute("data-export-bound", "1");
        btn.addEventListener("click", () => exportTableCSV(moduleKey));
      }
    });
  }

  /**
   * Export Table Data as CSV File
   */
  function exportTableCSV(moduleKey) {
    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config) return;
    const records = tableDataCache[moduleKey] || [];
    if (records.length === 0) {
      App.showToast("No records available to export.", "warning");
      return;
    }

    const headers = config.columns.map(c => `"${c.label}"`).join(",");
    const rows = records.map((r, idx) => {
      return config.columns.map(c => {
        let val = getRecordColValue(r, c, idx);
        if (val === "-") val = "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    }).join("\n");

    const csvContent = headers + "\n" + rows;
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.sheetName}_Records_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    App.showToast(`Exported ${records.length} records to CSV.`, "success");
  }

  /**
   * Quick Edit Modal Logic
   */
  function setupQuickEditModal() {
    const editForm = document.getElementById("quickEditForm");
    if (editForm) {
      editForm.addEventListener("submit", handleQuickEditSubmit);
    }
  }

  function openEditModal(moduleKey, recordId) {
    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config) return;
    const records = tableDataCache[moduleKey] || [];
    let recordIndex = records.findIndex(r => String(r[config.idField]) === String(recordId));
    if (recordIndex === -1) {
      recordIndex = records.findIndex(r => String(r.Entrepreneur_ID || r.Youth_ID || "") === String(recordId));
    }
    const record = recordIndex !== -1 ? records[recordIndex] : null;
    if (!record) {
      App.showToast("Record not found.", "error");
      return;
    }

    const modal = document.getElementById("quickEditModal");
    const titleEl = document.getElementById("quickEditModalTitle");
    const container = document.getElementById("quickEditFieldsContainer");
    const modInput = document.getElementById("editModuleKey");
    const recInput = document.getElementById("editRecordId");

    if (titleEl) {
      titleEl.innerHTML = `<i class="fas fa-edit text-primary"></i> Edit ${config.sheetName} (<span class="badge info">${recordId}</span>)`;
    }
    if (modInput) modInput.value = moduleKey;
    if (recInput) recInput.value = recordId;

    if (container) {
      let html = "";
      config.columns.forEach(col => {
        let val = getRecordColValue(record, col, recordIndex);
        if (val === "-") val = "";
        const isReadonly = col.key === config.idField || col.isSerial;
        html += `
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 12px; font-weight: 600;">${col.label}</label>
            <input type="text" name="${col.key}" class="form-control" value="${String(val).replace(/"/g, '&quot;')}" ${isReadonly ? 'readonly style="background:#F1F5F9;"' : ''}>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    if (modal) modal.classList.add("active");
  }

  async function handleQuickEditSubmit(e) {
    e.preventDefault();
    const modInput = document.getElementById("editModuleKey");
    const recInput = document.getElementById("editRecordId");
    const moduleKey = modInput ? modInput.value : "";
    const recordId = recInput ? recInput.value : "";
    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config || !recordId) return;

    const form = document.getElementById("quickEditForm");
    const formData = new FormData(form);
    const updatedData = {};
    formData.forEach((val, key) => {
      if (key !== "editModuleKey" && key !== "editRecordId") {
        updatedData[key] = val;
      }
    });

    const btn = document.getElementById("btnSaveQuickEdit");
    const originalText = btn ? btn.innerHTML : "Save";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const res = await API.call("updateRecord", {
        sheetName: config.sheetName,
        idField: config.idField,
        idValue: recordId,
        updatedData
      });

      if (res && res.success) {
        App.showToast(res.message || "Record updated successfully.", "success");
        const modal = document.getElementById("quickEditModal");
        if (modal) modal.classList.remove("active");
        loadTabTable(moduleKey);
        DashboardModule.loadDashboard();
      } else {
        App.showToast(res.message || "Failed to update record.", "error");
      }
    } catch (err) {
      App.showToast("Update failed: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  }

  async function confirmDeleteRecord(moduleKey, recordId) {
    const currentUser = API.getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      App.showToast("रिकॉर्ड हटाने की अनुमति केवल जिला रोजगार अधिकारी (Admin) को है।", "error");
      return;
    }

    const config = TAB_TABLE_CONFIGS[moduleKey];
    if (!config || !recordId) return;

    if (!confirm(`Are you sure you want to delete ${config.sheetName} record [${recordId}]? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await API.call("deleteRecord", {
        sheetName: config.sheetName,
        idField: config.idField,
        idValue: recordId
      });

      if (res && res.success) {
        App.showToast(res.message || "Record deleted successfully.", "success");
        loadTabTable(moduleKey);
        DashboardModule.loadDashboard();
      } else {
        App.showToast(res.message || "Failed to delete record.", "error");
      }
    } catch (err) {
      App.showToast("Delete failed: " + err.message, "error");
    }
  }

  // =========================================================================
  // BULK EXCEL UPLOAD SYSTEM
  // =========================================================================
  let activeBulkModuleKey = "youth_master";

  const BULK_TEMPLATE_CONFIGS = {
    youth_master: {
      sheetName: "Youth_Master",
      title: "Youth Master / नवीन युवा पंजीयन",
      apiAction: "addYouth",
      headers: [
        "Youth_Name", "Father_Husband_Name", "Mobile_Number", "Gender", "DOB", "Age",
        "Category", "Aadhaar_Number", "Qualification", "Occupation", "District", "Block",
        "Gram_Panchayat", "Village", "Address", "Career_Interest", "Registration_Date",
        "Follow_Up_Status", "Remarks"
      ],
      sample: {
        Youth_Name: "Ramesh Kumar",
        Father_Husband_Name: "Suresh Kumar",
        Mobile_Number: "9406123456",
        Gender: "Male",
        DOB: "2002-05-15",
        Age: 24,
        Category: "ST",
        Aadhaar_Number: "123456789012",
        Qualification: "12th Pass",
        Occupation: "Unemployed",
        District: "Dantewada",
        Block: "Dantewada",
        Gram_Panchayat: "Chitalanka",
        Village: "Chitalanka",
        Address: "Ward No 4",
        Career_Interest: "Electrician",
        Registration_Date: "2026-10-05",
        Follow_Up_Status: "Pending",
        Remarks: "Interested in skill training"
      }
    },
    mobilization: {
      sheetName: "Mobilization",
      title: "Mobilization / मोबिलाइजेशन शिविर",
      apiAction: "addMobilization",
      headers: [
        "Date", "Financial_Year", "Month", "Block", "Gram_Panchayat", "Village",
        "Activity_Name", "Mobilization_Source", "Mobilizer_Name", "Male", "Female",
        "Other", "Total_Mobilized", "Remarks"
      ],
      sample: {
        Date: "2026-10-05",
        Financial_Year: "2026-27",
        Month: "October",
        Block: "Dantewada",
        Gram_Panchayat: "Chitalanka",
        Village: "Chitalanka",
        Activity_Name: "Rojgar Mela Mobilization",
        Mobilization_Source: "Gram Sabha",
        Mobilizer_Name: "Sunil Yadav",
        Male: 15,
        Female: 12,
        Other: 0,
        Total_Mobilized: 27,
        Remarks: "High youth turnout"
      }
    },
    mform: {
      sheetName: "M_Form",
      title: "M-Form / एम-फॉर्म पंजीयन",
      apiAction: "addMForm",
      headers: [
        "Youth_ID", "Youth_Name", "Mobile", "Date", "Block", "GP", "Village",
        "MForm_Status", "MForm_Reg_No", "Follow_Up_Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Mobile: "9406123456",
        Date: "2026-10-05",
        Block: "Dantewada",
        GP: "Chitalanka",
        Village: "Chitalanka",
        MForm_Status: "Registered",
        MForm_Reg_No: "MF-9901",
        Follow_Up_Status: "Active",
        Remarks: "Documents verified"
      }
    },
    mybharat: {
      sheetName: "My_Bharat",
      title: "My Bharat / माय भारत पोर्टल",
      apiAction: "addMyBharat",
      headers: [
        "Youth_ID", "Youth_Name", "Mobile", "Registration_Date", "Block", "GP",
        "MyBharat_Reg_No", "Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Mobile: "9406123456",
        Registration_Date: "2026-10-05",
        Block: "Dantewada",
        GP: "Chitalanka",
        MyBharat_Reg_No: "MB-2026-110",
        Status: "Registered",
        Remarks: "Portal registration done"
      }
    },
    counselling: {
      sheetName: "Counselling",
      title: "Counselling / परामर्श / काउंसलिंग",
      apiAction: "addCounselling",
      headers: [
        "Youth_ID", "Youth_Name", "Date", "Block", "Counselling_Type",
        "Career_Interest", "Counsellor_Name", "Counselling_Outcome",
        "Follow_Up_Required", "Follow_Up_Date", "Follow_Up_Status",
        "Pending_Issue", "Recommended_Action", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Date: "2026-10-05",
        Block: "Dantewada",
        Counselling_Type: "Individual",
        Career_Interest: "Electrician",
        Counsellor_Name: "Rahul Verma",
        Counselling_Outcome: "Shortlisted for ITI",
        Follow_Up_Required: "Yes",
        Follow_Up_Date: "2026-10-20",
        Follow_Up_Status: "Pending",
        Pending_Issue: "None",
        Recommended_Action: "Send to ITI center",
        Remarks: "Session completed"
      }
    },
    skill_training: {
      sheetName: "Skill_Training",
      title: "Skill Training / कौशल प्रशिक्षण",
      apiAction: "addSkillTraining",
      headers: [
        "Youth_ID", "Youth_Name", "Training_Name", "Skill_Trade", "Training_Provider",
        "Course", "Start_Date", "End_Date", "Training_Status", "Completion_Status",
        "Certificate_Status", "Employment_After_Training", "Follow_Up_Date",
        "Follow_Up_Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Training_Name: "Livelihood College Dantewada",
        Skill_Trade: "Electrician",
        Training_Provider: "Livelihood College",
        Course: "Domestic Electrical",
        Start_Date: "2026-10-10",
        End_Date: "2026-12-10",
        Training_Status: "In Progress",
        Completion_Status: "Pending",
        Certificate_Status: "Pending",
        Employment_After_Training: "Pending",
        Follow_Up_Date: "2026-11-01",
        Follow_Up_Status: "Regular attendance",
        Remarks: "Batch 1"
      }
    },
    emp_registered: {
      sheetName: "Employment_Registered",
      title: "Employment Registration / रोजगार पंजीयन",
      apiAction: "addEmploymentRegistered",
      headers: [
        "Youth_ID", "Youth_Name", "Registration_Date", "Block", "Qualification",
        "Preferred_Job", "Registration_Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Registration_Date: "2026-10-05",
        Block: "Dantewada",
        Qualification: "12th Pass",
        Preferred_Job: "Electrician / Field Tech",
        Registration_Status: "Registered",
        Remarks: "Registered for local jobs"
      }
    },
    emp_linked: {
      sheetName: "Employment_Linked",
      title: "Employment Linked / रोजगार लिंकेज",
      apiAction: "addEmploymentLinked",
      headers: [
        "Youth_ID", "Youth_Name", "Employer_Name", "Job_Role", "Placement_Date",
        "Salary", "Employment_Type", "Location", "Status", "Follow_Up_Date",
        "Follow_Up_Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Employer_Name: "NMDC Contractor Services",
        Job_Role: "Field Assistant",
        Placement_Date: "2026-10-05",
        Salary: 14500,
        Employment_Type: "Full Time",
        Location: "Kirandul",
        Status: "Placed",
        Follow_Up_Date: "2026-11-05",
        Follow_Up_Status: "Working",
        Remarks: "Offer letter issued"
      }
    },
    education: {
      sheetName: "Education",
      title: "Higher Education / उच्च शिक्षा",
      apiAction: "addEducation",
      headers: [
        "Youth_ID", "Youth_Name", "Current_Qualification", "Education_Goal",
        "Institution_Name", "Course", "Admission_Date", "Block", "GP", "Status", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Youth_Name: "Ramesh Kumar",
        Current_Qualification: "12th Pass",
        Education_Goal: "Graduation",
        Institution_Name: "Govt PG College Dantewada",
        Course: "BA 1st Year",
        Admission_Date: "2026-10-05",
        Block: "Dantewada",
        GP: "Chitalanka",
        Status: "Enrolled",
        Remarks: "Fee concession applied"
      }
    },
    entrepreneurship: {
      sheetName: "Entrepreneurs",
      title: "Entrepreneurs / उद्यमिता विकास",
      apiAction: "addEntrepreneur",
      headers: [
        "S.NO", "BLOCK", "NAME", "FATHER NAME", "VILLAGE", "BLOCK",
        "MOBILE NO.", "BUSINESS", "LONE AMOUNT", "UDHYAM REGISTRATION",
        "BANK DOCUMENTS", "PAN CARD", "ADHAR CARD", "VOTER CARD",
        "QUOTATION", "REMARK", "UPDATES"
      ],
      sample: {
        "S.NO": 1,
        "BLOCK": "Dantewada",
        "NAME": "Ramesh Kumar",
        "FATHER NAME": "Suresh Kumar",
        "VILLAGE": "Chitalanka",
        "BLOCK": "Dantewada",
        "MOBILE NO.": "9406123456",
        "BUSINESS": "Dairy Farming Unit",
        "LONE AMOUNT": 100000,
        "UDHYAM REGISTRATION": "Available",
        "BANK DOCUMENTS": "Submitted",
        "PAN CARD": "Available",
        "ADHAR CARD": "Verified",
        "VOTER CARD": "Available",
        "QUOTATION": "Submitted",
        "REMARK": "Loan application under process",
        "UPDATES": "Sanction pending at bank branch"
      }
    },
    navgurukul: {
      sheetName: "NavGurukul",
      title: "NavGurukul / नवगुरुकुल कोडिंग",
      apiAction: "addNavGurukul",
      headers: [
        "Youth_ID", "Candidate_Name", "Mobile", "Block", "GP", "Qualification",
        "Registration_Date", "Selection_Status", "Admission_Status", "Joining_Date", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Candidate_Name: "Anita Sori",
        Mobile: "9406123456",
        Block: "Geedam",
        GP: "Kasoli",
        Qualification: "12th Pass",
        Registration_Date: "2026-10-05",
        Selection_Status: "Shortlisted",
        Admission_Status: "Admitted",
        Joining_Date: "2026-10-15",
        Remarks: "Selected for software batch"
      }
    },
    trainings: {
      sheetName: "Trainings",
      title: "Trainings Conducted / आयोजित प्रशिक्षण",
      apiAction: "addTraining",
      headers: [
        "Training_Name", "Training_Type", "Date", "Start_Date", "End_Date",
        "Block", "GP", "Venue", "Training_Provider", "Trainer_Name",
        "Male_Participants", "Female_Participants", "Total_Participants",
        "Training_Topic", "Outcome", "Remarks"
      ],
      sample: {
        Training_Name: "Youth Leadership Workshop",
        Training_Type: "Soft Skills",
        Date: "2026-10-05",
        Start_Date: "2026-10-05",
        End_Date: "2026-10-07",
        Block: "Dantewada",
        GP: "Chitalanka",
        Venue: "Youth Hub Dantewada",
        Training_Provider: "District Administration",
        Trainer_Name: "Pooja Sharma",
        Male_Participants: 20,
        Female_Participants: 15,
        Total_Participants: 35,
        Training_Topic: "Personality Development",
        Outcome: "Certificates Distributed",
        Remarks: "3-day workshop concluded"
      }
    },
    activities: {
      sheetName: "Activities",
      title: "Youth Hub Activities / गतिविधियां",
      apiAction: "addActivity",
      headers: [
        "Date", "Activity_Type", "Activity_Name", "Block", "GP", "Village",
        "Participants", "Description", "Outcome"
      ],
      sample: {
        Date: "2026-10-05",
        Activity_Type: "Awareness Camp",
        Activity_Name: "Career Guidance Fair",
        Block: "Dantewada",
        GP: "Chitalanka",
        Village: "Chitalanka",
        Participants: 85,
        Description: "Career awareness camp for 12th pass students",
        Outcome: "60 youth registered on portal"
      }
    },
    rehabilitation: {
      sheetName: "Rehabilitation",
      title: "Rehabilitation / आत्मसमर्पण एवं पुनर्वास",
      apiAction: "addRehabilitation",
      headers: [
        "Youth_ID", "Candidate_Name", "Father_Husband_Name", "Mobile", "Block", "GP",
        "Village", "Surrender_Date", "Rehabilitation_Status", "Assistance_Type",
        "Assistance_Amount", "Scheme_Linked", "Employment_Status", "Current_Status",
        "Follow_Up_Date", "Follow_Up_Status", "Pending_Issue", "Remarks"
      ],
      sample: {
        Youth_ID: "YH-2026-0001",
        Candidate_Name: "Laxman Mandavi",
        Father_Husband_Name: "Budhram Mandavi",
        Mobile: "9406123456",
        Block: "Katekalyan",
        GP: "Bodenar",
        Village: "Bodenar",
        Surrender_Date: "2026-08-10",
        Rehabilitation_Status: "Approved",
        Assistance_Type: "Financial Assistance",
        Assistance_Amount: 50000,
        Scheme_Linked: "Punarwas Niti",
        Employment_Status: "Self-Employed",
        Current_Status: "Active",
        Follow_Up_Date: "2026-10-25",
        Follow_Up_Status: "Satisfactory",
        Pending_Issue: "None",
        Remarks: "Rehabilitation package granted"
      }
    },
    iim_raipur: {
      sheetName: "IIM_Raipur",
      title: "IIM Raipur / आईआईएम रायपुर उद्यमिता",
      apiAction: "addIIMRaipur",
      headers: [
        "Candidate_Name", "Father_Husband_Name", "Age", "Category", "Address",
        "Village", "Block", "District", "Mobile_Number", "Aadhaar_Number",
        "Latest_Exam_Percentage", "Stream_Subject", "Vocational_Course",
        "Current_Occupation", "Selection_Status", "Batch", "Activity_Name",
        "Financial_Assistance_Amount", "Installment_2nd", "Remarks"
      ],
      sample: {
        Candidate_Name: "Prakash Markam",
        Father_Husband_Name: "Ganga Markam",
        Age: 23,
        Category: "ST",
        Address: "Main Road Kuakonda",
        Village: "Kuakonda",
        Block: "Kuakonda",
        District: "Dantewada",
        Mobile_Number: "9406123456",
        Aadhaar_Number: "123456789012",
        Latest_Exam_Percentage: "74%",
        Stream_Subject: "Commerce",
        Vocational_Course: "Computer DCA",
        Current_Occupation: "Unemployed",
        Selection_Status: "Selected",
        Batch: "Batch 2",
        Activity_Name: "Food Processing Unit",
        Financial_Assistance_Amount: 75000,
        Installment_2nd: "Released",
        Remarks: "Trained in entrepreneurship"
      }
    },
    shasan_sahyog: {
      sheetName: "Shasan_Sahyog",
      title: "Shasan Sahyog / शासन से सहयोग",
      apiAction: "addShasanSahyog",
      headers: [
        "Name", "Father_Husband_Name", "DOB", "Address", "Village", "Block",
        "District", "Mobile_Number", "Assistance_Required", "Status", "Remarks"
      ],
      sample: {
        Name: "Sunita Kashyap",
        Father_Husband_Name: "Kailash Kashyap",
        DOB: "1998-07-20",
        Address: "Ward 2 Geedam",
        Village: "Geedam",
        Block: "Geedam",
        District: "Dantewada",
        Mobile_Number: "9406123456",
        Assistance_Required: "Self-Help Group Sewing Machine Loan",
        Status: "Approved",
        Remarks: "Application forwarded to Dept"
      }
    }
  };

  const COLUMN_ALIASES = {
    youth_id: ["youthid", "id", "candidateid", "studentid", "युवाआईडी"],
    youth_name: ["youthname", "name", "candidatename", "fullname", "युवाकानाम", "युवानाम", "नाम", "अभ्यर्थीकानाम"],
    name: ["name", "youthname", "candidatename", "fullname", "नाम", "आवेदककानाम"],
    candidate_name: ["candidatename", "name", "youthname", "fullname", "नाम", "अभ्यर्थीकानाम"],
    father_husband_name: ["fatherhusbandname", "fathername", "husbandname", "parentname", "guardianname", "guardian", "पिताकानाम", "पतिपिताकानाम", "पालककानाम"],
    father_name: ["fathername", "fatherhusbandname", "parentname", "guardianname", "पिताकानाम"],
    mobile_number: ["mobilenumber", "mobile", "phone", "contact", "phonenumber", "मोबाइलनंबर", "मोबाइल", "फोननंबर"],
    mobile: ["mobile", "mobilenumber", "phone", "contact", "मोबाइलनंबर", "मोबाइल"],
    gender: ["gender", "sex", "लिंग"],
    dob: ["dob", "dateofbirth", "birthdate", "जन्मतिथि"],
    age: ["age", "उम्र", "आयु"],
    category: ["category", "caste", "वर्ग", "जाति"],
    aadhaar_number: ["aadhaarnumber", "aadhaar", "aadhar", "aadharno", "आधारनंबर", "आधार"],
    qualification: ["qualification", "currentqualification", "education", "शैक्षणिकयोग्यता", "योग्यता"],
    current_qualification: ["currentqualification", "qualification", "education", "योग्यता"],
    occupation: ["occupation", "job", "profession", "व्यवसाय"],
    district: ["district", "districtname", "जिला"],
    block: ["block", "blockname", "विकासखंड", "ब्लॉक"],
    gram_panchayat: ["grampanchayat", "gp", "panchayat", "ग्रामपंचायत"],
    gp: ["gp", "grampanchayat", "panchayat", "ग्रामपंचायत"],
    village: ["village", "villagename", "para", "गांव", "ग्राम"],
    address: ["address", "fulladdress", "पता"],
    career_interest: ["careerinterest", "interest", "sector", "रुचि"],
    date: ["date", "eventdate", "campdate", "दिनांक"],
    registration_date: ["registrationdate", "regdate", "date", "पंजीयनदिनांक", "दिनांक"],
    remarks: ["remarks", "remark", "note", "notes", "टिप्पणी"],
    s_no: ["sno", "s_no", "srno", "serialno", "slno", "s_n", "क्र"],
    business: ["business", "businessidea", "businesstype", "businessname", "unitname", "व्यवसाय", "उद्यम"],
    loan_amount: ["loanamount", "loneamount", "loan", "ऋणराशि", "लोनराशि"],
    lone_amount: ["loneamount", "loanamount", "loan", "ऋणराशि", "लोनराशि"],
    udyam_registration: ["udyamregistration", "udhyamregistration", "udyamreg", "udyam", "उद्यमपंजीयन"],
    udhyam_registration: ["udhyamregistration", "udyamregistration", "udyamreg", "udyam", "उद्यमपंजीयन"],
    bank_documents: ["bankdocuments", "bankdocs", "bankdocument", "बैंकदस्तावेज"],
    pan_card: ["pancard", "pan", "पैनकार्ड", "पैन"],
    aadhar_card: ["aadharcard", "adharcard", "aadhar", "aadhaarnumber", "आधारकार्ड", "आधार"],
    adhar_card: ["adharcard", "aadharcard", "aadhar", "aadhaarnumber", "आधारकार्ड", "आधार"],
    voter_card: ["votercard", "voterid", "voter", "मतदातापरिचयपत्र", "वोटरकार्ड"],
    quotation: ["quotation", "quote", "कोटेशन"],
    updates: ["updates", "update", "loanupdates", "statusupdate", "अद्यतन"]
  };

  function formatExcelValue(val, key) {
    if (val === undefined || val === null) return "";
    const isDateField = /date|dob/i.test(key);
    if (isDateField) {
      if (val instanceof Date) {
        if (!isNaN(val.getTime())) {
          return val.toISOString().split("T")[0];
        }
      }
      if (typeof val === "number") {
        const d = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(d.getTime())) {
          return d.toISOString().split("T")[0];
        }
      }
      const s = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const dmy = s.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
      if (dmy) {
        return `${dmy[3]}-${("0" + dmy[2]).slice(-2)}-${("0" + dmy[1]).slice(-2)}`;
      }
      return s;
    }

    if (typeof val === "number") {
      return String(val);
    }
    return String(val).trim();
  }

  function normalizeExcelRow(rawRow, targetHeaders) {
    const rawKeys = Object.keys(rawRow);
    const normalized = {};

    targetHeaders.forEach(targetKey => {
      const cleanTarget = targetKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      const aliases = COLUMN_ALIASES[targetKey.toLowerCase()] || [];

      let matchedRawKey = rawKeys.find(k => {
        const cleanRaw = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanRaw === cleanTarget) return true;
        if (aliases.includes(cleanRaw)) return true;
        return false;
      });

      if (matchedRawKey !== undefined) {
        normalized[targetKey] = formatExcelValue(rawRow[matchedRawKey], targetKey);
      } else {
        normalized[targetKey] = "";
      }
    });

    return normalized;
  }

  function setupBulkUploadButtons() {
    // 1. Add Bulk Upload button to all 16 tables
    Object.keys(TAB_TABLE_CONFIGS).forEach(moduleKey => {
      const config = TAB_TABLE_CONFIGS[moduleKey];
      const table = document.getElementById(config.tableId);
      if (!table) return;
      const card = table.closest(".form-card");
      if (!card) return;

      let btn = card.querySelector(".btn-table-bulk-upload");
      if (!btn) {
        const toolbar = card.querySelector(".table-actions") || card.querySelector(".table-header-toolbar") || card.querySelector(".form-header > div:last-child");
        if (toolbar) {
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn-tb-bulk btn-table-bulk-upload";
          btn.innerHTML = '<i class="fas fa-file-excel"></i> <span>Bulk Upload</span>';
          btn.title = "Bulk Upload from Excel (.xlsx, .xls, .csv)";
          
          const drawerBtn = toolbar.querySelector(".btn-open-drawer");
          if (drawerBtn) {
            toolbar.insertBefore(btn, drawerBtn);
          } else {
            toolbar.appendChild(btn);
          }
        }
      }

      if (btn && !btn.getAttribute("data-bulk-bound")) {
        btn.setAttribute("data-bulk-bound", "1");
        btn.addEventListener("click", () => openBulkUploadModal(moduleKey));
      }
    });

    // 2. Add Bulk Upload button in all slide-over drawers
    const DRAWER_FORM_MAP = {
      formYouthMaster: "youth_master",
      formMobilization: "mobilization",
      formMForm: "mform",
      formMyBharat: "mybharat",
      formCounselling: "counselling",
      formSkillTraining: "skill_training",
      formEmpRegistered: "emp_registered",
      formEmpLinked: "emp_linked",
      formEducation: "education",
      formEntrepreneur: "entrepreneurship",
      formNavGurukul: "navgurukul",
      formTrainingConducted: "trainings",
      formActivities: "activities",
      formRehabilitation: "rehabilitation",
      formIIMRaipur: "iim_raipur",
      formShasanSahyog: "shasan_sahyog"
    };

    Object.keys(DRAWER_FORM_MAP).forEach(formId => {
      const moduleKey = DRAWER_FORM_MAP[formId];
      const form = document.getElementById(formId);
      if (!form) return;
      const drawer = form.closest(".slide-over-drawer") || document.getElementById("drawer_" + formId);
      if (!drawer) return;

      const header = drawer.querySelector(".slide-over-header");
      if (header && !header.querySelector(".btn-drawer-bulk-upload")) {
        const bulkBtn = document.createElement("button");
        bulkBtn.type = "button";
        bulkBtn.className = "btn btn-secondary btn-sm btn-drawer-bulk-upload";
        bulkBtn.style.cssText = "font-size: 11.5px; padding: 4px 10px; background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; margin-right: 6px; cursor: pointer;";
        bulkBtn.innerHTML = '<i class="fas fa-file-excel" style="color: #6EE7B7 !important;"></i> Bulk Upload';
        bulkBtn.title = "Upload records in bulk via Excel";
        bulkBtn.addEventListener("click", () => {
          closeDrawer();
          openBulkUploadModal(moduleKey);
        });

        const closeBtn = header.querySelector(".btn-drawer-close");
        if (closeBtn) {
          closeBtn.parentNode.insertBefore(bulkBtn, closeBtn);
        } else {
          header.appendChild(bulkBtn);
        }
      }
    });
  }

  function setupBulkUploadModal() {
    const modal = document.getElementById("bulkUploadModal");
    const dropzone = document.getElementById("bulkUploadDropzone");
    const fileInput = document.getElementById("bulkUploadFileInput");
    const downloadBtn = document.getElementById("btnDownloadSampleTemplate");

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        downloadSampleTemplate(activeBulkModuleKey);
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processAndUploadExcelFile(e.dataTransfer.files[0], activeBulkModuleKey);
        }
      });

      fileInput.addEventListener("change", function() {
        if (this.files && this.files.length > 0) {
          processAndUploadExcelFile(this.files[0], activeBulkModuleKey);
          this.value = "";
        }
      });
    }
  }

  function openBulkUploadModal(moduleKey) {
    activeBulkModuleKey = moduleKey || "youth_master";
    const config = BULK_TEMPLATE_CONFIGS[activeBulkModuleKey] || BULK_TEMPLATE_CONFIGS.youth_master;

    const modal = document.getElementById("bulkUploadModal");
    const title = document.getElementById("bulkUploadModalTitle");
    const subtitle = document.getElementById("bulkUploadModalSubtitle");
    const statusBox = document.getElementById("bulkUploadStatusBox");
    const previewBox = document.getElementById("bulkUploadPreviewBox");
    const modInput = document.getElementById("bulkUploadModuleKey");
    const fileInput = document.getElementById("bulkUploadFileInput");

    if (modInput) modInput.value = activeBulkModuleKey;
    if (title) title.innerHTML = `<i class="fas fa-file-excel text-emerald"></i> Bulk Upload: ${config.title}`;
    if (subtitle) subtitle.textContent = `Upload records in bulk directly to Google Sheet '${config.sheetName}'`;

    if (statusBox) {
      statusBox.style.display = "none";
      statusBox.innerHTML = "";
    }
    if (previewBox) previewBox.style.display = "none";
    if (fileInput) fileInput.value = "";

    if (modal) modal.classList.add("active");
  }

  function downloadSampleTemplate(moduleKey) {
    const config = BULK_TEMPLATE_CONFIGS[moduleKey] || BULK_TEMPLATE_CONFIGS.youth_master;
    if (typeof XLSX === "undefined") {
      App.showToast("Excel library is loading, please try again in a moment.", "warning");
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const headers = config.headers;
      const sampleRow = headers.map(h => config.sample[h] !== undefined ? config.sample[h] : "");

      const wsData = [headers, sampleRow];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));

      XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
      XLSX.writeFile(wb, `${config.sheetName}_Bulk_Upload_Template.xlsx`);

      App.showToast(`Template downloaded: ${config.sheetName}_Bulk_Upload_Template.xlsx`, "success");
    } catch (e) {
      console.error("Error generating template:", e);
      App.showToast("Failed to generate Excel template: " + e.message, "error");
    }
  }

  async function processAndUploadExcelFile(file, moduleKey) {
    const config = BULK_TEMPLATE_CONFIGS[moduleKey] || BULK_TEMPLATE_CONFIGS.youth_master;
    const statusBox = document.getElementById("bulkUploadStatusBox");
    const previewBox = document.getElementById("bulkUploadPreviewBox");
    const parsedCountBadge = document.getElementById("bulkUploadParsedCount");
    const previewTable = document.getElementById("tblBulkPreview");

    if (!file) return;

    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      if (statusBox) {
        statusBox.style.display = "block";
        statusBox.innerHTML = `
          <div style="background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 8px; font-size: 13px;">
            <i class="fas fa-exclamation-triangle"></i> Invalid file type! Please select an Excel (.xlsx, .xls) or CSV file.
          </div>
        `;
      }
      return;
    }

    if (typeof XLSX === "undefined") {
      App.showToast("Excel parser is not ready yet. Please check connection.", "error");
      return;
    }

    // Step A: Show loading status
    if (statusBox) {
      statusBox.style.display = "block";
      statusBox.innerHTML = `
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 18px; color: #1E40AF;">
          <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <i class="fas fa-spinner fa-spin"></i> Reading & analyzing Excel file: <strong>${file.name}</strong>...
          </div>
          <div style="font-size: 12px; color: #3B82F6;">Validating columns and preparing records for Google Sheets...</div>
          <div class="bulk-progress-bar-bg"><div class="bulk-progress-bar-fill" style="width: 30%;"></div></div>
        </div>
      `;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rawRows || rawRows.length === 0) {
        if (statusBox) {
          statusBox.innerHTML = `
            <div style="background: #FEF3C7; color: #B45309; padding: 12px 16px; border-radius: 8px; font-size: 13px;">
              <i class="fas fa-info-circle"></i> Excel sheet appears to be empty! No data rows found to upload.
            </div>
          `;
        }
        return;
      }

      // Step B: Normalize rows
      const targetHeaders = config.headers;
      const validRecords = [];

      const currentUser = API.getCurrentUser();
      const userBlock = (currentUser && currentUser.block && currentUser.block !== "All") ? currentUser.block : null;

      rawRows.forEach(rawRow => {
        const norm = normalizeExcelRow(rawRow, targetHeaders);
        const hasContent = Object.values(norm).some(v => String(v).trim().length > 0);
        if (hasContent) {
          if (userBlock && norm.Block !== undefined) {
            norm.Block = userBlock;
          }
          validRecords.push(norm);
        }
      });

      if (validRecords.length === 0) {
        if (statusBox) {
          statusBox.innerHTML = `
            <div style="background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 8px; font-size: 13px;">
              <i class="fas fa-times-circle"></i> No valid data found in the uploaded file.
            </div>
          `;
        }
        return;
      }

      // Step C: Update status to uploading directly to Sheet
      if (statusBox) {
        statusBox.innerHTML = `
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 18px; color: #1E40AF;">
            <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <i class="fas fa-cloud-upload-alt fa-bounce"></i> Adding <strong>${validRecords.length} records</strong> to Google Sheet ('${config.sheetName}')...
            </div>
            <div style="font-size: 12px; color: #3B82F6;">Please wait while records are committed directly to Google Sheets database...</div>
            <div class="bulk-progress-bar-bg"><div class="bulk-progress-bar-fill" style="width: 70%;"></div></div>
          </div>
        `;
      }

      // Step D: Send records to Backend (immediate addition)
      let uploadSuccess = false;
      let insertedCount = 0;
      let responseMsg = "";

      // 1. Try bulkInsert API action
      const bulkRes = await API.call("bulkInsert", {
        sheetName: config.sheetName,
        records: validRecords
      });

      if (bulkRes && bulkRes.success) {
        uploadSuccess = true;
        insertedCount = bulkRes.count || validRecords.length;
        responseMsg = bulkRes.message || `${insertedCount} records added successfully.`;
      } else {
        console.warn("bulkInsert endpoint returned:", bulkRes, "- Trying sequential fallback...");
        let successCount = 0;
        const apiAction = config.apiAction;

        for (let i = 0; i < validRecords.length; i++) {
          const rec = validRecords[i];
          try {
            const singleRes = await API.call(apiAction, rec);
            if (singleRes && singleRes.success) {
              successCount++;
            }
          } catch (e) {
            console.error("Error inserting record", rec, e);
          }
          if (statusBox) {
            const pct = Math.round(((i + 1) / validRecords.length) * 100);
            const fill = statusBox.querySelector(".bulk-progress-bar-fill");
            if (fill) fill.style.width = pct + "%";
          }
        }

        if (successCount > 0) {
          uploadSuccess = true;
          insertedCount = successCount;
          responseMsg = `${insertedCount} of ${validRecords.length} records added successfully.`;
        } else {
          throw new Error(bulkRes && bulkRes.message ? bulkRes.message : "Failed to insert records into sheet.");
        }
      }

      // Step E: Render Success & Preview
      if (uploadSuccess) {
        if (statusBox) {
          statusBox.innerHTML = `
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 14px 18px; color: #065F46;">
              <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <i class="fas fa-check-circle" style="font-size: 20px; color: #059669;"></i> सफ़ल! ${insertedCount} रिकॉर्ड्स '${config.sheetName}' शीट में जोड़ दिए गए हैं!
              </div>
              <div style="font-size: 12px; color: #047857;">
                ${responseMsg} सभी रिकॉर्ड्स डेटाबेस में लाइव सुरक्षित हो चुके हैं।
              </div>
            </div>
          `;
        }

        // Render preview table
        if (previewBox && previewTable) {
          previewBox.style.display = "block";
          if (parsedCountBadge) parsedCountBadge.textContent = `${insertedCount} records added`;

          const thead = previewTable.querySelector("thead");
          const tbody = previewTable.querySelector("tbody");
          const previewCols = targetHeaders.slice(0, 6);

          if (thead) {
            thead.innerHTML = "<tr>" + previewCols.map(c => `<th>${c}</th>`).join("") + "</tr>";
          }

          if (tbody) {
            const previewRows = validRecords.slice(0, 5);
            tbody.innerHTML = previewRows.map(row => {
              return "<tr>" + previewCols.map(c => `<td>${row[c] || "-"}</td>`).join("") + "</tr>";
            }).join("");
          }
        }

        // Immediate reload of the active table & dashboard
        loadTabTable(moduleKey);
        DashboardModule.loadDashboard();
        App.showToast(`✅ ${insertedCount} records added to ${config.sheetName} sheet!`, "success");
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      if (statusBox) {
        statusBox.innerHTML = `
          <div style="background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; padding: 14px 18px; border-radius: 8px; font-size: 13px;">
            <div style="font-weight: 700; margin-bottom: 4px;">
              <i class="fas fa-times-circle"></i> Upload Failed / अपलोड असफल
            </div>
            <div>${err.message || "Failed to process file and save to Google Sheets."}</div>
          </div>
        `;
      }
    }
  }

  /**
   * Automatically inject "Save & Add Another" button in all form footers
   */
  function setupSaveAndAddAnotherButtons() {
    document.querySelectorAll("form[id^='form']").forEach(form => {
      if (form.id === "loginForm" || form.id === "quickEditForm") return;
      const footer = form.querySelector(".form-footer");
      if (!footer) return;

      if (!footer.querySelector(".btn-save-and-add")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-save-and-add";
        btn.innerHTML = '<i class="fas fa-plus-circle"></i> Save & Add Another / सुरक्षित करें एवं नया जोड़ें';
        btn.title = "Save this record and retain location/date context for the next candidate";
        btn.addEventListener("click", () => {
          form.dataset.saveAndAdd = "true";
          if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
          } else {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          }
        });
        footer.appendChild(btn);
      }
    });
  }

  /**
   * Bind submissions for all forms with context retention on "Save & Add Another"
   */
  function bindFormSubmissions() {
    // 1. Youth Master Form
    bindSubmit("formYouthMaster", "addYouth", "youth_master", () => {
      const mob = document.getElementById("ymMobile").value.trim();
      if (!/^[6-9]\d{9}$/.test(mob)) {
        App.showToast("Please enter a valid 10-digit mobile number.", "error");
        return false;
      }
      return true;
    });

    // 2. Mobilization Form
    bindSubmit("formMobilization", "addMobilization", "mobilization");

    // 3. M-Form
    bindSubmit("formMForm", "addMForm", "mform");

    // 4. My Bharat Form
    bindSubmit("formMyBharat", "addMyBharat", "mybharat");

    // 5. Counselling Form
    bindSubmit("formCounselling", "addCounselling", "counselling");

    // 6. Skill Training Form
    bindSubmit("formSkillTraining", "addSkillTraining", "skill_training");

    // 7. Employment Registered
    bindSubmit("formEmpRegistered", "addEmploymentRegistered", "emp_registered");

    // 8. Employment Linked
    bindSubmit("formEmpLinked", "addEmploymentLinked", "emp_linked");

    // 9. Education Linked
    bindSubmit("formEducation", "addEducation", "education");

    // 10. Entrepreneurship Form
    bindSubmit("formEntrepreneur", "addEntrepreneur", "entrepreneurship");

    // 11. NavGurukul Form
    bindSubmit("formNavGurukul", "addNavGurukul", "navgurukul");

    // 12. Trainings Conducted Form
    bindSubmit("formTrainingConducted", "addTraining", "trainings");

    // 13. Activities Form
    bindSubmit("formActivities", "addActivity", "activities");

    // 14. Rehabilitation Form (आत्मसमर्पण एवं पुनर्वास)
    bindSubmit("formRehabilitation", "addRehabilitation", "rehabilitation");

    // 15. IIM Raipur Form (आईआईएम रायपुर उद्यमिता)
    bindSubmit("formIIMRaipur", "addIIMRaipur", "iim_raipur");

    // 16. Govt Assistance / Shasan Sahyog (शासन से सहयोग)
    bindSubmit("formShasanSahyog", "addShasanSahyog", "shasan_sahyog");
  }

  function bindSubmit(formId, apiAction, moduleKey, preValidate) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      if (preValidate && !preValidate()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "Save";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      }

      try {
        const formData = new FormData(form);
        const payload = {};
        formData.forEach((value, key) => { payload[key] = value; });

        // Enforce assigned Block for Hub Operators even if select is disabled
        const currentUser = API.getCurrentUser();
        if (currentUser && currentUser.block && currentUser.block !== "All") {
          payload.Block = currentUser.block;
        }

        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput && fileInput.dataset && fileInput.dataset.base64) {
          const uploadRes = await API.call("uploadFile", {
            base64Data: fileInput.dataset.base64,
            fileName: fileInput.dataset.filename,
            mimeType: fileInput.dataset.mimetype,
            subFolder: apiAction
          });
          if (uploadRes && uploadRes.success) {
            payload.Photo_URL = uploadRes.fileUrl;
            payload.Drive_File_ID = uploadRes.fileId;
            payload.Photos_URL = uploadRes.fileUrl;
          }
        }

        const res = await API.call(apiAction, payload);

        if (res && res.success) {
          const isAddAnother = form.dataset.saveAndAdd === "true";
          form.dataset.saveAndAdd = "false";

          // Capture context fields before reset
          let contextValues = {};
          if (isAddAnother) {
            const contextKeys = [
              "Date", "Registration_Date", "Start_Date", "Placement_Date", "Admission_Date", "Identification_Date", "Surrender_Date",
              "Block", "Gram_Panchayat", "GP", "Village", "Venue", "Activity_Name", "Activity_Type",
              "Counsellor_Name", "Counselling_Type", "Training_Provider", "Training_Name", "Training_Type",
              "Employer_Name", "Job_Role", "Location", "Employment_Type",
              "Institution_Name", "Course", "Business_Category", "Bank_Name", "Loan_Scheme", "Assistance_Type"
            ];
            contextKeys.forEach(k => {
              const el = form.querySelector(`[name="${k}"]`);
              if (el && el.value) contextValues[k] = el.value;
            });
          }

          App.showToast(
            isAddAnother 
              ? (res.message || "Record saved!") + " Ready for next candidate (Context retained)." 
              : (res.message || "Data saved successfully."),
            "success"
          );

          form.reset();

          // Restore context if add another
          if (isAddAnother) {
            Object.keys(contextValues).forEach(k => {
              const el = form.querySelector(`[name="${k}"]`);
              if (el) {
                el.value = contextValues[k];
                if (el.hasAttribute("data-block-select")) {
                  el.dispatchEvent(new Event("change"));
                }
              }
            });
            // Focus on first candidate input
            const firstInput = form.querySelector('input[type="text"]:not([readonly]), input[type="tel"]');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
          }

          // Clear verified cards and warnings
          form.querySelectorAll(".youth-verified-card, .duplicate-warning").forEach(c => c.remove());
          form.querySelectorAll("img[data-preview-img]").forEach(img => {
            img.src = "";
            img.style.display = "none";
          });

          // Re-initialize date inputs to today if cleared
          initializeDateDefaults();

          // If standard save, smoothly close the slide-over drawer
          if (!isAddAnother) {
            closeDrawer();
          }

          // Refresh the embedded table in this exact tab immediately
          if (moduleKey) {
            loadTabTable(moduleKey);
          }

          // Refresh dashboard in background
          DashboardModule.loadDashboard();
        } else {
          App.showToast(res.message || "Failed to save record.", "error");
        }
      } catch (err) {
        App.showToast("Error communicating with server: " + err.message, "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  /**
   * Slide-Over Drawer Controls
   */
  function openDrawer(formIdOrDrawerId) {
    let drawer = document.getElementById(formIdOrDrawerId);
    if (!drawer || !drawer.classList.contains("slide-over-drawer")) {
      drawer = document.getElementById("drawer_" + formIdOrDrawerId) ||
               (document.getElementById(formIdOrDrawerId) ? document.getElementById(formIdOrDrawerId).closest(".slide-over-drawer") : null);
    }
    if (!drawer) return;

    // Close any other open drawers
    document.querySelectorAll(".slide-over-drawer.active").forEach(d => d.classList.remove("active"));

    drawer.classList.add("active");
    const backdrop = document.getElementById("slideOverBackdrop");
    if (backdrop) backdrop.classList.add("active");
    document.body.classList.add("drawer-open");

    // Block locking for Hub Operators in open drawer
    const currentUser = API.getCurrentUser();
    if (currentUser && currentUser.block && currentUser.block !== "All") {
      drawer.querySelectorAll("select[name='Block'], select[data-block-select]").forEach(sel => {
        sel.value = currentUser.block;
        sel.disabled = true;
        // Trigger GP dropdown cascade
        const targetGpId = sel.getAttribute("data-gp-target");
        if (targetGpId) {
          const gpSelect = document.getElementById(targetGpId);
          if (gpSelect && AppConfig.BLOCKS[currentUser.block]) {
            gpSelect.innerHTML = '<option value="">Select Gram Panchayat</option>';
            AppConfig.BLOCKS[currentUser.block].forEach(gp => {
              const opt = document.createElement("option");
              opt.value = gp;
              opt.textContent = gp;
              gpSelect.appendChild(opt);
            });
          }
        }
      });
    } else {
      drawer.querySelectorAll("select[name='Block'], select[data-block-select]").forEach(sel => {
        sel.disabled = false;
      });
    }

    // Focus on first editable input
    setTimeout(() => {
      const firstInp = drawer.querySelector('input[type="text"]:not([readonly]), input[type="tel"], select');
      if (firstInp) firstInp.focus();
    }, 250);
  }

  function closeDrawer() {
    document.querySelectorAll(".slide-over-drawer.active").forEach(d => d.classList.remove("active"));
    const backdrop = document.getElementById("slideOverBackdrop");
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("drawer-open");
  }

  // Global escape key to close drawer
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeDrawer();
      const quickEditModal = document.getElementById("quickEditModal");
      if (quickEditModal) quickEditModal.classList.remove("active");
    }
  });

  return {
    init,
    performYouthSearch,
    openYouthSearchModal,
    loadTabTable,
    renderTabTable,
    exportTableCSV,
    openEditModal,
    confirmDeleteRecord,
    openDrawer,
    closeDrawer,
    openBulkUploadModal,
    downloadSampleTemplate
  };
})();
