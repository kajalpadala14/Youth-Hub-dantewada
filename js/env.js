/**
 * Environment configuration for browser/frontend runtime.
 * You can set your Google Apps Script Web App URL here directly,
 * or manage it via your hosting provider's build environment.
 */
window.ENV = {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwZPrxwgxARGym4gEouhv122sbbDkR3eSpkBg2xlxzOBOJQ2LOIToPO8xymSwxqMFcD/exec",
  GOOGLE_DRIVE_FOLDER_ID: "1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO",
  GOOGLE_DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO"
};

// Automatically keep browser localStorage updated with active authorized endpoint
if (typeof localStorage !== "undefined") {
  localStorage.setItem("YH_DANTEWADA_API_URL", window.ENV.GOOGLE_SCRIPT_URL);
}

