/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * reports.js - Reports Engine, Data Exports (CSV/Excel/Print) & 360 Youth Profile Journey
 */

const ReportsModule = (function() {
  let currentReportData = { headers: [], rows: [] };
  let currentPage = 1;
  let rowsPerPage = 20;
  let sortColumnIdx = -1;
  let sortAscending = true;

  function init() {
    setupReportControls();
    loadActiveReport();
  }

  function setupReportControls() {
    const reportTypeSelect = document.getElementById("selectReportType");
    if (reportTypeSelect) {
      reportTypeSelect.addEventListener("change", () => {
        currentPage = 1;
        loadActiveReport();
      });
    }

    const searchInput = document.getElementById("reportTableSearch");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderReportTable();
      });
    }

    const pageSizeSelect = document.getElementById("reportPageSize");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function() {
        rowsPerPage = parseInt(this.value, 10) || 20;
        currentPage = 1;
        renderReportTable();
      });
    }

    // Export Buttons
    const btnCsv = document.getElementById("btnExportCSV");
    if (btnCsv) btnCsv.addEventListener("click", exportCSV);

    const btnExcel = document.getElementById("btnExportExcel");
    if (btnExcel) btnExcel.addEventListener("click", exportExcel);

    const btnPrint = document.getElementById("btnPrintReport");
    if (btnPrint) btnPrint.addEventListener("click", triggerPrint);
  }

  async function loadActiveReport() {
    const reportTypeSelect = document.getElementById("selectReportType");
    const reportType = reportTypeSelect ? reportTypeSelect.value : "overall";
    const reportTitleEl = document.getElementById("reportTitleDisplay");

    const tableBody = document.querySelector("#reportTable tbody");
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 24px;"><i class="fas fa-spinner fa-spin"></i> Loading report data...</td></tr>';
    }

    try {
      const currentUser = API.getCurrentUser();
      let blockFilterVal = document.getElementById("filterBlock") ? document.getElementById("filterBlock").value : "All";
      if (currentUser && currentUser.block && currentUser.block !== "All") {
        blockFilterVal = currentUser.block;
      }

      const filters = {
        financialYear: document.getElementById("filterFY") ? document.getElementById("filterFY").value : "All",
        month: document.getElementById("filterMonth") ? document.getElementById("filterMonth").value : "All",
        block: blockFilterVal,
        gramPanchayat: document.getElementById("filterGP") ? document.getElementById("filterGP").value : "All"
      };

      // Determine target sheet, headers and rowMapper based on reportType
      let sheetName = "Youth_Master";
      let reportTitle = "Comprehensive Youth Master Directory";
      let headers = ["Youth ID", "Name", "Father/Husband", "Mobile", "Gender", "Category", "Qualification", "Block", "Gram Panchayat", "Village", "Career Interest"];
      let rowMapper = r => [
        r.Youth_ID || "",
        r.Youth_Name || "",
        r.Father_Husband_Name || "",
        r.Mobile_Number || "",
        r.Gender || "",
        r.Category || "",
        r.Qualification || "",
        r.Block || "",
        r.Gram_Panchayat || "",
        r.Village || "",
        r.Career_Interest || ""
      ];

      if (reportType === "block_wise") {
        sheetName = "Youth_Master";
        reportTitle = "Block-wise Consolidated Monitoring Report";
        headers = ["Block", "Gram Panchayat", "Youth ID", "Name", "Mobile", "Qualification", "Career Interest", "Reg Date"];
        rowMapper = r => [r.Block || "", r.Gram_Panchayat || "", r.Youth_ID || "", r.Youth_Name || "", r.Mobile_Number || "", r.Qualification || "", r.Career_Interest || "", r.Registration_Date || ""];
      } else if (reportType === "gp_wise") {
        sheetName = "Youth_Master";
        reportTitle = "Gram Panchayat Wise Youth Progress";
        headers = ["Gram Panchayat", "Block", "Village", "Youth ID", "Name", "Mobile", "Gender", "Category"];
        rowMapper = r => [r.Gram_Panchayat || "", r.Block || "", r.Village || "", r.Youth_ID || "", r.Youth_Name || "", r.Mobile_Number || "", r.Gender || "", r.Category || ""];
      } else if (reportType === "employment") {
        sheetName = "Employment_Linked";
        reportTitle = "Employment Linkage & Placement Report";
        headers = ["Link ID", "Youth ID", "Name", "Employer", "Job Role", "Placement Date", "Salary (₹)", "Status"];
        rowMapper = r => [r.Emp_Link_ID || "", r.Youth_ID || "", r.Youth_Name || "", r.Employer_Name || "", r.Job_Role || "", r.Placement_Date || "", r.Salary ? "₹" + Number(r.Salary).toLocaleString("en-IN") : "-", r.Status || ""];
      } else if (reportType === "skill_training") {
        sheetName = "Skill_Training";
        reportTitle = "Skill Training & Certification Report";
        headers = ["Record ID", "Youth ID", "Name", "Training Name", "Skill/Trade", "Provider", "Status", "Certificate"];
        rowMapper = r => [r.Training_Record_ID || "", r.Youth_ID || "", r.Youth_Name || "", r.Training_Name || "", r.Skill_Trade || "", r.Training_Provider || "", r.Training_Status || "", r.Certificate_Status || ""];
      } else if (reportType === "entrepreneurship") {
        sheetName = "Entrepreneurs";
        reportTitle = "Entrepreneurship & Self-Employment Report";
        headers = ["ID", "Youth ID", "Name", "Mobile", "Block", "Business Idea", "Scheme", "Loan Status", "Amount (₹)"];
        rowMapper = r => [r.Entrepreneur_ID || "", r.Youth_ID || "", r.Name || "", r.Mobile || "", r.Block || "", r.Business_Idea || "", r.Loan_Scheme || "", r.Loan_Status || "", r.Loan_Amount ? "₹" + Number(r.Loan_Amount).toLocaleString("en-IN") : "-"];
      } else if (reportType === "navgurukul") {
        sheetName = "NavGurukul";
        reportTitle = "NavGurukul Fellowship Status Report";
        headers = ["Candidate ID", "Youth ID", "Name", "Mobile", "Block", "Qualification", "Pipeline Status", "Admission"];
        rowMapper = r => [r.Candidate_ID || "", r.Youth_ID || "", r.Candidate_Name || "", r.Mobile || "", r.Block || "", r.Qualification || "", r.Selection_Status || "", r.Admission_Status || ""];
      } else if (reportType === "training_activity") {
        sheetName = "Trainings";
        reportTitle = "Trainings Conducted Report";
        headers = ["Training ID", "Training Name", "Type", "Date", "Block", "Venue", "Provider", "Participants"];
        rowMapper = r => [r.Training_ID || "", r.Training_Name || "", r.Training_Type || "", r.Date || "", r.Block || "", r.Venue || "", r.Training_Provider || "", r.Total_Participants || "0"];
      } else if (reportType === "mobilization") {
        sheetName = "Mobilization";
        reportTitle = "Mobilization Events Report";
        headers = ["Activity ID", "Date", "Event Name", "Block", "Gram Panchayat", "Source", "Total Mobilized"];
        rowMapper = r => [r.Activity_ID || "", r.Date || "", r.Activity_Name || "", r.Block || "", r.Gram_Panchayat || "", r.Mobilization_Source || "", r.Total_Mobilized || "0"];
      } else if (reportType === "rehabilitation") {
        sheetName = "Rehabilitation";
        reportTitle = "Rehabilitation & Surrender Monitoring Report";
        headers = ["Rehab ID", "Youth ID", "Name", "Guardian", "Mobile", "Block", "Gram Panchayat", "Surrender Date", "Status", "Assistance Type", "Amount (₹)", "Scheme Linked", "Employment"];
        rowMapper = r => [
          r.Rehab_ID || "",
          r.Youth_ID || "",
          r.Candidate_Name || "",
          r.Father_Husband_Name || "",
          r.Mobile || "",
          r.Block || "",
          r.GP || "",
          r.Surrender_Date || "",
          r.Rehabilitation_Status || "",
          r.Assistance_Type || "",
          r.Assistance_Amount ? "₹" + Number(r.Assistance_Amount).toLocaleString("en-IN") : "-",
          r.Scheme_Linked || "",
          r.Employment_Status || ""
        ];
      }

      // Fetch live records directly from connected Google Sheet
      const res = await API.call("getTableRecords", { sheetName });
      let recordList = res && (res.records || res.data);

      // Apply Block & GP Filters if active
      if (Array.isArray(recordList)) {
        if (filters.block && filters.block !== "All") {
          const b = filters.block.toLowerCase();
          recordList = recordList.filter(r => String(r.Block || "").toLowerCase() === b);
        }
        if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
          const gp = filters.gramPanchayat.toLowerCase();
          recordList = recordList.filter(r => String(r.Gram_Panchayat || r.GP || "").toLowerCase() === gp);
        }
      }

      if (res && res.success && Array.isArray(recordList)) {
        currentReportData = {
          title: reportTitle,
          headers: headers,
          rows: recordList.map(rowMapper)
        };
        if (reportTitleEl) reportTitleEl.textContent = currentReportData.title;
        renderReportTable();
      } else {
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="13" style="text-align:center; padding: 24px; color: #94A3B8;">No records found in sheet.</td></tr>';
      }
    } catch (err) {
      console.error("Report error:", err);
      if (tableBody) tableBody.innerHTML = '<tr><td colspan="13" style="text-align:center; padding: 24px; color: #DC2626;">Error loading report.</td></tr>';
    }
  }

  function renderReportTable() {
    const tableHeader = document.querySelector("#reportTable thead");
    const tableBody = document.querySelector("#reportTable tbody");
    if (!tableHeader || !tableBody) return;

    // Render Headers
    let headerHtml = "<tr>";
    currentReportData.headers.forEach((h, idx) => {
      headerHtml += `<th style="cursor: pointer;" onclick="ReportsModule.sortReport(${idx})">
        ${h} <i class="fas fa-sort" style="font-size: 10px; margin-left: 4px; color: #94A3B8;"></i>
      </th>`;
    });
    headerHtml += "</tr>";
    tableHeader.innerHTML = headerHtml;

    // Filter Rows by live Search query
    const searchQuery = (document.getElementById("reportTableSearch")?.value || "").toLowerCase().trim();
    let filteredRows = currentReportData.rows.filter(row => {
      if (!searchQuery) return true;
      return row.some(cell => String(cell || "").toLowerCase().includes(searchQuery));
    });

    // Sort if active
    if (sortColumnIdx !== -1) {
      filteredRows.sort((a, b) => {
        let valA = a[sortColumnIdx] || "";
        let valB = b[sortColumnIdx] || "";
        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        }
        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageRows = filteredRows.slice(startIdx, startIdx + rowsPerPage);

    // Render Body
    if (pageRows.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 20px; color: #64748B;">No matching records found.</td></tr>';
    } else {
      let bodyHtml = "";
      pageRows.forEach(row => {
        bodyHtml += "<tr>";
        row.forEach((cell, cellIdx) => {
          let val = cell === null || cell === undefined ? "" : String(cell);
          // If Youth ID, make clickable to open 360 profile
          if (typeof val === "string" && val.startsWith("YH-")) {
            val = `<a href="javascript:void(0)" onclick="ReportsModule.openYouthProfileModal('${val}')" style="font-weight: 600; color: #2563EB; text-decoration: underline;">${val}</a>`;
          }
          bodyHtml += `<td>${val}</td>`;
        });
        bodyHtml += "</tr>";
      });
      tableBody.innerHTML = bodyHtml;
    }

    // Update Pagination UI
    const countDisplay = document.getElementById("reportRecordCount");
    if (countDisplay) {
      countDisplay.textContent = `Showing ${pageRows.length > 0 ? startIdx + 1 : 0} to ${startIdx + pageRows.length} of ${totalRows} entries`;
    }

    renderPaginationControls(totalPages);
  }

  function renderPaginationControls(totalPages) {
    const container = document.getElementById("reportPagination");
    if (!container) return;

    let html = `
      <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" ${currentPage <= 1 ? "disabled" : ""} onclick="ReportsModule.goToPage(${currentPage - 1})">Prev</button>
      <span style="font-size: 12px; margin: 0 8px; font-weight: 600;">Page ${currentPage} of ${totalPages}</span>
      <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" ${currentPage >= totalPages ? "disabled" : ""} onclick="ReportsModule.goToPage(${currentPage + 1})">Next</button>
    `;
    container.innerHTML = html;
  }

  function goToPage(page) {
    currentPage = page;
    renderReportTable();
  }

  function sortReport(colIdx) {
    if (sortColumnIdx === colIdx) {
      sortAscending = !sortAscending;
    } else {
      sortColumnIdx = colIdx;
      sortAscending = true;
    }
    renderReportTable();
  }

  /**
   * Export CSV with UTF-8 BOM
   */
  function exportCSV() {
    if (!currentReportData.headers.length) {
      App.showToast("No data available to export.", "warning");
      return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += currentReportData.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\r\n";

    currentReportData.rows.forEach(row => {
      csvContent += row.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `YouthHub_Dantewada_${currentReportData.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    App.showToast("CSV report exported successfully.", "success");
  }

  /**
   * Export Excel-compatible HTML format (.xls)
   */
  function exportExcel() {
    if (!currentReportData.headers.length) {
      App.showToast("No data available to export.", "warning");
      return;
    }

    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body>
      <h2>DISTRICT ADMINISTRATION, DANTEWADA</h2>
      <h3>YOUTH HUB DANTEWADA - ${currentReportData.title}</h3>
      <table border="1">
        <thead><tr style="background:#0F172A;color:#FFFFFF;">${currentReportData.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${currentReportData.rows.map(r => `<tr>${r.map(c => `<td>${c || ""}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </body></html>`;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `YouthHub_Dantewada_${currentReportData.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    App.showToast("Excel workbook downloaded successfully.", "success");
  }

  function triggerPrint() {
    window.print();
  }

  /**
   * 360-Degree Youth Journey Profile Modal
   */
  async function openYouthProfileModal(youthId) {
    const modal = document.getElementById("youthProfileModal");
    const container = document.getElementById("youthProfileTimelineContent");
    if (!modal || !container) return;

    modal.classList.add("active");
    container.innerHTML = '<div style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><p style="margin-top: 10px;">Retrieving complete youth journey from database...</p></div>';

    try {
      const res = await API.call("getYouthProfile", { youthId });
      if (res && res.success && res.profile) {
        const p = res.profile.personal;
        let html = `
          <!-- Header Card -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 18px; color: #0B2545; font-weight: 700;">${p.Youth_Name} <span class="badge info">${p.Youth_ID}</span></h2>
              <div style="font-size: 13px; color: #64748B; margin-top: 4px;">
                <span>👤 Parent: ${p.Father_Mother_Name || "N/A"}</span> | 
                <span>📱 ${p.Mobile_Number}</span> | 
                <span>🎂 Age: ${p.DOB_Age || "N/A"}</span> | 
                <span>🏷️ Category: ${p.Category}</span>
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                📍 <strong>${p.Block}</strong> > GP: <strong>${p.Gram_Panchayat}</strong> > Village: ${p.Village}
              </div>
            </div>
            <div>
              <span class="badge success" style="font-size: 12px; padding: 6px 12px;">Registered: ${p.Registration_Date}</span>
            </div>
          </div>

          <!-- Chronological Journey Steps -->
          <h3 style="font-size: 14.5px; font-weight: 700; color: #0B2545; margin-bottom: 1rem;">Comprehensive Youth Journey / प्रगति यात्रा</h3>
          <div class="timeline">
            <!-- Step 1: Youth Master -->
            <div class="timeline-step">
              <div class="timeline-dot active"></div>
              <div class="timeline-content">
                <div class="timeline-title">1. Youth Master Registration (पंजीयन)</div>
                <div class="timeline-desc">Registered with qualification: <strong>${p.Qualification}</strong> | Career Interest: <strong>${p.Career_Interest || "General"}</strong></div>
              </div>
            </div>

            <!-- Step 2: M-Form -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.mforms.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">2. M-Form Registration (एम-फॉर्म)</div>
                <div class="timeline-desc">
                  ${res.profile.mforms.length ? 
                    res.profile.mforms.map(m => `Status: <span class="badge success">${m.MForm_Status}</span> | Reg No: <strong>${m.MForm_Reg_No || "Under Process"}</strong> (${m.Date})`).join("<br>") : 
                    '<span class="text-muted">No M-Form entry recorded yet.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 3: My Bharat -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.mybharat.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">3. My Bharat Portal Registration (माय भारत)</div>
                <div class="timeline-desc">
                  ${res.profile.mybharat.length ? 
                    res.profile.mybharat.map(b => `Status: <span class="badge info">${b.Status}</span> | ID: <strong>${b.MyBharat_Reg_No || "Generated"}</strong> (${b.Registration_Date})`).join("<br>") : 
                    '<span class="text-muted">Not registered on My Bharat.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 4: Counselling -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.counselling.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">4. Career Counselling & Guidance (परामर्श)</div>
                <div class="timeline-desc">
                  ${res.profile.counselling.length ? 
                    res.profile.counselling.map(c => `Type: <strong>${c.Counselling_Type}</strong> | Counsellor: ${c.Counsellor_Name}<br>Outcome: ${c.Counselling_Outcome} (${c.Date})`).join("<br><br>") : 
                    '<span class="text-muted">No counselling recorded.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 5: Skill Training -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.skillTraining.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">5. Skill Training & Certification (कौशल प्रशिक्षण)</div>
                <div class="timeline-desc">
                  ${res.profile.skillTraining.length ? 
                    res.profile.skillTraining.map(s => `Course: <strong>${s.Course || s.Training_Name}</strong> | Provider: <strong>${s.Training_Provider}</strong><br>Status: <span class="badge success">${s.Training_Status}</span> | Certificate: ${s.Certificate_Status}`).join("<br><br>") : 
                    '<span class="text-muted">No skill training records.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 6: Employment -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.employmentLinked.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">6. Employment Linkage (रोजगार नियोजन)</div>
                <div class="timeline-desc">
                  ${res.profile.employmentLinked.length ? 
                    res.profile.employmentLinked.map(e => `Employer: <strong>${e.Employer_Name}</strong> | Role: <strong>${e.Job_Role}</strong><br>Salary: ₹${Number(e.Salary).toLocaleString("en-IN")}/month | Status: <span class="badge success">${e.Status}</span> (${e.Placement_Date})`).join("<br><br>") : 
                    (res.profile.employmentRegistered.length ? '<span class="badge warning">Registered in Job Portal</span>' : '<span class="text-muted">No employment records.</span>')}
                </div>
              </div>
            </div>

            <!-- Step 7: Education -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.education.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">7. Higher Education Linkage (उच्च शिक्षा)</div>
                <div class="timeline-desc">
                  ${res.profile.education.length ? 
                    res.profile.education.map(ed => `Institution: <strong>${ed.Institution_Name}</strong> | Course: <strong>${ed.Course}</strong> (${ed.Status})`).join("<br>") : 
                    '<span class="text-muted">No education linkage records.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 8: Entrepreneurship -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.entrepreneurship.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">8. Entrepreneurship & Self-Employment (उद्यमिता)</div>
                <div class="timeline-desc">
                  ${res.profile.entrepreneurship.length ? 
                    res.profile.entrepreneurship.map(ent => `Enterprise: <strong>${ent.Business_Name || ent.Business_Idea}</strong> | Stage: <span class="badge warning">${ent.Stage}</span><br>Loan Scheme: ${ent.Loan_Scheme || "N/A"} | Loan Amount: ₹${Number(ent.Loan_Amount || 0).toLocaleString("en-IN")}`).join("<br><br>") : 
                    '<span class="text-muted">Not enrolled in entrepreneurship program.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 9: NavGurukul -->
            <div class="timeline-step">
              <div class="timeline-dot ${res.profile.navgurukul.length ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">9. NavGurukul Software Fellowship (नवगुरुकुल)</div>
                <div class="timeline-desc">
                  ${res.profile.navgurukul.length ? 
                    res.profile.navgurukul.map(ng => `Status: <span class="badge info">${ng.Selection_Status}</span> | Admission: <strong>${ng.Admission_Status}</strong> (${ng.Registration_Date})`).join("<br>") : 
                    '<span class="text-muted">Not registered for NavGurukul.</span>'}
                </div>
              </div>
            </div>

            <!-- Step 10: Rehabilitation & Surrender -->
            <div class="timeline-step">
              <div class="timeline-dot ${(res.profile.rehabilitation && res.profile.rehabilitation.length) ? "active" : ""}"></div>
              <div class="timeline-content">
                <div class="timeline-title">10. Rehabilitation &amp; Surrender Support (आत्मसमर्पण एवं पुनर्वास)</div>
                <div class="timeline-desc">
                  ${(res.profile.rehabilitation && res.profile.rehabilitation.length) ? 
                    res.profile.rehabilitation.map(rh => `Status: <span class="badge success">${rh.Rehabilitation_Status}</span> | Assistance: <strong>${rh.Assistance_Type}</strong> (${rh.Assistance_Amount ? '₹' + Number(rh.Assistance_Amount).toLocaleString('en-IN') : 'N/A'})<br>Scheme: ${rh.Scheme_Linked || 'N/A'} | Employment: ${rh.Employment_Status || 'N/A'}`).join("<br><br>") : 
                    '<span class="text-muted">No surrender/rehabilitation records.</span>'}
                </div>
              </div>
            </div>
          </div>
        `;
        container.innerHTML = html;
      } else {
        container.innerHTML = `<p class="text-danger">${res.message || "Failed to load youth profile."}</p>`;
      }
    } catch (err) {
      container.innerHTML = '<p class="text-danger">Error retrieving youth profile.</p>';
    }
  }

  return {
    init,
    loadActiveReport,
    renderReportTable,
    sortReport,
    goToPage,
    exportCSV,
    exportExcel,
    openYouthProfileModal
  };
})();
