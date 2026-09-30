// ============================================================
// LANTERN - EXTENSION BACKGROUND SERVICE WORKER
// Auto-open and tab focus management for LANTERN Landing Page
// ============================================================

importScripts("config.js");

console.log("[LANTERN] Background service worker initialized.");

const APP_URL =
  typeof LANTERN_CONFIG !== "undefined" && LANTERN_CONFIG.APP_URL
    ? LANTERN_CONFIG.APP_URL
    : "http://localhost:5173/";

/**
 * Checks if the LANTERN landing page is already open in any tab.
 * If yes, focuses that tab.
 * If no, creates a single new tab with the landing page URL.
 */
function checkAndOpenLandingPage() {
  chrome.tabs.query({}, (tabs) => {
    if (chrome.runtime.lastError) {
      console.warn("[LANTERN] Tab query error:", chrome.runtime.lastError);
      return;
    }

    let existingLandingTab = null;

    try {
      const targetAppUrl = new URL(APP_URL);

      existingLandingTab = tabs.find((tab) => {
        if (!tab.url) return false;
        try {
          const tabUrl = new URL(tab.url);
          // Check if tab matches the host & port and is on the landing page or portal
          const isSameHost =
            tabUrl.hostname === targetAppUrl.hostname &&
            String(tabUrl.port) === String(targetAppUrl.port);

          const isLandingOrPortal =
            tabUrl.pathname === "/" ||
            tabUrl.pathname === "" ||
            tabUrl.pathname === "/ksrtc" ||
            tabUrl.pathname === "/irctc" ||
            tabUrl.pathname === "/bharatgas" ||
            tabUrl.pathname === "/kseb";

          return isSameHost && isLandingOrPortal;
        } catch (_) {
          return tab.url.startsWith(APP_URL);
        }
      });
    } catch (_) {
      existingLandingTab = tabs.find(
        (tab) => tab.url && tab.url.startsWith(APP_URL)
      );
    }

    if (existingLandingTab && existingLandingTab.id !== undefined) {
      console.log(
        "[LANTERN] Landing page tab already open (Tab ID: " +
          existingLandingTab.id +
          "). Focusing tab without duplication."
      );
      chrome.tabs.update(existingLandingTab.id, { active: true });
      if (existingLandingTab.windowId) {
        chrome.windows.update(existingLandingTab.windowId, { focused: true });
      }
    } else {
      console.log("[LANTERN] Opening fresh LANTERN landing page tab:", APP_URL);
      chrome.tabs.create({ url: APP_URL });
    }
  });
}

// ------------------------------------------------------------
// CHROME STARTUP HOOK
// Automatically opens LANTERN landing page on browser launch
// ------------------------------------------------------------
chrome.runtime.onStartup.addListener(() => {
  console.log("[LANTERN] Chrome browser startup detected.");
  checkAndOpenLandingPage();
});

// ------------------------------------------------------------
// EXTENSION INSTALL / UPDATE HOOK
// ------------------------------------------------------------
chrome.runtime.onInstalled.addListener((details) => {
  console.log(
    "[LANTERN] Extension installation or update event:",
    details.reason
  );
  if (details.reason === "install" || details.reason === "update") {
    checkAndOpenLandingPage();
  }
});

// ------------------------------------------------------------
// MESSAGE LISTENER
// Allows content scripts to request opening or focusing landing page
// ------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === "FOCUS_OR_OPEN_LANDING") {
    checkAndOpenLandingPage();
    sendResponse({ success: true });
  }
  return true;
});