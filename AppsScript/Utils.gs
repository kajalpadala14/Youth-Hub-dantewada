/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Utils.gs - Helper Utilities, Security, and Formatting
 */

// Dantewada Blocks and sample Gram Panchayats
const DANTEWADA_CONFIG = {
  DISTRICT: "Dantewada",
  BLOCKS: {
    "Dantewada": ["Chitalanka", "Bhansi", "Teknar", "Balpet", "Dantewada Rural", "Kamlur", "Madkamiras", "Gadhpal"],
    "Geedam": ["Barsoor", "Haram", "Gumalnar", "Kasoli", "Geedam Rural", "Pondum", "Javanga", "Karli"],
    "Katekalyan": ["Marjum", "Parcheli", "Tumakpal", "Bengpal", "Katekalyan Rural", "Bodenar", "Telam", "Gatam"],
    "Kuakonda": ["Mailawada", "Nakulnar", "Sameli", "Palnar", "Kuakonda Rural", "Bacheli Rural", "Hitawar", "Durgapur"]
  },
  YOUTH_HUBS: [
    "Youth Hub Dantewada (District HQ)",
    "Youth Hub Geedam (Skill & Innovation)",
    "Youth Hub Katekalyan",
    "Youth Hub Kuakonda"
  ],
  FINANCIAL_YEARS: ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"],
  MONTHS: [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ]
};

/**
 * Calculates Financial Year string (e.g. 2026-27) for a given date
 */
function getFinancialYear(dateInput) {
  var d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  var month = d.getMonth() + 1; // 1-12
  var year = d.getFullYear();
  if (month >= 4) {
    return year + "-" + String(year + 1).slice(-2);
  } else {
    return (year - 1) + "-" + String(year).slice(-2);
  }
}

/**
 * Validates Indian 10-digit mobile number
 */
function isValidMobile(mobile) {
  if (!mobile) return false;
  var cleaned = String(mobile).replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Generates next sequential Youth ID: YH-YYYY-00001
 */
function generateYouthId(sheet) {
  var year = new Date().getFullYear();
  var prefix = "YH-" + year + "-";
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = sheet.getDataRange().getValues();
    var maxNum = 0;
    for (var i = 1; i < data.length; i++) {
      var id = String(data[i][0] || "");
      if (id.indexOf(prefix) === 0) {
        var num = parseInt(id.replace(prefix, ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    var nextNum = maxNum + 1;
    var padded = ("00000" + nextNum).slice(-5);
    return prefix + padded;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Generates generic sequential record ID
 * e.g., MOB-2026-0001, MF-2026-0001
 */
function generateRecordId(prefix, sheet) {
  var year = new Date().getFullYear();
  var fullPrefix = prefix + "-" + year + "-";
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    var data = sheet.getDataRange().getValues();
    var maxNum = 0;
    for (var i = 1; i < data.length; i++) {
      var id = String(data[i][0] || "");
      if (id.indexOf(fullPrefix) === 0) {
        var num = parseInt(id.replace(fullPrefix, ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    var nextNum = maxNum + 1;
    var padded = ("0000" + nextNum).slice(-4);
    return fullPrefix + padded;
  } finally {
    lock.releaseLock();
  }
}

/**
 * SHA-256 Hash with salt
 */
function hashPassword(password) {
  var salt = "YH_DANTEWADA_SECURE_SALT_2026#@!";
  var signature = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + salt,
    Utilities.Charset.UTF_8
  );
  var hex = "";
  for (var i = 0; i < signature.length; i++) {
    var byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length == 1) byteHex = "0" + byteHex;
    hex += byteHex;
  }
  return hex;
}

/**
 * JSON Response builder for HTTP / Web App
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(d) {
  if (!d) return "";
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  var yr = dt.getFullYear();
  var mo = ("0" + (dt.getMonth() + 1)).slice(-2);
  var day = ("0" + dt.getDate()).slice(-2);
  return yr + "-" + mo + "-" + day;
}
