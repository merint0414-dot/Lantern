// ============================================================
// LANTERN CONFIGURATION
// Centralized configuration for the LANTERN Chrome Extension
// ============================================================

const LANTERN_APP_URL = "http://localhost:5173/";

const LANTERN_CONFIG = {
  APP_URL: LANTERN_APP_URL,
  DEFAULT_PORT: "5173",
  DEBUG_MODE: true
};

// Robust detector: verifies whether a given URL or Window location belongs to LANTERN
function isLanternDomain(urlOrLocation) {
  try {
    const loc = typeof urlOrLocation === "string" ? new URL(urlOrLocation) : urlOrLocation;
    const configUrl = new URL(LANTERN_CONFIG.APP_URL);

    // Exact origin match
    if (loc.origin === configUrl.origin) {
      return true;
    }

    // Localhost / 127.0.0.1 on configured port
    if (
      (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") &&
      (String(loc.port) === String(configUrl.port) || String(loc.port) === "5173")
    ) {
      return true;
    }

    // DOM-based detection if within an active page
    if (typeof document !== "undefined") {
      if (
        document.querySelector(".lantern-page-shell") ||
        document.getElementById("home-btn-ksrtc") ||
        document.querySelector(".ksrtc-page-theme, .irctc-page-theme, .bharatgas-page-theme, .kseb-page-theme")
      ) {
        return true;
      }
    }
  } catch (_) {}
  return false;
}

if (typeof globalThis !== "undefined") {
  globalThis.LANTERN_APP_URL = LANTERN_APP_URL;
  globalThis.LANTERN_CONFIG = LANTERN_CONFIG;
  globalThis.isLanternDomain = isLanternDomain;
}
