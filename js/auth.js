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
      aliasId: 'usr_dist',
      email: 'district.admin@dantewada.gov.in',
      name: 'जिला रोजगार अधिकारी (District Employment Officer)',
      role: 'super_admin',
      block: 'All',
      department: 'District Employment & Livelihood Exchange, Dantewada'
    }
  ];

  const STORAGE_KEY = 'DANTEWADA_AUTH_USER';
  const SESSION_KEY = 'DANTEWADA_ADMIN_SESSION';
  const CUSTOM_PASS_KEY = 'DANTEWADA_ADMIN_CUSTOM_PASSWORD';
  const CUSTOM_USERS_KEY = 'DANTEWADA_CUSTOM_USERS';
  const CUSTOM_ROLES_KEY = 'DANTEWADA_CUSTOM_ROLES';
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
     * Supports both Super Admin master password and custom user credentials.
     * @param {string} userIdOrEmail Selected user ID, username, or email
     * @param {string} password Secret password
     * @param {boolean} [remember=true] Persist session across browser restarts
     * @return {Object} Status and user details
     */
    authenticateWithPassword(userIdOrEmail, password, remember = true) {
      if (!password || typeof password !== 'string') {
        return {
          success: false,
          message: 'अमान्य पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।'
        };
      }
      const cleanPass = password.trim();
      if (!cleanPass) {
        return {
          success: false,
          message: 'अमान्य पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।'
        };
      }

      const allUsers = this._getRawUsers();
      let matchedUser = null;

      if (userIdOrEmail) {
        const target = String(userIdOrEmail).toLowerCase().trim();
        matchedUser = allUsers.find(u => 
          u.id === target || 
          u.aliasId === target ||
          (u.username && u.username.toLowerCase() === target) ||
          (u.email && u.email.toLowerCase() === target)
        );
      }

      if (matchedUser) {
        let passValid = false;
        if (matchedUser.password) {
          passValid = (cleanPass === matchedUser.password.trim()) || this.verifyPassword(cleanPass);
        } else {
          passValid = this.verifyPassword(cleanPass);
        }

        if (!passValid) {
          return {
            success: false,
            message: 'अमान्य पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।'
          };
        }
      } else {
        if (!this.verifyPassword(cleanPass)) {
          return {
            success: false,
            message: 'अमान्य पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।'
          };
        }
        matchedUser = DEFAULT_USERS[0];
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
          // If already District Employment Officer (Super Admin), keep it
          if (parsed && (parsed.id === 'usr_super' || parsed.id === 'usr_dist') && parsed.name === DEFAULT_USERS[0].name) {
            return parsed;
          }
          // If valid custom user, keep it
          const allUsers = this.getAllUsers ? this.getAllUsers() : DEFAULT_USERS;
          const match = allUsers.find(u => u.id === parsed.id || u.aliasId === parsed.id || (u.username && u.username === parsed.username));
          if (match) {
            return match;
          }
          // Fallback to Employment Officer
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS[0]));
          return DEFAULT_USERS[0];
        }
      } catch (e) {
        console.error('Error loading user from localStorage:', e);
      }
      // Default to Super Admin (District Employment Officer)
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
      const customRoles = this.getCustomRoles ? this.getCustomRoles() : [];
      const custom = customRoles.find(r => r.id === id);
      if (custom) return custom;
      return ROLES.PUBLIC_VISITOR;
    }

    // ==========================================
    // CUSTOM USER & ROLE MANAGEMENT
    // ==========================================

    getCustomUsers() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(CUSTOM_USERS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveCustomUsers(users) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
        }
      } catch (e) {
        console.error('Error saving custom users:', e);
      }
    }

    _getRawUsers() {
      return [...DEFAULT_USERS, ...this.getCustomUsers()];
    }

    /**
     * Retrieves all users.
     * Passwords are strictly sanitized/masked for non-super admins.
     * @param {boolean} [forceIncludePasswords=false]
     * @return {Array<Object>}
     */
    getAllUsers(forceIncludePasswords = false) {
      const raw = this._getRawUsers();
      if (this.isSuperAdmin() || forceIncludePasswords) {
        return raw;
      }
      return raw.map(u => ({
        ...u,
        password: '••••••••'
      }));
    }

    /**
     * Checks if a user (or current user) is Super Admin.
     * @param {Object} [user]
     * @return {boolean}
     */
    isSuperAdmin(user = null) {
      const u = user || this.currentUser;
      if (!u) return false;
      return u.role === 'super_admin' || u.id === 'usr_super' || u.id === 'usr_dist';
    }

    /**
     * Securely retrieves a user's password.
     * STRICT SECURITY POLICY: Passwords are ONLY shown/accessible to Super Admin.
     * @param {string} userId
     * @return {string|null}
     */
    getUserPassword(userId) {
      if (!this.isSuperAdmin()) {
        console.warn('Security Alert: Attempted to access password by non-super admin.');
        return null;
      }
      const raw = this._getRawUsers();
      const user = raw.find(u => u.id === userId || u.aliasId === userId || (u.username && u.username === userId));
      if (!user) return null;
      if (this.isSuperAdmin(user)) {
        return '(मास्टर एडमिन पासवर्ड)';
      }
      return user.password || '••••••';
    }

    addUser(userData) {
      if (!userData || typeof userData !== 'object') {
        return { success: false, message: 'अमान्य डेटा!' };
      }
      const name = String(userData.name || '').trim();
      const username = String(userData.username || '').trim().toLowerCase();
      const password = String(userData.password || '').trim();
      const role = String(userData.role || 'deo').trim();
      const block = String(userData.block || 'All').trim();
      const email = String(userData.email || (username ? `${username}@dantewada.gov.in` : '')).trim().toLowerCase();

      if (!name || name.length < 2) {
        return { success: false, message: 'कृपया उपयोगकर्ता का पूरा नाम दर्ज करें।' };
      }
      if (!username || username.length < 3) {
        return { success: false, message: 'यूजर आईडी कम से कम 3 अक्षरों की होनी चाहिए।' };
      }
      if (!password || password.length < 4) {
        return { success: false, message: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
      }

      const all = this.getAllUsers();
      const exists = all.some(u => 
        (u.username && u.username.toLowerCase() === username) || 
        (u.email && u.email.toLowerCase() === email) ||
        u.id === username
      );
      if (exists) {
        return { success: false, message: `यूजर आईडी '${username}' पहले से उपयोग में है। कृपया दूसरी आईडी चुनें।` };
      }

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        username,
        email,
        role,
        block,
        department: userData.department || 'District Administration, Dantewada',
        password,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const custom = this.getCustomUsers();
      custom.push(newUser);
      this.saveCustomUsers(custom);

      return { success: true, user: newUser, message: `उपयोगकर्ता '${name}' (${username}) सफलतापूर्वक बनाया गया!` };
    }

    deleteUser(userId) {
      if (!userId) return { success: false, message: 'यूजर आईडी आवश्यक है।' };
      if (userId === 'usr_super' || userId === 'usr_dist') {
        return { success: false, message: 'मुख्य सुपर एडमिन को हटाया नहीं जा सकता।' };
      }

      const custom = this.getCustomUsers();
      const filtered = custom.filter(u => u.id !== userId && u.username !== userId);
      if (filtered.length === custom.length) {
        return { success: false, message: 'उपयोगकर्ता नहीं मिला।' };
      }

      this.saveCustomUsers(filtered);
      return { success: true, message: 'उपयोगकर्ता सफलतापूर्वक हटा दिया गया।' };
    }

    updateUserPassword(userId, newPassword) {
      if (!newPassword || newPassword.trim().length < 4) {
        return { success: false, message: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
      }
      if (userId === 'usr_super' || userId === 'usr_dist') {
        try {
          localStorage.setItem(CUSTOM_PASS_KEY, newPassword.trim());
          return { success: true, message: 'सुपर एडमिन पासवर्ड अपडेट हो गया।' };
        } catch (e) {
          return { success: false, message: 'पासवर्ड सुरक्षित करने में त्रुटि।' };
        }
      }

      const custom = this.getCustomUsers();
      const user = custom.find(u => u.id === userId || u.username === userId);
      if (!user) {
        return { success: false, message: 'उपयोगकर्ता नहीं मिला।' };
      }

      user.password = newPassword.trim();
      this.saveCustomUsers(custom);
      return { success: true, message: `उपयोगकर्ता '${user.name}' का पासवर्ड अपडेट हो गया।` };
    }

    getCustomRoles() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(CUSTOM_ROLES_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveCustomRoles(roles) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(roles));
        }
      } catch (e) {
        console.error('Error saving custom roles:', e);
      }
    }

    addCustomRole(roleData) {
      if (!roleData || typeof roleData !== 'object') {
        return { success: false, message: 'अमान्य रोल डेटा!' };
      }
      const name = String(roleData.name || '').trim();
      const nameHi = String(roleData.nameHi || name).trim();
      const id = String(roleData.id || name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim().toLowerCase();
      const permissions = Array.isArray(roleData.permissions) ? roleData.permissions : ['youth_read'];

      if (!name || name.length < 2) {
        return { success: false, message: 'कृपया रोल का नाम दर्ज करें।' };
      }
      if (!id || id.length < 2) {
        return { success: false, message: 'रोल आईडी कम से कम 2 अक्षरों की होनी चाहिए।' };
      }

      const allRoles = this.getAllRoles();
      if (allRoles.some(r => r.id === id)) {
        return { success: false, message: `रोल आईडी '${id}' पहले से मौजूद है।` };
      }

      const newRole = {
        id,
        name,
        nameHi,
        permissions,
        isCustom: true
      };

      const customRoles = this.getCustomRoles();
      customRoles.push(newRole);
      this.saveCustomRoles(customRoles);

      return { success: true, role: newRole, message: `नया रोल '${nameHi}' सफलतापूर्वक बनाया गया!` };
    }

    switchUser(userId) {
      const all = this._getRawUsers();
      const found = all.find(u => u.id === userId || u.aliasId === userId || (u.username && u.username === userId));
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
