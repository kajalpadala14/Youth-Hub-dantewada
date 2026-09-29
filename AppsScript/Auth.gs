/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Auth.gs - Authentication, Token Management & Role-Based Access Control (RBAC)
 */

const ROLES = {
  ADMIN: "ADMIN",
  DATA_OPERATOR: "DATA OPERATOR",
  BLOCK_USER: "BLOCK USER",
  VIEWER: "VIEWER"
};

/**
 * Creates default system users if the Users sheet is empty
 */
function createAdminUser() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheet) return;
  
  if (sheet.getLastRow() <= 1) {
    var defaultUsers = [
      {
        User_ID: "USR-001",
        Name: "District Admin Dantewada",
        Email: "admin@dantewada.gov.in",
        Password_Hash: hashPassword("Admin@Dantewada2026"),
        Role: ROLES.ADMIN,
        Block: "All",
        Youth_Hub: "Youth Hub Dantewada (District HQ)",
        Status: "Active",
        Created_At: new Date()
      },
      {
        User_ID: "USR-002",
        Name: "Lead Data Operator",
        Email: "operator@dantewada.gov.in",
        Password_Hash: hashPassword("Operator@2026"),
        Role: ROLES.DATA_OPERATOR,
        Block: "All",
        Youth_Hub: "Youth Hub Dantewada (District HQ)",
        Status: "Active",
        Created_At: new Date()
      },
      {
        User_ID: "USR-003",
        Name: "Katekalyan Block Coordinator",
        Email: "kate.user@dantewada.gov.in",
        Password_Hash: hashPassword("Block@Kate2026"),
        Role: ROLES.BLOCK_USER,
        Block: "Katekalyan",
        Youth_Hub: "Youth Hub Katekalyan",
        Status: "Active",
        Created_At: new Date()
      },
      {
        User_ID: "USR-004",
        Name: "Kuakonda Block Coordinator",
        Email: "kua.user@dantewada.gov.in",
        Password_Hash: hashPassword("Block@Kua2026"),
        Role: ROLES.BLOCK_USER,
        Block: "Kuakonda",
        Youth_Hub: "Youth Hub Kuakonda",
        Status: "Active",
        Created_At: new Date()
      },
      {
        User_ID: "USR-005",
        Name: "District Collector / Senior Viewer",
        Email: "viewer@dantewada.gov.in",
        Password_Hash: hashPassword("Viewer@2026"),
        Role: ROLES.VIEWER,
        Block: "All",
        Youth_Hub: "All",
        Status: "Active",
        Created_At: new Date()
      }
    ];
    
    defaultUsers.forEach(function(u) {
      appendRecord(SHEET_NAMES.USERS, u);
    });
  }
}

/**
 * Authenticates user credentials and returns session token
 */
function authenticateUser(email, password) {
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  
  var cleanEmail = String(email).trim().toLowerCase();
  var passHash = hashPassword(password);
  
  var users = getSheetRows(SHEET_NAMES.USERS);
  var matchedUser = null;
  
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (String(u.Email).toLowerCase().trim() === cleanEmail) {
      matchedUser = u;
      break;
    }
  }
  
  if (!matchedUser) {
    return { success: false, message: "Invalid email or credentials." };
  }
  
  if (matchedUser.Status !== "Active") {
    return { success: false, message: "Your account is inactive. Please contact Administrator." };
  }
  
  if (matchedUser.Password_Hash !== passHash) {
    return { success: false, message: "Invalid email or password." };
  }
  
  // Generate session token valid for 7 days
  var tokenPayload = {
    userId: matchedUser.User_ID,
    name: matchedUser.Name,
    email: matchedUser.Email,
    role: matchedUser.Role,
    block: matchedUser.Block,
    youthHub: matchedUser.Youth_Hub,
    expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
  };
  
  var token = Utilities.base64Encode(JSON.stringify(tokenPayload));
  
  // Log login
  writeAuditLogDirect(matchedUser.Email, matchedUser.Role, "LOGIN", "Auth", matchedUser.User_ID, "Successful Login");
  
  return {
    success: true,
    token: token,
    user: {
      userId: matchedUser.User_ID,
      name: matchedUser.Name,
      email: matchedUser.Email,
      role: matchedUser.Role,
      block: matchedUser.Block,
      youthHub: matchedUser.Youth_Hub
    }
  };
}

/**
 * Verifies session token and returns decoded user payload
 */
function verifySessionToken(token) {
  if (!token) return null;
  try {
    var decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    var payload = JSON.parse(decoded);
    if (!payload.expiresAt || new Date().getTime() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Checks whether user has permission for a specific module or action
 */
function checkUserPermission(user, requiredRole) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (requiredRole === ROLES.ADMIN) return false;
  
  if (requiredRole === ROLES.DATA_OPERATOR) {
    return user.role === ROLES.DATA_OPERATOR || user.role === ROLES.BLOCK_USER;
  }
  
  if (requiredRole === ROLES.BLOCK_USER) {
    return user.role === ROLES.BLOCK_USER || user.role === ROLES.DATA_OPERATOR;
  }
  
  if (requiredRole === ROLES.VIEWER) {
    return true; // Any authenticated user can view
  }
  
  return true;
}

/**
 * User management list (Admin only)
 */
function listUsers(userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role !== ROLES.ADMIN) {
    return { success: false, message: "Unauthorized. Administrator rights required." };
  }
  
  var rows = getSheetRows(SHEET_NAMES.USERS);
  var safeUsers = rows.map(function(r) {
    return {
      User_ID: r.User_ID,
      Name: r.Name,
      Email: r.Email,
      Role: r.Role,
      Block: r.Block,
      Youth_Hub: r.Youth_Hub,
      Status: r.Status,
      Created_At: r.Created_At
    };
  });
  
  return { success: true, users: safeUsers };
}

/**
 * Add new user (Admin only)
 */
function createUser(userData, userToken) {
  var user = verifySessionToken(userToken);
  if (!user || user.role !== ROLES.ADMIN) {
    return { success: false, message: "Unauthorized. Administrator rights required." };
  }
  
  if (!userData.Name || !userData.Email || !userData.Password || !userData.Role) {
    return { success: false, message: "Name, Email, Password, and Role are mandatory." };
  }
  
  var email = String(userData.Email).toLowerCase().trim();
  var existing = getSheetRows(SHEET_NAMES.USERS);
  if (existing.some(function(u) { return String(u.Email).toLowerCase().trim() === email; })) {
    return { success: false, message: "A user with this email address already exists." };
  }
  
  var newId = "USR-" + ("000" + (existing.length + 1)).slice(-3);
  var record = {
    User_ID: newId,
    Name: userData.Name.trim(),
    Email: email,
    Password_Hash: hashPassword(userData.Password),
    Role: userData.Role,
    Block: userData.Block || "All",
    Youth_Hub: userData.Youth_Hub || "All",
    Status: userData.Status || "Active",
    Created_At: new Date()
  };
  
  appendRecord(SHEET_NAMES.USERS, record);
  writeAuditLogDirect(user.email, user.role, "CREATE", "Users", newId, "Created user: " + email);
  
  return { success: true, message: "User created successfully with ID: " + newId };
}
