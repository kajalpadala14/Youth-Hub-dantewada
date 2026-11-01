# Dantewada Youth Development, Employment & Success Story Portal
### जिला प्रशासन / जिला पंचायत, दंतेवाड़ा (छत्तीसगढ़)

A digital monitoring and public engagement portal developed for the **District Administration & Zilla Panchayat, Dantewada (Chhattisgarh)** to monitor youth employment, vocational training, education linkage, entrepreneurship, field visits with multi-photo uploads, and inspire through verified success stories.

---

## 🏛️ System Architecture

### 1. Public Portal (`index.html`)
- **Bilingual Interface**: Full toggle support for **हिन्दी (Hindi)** and **English**.
- **8 Comprehensive Public Sections**:
  1. **Home**: Hero banner with district insignia, key public metrics counter, vision.
  2. **About the Initiative (पहल के बारे में)**: Institutional convergence across Livelihood College, Danexx, NMDC, Navgurukul, IIM Raipur, and Lead Bank (LDM).
  3. **Youth Development Dashboard (सार्वजनिक आंकड़े)**: Public safe aggregate charts (Block distribution, social categories, gender ratio) with PII data masking.
  4. **Success Gallery (सफलता की कहानियाँ)**: Filterable cards with real candidate photos, category tags (Jobs, Enterprise, Education, Skills), and "Read Full Story" interactive modal.
  5. **Public Visit Gallery (स्वीकृत फील्ड विजिट)**: Approved field inspection records with multi-photo carousels, dates, officer attributions, and findings modal.
  6. **Training & Activities (प्रशिक्षण एवं गतिविधियाँ)**: Youth Hub programs, Bastar Munne Shivir, and upcoming batch enrollment schedules.
  7. **Employment & Entrepreneurship Initiatives (स्वरोजगार व योजनाएं)**: Guidance for PMEGP, PMFME, Mudra loans, and Danexx apparel placements.
  8. **Contact & Grievance (विभागीय संपर्क)**: Collectorate campus address, helpline numbers, and online citizen query form.

### 2. Admin Dashboard (`admin.html`)
- **Role-Based Access Control (RBAC)** (PRD Section 10):
  - `Super Admin`: Complete system control, user switcher, and audit logs.
  - `District Admin`: District-wide monitoring, reports, and approvals.
  - `Block Officer`: Block-restricted view for Dantewada, Geedam, Katekalyan, or Kuakonda.
  - `Field Staff`: Field visit reporting and live photo uploading.
  - `Data Entry Operator`: Youth profile data entry and imports.
  - `Gallery Reviewer`: Success story and field visit photo approvals.
- **12 Dynamic KPI Cards** (PRD Section 3):
  1. कुल पंजीकृत युवा (Total registered youth)
  2. रोजगार प्राप्त युवा (Employed youth)
  3. कौशल प्रशिक्षण प्राप्त युवा (Skill trained youth)
  4. शिक्षा से जुड़े युवा (Education linked)
  5. चिन्हित उद्यमी (Identified entrepreneurs)
  6. ऋण योजना के लाभार्थी (PMEGP/PMFME/Mudra beneficiaries)
  7. आयोजित प्रशिक्षण (Trainings conducted)
  8. MY Bharat पंजीयन (MY Bharat registrations)
  9. Youth Hub प्रशिक्षण (Youth Hub trainees)
  10. फील्ड विजिट की संख्या (Total field visits)
  11. अपलोड विजिट फोटो (Uploaded visit photos)
  12. प्रकाशित Success Stories (Published success stories)
- **12-Sheets Database Importer**:
  - Drag & drop or file selector for `.xlsx`, `.xls`, `.csv`.
  - Sheet selector for all 12 modules (`Employment_Registration`, `Employed`, `Skill_Linked`, `Education_Linked`, `Entrepreneur_Identified`, `PMEGP_PMFME_Loan`, `IIM_Candidate_List`, `Training_Conducted`, `MY_Bharat_Registration`, `Youth_Hub_Trainings`, `Bastar_Munne_Shivir`, `Field_Visits`).
  - Pre-flight preview with duplicate detection (by mobile number/ID) and data validation.
  - Commit import with automatic Audit Log trail.
  - Downloadable Excel template for each sheet.
- **Youth Profile Management**:
  - Full search & filter by block, GP, gender, category, qualification, employment status.
  - Add / Edit / View / Delete youth records.
  - Digital Dossier modal showing linked multi-module history (trainings, loans, visits, achievements).
  - Excel/CSV export.
- **Field Visit & Photo Upload Module**:
  - Auto-generated Visit ID (`VIS-2026-XXXX`).
  - Multi-photo upload with camera/file support (JPG, JPEG, PNG, WebP), live thumbnail previews, per-photo captions, and before/after/inspection tagging.
  - Comprehensive inspection form (purpose, findings, issues faced, action plan, follow-up date, status).
- **Visit Gallery & Review**:
  - Grid & list view with approval toggle ("Approve for Public Portal" / "Keep Internal").
- **Success Stories Management**:
  - Create & edit stories with photos, title, category, full narrative, and quote.
  - Workflow status transition: `Draft` ➔ `Pending Approval` ➔ `Approved` ➔ `Published`.
- **Visit Monitoring & Follow-up**:
  - Tracker for pending reports, follow-ups due, and issue resolution with resolution notes.
- **Reports & Analytics**:
  - 8 Standard PRD reports with Excel export and Print-to-PDF letterhead.
- **Audit Logs & Security**:
  - Timestamped audit log tracking all user modifications.
  - Factory reset option to restore pristine baseline seed data.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or newer)

### Start the Server
```bash
npm start
```
Or:
```bash
node server.js
```

### Access URLs
- **Public Portal**: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Admin Dashboard**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### Run Automated Tests
```bash
npm test
```
