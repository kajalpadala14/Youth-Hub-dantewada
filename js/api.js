/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * api.js - Clean, Production-Grade Communication Layer with Google Apps Script
 */

const API = (function() {
  const STORAGE_KEY_TOKEN = "YH_DANTEWADA_TOKEN";
  const STORAGE_KEY_USER = "YH_DANTEWADA_USER";
  const STORAGE_KEY_API_URL = "YH_DANTEWADA_API_URL";

  // Check if running inside Google Apps Script iframe
  const isAppsScriptEnvironment = typeof google !== "undefined" && google.script && google.script.run;

  function getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || "";
  }

  function setSession(token, user) {
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
    if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getApiUrl() {
    // 1. Check window.ENV if configured via env.js or hosting platform
    if (typeof window !== "undefined" && window.ENV && window.ENV.GOOGLE_SCRIPT_URL) {
      return window.ENV.GOOGLE_SCRIPT_URL.trim();
    }
    // 2. Check process.env (Vite / Webpack / Next build env)
    if (typeof process !== "undefined" && process.env) {
      const envUrl = process.env.VITE_GOOGLE_SCRIPT_URL || process.env.REACT_APP_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
      if (envUrl) return envUrl.trim();
    }
    // 3. Fallback to localStorage (Settings modal)
    return localStorage.getItem(STORAGE_KEY_API_URL) || "";
  }

  function setApiUrl(url) {
    if (url) localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
  }

  /**
   * Unified dispatcher: calls google.script.run when embedded, or fetch() when standalone
   */
  async function call(action, payload = {}) {
    payload.userToken = getToken();

    // 1. Apps Script embedded execution
    if (isAppsScriptEnvironment) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((response) => {
            if (typeof response === "string") {
              try { response = JSON.parse(response); } catch (e) {}
            }
            resolve(response);
          })
          .withFailureHandler((error) => {
            reject(new Error(error.message || error.toString()));
          })
          .doPost({
            postData: {
              contents: JSON.stringify({ action, payload, token: getToken() })
            }
          });
      });
    }

    // 2. Standalone / Local / Production execution via HTTP POST to Apps Script Web App URL
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      return { success: false, message: "Apps Script Web App URL is not configured." };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, payload, token: getToken() })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("API Server Error:", err);
      return { success: false, message: err.message || "Failed to communicate with Google Sheets." };
    }
  }

  return {
    call,
    getToken,
    setSession,
    clearSession,
    getCurrentUser,
    getApiUrl,
    setApiUrl,
    isAppsScriptEnvironment
  };
})();
