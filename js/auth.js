/**
 * Authentication and Role-Based Access Control (RBAC) Module
 * Dantewada Youth Development Portal
 * Roles defined as per PRD Section 10:
 * - Super Admin
 * - District Admin
 * - Block Officer
 * - Field Staff
 * - Data Entry Operator
 * - Gallery Reviewer
 * - Public Visitor
 */

(function () {
  const ROLES = {
    SUPER_ADMIN: {
      id: 'super_admin',
      name: 'Super Admin',
      nameHi: 'सुपर एडमिन',
      permissions: ['all', 'users', 'settings', 'youth_read', 'youth_write', 'youth_delete', 'visit_read', 'visit_write', 'visit_approve', 'story_read', 'story_write', 'story_approve', 'import', 'export', 'audit_logs']
    },
    DISTRICT_ADMIN: {
      id: 'district_admin',
      name: 'District Admin',
      nameHi: 'जिला एडमिन',
      permissions: ['district_wide', 'reports', 'approvals', 'youth_read', 'youth_write', 'visit_read', 'visit_write', 'visit_approve', 'story_read', 'story_write', 'story_approve', 'import', 'export']
    },
    BLOCK_OFFICER: {
      id: 'block_officer',
      name: 'Block Officer',
      nameHi: 'ब्लॉक अधिकारी',
      permissions: ['block_restricted', 'youth_read', 'youth_write', 'visit_read', 'visit_write', 'reports_block', 'export_block']
    },
    FIELD_STAFF: {
      id: 'field_staff',
      name: 'Field Staff',
      nameHi: 'फील्ड स्टाफ',
      permissions: ['visit_read', 'visit_write', 'photo_upload', 'youth_read']
    },
    DATA_ENTRY_OPERATOR: {
      id: 'deo',
      name: 'Data Entry Operator',
      nameHi: 'डेटा एंट्री ऑपरेटर',
      permissions: ['youth_read', 'youth_write', 'import', 'visit_read']
    },
    GALLERY_REVIEWER: {
      id: 'gallery_reviewer',
      name: 'Gallery Reviewer',
      nameHi: 'गैलरी समीक्षक',
      permissions: ['story_read', 'story_write', 'story_approve', 'visit_read', 'visit_approve']
    },
    PUBLIC_VISITOR: {
      id: 'public',
      name: 'Public Visitor',
      nameHi: 'सार्वजनिक नागरिक',
      permissions: ['public_read']
    }
  };

  const DEFAULT_USERS = [
    {
      id: 'usr_super',
      email: 'admin@dantewada.gov.in',
      name: 'Amit Varma',
      role: 'super_admin',
      block: 'All',
      department: 'District Administration Dantewada'
    },
    {
      id: 'usr_dist',
      email: 'district.admin@dantewada.gov.in',
      name: 'Dr. S. Beck (Assistant Director, Employment)',
      role: 'district_admin',
      block: 'All',
      department: 'District Employment & Livelihood Exchange'
    },
    {
      id: 'usr_block_geedam',
      email: 'bdo.geedam@dantewada.gov.in',
      name: 'Shri R.K. Kashyap (BDO Geedam)',
      role: 'block_officer',
      block: 'Geedam',
      department: 'Janpad Panchayat Geedam'
    },
    {
      id: 'usr_block_dantewada',
      email: 'bdo.dantewada@dantewada.gov.in',
      name: 'Shri V.K. Sahu (BDO Dantewada)',
      role: 'block_officer',
      block: 'Dantewada',
      department: 'Janpad Panchayat Dantewada'
    },
    {
      id: 'usr_field',
      email: 'field.staff@dantewada.gov.in',
      name: 'Smt. Anita Mandavi (Senior Field Coordinator)',
      role: 'field_staff',
      block: 'All',
      department: 'Youth Hub Field Operations'
    },
    {
      id: 'usr_deo',
      email: 'deo@dantewada.gov.in',
      name: 'Rohan Baghel (Lead DEO)',
      role: 'deo',
      block: 'All',
      department: 'Zilla Panchayat Data Cell'
    },
    {
      id: 'usr_reviewer',
      email: 'reviewer@dantewada.gov.in',
      name: 'Ms. Sunita Soren (District PRO & Media In-charge)',
      role: 'gallery_reviewer',
      block: 'All',
      department: 'District Public Relations'
    }
  ];

  const STORAGE_KEY = 'DANTEWADA_AUTH_USER';
  const SESSION_KEY = 'DANTEWADA_ADMIN_SESSION';
  const CUSTOM_PASS_KEY = 'DANTEWADA_ADMIN_CUSTOM_PASSWORD';
  const DEFAULT_PASSWORDS = ['admin123', 'dantewada@2026', 'admin@2026', 'dantewada', 'admin'];

  class AuthService {
    constructor() {
      this.currentUser = this.loadUser();
    }

    /**
     * Checks if current browser session holds an active admin session token.
     * @return {boolean}
     */
    isAuthenticated() {
      try {
        let token = null;
        if (typeof sessionStorage !== 'undefined') {
          token = sessionStorage.getItem(SESSION_KEY);
        }
        if (!token && typeof localStorage !== 'undefined') {
          token = localStorage.getItem(SESSION_KEY);
        }
        return Boolean(token);
      } catch (e) {
        return false;
      }
    }

    /**
     * Validates input password against custom password or built-in administrative defaults.
     * @param {string} password
     * @return {boolean}
     */
    verifyPassword(password) {
      if (!password || typeof password !== 'string') return false;
      const cleanPass = password.trim();
      if (!cleanPass) return false;

      // 1. Check custom password stored in localStorage
      try {
        const customPass = localStorage.getItem(CUSTOM_PASS_KEY);
        if (customPass && customPass.trim() === cleanPass) {
          return true;
        }
      } catch (e) {}

      // 2. Check default passwords (case-normalized and exact)
      const cleanLower = cleanPass.toLowerCase();
      return DEFAULT_PASSWORDS.some(dp => dp === cleanPass || dp.toLowerCase() === cleanLower);
    }

    /**
     * Authenticates administrative user with password.
     * @param {string} userIdOrEmail Selected user ID or email
     * @param {string} password Secret password
     * @param {boolean} [remember=true] Persist session across browser restarts
     * @return {Object} Status and user details
     */
    authenticateWithPassword(userIdOrEmail, password, remember = true) {
      if (!this.verifyPassword(password)) {
        return {
          success: false,
          message: 'अमान्य पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।'
        };
      }

      let matchedUser = null;
      if (userIdOrEmail) {
        matchedUser = DEFAULT_USERS.find(u => 
          u.id === userIdOrEmail || 
          u.email.toLowerCase() === String(userIdOrEmail).toLowerCase().trim()
        );
      }
      if (!matchedUser) {
        matchedUser = this.currentUser || DEFAULT_USERS[0];
      }

      this.saveUser(matchedUser);

      // Store authenticated session token
      const sessionToken = 'ADMIN_SESSION_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(SESSION_KEY, sessionToken);
        }
        if (typeof localStorage !== 'undefined') {
          if (remember) {
            localStorage.setItem(SESSION_KEY, sessionToken);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (e) {}

      return { success: true, user: matchedUser, token: sessionToken };
    }

    /**
     * Allows authenticated administrator to set a new custom password.
     * @param {string} currentPassword
     * @param {string} newPassword
     * @return {Object}
     */
    setAdminPassword(currentPassword, newPassword) {
      if (!this.verifyPassword(currentPassword)) {
        return { success: false, message: 'वर्तमान पासवर्ड गलत है (Current password incorrect)!' };
      }
      if (!newPassword || newPassword.trim().length < 4) {
        return { success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
      }

      try {
        localStorage.setItem(CUSTOM_PASS_KEY, newPassword.trim());
      } catch (e) {
        return { success: false, message: 'पासवर्ड सुरक्षित करने में असमर्थ।' };
      }

      return { success: true, message: 'एडमिन पासवर्ड सफलतापूर्वक अपडेट हो गया!' };
    }

    loadUser() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.id === 'usr_super' || parsed.role === 'super_admin')) {
            parsed.name = 'Amit Varma';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch (e) {
        console.error('Error loading user from localStorage:', e);
      }
      // Default to Super Admin for smooth administrative workflow
      return DEFAULT_USERS[0];
    }

    saveUser(user) {
      this.currentUser = user;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Error saving user to localStorage:', e);
      }
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:user_changed', { detail: user }));
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    getRoleDetails(roleId) {
      const id = roleId || (this.currentUser ? this.currentUser.role : 'public');
      for (const key in ROLES) {
        if (ROLES[key].id === id) return ROLES[key];
      }
      return ROLES.PUBLIC_VISITOR;
    }

    switchUser(userId) {
      const found = DEFAULT_USERS.find(u => u.id === userId);
      if (found) {
        this.saveUser(found);
        return found;
      }
      return null;
    }

    login(email) {
      const found = DEFAULT_USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
      if (found) {
        this.saveUser(found);
        return { success: true, user: found };
      }
      // If user typed a custom email, grant default DEO role
      const custom = {
        id: 'usr_custom_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'deo',
        block: 'All',
        department: 'District Administration'
      };
      this.saveUser(custom);
      return { success: true, user: custom };
    }

    logout() {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(SESSION_KEY);
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {}

      const publicUser = {
        id: 'usr_public',
        email: '',
        name: 'Guest User',
        role: 'public',
        block: 'All',
        department: 'Citizen Portal'
      };
      this.saveUser(publicUser);
      return true;
    }

    can(permission) {
      if (!this.currentUser) return false;
      const role = this.getRoleDetails(this.currentUser.role);
      if (role.permissions.includes('all')) return true;
      return role.permissions.includes(permission);
    }

    isBlockRestricted() {
      return this.currentUser && this.currentUser.role === 'block_officer' && this.currentUser.block !== 'All';
    }

    getRestrictedBlock() {
      return this.isBlockRestricted() ? this.currentUser.block : null;
    }

    getAllPresetUsers() {
      return DEFAULT_USERS;
    }

    getAllRoles() {
      return Object.values(ROLES);
    }
  }

  window.DantewadaAuth = new AuthService();
})();
