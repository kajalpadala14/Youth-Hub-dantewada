/**
 * Unified Database & Data Management Service
 * Dantewada Youth Development, Employment & Success Story Portal
 * Department: District Administration / Zilla Panchayat, Dantewada
 */

(function () {
  const DB_STORAGE_KEY = 'DANTEWADA_PORTAL_DB_V3';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function maskMobile(mobile) {
    if (!mobile) return 'N/A';
    const clean = String(mobile).replace(/\D/g, '');
    if (clean.length < 10) return 'XXXXX-' + clean.slice(-4);
    return clean.slice(0, 2) + 'XXXX-XX' + clean.slice(-2);
  }

  function maskAadhaar(aadhaar) {
    if (!aadhaar) return '';
    const clean = String(aadhaar).replace(/\D/g, '');
    if (clean.length === 12) return 'XXXX-XXXX-' + clean.slice(-4);
    return 'XXXX-XXXX-XXXX';
  }

  function formatTimestamp(d = new Date()) {
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  const Utils = { escapeHtml, maskMobile, maskAadhaar, formatTimestamp };
  if (typeof window !== 'undefined') {
    window.DantewadaUtils = Utils;
    window.escapeHtml = escapeHtml;
    window.maskMobile = maskMobile;
  }

  function createEmptyDatabase() {
    return {
      youth: [],
      placed: [],
      skills: [],
      counselling: [],
      navgurukul: [],
      loans: [],
      iimRaipur: [],
      iimSurvey: [],
      myBharat: [],
      youthHubTrainings: [],
      bastarShivir: [],
      bastarVillageCandidates: [],
      bastarMunneVillageReport: [],
      trainingConducted: [],
      entrepreneursIdentified: [],
      entrepreneurIdeas: [],
      startupIdeas: [],
      meetingsVoClfTrif: [],
      mFormRecords: (typeof window !== 'undefined' && Array.isArray(window.DANTEWADA_MFORM_DATA)) ? window.DANTEWADA_MFORM_DATA : [],
      rangDe: [],
      rehabilitationCounselling: [],
      fieldVisits: [],
      successStories: [
        {
          id: "STR-2026-7964",
          youthName: "Suresh Karma",
          village: "Bade Kameli",
          block: "Dantewada",
          title: "सफलता की कहानी - सुरेश कर्मा",
          category: "Employment",
          scheme: "Danexx / स्वरोजगार",
          photoUrl: "https://lh3.googleusercontent.com/d/1kQys1eI2kxdnITqRF4mn53tIcHx5hzvz",
          isPdf: false,
          summary: "आजीविका, मार्गदर्शन एवं सहयोग के माध्यम से स्वरोजगार व रोजगार में सफलता।",
          fullStory: "आजीविका का माध्यम: सुरेश कर्मा बड़े कमेली के निवासी हैं। वे घर पर सब्जी की खेती के माध्यम से आजीविका को बेहतर बनाने की दिशा में कार्य करना चाहते थे, लेकिन खेती के लिए आवश्यक संसाधन जुटाने में आर्थिक कठिनाइयों का सामना कर रहे थे।\n\nमार्गदर्शन एवं सहयोग: अपने कार्य को आगे बढ़ाने के उद्देश्य से उन्होंने यूथ हब भांसी से संपर्क किया। यूथ हब द्वारा उन्हें ऋण सुविधा की जानकारी दी गई तथा आवेदन एवं आवश्यक प्रक्रिया में सहयोग प्रदान किया गया।",
          quote: "यूथ हब के मार्गदर्शन से मुझे आगे बढ़ने का संबल मिला।",
          achievementDate: "2026-11-16",
          featured: true,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T07:42:17.964Z"
        },
        {
          id: "STR-2026-5200",
          youthName: "Savitri Tamo",
          village: "Bade Kameli",
          block: "Dantewada",
          title: "सफलता की कहानी - सावित्री तामो",
          category: "Employment",
          scheme: "Youth Hub Livelihood",
          photoUrl: "https://lh3.googleusercontent.com/d/1hWh51CxFD8MXnQcIqjS_ltRnjvWDz_8u",
          isPdf: false,
          summary: "कौशल प्रशिक्षण एवं रोजगार लिंकेज के माध्यम से आत्मनिर्भरता की प्रेरणादायक कहानी।",
          fullStory: "सावित्री तामो ने यूथ हब दंतेवाड़ा के माध्यम से आजीविका संवर्धन प्रशिक्षण प्राप्त किया तथा रोजगार से जुड़कर अपने परिवार को आर्थिक सहयोग प्रदान कर रही हैं।",
          quote: "प्रशिक्षण ने मुझे आत्मनिर्भर बनाया।",
          achievementDate: "2026-11-16",
          featured: true,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T07:45:05.200Z"
        },
        {
          id: "STR-2026-0823",
          youthName: "Angati Kumar",
          village: "Bhansi Bajar Para",
          block: "Dantewada",
          title: "सफलता की कहानी - अंगाती कुमार",
          category: "Employment",
          scheme: "Youth Hub Dantewada",
          photoUrl: "https://lh3.googleusercontent.com/d/1FEpS97pi6JvoQlcwGrVcnDaB0oHWtR1X",
          isPdf: false,
          summary: "भांसी बाजार पारा के युवा की आजीविका एवं रोजगार सशक्तिकरण यात्रा।",
          fullStory: "अंगाती कुमार ने तकनीकी कौशल प्रशिक्षण प्राप्त कर स्थानीय स्तर पर रोजगार स्थापित किया।",
          quote: "कौशल ही सफलता की असली कुंजी है।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:00:50.823Z"
        },
        {
          id: "STR-2026-3018",
          youthName: "Neha Sethiya",
          village: "Pondum-01",
          block: "Dantewada",
          title: "सफलता की कहानी - नेहा सेठिया",
          category: "Employment",
          scheme: "Youth Hub Skill Mission",
          photoUrl: "https://lh3.googleusercontent.com/d/1OtcptgVL58AFmbRGwwHL_3W-wfShpkw2",
          isPdf: false,
          summary: "पोंदुम की नेहा सेठिया की कौशल संवर्धन व आजीविका लिंकेज की सफलता।",
          fullStory: "नेहा सेठिया ने यूथ हब के माध्यम से प्रशिक्षण प्राप्त किया और सफलतापूर्वक कार्य में संलग्न हैं।",
          quote: "आत्मविश्वास और सही मार्गदर्शन से हर लक्ष्य संभव है।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:22:33.018Z"
        },
        {
          id: "STR-2026-2154",
          youthName: "Sandeep Sethiya",
          village: "Balud",
          block: "Dantewada",
          title: "सफलता की कहानी - संदीप सेठिया",
          category: "Employment",
          scheme: "Youth Hub Dantewada",
          photoUrl: "https://lh3.googleusercontent.com/d/1NwXOpO-lOTAKxcBBxLi5b8QIWrhAK1hw",
          isPdf: false,
          summary: "बालूद निवासी संदीप सेठिया की रोजगार प्राप्ति एवं आत्मनिर्भरता।",
          fullStory: "संदीप सेठिया ने व्यावसायिक प्रशिक्षण के पश्चात रोजगार प्राप्त कर आर्थिक स्वावलंबन हासिल किया।",
          quote: "युवाओं को अवसर मिलने पर वे हर क्षेत्र में आगे बढ़ सकते हैं।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:24:42.154Z"
        },
        {
          id: "STR-2026-2235",
          youthName: "Sukman Telam",
          village: "Bhansi",
          block: "Dantewada",
          title: "सफलता की कहानी - सुकमान तेलाम",
          category: "Employment",
          scheme: "Youth Hub Dantewada",
          photoUrl: "https://lh3.googleusercontent.com/d/1--85sGJc80guIK7t0TfM-RRnVW8-I4Du",
          isPdf: false,
          summary: "भांसी के सुकमान तेलाम की रोजगार एवं कौशल संवर्धन की प्रेरणादायक कहानी।",
          fullStory: "सुकमान तेलाम ने बस्तर मुन्ने शिविर एवं यूथ हब के माध्यम से काउंसलिंग व प्रशिक्षण प्राप्त किया।",
          quote: "सही मार्गदर्शन से ग्रामीण युवाओं को नई दिशा मिली।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:27:02.235Z"
        },
        {
          id: "STR-2026-9540",
          youthName: "Pratik Verma",
          village: "Bhansi",
          block: "Dantewada",
          title: "सफलता की कहानी - प्रतीक वर्मा",
          category: "Employment",
          scheme: "Youth Hub Dantewada",
          photoUrl: "https://lh3.googleusercontent.com/d/14ohYu2gSvpJKjBRXF7xk1XyqR6UBP2Sn",
          isPdf: false,
          summary: "भांसी निवासी प्रतीक वर्मा की तकनीकी कौशल व रोजगार लिंकेज की कहानी।",
          fullStory: "प्रतीक वर्मा ने कौशल विकास कार्यक्रम में सहभागिता कर अपनी क्षमता को रोजगार में बदला।",
          quote: "प्रशिक्षण से अवसरों के नए द्वार खुले।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:31:29.540Z"
        },
        {
          id: "STR-2026-5052",
          youthName: "Sahil Tamo",
          village: "Bade Kameli",
          block: "Dantewada",
          title: "सफलता की कहानी - साहिल तामो",
          category: "Employment",
          scheme: "Youth Hub Dantewada",
          photoUrl: "https://lh3.googleusercontent.com/d/1i8YstfkZj7rEbtmhQ5D6huE1lzv1e3Pq",
          isPdf: false,
          summary: "बड़े कमेली के साहिल तामो की आजीविका संवर्धन व रोजगार लिंकेज की उपलब्धि।",
          fullStory: "साहिल तामो ने यूथ हब काउंसलिंग सत्र से जुड़कर व्यावसायिक प्रशिक्षण पूरा किया और रोजगार प्राप्त किया।",
          quote: "मेहनत और सही दिशा से सफलता निश्चित है।",
          achievementDate: "2026-11-16",
          featured: false,
          status: "Published",
          author: "जिला रोजगार कार्यालय, दंतेवाड़ा",
          submittedAt: "2026-11-16T08:33:15.052Z"
        }
      ],
      auditLogs: [],
      metadata: { district: 'Dantewada', version: '3.0.0', initializedAt: new Date().toISOString() }
    };
  }

  class DatabaseService {
    constructor() {
      this.escapeHtml = escapeHtml;
      this.maskMobile = maskMobile;
      this.maskAadhaar = maskAadhaar;
      this.data = this.initDatabase();
    }

    initDatabase() {
      try {
        const local = localStorage.getItem(DB_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.metadata) {
            // Ensure all collections exist as arrays even if empty
            const schema = createEmptyDatabase();
            for (const key of Object.keys(schema)) {
              if (Array.isArray(schema[key]) && !Array.isArray(parsed[key])) {
                parsed[key] = [];
              }
            }
            if ((!Array.isArray(parsed.mFormRecords) || parsed.mFormRecords.length === 0) && typeof window !== 'undefined' && Array.isArray(window.DANTEWADA_MFORM_DATA)) {
              parsed.mFormRecords = window.DANTEWADA_MFORM_DATA;
              this.persist(parsed);
            }
            if ((!Array.isArray(parsed.successStories) || parsed.successStories.length === 0) && Array.isArray(schema.successStories) && schema.successStories.length > 0) {
              parsed.successStories = schema.successStories;
              this.persist(parsed);
            }
            // Purge legacy mock datasets so portal only displays real Google Sheet data
            if (!parsed.metadata.cleanedMockDataV5 || (Array.isArray(parsed.youth) && parsed.youth.length > 0 && parsed.youth.some(y => y.name === 'Manisha Yadav' || y.firstName === 'Manisha' || y.fullName === 'Manisha Yadav'))) {
              parsed.youth = [];
              parsed.placed = [];
              parsed.skills = [];
              parsed.navgurukul = [];
              parsed.loans = [];
              parsed.bastarShivir = [];
              parsed.entrepreneurIdeas = [];
              parsed.bastarVillageCandidates = [];
              parsed.bastarMunneVillageReport = [];
              parsed.trainingConducted = [];
              parsed.myBharat = [];
              parsed.youthHubTrainings = [];
              parsed.rangDe = [];
              parsed.metadata.cleanedMockDataV4 = true;
              parsed.metadata.cleanedMockDataV5 = true;
              this.persist(parsed);
            }
            if (!parsed.metadata.cleanedMockDataV6 || (Array.isArray(parsed.entrepreneurIdeas) && parsed.entrepreneurIdeas.some(e => e.founderName === 'उद्यमी' || e.startupName === 'उद्यम विचार'))) {
              parsed.entrepreneurIdeas = [];
              parsed.metadata.cleanedMockDataV6 = true;
              this.persist(parsed);
            }
            // Remove the legacy empty MY Bharat placeholder. Older sync code
            // created this display row when a backend row had no name.
            if (Array.isArray(parsed.myBharat)) {
              const beforeCount = parsed.myBharat.length;
              parsed.myBharat = parsed.myBharat.filter(record => {
                const name = String(record && record.name || '').trim();
                const mobile = String(record && (record.mobile || record['MOBILE NO.']) || '').replace(/\D/g, '');
                const isPlaceholder = !name || name === 'पंजीकृत युवा' || name.toLowerCase() === 'registered youth';
                return !isPlaceholder || mobile.length >= 10;
              });
              if (parsed.myBharat.length !== beforeCount) this.persist(parsed);
            }
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not parse local storage DB, starting fresh empty database:', e);
      }

      // Default: clean empty database (0 records)
      const emptyDb = createEmptyDatabase();
      this.persist(emptyDb);
      return emptyDb;
    }

    persist(customData) {
      const dataToSave = customData || this.data;
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dataToSave));
        return { success: true };
      } catch (e) {
        console.error('Failed to persist DB to localStorage:', e);
        const isQuota = e.name === 'QuotaExceededError' || e.code === 22 || (e.message && e.message.toLowerCase().includes('quota'));
        return {
          success: false,
          error: isQuota
            ? 'ब्राउज़र स्टोरेज सीमा (Quota) पार हो गई है। कृपया पुरानी अनावश्यक प्रविष्टियां हटाएं।'
            : 'डेटा सुरक्षित करने में त्रुटि: ' + (e.message || 'Unknown Storage Error')
        };
      }
    }

    clearAllData() {
      this.data = createEmptyDatabase();
      this.persist(this.data);
      this.logAudit('DATABASE_CLEARED', 'System', 'All Collections', 'Wiped all records to clean 0-state database.');
      window.dispatchEvent(new CustomEvent('db:changed'));
      return true;
    }

    clearSheetData(collectionName) {
      if (this.data && Array.isArray(this.data[collectionName])) {
        const count = this.data[collectionName].length;
        this.data[collectionName] = [];
        this.persist();
        this.logAudit('SHEET_CLEARED', 'System', collectionName, `Cleared all ${count} records from ${collectionName}`);
        window.dispatchEvent(new CustomEvent('db:changed'));
        return { success: true, count };
      }
      return { success: false, message: 'Collection not found' };
    }

    bulkDeleteSheetRecords(collectionName, itemsOrIndices) {
      if (!this.data || !Array.isArray(this.data[collectionName])) {
        return { success: false, message: 'Collection not found' };
      }
      const arr = this.data[collectionName];
      let deletedCount = 0;
      if (Array.isArray(itemsOrIndices) && itemsOrIndices.length > 0) {
        const toDeleteSet = new Set(itemsOrIndices);
        this.data[collectionName] = arr.filter((item, idx) => {
          if (toDeleteSet.has(item) || toDeleteSet.has(idx)) {
            deletedCount++;
            return false;
          }
          return true;
        });
        this.persist();
        this.logAudit('BULK_DELETE', 'System', collectionName, `Bulk deleted ${deletedCount} records from ${collectionName}`);
        window.dispatchEvent(new CustomEvent('db:changed'));
        return { success: true, count: deletedCount };
      }
      return { success: false, message: 'No items provided for deletion' };
    }

    resetToDefaults() {
      if (window.DANTEWADA_SEED_DATA) {
        this.data = JSON.parse(JSON.stringify(window.DANTEWADA_SEED_DATA));
        this.data.metadata = { district: 'Dantewada', version: '3.0.0', restoredAt: new Date().toISOString() };
        this.persist(this.data);
        this.logAudit('DATABASE_RESET', 'System', 'All Collections', 'Restored sample/demo baseline database.');
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    // -------------------------------------------------------------
    // Audit Logging
    // -------------------------------------------------------------
    logAudit(action, module, target, details, user) {
      const currentUser = user || (window.DantewadaAuth ? window.DantewadaAuth.getCurrentUser() : null) || {
        id: 'system',
        name: 'System User',
        role: 'system'
      };

      const timestamp = formatTimestamp();

      const log = {
        id: 'LOG-' + Date.now().toString().slice(-6),
        timestamp,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        module,
        target,
        details
      };

      if (!this.data.auditLogs) this.data.auditLogs = [];
      this.data.auditLogs.unshift(log);
      if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
      this.persist();
      return log;
    }

    getAuditLogs() {
      return this.data.auditLogs || [];
    }

    // -------------------------------------------------------------
    // KPI Calculations (PRD Section 3)
    // -------------------------------------------------------------
    getKPIs(filterBlock = null) {
      let youthList = this.data.youth || [];
      let visitsList = this.data.fieldVisits || [];
      let storiesList = this.data.successStories || [];
      let trainingsList = this.data.trainingConducted || [];
      let placedList = this.data.placed || [];
      let skillsList = this.data.skills || [];
      let navList = this.data.navgurukul || [];
      let loansList = this.data.loans || [];
      let mbList = this.data.myBharat || [];
      let yhList = this.data.youthHubTrainings || [];

      if (filterBlock && filterBlock !== 'All') {
        const fb = filterBlock.toLowerCase().trim();
        youthList = youthList.filter(y => (y.block || '').toLowerCase().trim() === fb);
        visitsList = visitsList.filter(v => (v.block || '').toLowerCase().trim() === fb);
        storiesList = storiesList.filter(s => (s.block || '').toLowerCase().trim() === fb);
        trainingsList = trainingsList.filter(t => (t.block || '').toLowerCase().trim() === fb);
        loansList = loansList.filter(l => (l.block || '').toLowerCase().trim() === fb);
        yhList = yhList.filter(y => (y.block || '').toLowerCase().trim() === fb);
      }

      // Count uploaded photos across visits
      const totalPhotos = visitsList.reduce((acc, v) => acc + (v.photos ? v.photos.length : 0), 0);
      const publishedStories = storiesList.filter(s => s.status === 'Published').length;

      return {
        totalYouth: youthList.length,
        employedYouth: placedList.length,
        skillTrainedYouth: skillsList.length,
        educationLinked: navList.length,
        identifiedEntrepreneurs: loansList.length,
        schemeBeneficiaries: loansList.filter(l => (l.scheme || '').toLowerCase().includes('pmegp') || (l.scheme || '').toLowerCase().includes('pmfme') || (l.scheme || '').toLowerCase().includes('mudra')).length,
        trainingsConducted: trainingsList.length,
        myBharatRegistered: mbList.length,
        youthHubTrainees: yhList.length,
        fieldVisitsCount: visitsList.length,
        visitPhotosCount: totalPhotos,
        successStoriesCount: publishedStories
      };
    }

    // -------------------------------------------------------------
    // 11 Specific Sheets Data Access with Exact Parameters
    // -------------------------------------------------------------
    getSheetData(sheetKey, options = {}) {
      let list = [];
      switch (sheetKey) {
        case 'Employment_Registration':
          list = (this.data.youth || []).map(y => {
            const parts = (y.name || '').trim().split(' ');
            return {
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || '',
              fatherHusband: y.fatherHusband || 'N/A',
              gramPanchayat: y.gramPanchayat || y.village || 'N/A',
              block: y.block || 'Dantewada',
              mobile: y.mobile || 'N/A',
              gender: y.gender || 'Male',
              category: y.category || 'ST',
              qualification: y.qualification || '12th Pass',
              occupation: y.employmentStatus || 'Unemployed',
              aspiredCareer: y.aspiredCareer || 'Direct Formal Jobs'
            };
          });
          break;

        case 'Employed':
          list = (this.data.placed || []).map(p => ({
            id: p.id,
            name: p.name,
            fatherName: p.fatherName || 'N/A',
            address: p.address || 'Dantewada',
            block: p.block || 'Dantewada',
            district: p.district || 'Dantewada',
            mobile: p.mobile,
            organisation: p.organisation,
            joiningDate: p.joiningDate || '2026-06-01',
            salary: p.salary || '₹12,000'
          }));
          break;

        case 'Skill_Linked':
          list = (this.data.skills || []).map(s => ({
            name: s.name,
            village: s.village || 'Dantewada',
            mobile: s.mobile || 'N/A',
            institute: s.institute || 'District Livelihood College',
            skillTraining: s.skillTraining || s.trade || 'Skill Course'
          }));
          break;

        case 'Education_Linked':
          list = (this.data.navgurukul || []).map(e => ({
            name: e.name,
            fatherName: e.fatherName || 'N/A',
            motherName: e.motherName || 'N/A',
            email: e.email || `${(e.name || 'youth').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            gender: e.gender || 'Female',
            education: e.education || 'Graduate',
            phone: e.phone || e.mobile || 'N/A',
            address: e.address || 'Dantewada'
          }));
          break;

        case 'Counselling':
          list = (this.data.counselling || []).map(c => ({
            block: c.block || 'Dantewada',
            gramPanchayat: c.gramPanchayat || c.village || 'N/A',
            firstName: c.firstName || (c.name ? c.name.split(' ')[0] : 'N/A'),
            lastName: c.lastName || (c.name ? c.name.split(' ').slice(1).join(' ') : ''),
            mobile: c.mobile || c.phone || 'N/A',
            gender: c.gender || 'Male',
            email: c.email || '',
            pinCode: c.pinCode || '494441',
            fatherHusband: c.fatherHusband || c.fatherName || 'N/A',
            motherName: c.motherName || 'N/A',
            category: c.category || 'ST',
            qualification: c.qualification || '12th Pass',
            currentOccupation: c.currentOccupation || 'Student / Job Seeker',
            aspiredCareer: c.aspiredCareer || 'Skill Training'
          }));
          break;

        case 'Entrepreneur_Identified':
        case 'Startup_Hunt':
        case 'Startup hunt':
          // This sheet has its own authoritative collection. Falling back to
          // entrepreneurIdeas when it is empty resurrects rows after deletion.
          if (Array.isArray(this.data.entrepreneursIdentified)) {
            list = (this.data.entrepreneursIdentified || []).map((e, idx) => ({
              id: e.id || idx + 1,
              'SR.no': e['SR.no'] || e.sNo || e.id || idx + 1,
              NAME: e.NAME || e.name || 'N/A',
              name: e.NAME || e.name || 'N/A',
              'FATHER NAME': e['FATHER NAME'] || e.fatherName || 'N/A',
              fatherName: e['FATHER NAME'] || e.fatherName || 'N/A',
              VILLAGE: e.VILLAGE || e.village || e.address || 'N/A',
              village: e.VILLAGE || e.village || e.address || 'N/A',
              BLOCK: e.BLOCK || e.block || 'Dantewada',
              block: e.BLOCK || e.block || 'Dantewada',
              'LOAN AMOUNT': e['LOAN AMOUNT'] || e.loanAmount || 'N/A',
              loanAmount: e['LOAN AMOUNT'] || e.loanAmount || 'N/A',
              BUSSINESS: e.BUSSINESS || e.business || 'N/A',
              business: e.BUSSINESS || e.business || 'N/A'
            }));
          } else {
            list = (this.data.entrepreneurIdeas || [])
              .filter(e => {
                const f = (e.founderName || e.name || '').trim();
                const s = (e.startupName || '').trim();
                if (!f && !s) return false;
                if (f === 'उद्यमी' && s === 'उद्यम विचार') return false;
                if (f === 'N/A' && s === 'Startup Idea') return false;
                return true;
              })
              .map((e, idx) => ({
                id: e.id || idx + 1,
                'SR.no': e.id || idx + 1,
                NAME: e.founderName || e.name || 'N/A',
                name: e.founderName || e.name || 'N/A',
                'FATHER NAME': e.fatherName || 'N/A',
                fatherName: e.fatherName || 'N/A',
                VILLAGE: e.address || e.village || 'N/A',
                village: e.address || e.village || 'N/A',
                BLOCK: e.district || e.block || 'Dantewada',
                block: e.district || e.block || 'Dantewada',
                'LOAN AMOUNT': e.investmentNeeded || e.loanAmount || 'N/A',
                loanAmount: e.investmentNeeded || e.loanAmount || 'N/A',
                BUSSINESS: e.startupName || e.business || 'N/A',
                business: e.startupName || e.business || 'N/A',
                startupName: e.startupName || 'Startup Idea',
                founderName: e.founderName || 'N/A',
                district: e.district || 'Dantewada',
                age: e.age || 'N/A',
                education: e.education || 'N/A',
                address: e.address || 'Dantewada',
                mobile: e.mobile || 'N/A',
                investmentNeeded: e.investmentNeeded || 'N/A',
                workType: e.workType || 'FULL TIME',
                businessModel: e.businessModel || 'N/A'
              }));
          }
          break;

        case 'Startup_Ideas':
        case 'Startup & Innovation Idea':
          list = this.data.startupIdeas || [];
          break;

        case 'Startup_District_Ideas': {
          const ideas = this.data.entrepreneurIdeas || [];
          if (ideas.length === 0) {
            list = [];
            break;
          }
          const byDistrict = {};
          ideas.forEach(i => {
            const d = (i.district || 'Dantewada').trim();
            if (!byDistrict[d]) byDistrict[d] = [];
            byDistrict[d].push(i);
          });
          let sr = 1;
          list = Object.keys(byDistrict).map(d => {
            const items = byDistrict[d];
            return {
              sr: sr++,
              district: d,
              districtKey: d,
              totalIdeas: items.length,
              shortlisted: items.filter(x => x.workType === 'FULL TIME' || (x.businessModel && x.businessModel !== 'N/A')).length,
              keySectors: [...new Set(items.map(x => x.targetCustomer || x.problemSolved || 'General').filter(Boolean))].slice(0, 3).join(', ') || 'Various',
              topIdeas: items.slice(0, 4).map(x => x.startupName).join(', ') || 'N/A',
              totalInvestment: `₹${items.reduce((acc, curr) => acc + (parseFloat(curr.investedSoFar) || 0), 0).toLocaleString('en-IN')}`,
              targetAudience: 'Tribal Artisans, Youth, Farmers'
            };
          });
          if (list.length > 0) {
            list.push({
              sr: 'TOTAL',
              district: 'TOTAL / कुल संभाग एवं संबद्ध जिले',
              districtKey: 'All',
              totalIdeas: ideas.length,
              shortlisted: list.reduce((a, b) => a + (b.shortlisted || 0), 0),
              keySectors: 'Cross-Sector Innovations & Tribal Micro-Enterprises',
              topIdeas: `${ideas.length} Real Youth Startup Proposals`,
              totalInvestment: `₹${ideas.reduce((acc, curr) => acc + (parseFloat(curr.investedSoFar) || 0), 0).toLocaleString('en-IN')}`,
              targetAudience: 'Comprehensive Youth Self-Employment Ecosystem'
            });
          }
          break;
        }

        case 'PMEGP_PMFME_Loan':
          list = (this.data.loans || []).map(l => ({
            name: l.name,
            fatherName: l.fatherName || 'N/A',
            village: l.village || 'Dantewada',
            block: l.block || 'Dantewada',
            amount: l.amount || '100000',
            yojna: l.scheme || 'PMEGP / MUDRA',
            business: l.business || 'Enterprise'
          }));
          break;

        case 'Rang_De_Loan':
          list = this.data.rangDe || [];
          break;

        case 'Rehabilitation_Counselling':
        case 'rehabilitation_counselling':
        case 'Rehabilitation Counselling':
        case 'rehabilitationCounselling':
          list = (this.data.rehabilitationCounselling || []).map(r => ({
            id: r.id || '',
            name: r.name || r['NAME'] || r['NAME '] || r.candidateName || 'N/A',
            address: r.address || r['ADDRESS'] || r.village || 'Dantewada',
            mobile: r.mobile || r['MOBILE NO.'] || r['MOBILE NUMBER'] || '-',
            institute: r.institute || r['INSTITUTE'] || 'LIVELIHOOD',
            training: r.training || r['TRAINING'] || r.trade || 'Computer Operator',
            block: r.block || 'Dantewada'
          }));
          break;

        case 'IIM_Candidate_List':
          list = (this.data.iimRaipur || []).map(i => ({
            id: i.id,
            name: i.name,
            fatherName: i.fatherName || 'N/A',
            gender: i.gender || 'Male',
            age: i.age || '22',
            category: i.category || i.cast || 'ST',
            gp: i.gp || i.village || 'N/A',
            block: i.block || 'Dantewada',
            district: i.district || 'Dantewada',
            mobile: i.mobile || 'N/A',
            education: i.education || 'Graduate',
            percent: i.percent || '65%',
            age2: i.age || '22'
          }));
          break;

        case 'Training_Conducted':
          list = (this.data.trainingConducted || []).map(t => ({
            name: t.name || 'N/A',
            address: t.address || t.village || 'Dantewada',
            mobile: t.mobile || 'N/A',
            institute: t.institute || 'District Livelihood College Dantewada',
            training: t.training || t.trade || 'Skill Training',
            block: t.block || 'Dantewada'
          }));
          break;

        case 'MY_Bharat_Registration':
          list = (this.data.myBharat || []).map(m => ({
            name: m.name,
            fatherName: m.fatherName || 'N/A',
            village: m.village || 'Dantewada',
            block: m.block || 'Dantewada',
            dob: m.dob || '2002-05-14',
            gender: m.gender || 'Male',
            mobile: m.mobile || 'N/A',
            category: m.category || 'ST',
            currentOccupation: m.currentOccupation || 'Candidate',
            remark: m.remark || 'Active Registered'
          }));
          break;

        case 'Youth_Hub_Trainings':
          list = (this.data.youthHubTrainings || []).map(y => ({
            name: y.name,
            fatherName: y.fatherName || 'N/A',
            village: y.village || 'Dantewada',
            block: y.block || 'Dantewada',
            dob: y.dob || '2001-11-20',
            gender: y.gender || 'Male',
            mobile: y.mobile || 'N/A',
            remark: y.remark || 'Training Completed'
          }));
          break;

        case 'Bastar_Munne_Shivir':
          list = (this.data.bastarShivir || []).map(b => ({
            name: b.name,
            fatherName: b.fatherName || 'N/A',
            village: b.village || 'Dantewada',
            block: b.block || 'Dantewada',
            dob: b.dob || '2003-04-12',
            gender: b.gender || 'Male',
            mobile: b.mobile || 'N/A',
            aadhar: b.aadhar || 'XXXXXXXX7890',
            category: b.category || 'ST',
            training: b.training || b.remark || 'Skill Training',
            remark: b.training ? `${b.training}` : (b.remark || 'Counseling Completed')
          }));
          break;

        case 'Bastar_Munne_Report':
          list = (this.data.bastarMunneVillageReport || []);
          break;

        case 'Meetings_VO_CLF_TRIF':
          list = (this.data.meetingsVoClfTrif || []).map((m, idx) => ({
            id: m.id || idx + 1,
            date: m.date || '2026-03-01',
            village: m.village || m.gp || 'Dantewada',
            block: m.block || 'Dantewada',
            voClfName: m.voClfName || m.orgName || 'Prerna Mahila Gram Sangathan',
            adhayakshSachiv: m.adhayakshSachiv || m.chairedBy || 'N/A',
            discussPoint: m.discussPoint || m.agenda || 'Livelihood & Mobilization Review',
            remarks: m.remarks || m.decisions || 'Action Plan Finalized',
            photo: m.photo || m.photoUrl || '',
            // Backward compatibility aliases
            orgName: m.voClfName || m.orgName || 'Prerna Mahila Gram Sangathan',
            gp: m.village || m.gp || 'Dantewada',
            chairedBy: m.adhayakshSachiv || m.chairedBy || 'N/A',
            agenda: m.discussPoint || m.agenda || '',
            decisions: m.remarks || m.decisions || '',
            type: m.type || 'VO/CLF Meeting',
            status: m.status || m.remarks || 'Completed'
          }));
          break;

        case 'M_Form':
          list = (this.data.mFormRecords || []).map((m, idx) => ({
            id: m.id || idx + 1,
            block: m.block || m['Block Name'] || 'Dantewada',
            gramPanchayat: m.gramPanchayat || m.gp || m['Grampanchayat'] || '',
            firstName: m.firstName || m['First Name'] || (m.name ? m.name.split(' ')[0] : ''),
            lastName: m.lastName || m['Last Name'] || (m.name ? m.name.split(' ').slice(1).join(' ') : ''),
            mobile: m.mobile || m['Mobile Number'] || m['Mobile'] || '',
            gender: m.gender || m['Gender'] || 'Male',
            email: m.email || m['Email'] || '',
            pinCode: m.pinCode || m['Pin Code'] || '',
            fatherHusband: m.fatherHusband || m["Father's Name / Husband's Name"] || m.fatherName || '',
            motherName: m.motherName || m["Mother's Name"] || '',
            category: m.category || m['Category'] || 'ST',
            qualification: m.qualification || m['Highest Qualification'] || '12th Pass',
            currentOccupation: m.currentOccupation || m['Current Occupation'] || m.occupation || 'Candidate',
            aspiredCareer: m.aspiredCareer || m['Aspired Career'] || 'Direct Formal Jobs',
            state: m.state || m['State Name'] || 'CHHATTISGARH',
            district: m.district || m['District Name'] || 'Dantewada',
            village: m.village || m['Village Of Candidate'] || ''
          }));
          break;

        case 'Field_Visits':
          list = (this.data.fieldVisits || []).map(v => ({
            id: v.id,
            date: v.date || '',
            officerName: v.officerName || '',
            block: v.block || 'Dantewada',
            gramPanchayat: v.gramPanchayat || v.locationName || '',
            location: v.locationName || '',
            purpose: v.purpose || '',
            scheme: v.scheme || '',
            findings: v.observations || v.findings || '',
            status: v.status || 'Resolved',
            photos: v.photos || []
          }));
          break;

        case 'Success_Stories':
          list = (this.data.successStories || []).map(s => ({
            id: s.id,
            youthName: s.youthName || '',
            village: s.village || '',
            block: s.block || 'Dantewada',
            category: s.category || 'Employment',
            title: s.title || '',
            summary: s.summary || '',
            status: s.status || 'Published',
            photoUrl: s.photoUrl || ''
          }));
          break;

        default:
          list = this.data.youth || [];
      }

      // Apply Search Filter
      if (options.search && options.search.trim()) {
        const q = options.search.trim().toLowerCase();
        list = list.filter(item => {
          return Object.values(item).some(val => 
            val && val.toString().toLowerCase().includes(q)
          );
        });
      }

      // Apply Block Filter
      if (options.block && options.block !== 'All') {
        const b = options.block.toLowerCase();
        list = list.filter(item => {
          const itemBlock = (item.block || item.address || item.village || '').toLowerCase();
          return itemBlock.includes(b);
        });
      }

      return list;
    }

    getVillageReportCandidates(villageName = '', tradeFilter = 'ALL', searchQuery = '') {
      let list = (this.data.bastarVillageCandidates || []);

      if (villageName && villageName !== 'ALL' && !villageName.toLowerCase().includes('total')) {
        const vClean = villageName.trim().toLowerCase();
        list = list.filter(c => (c.village || '').trim().toLowerCase() === vClean);
      }

      if (tradeFilter && tradeFilter !== 'ALL') {
        const tClean = tradeFilter.trim().toUpperCase();
        list = list.filter(c => {
          const t = (c.training || c.remark || '').toUpperCase();
          return t === tClean || t.includes(tClean);
        });
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(c => {
          return Object.values(c).some(val => val && val.toString().toLowerCase().includes(q));
        });
      }

      return list;
    }

    // -------------------------------------------------------------
    // Youth Profile Management (PRD Section 4)
    // -------------------------------------------------------------
    getYouth(options = {}) {
      let list = [...(this.data.youth || [])];

      // Check RBAC block restriction
      if (window.DantewadaAuth && window.DantewadaAuth.isBlockRestricted()) {
        const restrictedBlock = window.DantewadaAuth.getRestrictedBlock();
        if (restrictedBlock) {
          list = list.filter(y => (y.block || '').toLowerCase() === restrictedBlock.toLowerCase());
        }
      } else if (options.block && options.block !== 'All') {
        list = list.filter(y => (y.block || '').toLowerCase() === options.block.toLowerCase());
      }

      if (options.gramPanchayat && options.gramPanchayat !== 'All') {
        list = list.filter(y => (y.gramPanchayat || '').toLowerCase() === options.gramPanchayat.toLowerCase());
      }

      if (options.gender && options.gender !== 'All') {
        list = list.filter(y => (y.gender || '').toLowerCase() === options.gender.toLowerCase());
      }

      if (options.category && options.category !== 'All') {
        list = list.filter(y => (y.category || '').toLowerCase() === options.category.toLowerCase());
      }

      if (options.employmentStatus && options.employmentStatus !== 'All') {
        list = list.filter(y => (y.employmentStatus || '').toLowerCase() === options.employmentStatus.toLowerCase());
      }

      if (options.search) {
        const q = options.search.toLowerCase().trim();
        list = list.filter(y =>
          (y.name || '').toLowerCase().includes(q) ||
          (y.mobile || '').includes(q) ||
          (y.village || '').toLowerCase().includes(q) ||
          (y.block || '').toLowerCase().includes(q) ||
          (y.fatherHusband || '').toLowerCase().includes(q) ||
          (y.id || '').includes(q)
        );
      }

      return list;
    }

    getYouthById(id) {
      const youth = (this.data.youth || []).find(y => String(y.id) === String(id));
      if (!youth) return null;

      // Construct rich linked timeline across modules
      const mobile = youth.mobile || '';
      const name = (youth.name || '').toLowerCase().trim();

      const linkedPlaced = (this.data.placed || []).filter(p => (mobile && p.mobile === mobile) || (p.name && p.name.toLowerCase().includes(name)));
      const linkedSkills = (this.data.skills || []).filter(s => (mobile && s.mobile === mobile) || (s.name && s.name.toLowerCase().includes(name)));
      const linkedNav = (this.data.navgurukul || []).filter(n => (mobile && n.mobile === mobile) || (n.name && n.name.toLowerCase().includes(name)));
      const linkedLoans = (this.data.loans || []).filter(l => (l.name && l.name.toLowerCase().includes(name)));
      const linkedVisits = (this.data.fieldVisits || []).filter(v => String(v.linkedYouthId) === String(id) || (v.linkedYouthName && v.linkedYouthName.toLowerCase().includes(name)));
      const linkedStories = (this.data.successStories || []).filter(s => String(s.linkedYouthId) === String(id) || (s.youthName && s.youthName.toLowerCase().includes(name)));
      const linkedMyBharat = (this.data.myBharat || []).filter(m => (mobile && m.mobile === mobile) || (m.name && m.name.toLowerCase().includes(name)));
      const linkedShivir = (this.data.bastarShivir || []).filter(b => (mobile && b.mobile === mobile) || (b.name && b.name.toLowerCase().includes(name)));

      return {
        ...youth,
        linkedPlaced,
        linkedSkills,
        linkedNav,
        linkedLoans,
        linkedVisits,
        linkedStories,
        linkedMyBharat,
        linkedShivir
      };
    }

    saveYouth(profile) {
      if (!this.data.youth) this.data.youth = [];

      let isNew = false;
      if (!profile.id) {
        isNew = true;
        profile.id = String(Date.now());
      }

      const existingIdx = this.data.youth.findIndex(y => String(y.id) === String(profile.id));

      if (existingIdx >= 0) {
        const old = this.data.youth[existingIdx];
        this.data.youth[existingIdx] = { ...old, ...profile, updatedAt: new Date().toISOString() };
        this.logAudit('UPDATE_YOUTH', 'Youth Profiles', `ID: ${profile.id} (${profile.name})`, `Updated profile fields for ${profile.name}`);
      } else {
        isNew = true;
        profile.registeredDate = profile.registeredDate || new Date().toISOString().split('T')[0];
        profile.status = profile.status || 'Active';
        this.data.youth.unshift(profile);
        this.logAudit('CREATE_YOUTH', 'Youth Profiles', `ID: ${profile.id} (${profile.name})`, `Created new digital profile in block ${profile.block}`);
      }

      this.persist();
      window.dispatchEvent(new CustomEvent('db:changed'));
      return profile;
    }

    deleteYouth(id) {
      const idx = (this.data.youth || []).findIndex(y => String(y.id) === String(id));
      if (idx >= 0) {
        const removed = this.data.youth.splice(idx, 1)[0];
        this.logAudit('DELETE_YOUTH', 'Youth Profiles', `ID: ${id} (${removed.name})`, `Removed youth profile record`);
        this.persist();
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    // -------------------------------------------------------------
    // Field Visits & Photo Upload Management (PRD Section 6 & 7)
    // -------------------------------------------------------------
    getFieldVisits(options = {}) {
      let list = [...(this.data.fieldVisits || [])];

      if (options.isPublicOnly) {
        list = list.filter(v => v.isPublic && v.approvalStatus === 'Approved');
      }

      // Check RBAC block restriction
      if (window.DantewadaAuth && window.DantewadaAuth.isBlockRestricted()) {
        const restrictedBlock = window.DantewadaAuth.getRestrictedBlock();
        if (restrictedBlock) {
          list = list.filter(v => (v.block || '').toLowerCase() === restrictedBlock.toLowerCase());
        }
      } else if (options.block && options.block !== 'All') {
        list = list.filter(v => (v.block || '').toLowerCase() === options.block.toLowerCase());
      }

      if (options.gramPanchayat && options.gramPanchayat !== 'All') {
        list = list.filter(v => (v.gramPanchayat || '').toLowerCase() === options.gramPanchayat.toLowerCase());
      }

      if (options.status && options.status !== 'All') {
        list = list.filter(v => v.status === options.status);
      }

      if (options.scheme && options.scheme !== 'All') {
        list = list.filter(v => (v.scheme || '').toLowerCase().includes(options.scheme.toLowerCase()));
      }

      if (options.search) {
        const q = options.search.toLowerCase().trim();
        list = list.filter(v =>
          (v.id || '').toLowerCase().includes(q) ||
          (v.officerName || '').toLowerCase().includes(q) ||
          (v.locationName || '').toLowerCase().includes(q) ||
          (v.purpose || '').toLowerCase().includes(q) ||
          (v.linkedYouthName || '').toLowerCase().includes(q)
        );
      }

      return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    getFieldVisitById(id) {
      return (this.data.fieldVisits || []).find(v => String(v.id) === String(id));
    }

    saveFieldVisit(visit) {
      if (!this.data.fieldVisits) this.data.fieldVisits = [];

      let isNew = false;
      if (!visit.id) {
        isNew = true;
        const currentCount = this.data.fieldVisits.length + 1;
        visit.id = `VIS-2026-${String(currentCount).padStart(4, '0')}`;
      }

      const existingIdx = this.data.fieldVisits.findIndex(v => String(v.id) === String(visit.id));

      if (existingIdx >= 0) {
        this.data.fieldVisits[existingIdx] = { ...this.data.fieldVisits[existingIdx], ...visit };
        this.logAudit('UPDATE_VISIT', 'Field Visits', visit.id, `Updated visit report: ${visit.purpose} (${visit.locationName})`);
      } else {
        visit.approvalStatus = visit.approvalStatus || 'Pending Approval';
        visit.isPublic = (visit.isPublic !== undefined) ? visit.isPublic : false;
        visit.photos = visit.photos || [];
        this.data.fieldVisits.unshift(visit);
        this.logAudit('CREATE_VISIT', 'Field Visits', visit.id, `Logged new visit at ${visit.locationName}, Block: ${visit.block}`);
      }

      this.persist();
      window.dispatchEvent(new CustomEvent('db:changed'));
      return visit;
    }

    updateVisitApproval(id, approvalStatus, isPublic) {
      const visit = this.getFieldVisitById(id);
      if (visit) {
        visit.approvalStatus = approvalStatus;
        visit.isPublic = !!isPublic;
        this.logAudit('VISIT_APPROVAL', 'Visit Gallery', visit.id, `Status updated to ${approvalStatus}, Public visibility: ${isPublic}`);
        this.persist();
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    updateVisitStatus(id, newStatus, resolutionNotes = '') {
      const visit = this.getFieldVisitById(id);
      if (visit) {
        const oldStatus = visit.status;
        visit.status = newStatus;
        if (resolutionNotes) {
          visit.resolutionNotes = resolutionNotes;
        }
        this.logAudit('VISIT_STATUS_CHANGE', 'Visit Monitoring', visit.id, `Status changed from ${oldStatus} to ${newStatus}`);
        this.persist();
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    deleteFieldVisit(id) {
      if (!this.data.fieldVisits) return false;
      const idx = this.data.fieldVisits.findIndex(v => String(v.id) === String(id));
      if (idx >= 0) {
        const deleted = this.data.fieldVisits.splice(idx, 1)[0];
        this.logAudit('DELETE_VISIT', 'Field Visits', id, `Deleted visit: ${deleted.locationName || ''} (${deleted.purpose || ''})`);
        this.persist();
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    deleteVisit(id) {
      return this.deleteFieldVisit(id);
    }

    // -------------------------------------------------------------
    // Success Stories Management (PRD Section 5)
    // -------------------------------------------------------------
    getSuccessStories(options = {}) {
      let list = [...(this.data.successStories || [])];

      if (options.isPublicOnly) {
        list = list.filter(s => s.status !== 'Rejected' && s.status !== 'Draft');
      }

      if (options.category && options.category !== 'All') {
        list = list.filter(s => (s.category || '').toLowerCase() === options.category.toLowerCase());
      }

      if (options.status && options.status !== 'All') {
        list = list.filter(s => s.status === options.status);
      }

      if (options.featuredOnly) {
        list = list.filter(s => s.featured);
      }

      if (options.search) {
        const q = options.search.toLowerCase().trim();
        list = list.filter(s =>
          (s.title || '').toLowerCase().includes(q) ||
          (s.youthName || '').toLowerCase().includes(q) ||
          (s.village || '').toLowerCase().includes(q) ||
          (s.summary || '').toLowerCase().includes(q)
        );
      }

      return list;
    }

    getSuccessStoryById(id) {
      return (this.data.successStories || []).find(s => String(s.id) === String(id));
    }

    saveSuccessStory(story) {
      if (!this.data.successStories) this.data.successStories = [];

      let isNew = false;
      if (!story.id) {
        isNew = true;
        const count = this.data.successStories.length + 1;
        story.id = `STORY-${String(count).padStart(3, '0')}`;
      }

      const existingIdx = this.data.successStories.findIndex(s => String(s.id) === String(story.id));

      if (existingIdx >= 0) {
        this.data.successStories[existingIdx] = { ...this.data.successStories[existingIdx], ...story };
        this.logAudit('UPDATE_STORY', 'Success Gallery', story.id, `Updated story: ${story.title}`);
      } else {
        story.status = story.status || 'Draft';
        story.featured = !!story.featured;
        this.data.successStories.unshift(story);
        this.logAudit('CREATE_STORY', 'Success Gallery', story.id, `Created story for ${story.youthName}`);
      }

      this.persist();
      window.dispatchEvent(new CustomEvent('db:changed'));
      return story;
    }

    updateStoryStatus(id, newStatus) {
      const story = this.getSuccessStoryById(id);
      if (story) {
        const old = story.status;
        story.status = newStatus;
        this.logAudit('STORY_STATUS_CHANGE', 'Success Gallery', story.id, `Workflow updated from ${old} to ${newStatus}`);
        this.persist();
        window.dispatchEvent(new CustomEvent('db:changed'));
        return true;
      }
      return false;
    }

    // -------------------------------------------------------------
    // Excel/CSV 12-Sheets Importer (PRD Section 2)
    // -------------------------------------------------------------
    previewImport(sheetName, rawRows) {
      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        return {
          validRows: [],
          duplicateRows: [],
          invalidRows: [],
          totalCount: 0,
          errorSummary: 'No data rows detected in sheet.'
        };
      }

      const validRows = [];
      const duplicateRows = [];
      const invalidRows = [];

      const existingMobiles = new Set(
        (this.data.youth || []).map(y => (y.mobile || '').replace(/\D/g, '')).filter(m => m.length >= 10)
      );

      rawRows.forEach((row, idx) => {
        const cleanRow = { ...row, _rowNum: idx + 2 };

        // Helper to extract value by multiple possible aliases with trimming and case/space-insensitivity
        const getFieldVal = (aliases) => {
          // 1. Direct key match
          for (const a of aliases) {
            if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') {
              return String(row[a]).trim();
            }
          }
          // 2. Fuzzy clean match (ignore spaces, punctuation, case)
          const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const rowEntries = Object.entries(row);
          for (const a of aliases) {
            const cleanA = clean(a);
            for (const [rk, rv] of rowEntries) {
              if (clean(rk) === cleanA && rv !== undefined && rv !== null && String(rv).trim() !== '') {
                return String(rv).trim();
              }
            }
          }
          return '';
        };

        const hasAnyContent = Object.entries(row).some(([k, v]) => {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (['empty', 'sr', 'srno', 'sno', 'sl', 'id', 'rownum'].some(p => cleanK.includes(p))) return false;
          return v !== undefined && v !== null && String(v).trim() !== '';
        });

        // 1. Name resolution
        let name = '';
        const firstName = getFieldVal(['First Name', 'firstname', 'First_Name']);
        const lastName = getFieldVal(['Last Name', 'lastname', 'Last_Name', 'Surname']);
        if (firstName || lastName) {
          name = `${firstName} ${lastName}`.trim();
        }
        if (!name) {
          name = getFieldVal([
            'NAME', 'NAME ', 'Name', 'Full Name', 'fullName', 'Youth_Name', 'Candidate_Name',
            'TRAINING NAME', 'Training Name', 'TRAINNER', 'Trainner', 'TRAINER', 'Trainer',
            'FOUNDER NAME', 'Founder Name', 'पूरा नाम (Full Name)',
            'STARTUP / IDEA NAME', 'आपके स्टार्टअप/आइडिया का नाम (Name of your Startup/Idea)',
            'VO / CLF NAME', 'VO/CLF NAME', 'VO CLF NAME', 'VO_CLF_NAME', 'ORGANIZATION / CLF NAME',
            'ADHAYAKSH / SACHIV', 'ADHAYAKSH SACHIV', 'Adhayaksh / Sachiv', 'VILLAGE NAME', 'Village Name'
          ]);
        }
        if (!name) {
          if (sheetName === 'Meetings_VO_CLF_TRIF' || sheetName === 'VO CLF Meeting') {
            name = getFieldVal(['VO / CLF NAME', 'VILLAGE', 'Village', 'ADHAYAKSH / SACHIV']) || (hasAnyContent ? `Meeting Record #${idx + 1}` : '');
          } else if (sheetName === 'Bastar_Munne_Report') {
            name = getFieldVal(['VILLAGE NAME', 'Village', 'VILLAGE']) || (hasAnyContent ? `Village Report #${idx + 1}` : '');
          } else if (sheetName === 'Training_Conducted' || sheetName === 'training_conducted' || sheetName === 'Youth_Hub_Trainings') {
            const trProg = getFieldVal(['TRAINING NAME', 'Training Name', 'TRAINING', 'Training', 'Course', 'INTERESTED TRADE (इच्छुक ट्रेड)']);
            const trTrainer = getFieldVal(['TRAINNER', 'Trainner', 'TRAINER', 'Trainer']);
            const trVenue = getFieldVal(['VANUE', 'Vanue', 'VENUE', 'Venue', 'ADDRESS', 'Address', 'VILLAGE', 'Village']);
            const trOrg = getFieldVal(['ORAGANISATION', 'Oraganisation', 'ORGANISATION', 'Organisation', 'INSTITUTE', 'Institute']);
            if (trProg) {
              name = trProg;
            } else if (trTrainer) {
              name = `${trTrainer} (Trainer)`;
            } else if (trVenue || trOrg) {
              name = `Training at ${trVenue || trOrg}`;
            } else if (hasAnyContent) {
              name = `Training Session #${idx + 1}`;
            }
          } else if (getFieldVal(['MOBILE NO.', 'MOBILE NO', 'MOBILE N0.', 'Mobile Number', 'Phone Number', 'ORGANISATION'])) {
            name = `Candidate #${idx + 1}`;
          }
        }

        // 2. Father / Husband name
        const fatherName = getFieldVal([
          "Father's Name / Husband's Name", 'FATHER NAME', 'Father Name', 'Faather Name',
          'fatherHusband', 'Father_Name', "Father's Name", 'Husband Name'
        ]);

        // 3. Mobile normalization
        const rawMobile = getFieldVal([
          'Mobile Number', 'MOBILE NO.', 'MOBILE NO', 'MOBILE N0.', 'Phone Number',
          ' Phone Number', 'Mobile', 'mobile', 'Phone', 'phone', 'Contact Number', 'TELEPHONE'
        ]);
        const mobile = rawMobile.replace(/\D/g, '').trim();

        // 4. Block
        const block = getFieldVal(['Block Name', 'BLOCK', 'Block', 'block', 'District', 'DISTRICT', 'Taluka']) || 'Dantewada';

        // 5. Village / Address / GP
        const village = getFieldVal([
          'Grampanchayat', 'Gram Panchayat', 'GP', 'VILLAGE', 'Village',
          'ADDRESS', 'Address', 'Village Of Candidate', 'Location', 'Panchayat',
          'VANUE', 'Vanue', 'VENUE', 'Venue'
        ]);

        // 6. Organization & Salary for Employed
        const organisation = getFieldVal([
          'ORGANISATION', 'Organisation', 'Organization', 'Company', 'Employer',
          'INSTITUTE', 'Institute', 'Agency', 'ORAGANISATION', 'Oraganisation'
        ]);
        const salary = getFieldVal(['SALARY', 'Salary', 'Remuneration', 'Income', 'Pay', 'Package']);
        const joiningDate = getFieldVal(['DATE OF JOINING', 'Date of Joining', 'Joining Date', 'Date', 'DOJ']);

        // 7. Business & Loan
        const business = getFieldVal(['BUSSINESS', 'Business', 'business', 'ACTIVITY', 'Activity', 'Trade', 'Startup Idea']);
        const loanAmount = getFieldVal(['LOAN AMOUNT', 'Loan Amount', 'AMOUNT (₹)', 'Amount', 'AMOUNT', 'INVESTMENT NEEDED']);
        const yojana = getFieldVal(['YOJNA', 'Yojna', 'Scheme', 'SCHEME', 'Yojana']);

        // 8. Skill & Training
        const institute = getFieldVal([
          'INSTITUTE', 'Institute', 'Training Center', 'College',
          'ORAGANISATION', 'Oraganisation', 'ORGANISATION', 'Organisation', 'Agency'
        ]);
        const training = getFieldVal([
          'SKILL TRAINING', 'TRAINING', 'Training', 'TRAINING NAME', 'Training Name',
          'INTERESTED TRADE (इच्छुक ट्रेड)', 'Trade', 'Course'
        ]);
        const trainer = getFieldVal(['TRAINNER', 'Trainner', 'TRAINER', 'Trainer']);
        const duration = getFieldVal(['DURATION', 'Duration']);
        const supportingStaff = getFieldVal(['SUPPORTING STAFF', 'Supporting Staff']);

        // 9. Personal details
        let age = getFieldVal(['AGE', 'Age']);
        const age2 = getFieldVal(['AGE_1', 'AGE (2)', 'AGE2']);
        if (age2 && age2 !== age) {
          age = `${age} / ${age2}`;
        }
        const motherName = getFieldVal(['Mother Name', 'Mother_Name', 'Mothers Name']);
        const email = getFieldVal(['Email', 'EMAIL', 'Email ID', 'EMAIL ID']);
        const aadhar = getFieldVal(['AADHAR', 'Aadhar', 'Aadhaar', 'Aadhar Number']);
        const dob = getFieldVal(['DOB', 'Date of Birth', 'Birth Date']);
        const remark = getFieldVal(['REMARK', 'Remark', 'Remarks', 'REMARKS']);

        cleanRow._normalized = {
          name,
          fatherName,
          mobile,
          block: this.standardizeBlock(block),
          village,
          gender: row['Gender'] || row['GENDER'] || 'Male',
          category: row['Category'] || row['CATEGORY'] || row['CAST'] || 'ST',
          qualification: row['Highest Qualification'] || row['Education'] || row['EDUCATION'] || '12th Pass',
          occupation: row['Current Occupation'] || row['CURRENT OCCUPATION'] || 'Candidate',
          aspiredCareer: row['Aspired Career'] || '',
          business,
          loanAmount,
          yojana,
          institute,
          training,
          trainer,
          duration,
          supportingStaff,
          organisation,
          salary,
          joiningDate,
          motherName,
          email,
          aadhar,
          dob,
          remark,
          age
        };

        if (!name) {
          invalidRows.push({ row: cleanRow, reason: 'युवा/उम्मीदवार का नाम रिक्त है (Missing Name)' });
          return;
        }

        // Check duplicates by mobile number
        if (mobile && mobile.length >= 10 && existingMobiles.has(mobile)) {
          duplicateRows.push({ row: cleanRow, reason: `मोबाइल नंबर ${mobile} डेटाबेस में पहले से मौजूद है` });
          return;
        }

        validRows.push(cleanRow);
      });

      return {
        sheetName,
        totalCount: rawRows.length,
        validRows,
        duplicateRows,
        invalidRows
      };
    }

    commitImport(sheetName, validRows, options = {}) {
      if (!Array.isArray(validRows) || validRows.length === 0) {
        return { success: false, message: 'No valid rows to commit.' };
      }

      let insertedCount = 0;
      let updatedCount = 0;
      validRows.forEach((row, idx) => {
        const norm = row._normalized || {
          name: (row['First Name'] ? `${row['First Name']} ${row['Last Name'] || ''}`.trim() : (row.NAME || row.Name || row.Youth_Name || '')),
          fatherName: (row["Father's Name / Husband's Name"] || row['FATHER NAME'] || row['Father Name'] || ''),
          mobile: (row['Mobile Number'] || row['MOBILE NO.'] || row['Mobile'] || '').toString().replace(/\D/g, '').trim(),
          block: (row['Block Name'] || row['BLOCK'] || row['Block'] || 'Dantewada'),
          village: (row['Village Of Candidate'] || row['Grampanchayat'] || row['VILLAGE'] || row['Village'] || 'Dantewada'),
          gender: row['Gender'] || 'Male',
          category: row['Category'] || 'ST',
          qualification: row['Highest Qualification'] || row['Qualification'] || '12th Pass',
          occupation: row['Current Occupation'] || 'Candidate',
          aspiredCareer: row['Aspired Career'] || ''
        };

        let loanDetails = '';
        if (norm.loanAmount || norm.business) {
          loanDetails = `Amount: ₹${norm.loanAmount || 'N/A'} | Business: ${norm.business || 'N/A'} | Scheme: ${norm.yojana || sheetName}`;
        }

        let remarks = `Imported via ${sheetName} on ${new Date().toISOString().split('T')[0]}`;
        if (norm.remark) remarks += ` | ${norm.remark}`;
        if (norm.organisation) remarks += ` | Org: ${norm.organisation} (Salary: ${norm.salary || 'N/A'})`;
        if (norm.training) remarks += ` | Trade: ${norm.training} (${norm.institute || 'Livelihood College'})`;

        const newRecord = {
          id: String(Date.now() + Math.floor(Math.random() * 100000)),
          name: norm.name,
          fatherHusband: norm.fatherName || '',
          mobile: norm.mobile || '0000000000',
          village: norm.village || 'Dantewada',
          gramPanchayat: norm.village || 'Dantewada',
          block: norm.block || 'Dantewada',
          gender: norm.gender,
          category: norm.category,
          qualification: norm.qualification,
          employmentStatus: norm.occupation,
          aspiredCareer: norm.aspiredCareer || (norm.training ? `Training: ${norm.training}` : sheetName),
          scheme: norm.yojana || sheetName,
          loanDetails: loanDetails,
          motherName: norm.motherName,
          email: norm.email,
          dob: norm.dob,
          aadhar: norm.aadhar ? this.maskAadhaar(norm.aadhar) : '',
          status: 'Active',
          remarks: remarks,
          followUpDate: '2026-11-20',
          registeredDate: new Date().toISOString().split('T')[0]
        };

        if (sheetName !== 'Meetings_VO_CLF_TRIF' && sheetName !== 'Startup_Ideas' && sheetName !== 'Startup & Innovation Idea') {
          this.data.youth.unshift(newRecord);
        }
        insertedCount++;

        // Also add to specific child collection if applicable
        if (sheetName === 'Employed') {
          if (!this.data.placed) this.data.placed = [];
          this.data.placed.unshift({
            id: this.data.placed.length + 1,
            name: norm.name,
            fatherName: norm.fatherName,
            address: norm.village,
            block: norm.block,
            district: 'Dantewada',
            mobile: norm.mobile,
            organisation: norm.organisation || 'N/A',
            joiningDate: norm.joiningDate || new Date().toISOString().split('T')[0],
            salary: norm.salary || '₹12,000'
          });
        } else if (sheetName === 'Skill_Linked') {
          if (!this.data.skills) this.data.skills = [];
          this.data.skills.unshift({
            name: norm.name,
            village: norm.village,
            mobile: norm.mobile,
            institute: norm.institute || 'District Livelihood College',
            skillTraining: norm.training || 'Skill Training'
          });
        } else if (sheetName === 'Education_Linked') {
          if (!this.data.navgurukul) this.data.navgurukul = [];
          this.data.navgurukul.unshift({
            id: this.data.navgurukul.length + 1,
            name: norm.name,
            fatherName: norm.fatherName,
            motherName: norm.motherName,
            email: norm.email || `${norm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            gender: norm.gender,
            education: norm.qualification,
            phone: norm.mobile,
            address: norm.village || norm.block
          });
        } else if (sheetName === 'PMEGP_PMFME_Loan') {
          if (!this.data.loans) this.data.loans = [];
          this.data.loans.unshift({
            id: this.data.loans.length + 1,
            name: norm.name,
            fatherName: norm.fatherName,
            village: norm.village,
            block: norm.block,
            amount: norm.loanAmount || '100000',
            business: norm.business || 'Micro Enterprise',
            scheme: norm.yojana || 'PMEGP'
          });
        } else if (sheetName === 'Rang_De_Loan') {
          if (!this.data.rangDe) this.data.rangDe = [];
          this.data.rangDe.unshift({
            id: this.data.rangDe.length + 1,
            name: norm.name,
            address: norm.village || norm.block,
            mobile: norm.mobile || '-',
            activity: norm.business || 'Retail Business',
            amount: norm.loanAmount || '₹50,000',
            secondAmount: '-',
            block: norm.block || 'Dantewada'
          });
        } else if (sheetName === 'IIM_Candidate_List') {
          if (!this.data.iimRaipur) this.data.iimRaipur = [];
          this.data.iimRaipur.unshift({
            id: this.data.iimRaipur.length + 1,
            name: norm.name,
            fatherName: norm.fatherName,
            gender: norm.gender || 'Male',
            age: norm.age || '22',
            category: norm.category,
            gp: norm.village,
            block: norm.block,
            district: 'Dantewada',
            mobile: norm.mobile,
            education: norm.qualification,
            percent: row['PERCENT'] || row['Percent'] || row['Latest exam percentage'] || '60%',
            age2: norm.age || '22'
          });
        } else if (sheetName === 'Training_Conducted') {
          if (!this.data.trainingConducted) this.data.trainingConducted = [];
          const trName = norm.training || norm.name || row['TRAINING NAME'] || row['Training Name'] || 'Skill Training';
          const venue = norm.village || row['VANUE'] || row['VENUE'] || row['Vanue'] || row['Venue'] || row['ADDRESS'] || 'Dantewada';
          const org = norm.institute || norm.organisation || row['ORAGANISATION'] || row['ORGANISATION'] || 'District Livelihood College Dantewada';
          const trainer = norm.trainer || row['TRAINNER'] || row['TRAINER'] || '';
          const mob = norm.mobile || (row['DURATION'] ? `Duration: ${row['DURATION']}` : (row['DATE'] ? `Date: ${row['DATE']}` : '-'));

          this.data.trainingConducted.unshift({
            name: norm.name || trName || trainer || 'Training Program',
            address: venue,
            mobile: mob,
            institute: org,
            training: trName,
            block: norm.block || 'Dantewada',
            duration: row['DURATION'] || norm.duration || '',
            date: row['DATE'] || norm.joiningDate || '',
            trainer: trainer,
            supportingStaff: row['SUPPORTING STAFF'] || norm.supportingStaff || ''
          });
        } else if (sheetName === 'MY_Bharat_Registration') {
          if (!this.data.myBharat) this.data.myBharat = [];
          this.data.myBharat.unshift({
            name: norm.name,
            fatherName: norm.fatherName,
            village: norm.village,
            block: norm.block,
            dob: norm.dob || '2002-05-14',
            gender: norm.gender,
            mobile: norm.mobile,
            category: norm.category,
            currentOccupation: norm.occupation,
            remark: norm.remark || 'Active Registered'
          });
        } else if (sheetName === 'Youth_Hub_Trainings') {
          if (!this.data.youthHubTrainings) this.data.youthHubTrainings = [];
          this.data.youthHubTrainings.unshift({
            name: norm.name,
            fatherName: norm.fatherName,
            village: norm.village,
            block: norm.block,
            dob: norm.dob || '2003-01-01',
            gender: norm.gender,
            mobile: norm.mobile,
            remark: norm.remark || 'Completed'
          });
        } else if (sheetName === 'Bastar_Munne_Shivir') {
          if (!this.data.bastarShivir) this.data.bastarShivir = [];
          this.data.bastarShivir.unshift({
            name: norm.name,
            fatherName: norm.fatherName,
            village: norm.village,
            block: norm.block,
            dob: norm.dob || '2004-01-01',
            gender: norm.gender,
            mobile: norm.mobile,
            aadhar: norm.aadhar || '',
            category: norm.category,
            training: norm.training || row['INTERESTED TRADE (इच्छुक ट्रेड)'] || 'SKILL TRAINING',
            status: 'Applied'
          });
        } else if (sheetName === 'Startup_Ideas' || sheetName === 'Startup & Innovation Idea') {
          if (!this.data.startupIdeas) this.data.startupIdeas = [];
          this.data.startupIdeas.unshift({
            id: String(row['SR. NO.'] || idx + 1),
            startupName: String(row['STARTUP / IDEA NAME'] || row.startupName || ''),
            district: String(row.DISTRICT || row.district || norm.block || ''),
            founderName: String(row['FOUNDER NAME'] || row.founderName || norm.name || ''),
            age: String(row.AGE || row.age || ''),
            address: String(row.ADDRESS || row.address || norm.village || ''),
            education: String(row.EDUCATION || row.education || norm.qualification || ''),
            mobile: String(row['MOBILE NO.'] || row.mobile || norm.mobile || ''),
            investmentNeeded: String(row['INVESTMENT NEEDED'] || row.investmentNeeded || norm.loanAmount || ''),
            workType: String(row['WORK TYPE'] || row.workType || ''),
            businessModel: String(row['BUSINESS MODEL / PROBLEM'] || row['BUSINESS MODEL'] || row.businessModel || '')
          });
        } else if (sheetName === 'Entrepreneur_Identified') {
          if (!this.data.entrepreneursIdentified) this.data.entrepreneursIdentified = [];
          if (!this.data.entrepreneurIdeas) this.data.entrepreneurIdeas = [];
          const sNo = row['SR.no'] || row['Sr.No'] || row['SR. NO.'] || row['S.NO'] || idx + 1;
          const name = row['NAME'] || row['NAME '] || row['Name'] || row['FOUNDER NAME'] || norm.name || 'N/A';
          const father = row['FATHER NAME'] || row['Father Name'] || norm.fatherName || 'N/A';
          const village = row['VILLAGE'] || row['Village'] || row['ADDRESS'] || norm.village || 'N/A';
          const block = row['BLOCK'] || row['Block'] || row['DISTRICT'] || norm.block || 'Dantewada';
          const loanAmt = row['LOAN AMOUNT'] || row['Loan Amount'] || row['INVESTMENT NEEDED'] || norm.loanAmount || 'N/A';
          const biz = row['BUSSINESS'] || row['BUSINESS'] || row['Business'] || row['STARTUP / IDEA NAME'] || norm.business || 'N/A';

          this.data.entrepreneursIdentified.unshift({
            id: String(sNo),
            'SR.no': sNo,
            NAME: name,
            name: name,
            'FATHER NAME': father,
            fatherName: father,
            VILLAGE: village,
            village: village,
            BLOCK: block,
            block: block,
            'LOAN AMOUNT': loanAmt,
            loanAmount: loanAmt,
            BUSSINESS: biz,
            business: biz
          });

          const rawStartup = row['आपके स्टार्टअप/आइडिया का नाम (Name of your Startup/Idea)'] || row['STARTUP / IDEA NAME'] || row['STARTUP NAME'] || biz || 'Startup Idea';
          const rawFounder = row['पूरा नाम (Full Name)'] || row['FOUNDER NAME'] || name || 'N/A';
          const rawDistrict = row['DISTRICT (जिला)'] || row['DISTRICT'] || row['DISTRICT (ftyk)'] || block || 'Dantewada';
          const rawAge = row['उम्र (Age)'] || row['AGE'] || norm.age || '22';
          const rawAddress = row['पता (Address)'] || row['ADDRESS'] || village || 'Dantewada';
          const rawEdu = row['शैक्षणिक योग्यता (Educational Qualification)'] || row['QUALIFICATION'] || row['EDUCATION'] || norm.qualification || '12th';
          const rawMobile = row['संपर्क नंबर (Mobile Number)'] || row['MOBILE NO.'] || norm.mobile || 'N/A';
          const rawEmail = row['ईमेल आईडी (Email ID)'] || row['EMAIL'] || row['EMAIL ID'] || 'N/A';
          const rawDesc = row['आपके आइडिया/स्टार्टअप का विवरण (Describe your Startup/Idea)'] || row['DESCRIPTION'] || rawStartup;
          const rawProblem = row['आपका आइडिया किस समस्या का समाधान करता है? (What problem does your idea solve?)'] || row['PROBLEM SOLVED'] || 'N/A';
          const rawTarget = row['आपका लक्षित ग्राहक समूह कौन है? (Who is your target customer group?)'] || row['TARGET CUSTOMER'] || 'N/A';
          const rawInvested = row['आप अब तक कितना निवेश कर चुके हैं? (How much have you invested so far?)'] || row['INVESTED SO FAR'] || '0';
          const rawNeeded = row['आपको कितने निवेश (Investment) की आवश्यकता है? (How much investment are you seeking?)'] || row['INVESTMENT NEEDED'] || loanAmt || '₹5 Lakh';
          const rawTeam = row['टीम में कुल कितने सदस्य हैं? (Total number of team members)'] || row['TEAM MEMBERS'] || '1';
          const rawWork = row['क्या आप फुल-टाइम इस आइडिया पर काम कर रहे हैं? (Are you working full-time on this idea?)'] || row['WORK TYPE'] || 'FULL TIME';
          const rawModel = row['आपका बिजनेस मॉडल क्या है? (What is your business model?)'] || row['BUSINESS MODEL'] || row['BUSINESS MODEL / PROBLEM'] || 'Direct Selling / Service';
          const rawGoals = row['आपके भविष्य के लक्ष्य क्या हैं? (What are your future goals?)'] || row['FUTURE GOALS'] || 'N/A';
          const rawSocial = row['आपके स्टार्टअप की कोई वेबसाइट या सोशल मीडिया लिंक हो तो यहाँ डालें: (Link to your website or social media page)'] || row['WEBSITE / SOCIAL LINKS'] || 'N/A';
          const rawPlan = row['यदि आपके पास बिजनेस प्लान है तो यहाँ अपलोड करें (Attach Business Plan if any)'] || row['BUSINESS PLAN'] || 'N/A';

          this.data.entrepreneurIdeas.unshift({
            id: this.data.entrepreneurIdeas.length + 1,
            startupName: rawStartup,
            founderName: rawFounder,
            district: rawDistrict,
            age: rawAge,
            address: rawAddress,
            education: rawEdu,
            mobile: rawMobile,
            email: rawEmail,
            description: rawDesc,
            problemSolved: rawProblem,
            targetCustomer: rawTarget,
            investedSoFar: rawInvested,
            investmentNeeded: rawNeeded,
            teamMembers: rawTeam,
            workType: rawWork,
            businessModel: rawModel,
            futureGoals: rawGoals,
            socialLinks: rawSocial,
            businessPlanLink: rawPlan
          });
        } else if (sheetName === 'Meetings_VO_CLF_TRIF') {
          if (!this.data.meetingsVoClfTrif) this.data.meetingsVoClfTrif = [];
          this.data.meetingsVoClfTrif.unshift({
            id: this.data.meetingsVoClfTrif.length + 1,
            date: row['DATE'] || row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
            village: row['VILLAGE'] || row['Village'] || row['village'] || norm.village || 'Dantewada',
            block: row['BLOCK'] || row['Block'] || row['block'] || norm.block || 'Dantewada',
            voClfName: row['VO / CLF NAME'] || row['VO/CLF NAME'] || row['VO CLF NAME'] || row['VO_CLF_NAME'] || row['ORGANIZATION / CLF NAME'] || 'VO / CLF Organization',
            adhayakshSachiv: row['ADHAYAKSH / SACHIV'] || row['ADHAYAKSH SACHIV'] || row['Adhayaksh / Sachiv'] || row['Adhayaksh Sachiv'] || row['CHAIRED BY / TRIF LEAD'] || 'N/A',
            discussPoint: row['DISCUSS POINT'] || row['Discuss Point'] || row['DISCUSS_POINT'] || row['KEY AGENDA'] || row['AGENDA'] || 'Youth livelihood and training mobilization',
            remarks: row['REMARKS'] || row['Remarks'] || row['remarks'] || row['STATUS'] || 'Action Plan Finalized',
            photo: row['PHOTO'] || row['PHOTO UPLOAD'] || row['Photo'] || row['photo'] || ''
          });
        } else if (sheetName === 'M_Form') {
          if (!this.data.mFormRecords) this.data.mFormRecords = [];
          this.data.mFormRecords.unshift({
            id: this.data.mFormRecords.length + 1,
            block: norm.block || 'Dantewada',
            gramPanchayat: row['Grampanchayat'] || norm.village || '',
            firstName: row['First Name'] || norm.name.split(' ')[0],
            lastName: row['Last Name'] || norm.name.split(' ').slice(1).join(' '),
            mobile: row['Mobile Number'] || norm.mobile || '',
            gender: norm.gender,
            email: row['Email'] || norm.email || '',
            pinCode: row['Pin Code'] || '',
            fatherHusband: row["Father's Name / Husband's Name"] || norm.fatherName || '',
            motherName: row["Mother's Name"] || norm.motherName || '',
            category: norm.category,
            qualification: norm.qualification,
            currentOccupation: row['Current Occupation'] || norm.occupation || 'Candidate',
            aspiredCareer: row['Aspired Career'] || norm.aspiredCareer || 'Direct Formal Jobs'
          });
        }
      });

      this.logAudit(
        'EXCEL_IMPORT',
        'Database Integration',
        sheetName,
        `Imported ${insertedCount} verified records from sheet [${sheetName}]. Valid rows committed.`
      );

      const persistRes = this.persist();
      if (persistRes && !persistRes.success) {
        return {
          success: false,
          error: persistRes.error,
          sheetName,
          insertedCount: 0,
          updatedCount: 0
        };
      }
      window.dispatchEvent(new CustomEvent('db:changed'));

      return {
        success: true,
        sheetName,
        insertedCount,
        updatedCount,
        timestamp: new Date().toISOString()
      };
    }

    standardizeBlock(raw) {
      if (raw === null || raw === undefined) return 'Dantewada';
      const clean = String(raw).toLowerCase().trim();
      if (!clean) return 'Dantewada';
      if (clean.includes('geedam') || clean.includes('gidam')) return 'Geedam';
      if (clean.includes('katekalyan') || clean.includes('kate')) return 'Katekalyan';
      if (clean.includes('kuakonda') || clean.includes('kua')) return 'Kuakonda';
      return 'Dantewada';
    }

    // -------------------------------------------------------------
    // Reports Engine (PRD Section 9)
    // -------------------------------------------------------------
    generateReport(reportType, filterBlock = 'All') {
      const youth = this.getYouth({ block: filterBlock });
      const visits = this.getFieldVisits({ block: filterBlock });
      const stories = this.getSuccessStories({ block: filterBlock });

      switch (reportType) {
        case 'block_summary': {
          const blocks = ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'];
          return blocks.map(b => {
            const bYouth = this.data.youth.filter(y => (y.block || '').toLowerCase() === b.toLowerCase());
            const bVisits = this.data.fieldVisits.filter(v => (v.block || '').toLowerCase() === b.toLowerCase());
            const bLoans = this.data.loans.filter(l => (l.block || '').toLowerCase() === b.toLowerCase());
            const bTrainees = this.data.youthHubTrainings.filter(t => (t.block || '').toLowerCase() === b.toLowerCase());

            return {
              block: b,
              totalRegistered: bYouth.length,
              femaleCount: bYouth.filter(y => (y.gender || '').toLowerCase() === 'female').length,
              stCount: bYouth.filter(y => (y.category || '').toUpperCase() === 'ST').length,
              fieldVisits: bVisits.length,
              loansDisbursed: bLoans.length,
              youthHubTrainees: bTrainees.length
            };
          });
        }

        case 'employment_tracking': {
          return (this.data.placed || []).map((p, idx) => ({
            id: idx + 1,
            name: p.name,
            organisation: p.organisation || 'Local Enterprise',
            district: p.district || 'Dantewada',
            address: p.address || 'Bastar',
            contact: window.DantewadaDB.maskMobile(p.mobile)
          }));
        }

        case 'loan_beneficiaries': {
          return (this.data.loans || []).map((l, idx) => ({
            id: idx + 1,
            name: l.name,
            fatherName: l.fatherName,
            village: l.village,
            block: l.block,
            amount: l.amount,
            business: l.business,
            scheme: l.scheme
          }));
        }

        case 'trainings_conducted': {
          return (this.data.trainingConducted || []).map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            block: t.block,
            venue: t.venue,
            enrolled: t.enrolledCount,
            completed: t.completedCount,
            placed: t.placedCount,
            status: t.status
          }));
        }

        case 'visits_monitoring': {
          return visits.map(v => ({
            visitId: v.id,
            date: v.date,
            officer: v.officerName,
            block: v.block,
            location: v.locationName,
            purpose: v.purpose,
            photosCount: v.photos ? v.photos.length : 0,
            status: v.status,
            followUpDate: v.followUpDate || 'None'
          }));
        }

        case 'follow_up_due': {
          return visits
            .filter(v => v.status === 'Follow-up Required' || v.status === 'Action in Progress')
            .map(v => ({
              visitId: v.id,
              date: v.date,
              location: `${v.locationName} (${v.block})`,
              officer: v.officerName,
              actionRequired: v.actionRequired,
              followUpDate: v.followUpDate,
              status: v.status
            }));
        }

        case 'success_stories': {
          return stories.map(s => ({
            storyId: s.id,
            youthName: s.youthName,
            village: `${s.village}, ${s.block || 'Dantewada'}`,
            title: s.title,
            category: s.category,
            achievementDate: s.achievementDate,
            status: s.status,
            featured: s.featured ? 'Yes' : 'No'
          }));
        }

        case 'audit_trail': {
          return (this.data.auditLogs || []).slice(0, 50).map(a => ({
            id: a.id,
            timestamp: a.timestamp,
            user: `${a.userName} (${a.userRole})`,
            action: a.action,
            module: a.module,
            target: a.target,
            details: a.details
          }));
        }

        default:
          return [];
      }
    }

    // -------------------------------------------------------------
    // Live Google Apps Script Cloud Sync
    // -------------------------------------------------------------
    async _fetchWithTimeoutAndRetry(url, bodyObj, maxRetries = 2, timeoutMs = 15000) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        let timer = null;
        try {
          const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
          if (controller) {
            timer = setTimeout(() => controller.abort(), timeoutMs);
          }
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(bodyObj),
            signal: controller ? controller.signal : undefined
          });
          if (timer) clearTimeout(timer);

          if (res.status === 429 || res.status >= 500) {
            if (attempt < maxRetries) {
              const backoff = Math.pow(2, attempt) * 800 + Math.random() * 300;
              await new Promise(r => setTimeout(r, backoff));
              continue;
            }
          }

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return await res.json();
        } catch (err) {
          if (timer) clearTimeout(timer);
          if (attempt < maxRetries) {
            const backoff = Math.pow(2, attempt) * 800 + Math.random() * 300;
            await new Promise(r => setTimeout(r, backoff));
            continue;
          }
          throw err;
        }
      }
    }

    async syncFromGoogleSheet(customUrl) {
      if (this._syncInProgressPromise) {
        return this._syncInProgressPromise;
      }
      this._syncInProgressPromise = this._doSyncFromGoogleSheet(customUrl).finally(() => {
        this._syncInProgressPromise = null;
      });
      return this._syncInProgressPromise;
    }

    async _doSyncFromGoogleSheet(customUrl) {
      const url = customUrl || (typeof window !== 'undefined' && window.ENV && window.ENV.GOOGLE_SCRIPT_URL) || (typeof localStorage !== 'undefined' && localStorage.getItem('YH_DANTEWADA_API_URL')) || '';
      if (!url) {
        return { success: false, message: 'Google Apps Script URL is not configured. Please set GOOGLE_SCRIPT_URL in .env or js/env.js.' };
      }

      const sheetsToFetch = [
        'Employment_Registered',
        'Employment_Registration',
        'M_Form',
        'M Form',
        'Counselling',
        'Employment_Linked',
        'Employed',
        'Skill_Training',
        'Skill_Linked',
        'Education',
        'Education_Linked',
        'Entrepreneur_Identified',
        'Startup hunt',
        'Startup_Hunt',
        'Startup & Innovation Idea',
        'Entrepreneurs',
        'PMEGP_PMFME_Loan',
        'IIM_Candidate_List',
        'NavGurukul',
        'RangDe_Loan',
        'Rang_De_Loan',
        'Rehabilitation_Counselling',
        'Rehabilitation Counselling',
        'Bastar_Munne_Shivir',
        'Training_Conducted',
        'MY_Bharat_Registration',
        'Youth_Hub_Trainee',
        'Youth_Hub_Trainings',
        'VO CLF Meeting',
        'VO_CLF_Meeting',
        'Meetings_VO_CLF_TRIF',
        'Field_Visits',
        'Field Visits',
        'Success_Stories',
        'Success Stories'
      ];

      let totalSynced = 0;
      const stats = {};
      const sheetDataMap = {};
      const fetchedSheets = new Set();

      // 1. First attempt fast single-call sync using 'getAllData'
      let fastSyncSuccess = false;
      try {
        const fastJson = await this._fetchWithTimeoutAndRetry(url, { action: 'getAllData', payload: {} }, 2, 18000);
        if (fastJson && fastJson.success && fastJson.data && typeof fastJson.data === 'object') {
          for (const [k, recs] of Object.entries(fastJson.data)) {
            if (Array.isArray(recs)) {
              sheetDataMap[k] = recs;
              fetchedSheets.add(k);
              stats[k] = recs.length;
              totalSynced += recs.length;
            }
          }
          fastSyncSuccess = true;
          console.log(`⚡ Live Google Sheets synced in 1 call: ${totalSynced} records loaded.`);
        }
      } catch (fastErr) {
        console.warn('Fast getAllData sync failed, falling back to chunked sheets:', fastErr.message);
      }

      // 2. Safe fallback: Chunk sheets in batches of 4 with delays to avoid Google quota limits
      if (!fastSyncSuccess) {
        const CHUNK_SIZE = 4;
        for (let i = 0; i < sheetsToFetch.length; i += CHUNK_SIZE) {
          const chunk = sheetsToFetch.slice(i, i + CHUNK_SIZE);
          const chunkPromises = chunk.map(async (sheetName) => {
            try {
              const d = await this._fetchWithTimeoutAndRetry(url, { action: 'getTableRecords', payload: { sheetName } }, 1, 10000);
              return { sheetName, success: d && d.success, records: (d && Array.isArray(d.records)) ? d.records : [] };
            } catch (err) {
              console.warn(`Failed to fetch sheet ${sheetName}:`, err.message);
              return { sheetName, success: false, records: [] };
            }
          });

          const chunkSettled = await Promise.allSettled(chunkPromises);
          chunkSettled.forEach(item => {
            if (item.status === 'fulfilled' && item.value.success) {
              const recs = item.value.records || [];
              sheetDataMap[item.value.sheetName] = recs;
              fetchedSheets.add(item.value.sheetName);
              stats[item.value.sheetName] = recs.length;
              totalSynced += recs.length;
            }
          });

          if (i + CHUNK_SIZE < sheetsToFetch.length) {
            await new Promise(r => setTimeout(r, 150));
          }
        }
      }

      // A failed request set must not be treated as a successful empty sync.
      // In particular, do not stamp stale local data as freshly synced.
      if (fetchedSheets.size === 0) {
        return { success: false, totalSynced: 0, stats, message: 'No Google Sheets data could be fetched. Check the Apps Script deployment URL and access permissions.' };
      }

      // Older Apps Script deployments can omit the spaced alias from
      // getAllData(). Query that physical tab directly so the bundled local
      // M-Form dataset is never mistaken for current Google Sheet data.
      if (!Array.isArray(sheetDataMap['M Form']) || sheetDataMap['M Form'].length === 0) {
        try {
          const legacyMForm = await this._fetchWithTimeoutAndRetry(
            url,
            { action: 'getTableRecords', payload: { sheetName: 'M Form' } },
            1,
            10000
          );
          if (legacyMForm && legacyMForm.success && Array.isArray(legacyMForm.records)) {
            const hadLegacyRows = Array.isArray(sheetDataMap['M Form']) ? sheetDataMap['M Form'].length : 0;
            sheetDataMap['M Form'] = legacyMForm.records;
            fetchedSheets.add('M Form');
            stats['M Form'] = legacyMForm.records.length;
            totalSynced += Math.max(0, legacyMForm.records.length - hadLegacyRows);
          }
        } catch (legacyMFormError) {
          console.warn('Could not fetch the legacy M Form tab:', legacyMFormError.message);
        }
      }

      // Do not let a partial getAllData response leave stale local
      // Counselling records visible when this sheet was omitted.
      if (!Array.isArray(sheetDataMap.Counselling) || sheetDataMap.Counselling.length === 0) {
        try {
          const counsellingResponse = await this._fetchWithTimeoutAndRetry(
            url,
            { action: 'getTableRecords', payload: { sheetName: 'Counselling' } },
            1,
            10000
          );
          if (counsellingResponse && counsellingResponse.success && Array.isArray(counsellingResponse.records)) {
            const previousCount = Array.isArray(sheetDataMap.Counselling) ? sheetDataMap.Counselling.length : 0;
            sheetDataMap.Counselling = counsellingResponse.records;
            fetchedSheets.add('Counselling');
            stats.Counselling = counsellingResponse.records.length;
            totalSynced += Math.max(0, counsellingResponse.records.length - previousCount);
          }
        } catch (counsellingError) {
          console.warn('Could not fetch the Counselling sheet directly:', counsellingError.message);
        }
      }

      // The Startup & Innovation Idea module is a separate register from
      // Entrepreneur_Identified. Fetch it directly if an older full-sync
      // response omitted its sheet key.
      if (!Array.isArray(sheetDataMap['Startup & Innovation Idea']) || sheetDataMap['Startup & Innovation Idea'].length === 0) {
        try {
          const startupResponse = await this._fetchWithTimeoutAndRetry(
            url,
            { action: 'getTableRecords', payload: { sheetName: 'Startup & Innovation Idea' } },
            1,
            10000
          );
          if (startupResponse && startupResponse.success && Array.isArray(startupResponse.records)) {
            const previousCount = Array.isArray(sheetDataMap['Startup & Innovation Idea']) ? sheetDataMap['Startup & Innovation Idea'].length : 0;
            sheetDataMap['Startup & Innovation Idea'] = startupResponse.records;
            fetchedSheets.add('Startup & Innovation Idea');
            stats['Startup & Innovation Idea'] = startupResponse.records.length;
            totalSynced += Math.max(0, startupResponse.records.length - previousCount);
          }
        } catch (startupError) {
          console.warn('Could not fetch the Startup & Innovation Idea sheet directly:', startupError.message);
        }
      }

      // 1. Employment_Registration / M_Form
      const empRecords = sheetDataMap['Employment_Registration'] || sheetDataMap['Employment_Registered'] || [];
      const empYouth = empRecords.map((r, idx) => {
        const fullName = (r['First Name'] ? `${r['First Name']} ${r['Last Name'] || ''}`.trim() : '') || r.Youth_Name || r.Name || 'पंजीकृत उम्मीदवार';
        return {
          id: String(r['SR.No'] || r['SR. NO.'] || r.Emp_Reg_ID || r.Youth_ID || ('YH-' + (1000 + idx))),
          name: String(fullName),
          fatherHusband: String(r["Father's Name / Husband's Name"] || r.Father_Husband_Name || r.Father_Name || ''),
          mobile: String(r['Mobile Number'] || r.Mobile_Number || r.Mobile || ''),
          gender: String(r.Gender || (idx % 3 === 0 ? 'Female' : 'Male')),
          category: String(r.Category || 'ST'),
          qualification: String(r['Highest Qualification'] || r.Qualification || '12th Pass'),
          block: this.standardizeBlock(r['Block Name'] || r.Block),
          gramPanchayat: String(r.Grampanchayat || r.Gram_Panchayat || r.GP || ''),
          village: String(r.Village || r.Grampanchayat || ''),
          employmentStatus: String(r['Current Occupation'] || r.Registration_Status || 'Registered'),
          aspiredCareer: String(r['Aspired Career'] || r.Preferred_Job || 'Direct Formal Jobs'),
          registrationDate: String(r.Registration_Date || new Date().toISOString().split('T')[0])
        };
      });

      // 2. M_Form records
      const mformCandidates = [sheetDataMap['M_Form'], sheetDataMap['M Form']].filter(Array.isArray);
      // Both tab spellings exist in some database copies. The canonical tab
      // may be an empty template while the spaced legacy tab holds the data.
      const mformRecords = mformCandidates.reduce((best, records) => records.length > best.length ? records : best, []);
      const mformYouth = mformRecords.map((r, idx) => ({
        id: String(r.MForm_ID || ('MF-' + (1000 + idx))),
        name: String(r.Youth_Name || ('एम-फॉर्म आवेदक #' + (idx + 1))),
        fatherHusband: '',
        mobile: String(r.Mobile || ''),
        gender: 'Male',
        category: 'ST',
        qualification: '10th / 12th Pass',
        block: this.standardizeBlock(r.Block),
        gramPanchayat: String(r.GP || ''),
        village: String(r.Village || ''),
        employmentStatus: String(r.MForm_Status || 'M-Form Verified'),
        aspiredCareer: 'Skill Training / Jobs',
        registrationDate: String(r.Date || new Date().toISOString().split('T')[0])
      }));

      if (fetchedSheets.has('Employment_Registration') || fetchedSheets.has('Employment_Registered')) {
        this.data.youth = empYouth;
      } else if (fetchedSheets.has('M_Form') && mformYouth.length > 0) {
        this.data.youth = mformYouth;
      }
      if (fetchedSheets.has('M_Form') || fetchedSheets.has('M Form')) {
        this.data.mFormRecords = mformRecords;
      }

      // 3. Counselling records
      const counsellingRecords = sheetDataMap['Counselling'] || [];
      if (fetchedSheets.has('Counselling')) {
        const validCounsellingRecords = counsellingRecords.filter(c => {
          const name = String(c.Youth_Name || c.Name || ((c['First Name'] || '') + ' ' + (c['Last Name'] || '')).trim()).trim();
          const mobile = String(c['Mobile Number'] || c.Mobile || c['MOBILE NO.'] || '').replace(/\D/g, '');
          return Boolean(name || mobile.length >= 10);
        });
        this.data.counselling = validCounsellingRecords.map((c, idx) => ({
          id: String(c.Counselling_ID || ('COU-' + (1000 + idx))),
          block: this.standardizeBlock(c['Block Name'] || c.Block || c.Counselling_Type),
          gramPanchayat: String(c.Grampanchayat || c.GP || c.Village || 'N/A').trim(),
          firstName: String(c['First Name'] || (c.Youth_Name || c.Name ? String(c.Youth_Name || c.Name).split(' ')[0] : 'N/A')).trim(),
          lastName: String(c['Last Name'] || (c.Youth_Name || c.Name ? String(c.Youth_Name || c.Name).split(' ').slice(1).join(' ') : '')).trim(),
          name: String(c.Youth_Name || c.Name || ((c['First Name'] || '') + ' ' + (c['Last Name'] || '')).trim() || 'परामर्शित युवा'),
          mobile: String(c['Mobile Number'] || c.Mobile || c['MOBILE NO.'] || 'N/A').trim(),
          gender: String(c.Gender || 'Male').trim(),
          email: String(c.Email || '').trim(),
          pinCode: String(c['Pin Code'] || c.PinCode || '494441').trim(),
          fatherHusband: String(c["Father's Name / Husband's Name"] || c['Father Name'] || 'N/A').trim(),
          motherName: String(c["Mother's Name"] || c['Mother Name'] || 'N/A').trim(),
          category: String(c.Category || 'ST').trim(),
          qualification: String(c['Highest Qualification'] || c.Qualification || '12th Pass').trim(),
          currentOccupation: String(c['Current Occupation'] || c.Occupation || 'Student / Job Seeker').trim(),
          aspiredCareer: String(c['Aspired Career'] || c.Career_Interest || 'Skill Training').trim(),
          date: String(c.Date || new Date().toISOString().split('T')[0]),
          outcome: String(c.Counselling_Outcome || 'Referred for Training')
        }));
      }

      const startupCandidates = [sheetDataMap['Startup & Innovation Idea'], sheetDataMap.Startup_Ideas].filter(Array.isArray);
      const startupRecords = startupCandidates.reduce((best, records) => records.length > best.length ? records : best, []);
      if (fetchedSheets.has('Startup & Innovation Idea') || fetchedSheets.has('Startup_Ideas') || startupRecords.length > 0) {
        const validStartupRecords = startupRecords.filter(r => {
          if (!r || typeof r !== 'object') return false;
          const firstVal = Object.values(r)[0];
          if (firstVal && String(firstVal).trim().toUpperCase() === 'SR. NO.') return false;
          return Object.values(r).some(v => v !== null && v !== undefined && String(v).trim() !== '');
        });
        this.data.startupIdeas = validStartupRecords.map((r, idx) => {
          const srNo = String(r['SR. NO.'] || r.SR || (idx + 1));
          const addr = String(r.ADDRESS || r.Address || '').trim();
          const rawIdea = String(r['STARTUP / IDEA NAME'] || r.STARTUP_NAME || r.Startup_Name || '').trim();
          const rawFounder = String(r['FOUNDER NAME'] || r.Founder || '').trim();
          const age = String(r.AGE || r.Age || '').trim();
          const dist = String(r.DISTRICT || r.District || '').trim();
          return {
            id: srNo,
            startupName: rawIdea || '-',
            district: dist || this.standardizeBlock(addr) || 'Dantewada',
            founderName: rawFounder || '-',
            age: age || '-',
            address: addr || '-',
            education: String(r.EDUCATION || r.Education || '-').trim() || '-',
            mobile: String(r['MOBILE NO.'] || r['MOBILE NO'] || r.Mobile || '-').trim() || '-',
            investmentNeeded: String(r['INVESTMENT NEEDED'] || r.Investment_Needed || '-').trim() || '-',
            workType: String(r['WORK TYPE'] || r.Work_Type || '-').trim() || '-',
            businessModel: String(r['BUSINESS MODEL / PROBLEM'] || r['BUSINESS MODEL'] || r.Business_Model || '-').trim() || '-'
          };
        });
      }

      // 4. Employment_Linked / Employed (Placed)
      const placedRecords = sheetDataMap['Employed'] || sheetDataMap['Employment_Linked'] || [];
      if (fetchedSheets.has('Employed') || fetchedSheets.has('Employment_Linked')) {
        this.data.placed = placedRecords.map((r, idx) => ({
          id: String(r.Emp_Link_ID || r['SR. NO.'] || ('PL-' + (100 + idx))),
          name: String(r['NAME '] || r.NAME || r.Youth_Name || 'नियोजित युवा').trim(),
          fatherName: String(r['FATHER NAME'] || r.Father_Name || '').trim(),
          address: String(r.ADDRESS || r.Location || 'Dantewada').trim(),
          block: this.standardizeBlock(r.BLOCK || r.Block),
          district: String(r.DISTRICT || r.District || 'Dantewada').trim(),
          mobile: String(r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '').trim(),
          organisation: String(r.ORGANISATION || r.Employer_Name || r.Job_Role || 'Local Enterprise').trim(),
          joiningDate: String(r['DATE OF JOINING'] || r.Placement_Date || '2026-06-01').trim(),
          salary: String(r.SALARY || r.Salary || '₹12,000').trim()
        }));
      }

      // 5. Skill_Training / Skill_Linked
      const skillRecords = sheetDataMap['Skill_Linked'] || sheetDataMap['Skill_Training'] || [];
      if (fetchedSheets.has('Skill_Linked') || fetchedSheets.has('Skill_Training')) {
        this.data.skills = skillRecords.map((r, idx) => ({
          id: String(r.Training_Record_ID || ('SKL-' + (100 + idx))),
          name: String(r['NAME '] || r.NAME || r.Youth_Name || r.Training_Name || 'प्रशिक्षु').trim(),
          trade: String(r['SKILL TRAINING'] || r.Skill_Trade || r.Trade || 'Vocational Trade').trim(),
          institute: String(r.INSTITUTE || r.Training_Provider || 'District Livelihood College').trim(),
          mobile: String(r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '').trim(),
          village: String(r.VILLAGE || r.Village || 'Dantewada').trim(),
          block: this.standardizeBlock(r.BLOCK || r.Block),
          status: String(r.Training_Status || 'Completed').trim()
        }));
      }

      // 5. IIM Candidate List (Filter out empty/header rows so count matches exactly 80)
      const iimCandidates = sheetDataMap['IIM_Candidate_List'] || [];
      const validIimRecords = iimCandidates.filter(r => {
        if (!r || typeof r !== 'object') return false;
        const name = String(r.NAME || r['NAME '] || r.Candidate_Name || '').trim();
        const mob = String(r['MOBILE NO,'] || r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '').trim();
        return Boolean(name || mob);
      });

      if (fetchedSheets.has('IIM_Candidate_List') || validIimRecords.length > 0) {
        this.data.iimRaipur = validIimRecords.map((r, idx) => ({
          id: String(r.SR || r['SR. NO.'] || r.S_No || idx + 1),
          name: String(r.NAME || r['NAME '] || r.Candidate_Name || '').trim(),
          fatherName: String(r['FATHER NAME'] || r.Father_Name || '').trim(),
          gender: String(r.GENDER || r.Gender || '').trim(),
          age: String(r.AGE || r.Age || '').trim(),
          age2: String(r.AGE_2 || r.AGE2 || r['AGE (2)'] || r.AGE || r.Age || '').trim(),
          category: String(r.CAST || r.Category || r.Caste || '').trim(),
          cast: String(r.CAST || r.Category || r.Caste || '').trim(),
          gp: String(r.GP || r.Village || '').trim(),
          block: this.standardizeBlock(r.BLOCK || r.Block),
          district: String(r.DISTRICT || r.District || 'Dantewada').trim(),
          mobile: String(r['MOBILE NO,'] || r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '').trim(),
          education: String(r.EDUCATION || r.Education || '').trim(),
          percent: String(r.PERCENT || r.Percent || '').trim()
        }));
      }

      // 6. Education Linked (Keep distinct from IIM so count matches Google Sheet exactly 228)
      const eduRecords = sheetDataMap['Education_Linked'] || sheetDataMap['Education'] || sheetDataMap['NavGurukul'] || [];
      const validEduRecords = eduRecords.filter(r => {
        if (!r || typeof r !== 'object') return false;
        const name = String(r.Name || r.Youth_Name || r['NAME'] || r['Candidate_Name'] || '').trim();
        const phone = String(r['Phone Number'] || r.Mobile || r['MOBILE NO.'] || '').trim();
        return Boolean(name || phone);
      });

      if (fetchedSheets.has('Education_Linked') || fetchedSheets.has('Education') || fetchedSheets.has('NavGurukul') || validEduRecords.length > 0) {
        this.data.navgurukul = validEduRecords.map((r, idx) => ({
          id: String(r.Education_ID || r.id || ('EDU-' + (100 + idx))),
          name: String(r.Name || r.Youth_Name || 'उच्च शिक्षा छात्र').trim(),
          fatherName: String(r['Faather Name'] || r['Father Name'] || '').trim(),
          motherName: String(r['Mother Name'] || '').trim(),
          email: String(r.Email || `${String(r.Name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`).trim(),
          gender: String(r.Gender || 'Female').trim(),
          education: String(r.Education || r.Current_Qualification || 'Graduate Linkage').trim(),
          phone: String(r['Phone Number'] || r.Mobile || '').trim(),
          address: String(r.Address || 'Dantewada').trim(),
          block: this.standardizeBlock(r.Block || r.Address)
        }));
      }

      // 7. Entrepreneurs (loans)
      const entRecords = sheetDataMap['PMEGP_PMFME_Loan'] || sheetDataMap['Entrepreneurs'] || [];
      if (fetchedSheets.has('PMEGP_PMFME_Loan') || fetchedSheets.has('Entrepreneurs')) {
        const validLoans = entRecords.filter(r => {
          const name = String(r.NAME || r['NAME '] || r.Name || '').trim();
          const biz = String(r.BUSSINESS || r.BUSINESS || r.Business_Type || '').trim();
          return name !== '' || biz !== '';
        });
        this.data.loans = validLoans.map((r, idx) => {
          const rawAmt = r['LOAN AMOUNT'] || r['LONE AMOUNT'] || r.Loan_Amount || r.Amount || '50000';
          return {
            id: String(r.Entrepreneur_ID || r['SR. NO.'] || r['S.NO'] || ('ENT-' + (100 + idx))),
            name: String(r.NAME || r.Name || 'उद्यमी').trim(),
            fatherName: String(r['FATHER NAME'] || r.Father_Name || '').trim(),
            village: String(r.VILLAGE || r.Village || 'Dantewada').trim(),
            block: this.standardizeBlock(r.BLOCK || r.Block),
            loanAmount: String(rawAmt).startsWith('₹') ? String(rawAmt) : `₹${Number(rawAmt).toLocaleString('en-IN')}`,
            amount: String(rawAmt),
            business: String(r.BUSSINESS || r.BUSINESS || r.Business_Type || 'Micro-Enterprise').trim(),
            scheme: String(r.YOJNA || r.Loan_Scheme || 'PMEGP / MUDRA').trim(),
            status: String(r.Loan_Status || 'Approved')
          };
        });
      }

      // 8. Rang_De_Loan
      // getAllData adds empty template keys for canonical sheet names. If the
      // populated physical tab is named "Rang de loan", a truthy empty array
      // at Rang_De_Loan must not hide its records.
      const rangDeKeys = ['Rang_De_Loan', 'RangDe_Loan', 'Rang de loan'];
      const rangDeRecords = rangDeKeys
        .map(key => sheetDataMap[key])
        .find(records => Array.isArray(records) && records.length > 0)
        || rangDeKeys.map(key => sheetDataMap[key]).find(Array.isArray)
        || [];
      if (rangDeKeys.some(key => fetchedSheets.has(key) || Array.isArray(sheetDataMap[key]))) {
        const fmtCurrency = (val) => {
          if (val === undefined || val === null || val === '' || val === '-') return '-';
          const s = String(val).trim();
          if (s.startsWith('₹')) return s;
          const num = Number(s.replace(/[^0-9.-]+/g, ''));
          return (!isNaN(num) && s.length > 0) ? `₹${num.toLocaleString('en-IN')}` : s;
        };

        const validRangDe = rangDeRecords.filter(r => {
          const name = String(r.NAME || r['NAME '] || r.Name || '').trim();
          return name !== '';
        });

        this.data.rangDe = validRangDe.map((r, idx) => {
          const rawAmt = r['AMOUNT (₹)'] ?? r['AMOUNT(?)'] ?? r.AMOUNT ?? r.Amount ?? r.amount ?? '';
          const raw2nd = r['2ND (₹)'] ?? r['2ND(?)'] ?? r['2ND'] ?? r.Second_Amount ?? r.secondAmount ?? '';

          return {
            id: idx + 1,
            sNo: r['SR. NO.'] || r['SR.NO.'] || r.S_No || (idx + 1),
            name: String(r.NAME || r['NAME '] || r.Name || 'रंग दे लाभार्थी').trim(),
            address: String(r.ADDRESS || r.Address || r.VILLAGE || r.Village || 'Dantewada').trim(),
            mobile: String(r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '-').trim(),
            activity: String(r.ACTIVITY || r.Activity || r.BUSINESS || r.Business || 'Micro-Credit').trim(),
            amount: fmtCurrency(rawAmt),
            secondAmount: fmtCurrency(raw2nd)
          };
        });
      }

      // Rehabilitation_Counselling
      const rehabKeys = ['Rehabilitation_Counselling', 'Rehabilitation Counselling', 'rehabilitation_counselling', 'Rehabilitation'];
      const rehabRecords = rehabKeys
        .map(key => sheetDataMap[key])
        .find(records => Array.isArray(records) && records.length > 0)
        || rehabKeys.map(key => sheetDataMap[key]).find(Array.isArray)
        || [];
      if (rehabKeys.some(key => fetchedSheets.has(key) || Array.isArray(sheetDataMap[key]))) {
        this.data.rehabilitationCounselling = rehabRecords.map((r, idx) => ({
          id: r.id || r['SR. NO.'] || (idx + 1),
          name: String(r.NAME || r['NAME '] || r.Name || r.Candidate_Name || 'N/A').trim(),
          address: String(r.ADDRESS || r.Address || r.Village || 'Dantewada').trim(),
          mobile: String(r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || '-').trim(),
          institute: String(r.INSTITUTE || r.Institute || 'LIVELIHOOD').trim(),
          training: String(r.TRAINING || r.Training || r.Trade || 'Computer Operator').trim(),
          block: (r.ADDRESS || r.Address || '').includes('Geedam') ? 'Geedam' : ((r.ADDRESS || r.Address || '').includes('Kuakonda') ? 'Kuakonda' : ((r.ADDRESS || r.Address || '').includes('Katekalyan') ? 'Katekalyan' : 'Dantewada'))
        }));
      }

      // 9. Entrepreneur_Identified (Startup Hunt)
      const entOrigRecords = sheetDataMap['Entrepreneur_Identified'] || [];
      const startupHuntRecords = sheetDataMap['Startup_Hunt'] || sheetDataMap['Startup Hunt'] || sheetDataMap['Startup hunt'] || [];
      const entIdentifiedRecords = fetchedSheets.has('Entrepreneur_Identified') ? entOrigRecords : (entOrigRecords.length > 0 ? entOrigRecords : startupHuntRecords);
      if (fetchedSheets.has('Entrepreneur_Identified') || fetchedSheets.has('Startup hunt') || fetchedSheets.has('Startup_Hunt') || entIdentifiedRecords.length > 0) {
        const validEnt = entIdentifiedRecords.filter(r => {
          const name = String(r['FOUNDER NAME'] || r.NAME || r['NAME '] || r.Founder || '').trim();
          const biz = String(r['STARTUP / IDEA NAME'] || r.BUSSINESS || r.BUSINESS || r.Startup_Name || '').trim();
          const idea = String(r['BUSINESS MODEL / PROBLEM'] || r.Idea || '').trim();
          if (!name && !biz && !idea) return false;
          if ((name === 'उद्यमी' || !name) && (biz === 'उद्यम विचार' || !biz)) return false;
          return true;
        });

        this.data.entrepreneursIdentified = validEnt.map((r, idx) => ({
          id: String(r['SR.no'] || r['SR. NO.'] || r['S.NO'] || idx + 1),
          'SR.no': String(r['SR.no'] || r['SR. NO.'] || r['S.NO'] || idx + 1),
          NAME: String(r.NAME || r['NAME '] || r['FOUNDER NAME'] || 'N/A').trim(),
          name: String(r.NAME || r['NAME '] || r['FOUNDER NAME'] || 'N/A').trim(),
          'FATHER NAME': String(r['FATHER NAME'] || r.Father_Name || 'N/A').trim(),
          fatherName: String(r['FATHER NAME'] || r.Father_Name || 'N/A').trim(),
          VILLAGE: String(r.VILLAGE || r.Village || r.Address || 'N/A').trim(),
          village: String(r.VILLAGE || r.Village || r.Address || 'N/A').trim(),
          BLOCK: this.standardizeBlock(r.BLOCK || r.Block),
          block: this.standardizeBlock(r.BLOCK || r.Block),
          'LOAN AMOUNT': String(r['LOAN AMOUNT'] || r.Loan_Amount || r['INVESTMENT NEEDED'] || 'N/A').trim(),
          loanAmount: String(r['LOAN AMOUNT'] || r.Loan_Amount || r['INVESTMENT NEEDED'] || 'N/A').trim(),
          BUSSINESS: String(r.BUSSINESS || r.BUSINESS || r['STARTUP / IDEA NAME'] || 'N/A').trim(),
          business: String(r.BUSSINESS || r.BUSINESS || r['STARTUP / IDEA NAME'] || 'N/A').trim()
        }));

        this.data.entrepreneurIdeas = validEnt.map((r, idx) => ({
          id: String(r['SR.no'] || r['SR. NO.'] || r['S.NO'] || idx + 1),
          startupName: String(r['STARTUP / IDEA NAME'] || r.BUSSINESS || r.BUSINESS || r.Startup_Name || r.NAME || 'Startup Idea').trim(),
          founderName: String(r['FOUNDER NAME'] || r.NAME || r['NAME '] || r.Founder || 'N/A').trim(),
          district: String(r.DISTRICT || r.District || r.BLOCK || 'Dantewada').trim(),
          block: this.standardizeBlock(r.BLOCK || r.Block),
          village: String(r.VILLAGE || r.Village || '').trim(),
          age: String(r.AGE || r.Age || 'N/A'),
          education: String(r.EDUCATION || r.Qualification || 'N/A'),
          address: String(r.VILLAGE || r.Village || r.Address || 'Dantewada').trim(),
          mobile: String(r['MOBILE NO.'] || r['MOBILE N0.'] || r.Mobile || 'N/A').trim(),
          investmentNeeded: String(r['INVESTMENT NEEDED'] || r['LOAN AMOUNT'] || r.Loan_Amount || 'N/A'),
          workType: String(r['WORK TYPE'] || r.workType || 'FULL TIME'),
          businessModel: String(r['BUSINESS MODEL / PROBLEM'] || r.BUSSINESS || r.BUSINESS || 'Micro-Enterprise')
        }));
      }

      // 10. Bastar_Munne_Shivir
      const bastarRecords = sheetDataMap['Bastar_Munne_Shivir'] || [];
      const validBastar = bastarRecords.filter(r => {
        const val = Object.values(r)[0];
        return val && String(val).toUpperCase() !== 'SR. NO.' && String(val).toUpperCase() !== 'SR.NO';
      });
      if (fetchedSheets.has('Bastar_Munne_Shivir')) {
        this.data.bastarShivir = validBastar.map((b, idx) => ({
          id: idx + 1,
          name: String(b.NAME || b['NAME '] || b.Youth_Name || 'उम्मीदवार').trim(),
          fatherName: String(b['FATHER NAME'] || b.Father_Name || '').trim(),
          village: String(b.VILLAGE || b.Village || 'Dantewada').trim(),
          block: this.standardizeBlock(b.BLOCK || b.Block),
          dob: String(b.DOB || '2003-04-12'),
          gender: String(b.GENDER || b.Gender || 'Male'),
          mobile: String(b['MOBILE NO.'] || b['MOBILE N0.'] || b.Mobile || '').trim(),
          aadhar: String(b.AADHAR || b.Aadhar || ''),
          category: String(b.CATEGORY || b.Category || 'ST'),
          training: String(b['SKILL TRAINING'] || b.Trade || b.Remark || 'Skill Training'),
          remark: String(b.Remark || 'Registered')
        }));
      }

      // 11. Youth_Hub_Trainee / Youth_Hub_Trainings
      const yhRecords = sheetDataMap['Youth_Hub_Trainee'] || sheetDataMap['Youth_Hub_Trainings'] || [];
      const validYh = yhRecords.filter(r => {
        const val = Object.values(r)[0];
        return val && String(val).toUpperCase() !== 'NAME' && String(val).toUpperCase() !== 'SR. NO.';
      });
      if (fetchedSheets.has('Youth_Hub_Trainee') || fetchedSheets.has('Youth_Hub_Trainings')) {
        this.data.youthHubTrainings = validYh.map((y, idx) => ({
          id: idx + 1,
          name: String(y.NAME || y['NAME '] || y.Youth_Name || 'प्रशिक्षु').trim(),
          fatherName: String(y['FATHER NAME'] || y.Father_Name || '').trim(),
          village: String(y.VILLAGE || y.Village || 'Dantewada').trim(),
          block: this.standardizeBlock(y.BLOCK || y.Block),
          dob: String(y.DOB || '2003-01-01'),
          gender: String(y.GENDER || y.Gender || 'Male'),
          mobile: String(y['MOBILE NO.'] || y['MOBILE N0.'] || y.Mobile || '').trim(),
          remark: String(y.REMARK || y.Remark || 'Completed')
        }));
      }

      // 12. VO CLF Meeting / Meetings_VO_CLF_TRIF
      const meetingRecords = sheetDataMap['VO CLF Meeting'] || sheetDataMap['VO_CLF_Meeting'] || sheetDataMap['Meetings_VO_CLF_TRIF'] || [];
      const validMeetings = meetingRecords.filter(r => {
        const val = Object.values(r)[0];
        return val && String(val).toUpperCase() !== 'DATE';
      });
      if (fetchedSheets.has('VO CLF Meeting') || fetchedSheets.has('VO_CLF_Meeting') || fetchedSheets.has('Meetings_VO_CLF_TRIF')) {
        this.data.meetingsVoClfTrif = validMeetings.map((m, idx) => ({
          id: idx + 1,
          date: String(m.DATE || m.Date || new Date().toISOString().split('T')[0]),
          village: String(m.VILLAGE || m.Village || 'Dantewada').trim(),
          block: this.standardizeBlock(m.BLOCK || m.Block),
          voClfName: String(m['VO / CLF NAME'] || m['VO/CLF NAME'] || m.VO_CLF_NAME || 'VO / CLF Organization').trim(),
          adhayakshSachiv: String(m['ADHAYAKSH / SACHIV'] || m['ADHAYAKSH SACHIV'] || m.Adhayaksh_Sachiv || 'N/A').trim(),
          discussPoint: String(m['DISCUSS POINT'] || m.Discuss_Point || 'Youth Livelihood Mobilization').trim(),
          remarks: String(m.REMARKS || m.Remarks || 'Action Plan Finalized').trim(),
          photo: String(m.PHOTO || m.Photo || '')
        }));
      }

      // 13. Training_Conducted
      if (fetchedSheets.has('Training_Conducted')) {
        const trainRecords = sheetDataMap['Training_Conducted'] || [];
        this.data.trainingConducted = trainRecords.map((t, idx) => ({
          id: idx + 1,
          name: String(t.NAME || t['NAME '] || 'प्रशिक्षु').trim(),
          address: String(t.ADDRESS || t.Address || 'Dantewada').trim(),
          mobile: String(t['MOBILE NO.'] || t.Mobile || '').trim(),
          institute: String(t.INSTITUTE || t.Institute || 'District Livelihood College').trim(),
          training: String(t.TRAINING || t.Training || 'Vocational Training').trim()
        }));
      }

      // 14. MY_Bharat_Registration
      if (fetchedSheets.has('MY_Bharat_Registration')) {
        const mbRecords = sheetDataMap['MY_Bharat_Registration'] || [];
        const validMbRecords = mbRecords.filter(m => {
          const name = String(m.NAME || m.Name || m.Youth_Name || '').trim();
          const mobile = String(m['MOBILE NO.'] || m['MOBILE NO'] || m.Mobile || m.Mobile_Number || '').replace(/\D/g, '');
          return Boolean(name || mobile.length >= 10);
        });
        this.data.myBharat = validMbRecords.map((m, idx) => ({
          id: idx + 1,
          name: String(m.NAME || m.Name || 'पंजीकृत युवा').trim(),
          fatherName: String(m['FATHER NAME'] || m.Father_Name || '').trim(),
          village: String(m.VILLAGE || m.Village || '').trim(),
          block: this.standardizeBlock(m.BLOCK || m.Block),
          mobile: String(m['MOBILE NO.'] || m.Mobile || '').trim(),
          gender: String(m.GENDER || m.Gender || 'Male')
        }));
      }

      // 15. Field_Visits
      const visitRecords = sheetDataMap['Field_Visits'] || sheetDataMap['Field Visits'] || [];
      if (fetchedSheets.has('Field_Visits') || fetchedSheets.has('Field Visits') || visitRecords.length > 0) {
        this.data.fieldVisits = visitRecords.map((v, idx) => {
          let parsedPhotos = [];
          if (v.All_Photos_JSON || v.All_photos_JSON) {
            try {
              parsedPhotos = JSON.parse(v.All_Photos_JSON || v.All_photos_JSON);
            } catch (e) {}
          }
          if (!Array.isArray(parsedPhotos) || parsedPhotos.length === 0) {
            for (let p = 1; p <= 5; p++) {
              const link = v[`Photo_${p}_Link`] || v[`Photo_${p}`] || v[`Photo${p}`] || v[`Photo_${p}_link`];
              if (link) {
                parsedPhotos.push({
                  url: (typeof window !== 'undefined' && window.PhotoModule) ? window.PhotoModule.formatDriveUrl(link) : link,
                  caption: v[`Photo_${p}_Caption`] || v[`Photo_${p}_caption`] || `निरीक्षण प्रमाण #${p}`,
                  type: v[`Photo_${p}_Type`] || 'Inspection Proof'
                });
              }
            }
          } else {
            parsedPhotos = parsedPhotos.map(p => ({
              ...p,
              url: (typeof window !== 'undefined' && window.PhotoModule) ? window.PhotoModule.formatDriveUrl(p.url) : p.url
            }));
          }
          return {
            id: String(v.Visit_ID || v.id || `VIS-2026-${String(idx + 1).padStart(4, '0')}`),
            date: String(v.Date || ''),
            officerName: String(v.Officer_Name || v.officerName || 'Field Officer'),
            officerRole: String(v.Officer_Role || v.officerRole || 'Officer'),
            block: this.standardizeBlock(v.Block || v.block),
            gramPanchayat: String(v.Gram_Panchayat || v.gramPanchayat || ''),
            locationName: String(v.Location_Name || v.locationName || v.Village || ''),
            purpose: String(v.Purpose || v.purpose || 'फील्ड विजिट एवं निरीक्षण'),
            scheme: String(v.Scheme || v.scheme || ''),
            linkedYouthName: String(v.Linked_Youth_Name || v.linkedYouthName || ''),
            description: String(v.Description || v.description || ''),
            findings: String(v.Findings || v.findings || ''),
            issuesFaced: String(v.Issues_Faced || v.issuesFaced || ''),
            actionRequired: String(v.Action_Required || v.actionRequired || ''),
            followUpDate: String(v.Follow_Up_Date || v.followUpDate || ''),
            status: String(v.Status || v.status || 'Verified'),
            photos: parsedPhotos,
            isPublic: true,
            submittedAt: String(v.Submitted_At || v.submittedAt || '')
          };
        });
      }

      // 16. Success_Stories
      const storyRecords = sheetDataMap['Success_Stories'] || sheetDataMap['Success Stories'] || [];
      if (fetchedSheets.has('Success_Stories') || fetchedSheets.has('Success Stories') || storyRecords.length > 0) {
        this.data.successStories = storyRecords.map((s, idx) => {
          const rawPhoto = String(s.Photo_Link || s.photoUrl || s.Photo || '').trim();
          const photoUrl = (typeof window !== 'undefined' && window.PhotoModule) ? window.PhotoModule.formatDriveUrl(rawPhoto) : rawPhoto;
          return {
            id: String(s.Story_ID || s.id || `STR-2026-${String(idx + 1).padStart(3, '0')}`),
            youthName: String(s.Youth_Name || s.youthName || s.Name || 'सफल युवा'),
            village: String(s.Village || s.village || ''),
            block: this.standardizeBlock(s.Block || s.block),
            title: String(s.Title || s.title || `${s.Youth_Name || 'युवा'} की सफलता`),
            category: String(s.Category || s.category || 'Employment'),
            scheme: String(s.Scheme || s.scheme || ''),
            photoUrl: photoUrl,
            isPdf: s.Is_PDF === true || String(s.Is_PDF).toLowerCase() === 'true',
            summary: String(s.Summary || s.summary || ''),
            fullStory: String(s.Full_Story || s.fullStory || s.Description || ''),
            quote: String(s.Quote || s.quote || ''),
            achievementDate: String(s.Achievement_Date || s.achievementDate || ''),
            featured: s.Featured === true || String(s.Featured).toLowerCase() === 'true',
            status: (s.Status && s.Status !== 'Pending Approval') ? String(s.Status) : 'Published',
            author: String(s.Author || s.author || 'District Administration'),
            submittedAt: String(s.Submitted_At || s.submittedAt || '')
          };
        });
      }

      this.data.metadata.lastCloudSync = new Date().toISOString();
      this.data.metadata.totalSyncedRecords = totalSynced;
      this.data.metadata.syncStats = stats;
      this.persist();

      if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('db:changed'));
      }

      return {
        success: true,
        totalSynced,
        stats,
        message: `गूगल शीट से कुल ${totalSynced} लाइव रिकॉर्ड्स सफलतापूर्वक लोड कर लिए गए हैं।`
      };
    }

    // -------------------------------------------------------------
    // PII Masking Utilities (PRD Section 11 & 15)
    // -------------------------------------------------------------
    maskMobile(mobile) {
      if (!mobile) return 'XXXXX-XXXXX';
      const clean = String(mobile).replace(/\D/g, '');
      if (clean.length < 10) return 'XXXXX-' + clean.slice(-4);
      return clean.slice(0, 2) + 'XXXX-XX' + clean.slice(-2);
    }

    maskAadhaar(aadhaar) {
      if (!aadhaar) return 'XXXX-XXXX-XXXX';
      const clean = String(aadhaar).replace(/\D/g, '');
      if (clean.length < 12) return 'XXXX-XXXX-XXXX';
      return 'XXXX-XXXX-' + clean.slice(-4);
    }
  }

  window.DantewadaDB = new DatabaseService();
})();
