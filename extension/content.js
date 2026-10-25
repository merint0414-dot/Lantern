// ============================================================
// LANTERN - INTELLIGENT WEB ASSISTANT CONTENT SCRIPT
// Multi-Domain Accessibility Guidance System
// Supported Domains:
//  1. Gmail (Compose, Recipient, Subject, Body, Send, Attachments)
//  2. LANTERN Portals (Landing Page, KSRTC, IRCTC, Bharatgas, KSEB)
// ============================================================

(() => {
  "use strict";

  // ==========================================================
  // DOMAIN & ENVIRONMENT DETECTION
  // ==========================================================

  const hostname = window.location.hostname;
  const isGmail =
    hostname === "mail.google.com" || hostname.endsWith(".mail.google.com");

  const isPortal =
    typeof isLanternDomain === "function"
      ? isLanternDomain(window.location)
      : hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        Boolean(document.querySelector(".lantern-page-shell"));

  if (!isGmail && !isPortal) {
    // Neither Gmail nor LANTERN portal -> safe early return
    return;
  }

  console.log(
    `[LANTERN] Content script initialized on: ${window.location.href} (Gmail: ${isGmail}, Portal: ${isPortal})`
  );

  // ==========================================================
  // SHARED STYLES SAFEGUARD
  // ==========================================================

  function addStyles() {
    if (document.getElementById("lantern-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "lantern-styles";
    style.textContent = `
      #lantern-guidance-message,
      #lantern-help-prompt {
        position: fixed !important;
        right: 24px !important;
        bottom: 24px !important;
        width: 380px !important;
        max-width: calc(100vw - 32px) !important;
        box-sizing: border-box !important;
        padding: 20px !important;
        background: #17191b !important;
        color: #ffffff !important;
        border: 1px solid #383c40 !important;
        border-top: 4px solid #f5b800 !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55) !important;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        z-index: 2147483647 !important;
      }
      #lantern-bright-highlight,
      .lantern-bright-highlight {
        position: fixed !important;
        box-sizing: border-box !important;
        border: 4px solid #ffd000 !important;
        border-radius: 9px !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
        animation: lanternBrightPulse 1s infinite !important;
      }
      .lantern-recipient-counter-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        background: #202326 !important;
        border: 1px solid #383c40 !important;
        border-radius: 9px !important;
        padding: 8px 12px !important;
        margin: 10px 0 !important;
        font-size: 12px !important;
        gap: 8px !important;
      }
      .lantern-recipient-label {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        color: #d1d5db !important;
        font-weight: 600 !important;
      }
      .lantern-stepper {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        background: #17191b !important;
        border: 1px solid #484c51 !important;
        border-radius: 6px !important;
        padding: 2px 6px !important;
      }
      .lantern-stepper-btn {
        background: transparent !important;
        border: none !important;
        color: #f5b800 !important;
        font-size: 14px !important;
        font-weight: 900 !important;
        cursor: pointer !important;
        line-height: 1 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
      }
      .lantern-stepper-btn:hover {
        background: #2d3135 !important;
        color: #ffffff !important;
      }
      .lantern-stepper-val {
        font-weight: 800 !important;
        color: #ffffff !important;
        min-width: 16px !important;
        text-align: center !important;
        font-size: 12.5px !important;
      }
      .lantern-recipient-status {
        font-size: 11.5px !important;
        font-weight: 700 !important;
        color: #9ca3af !important;
        white-space: nowrap !important;
      }
      .lantern-recipient-status.lantern-status-ok {
        color: #34d399 !important;
      }
      .lantern-recipient-chips-container {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
        margin: 6px 0 10px 0 !important;
        max-height: 80px !important;
        overflow-y: auto !important;
      }
      .lantern-chip {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        background: #064e3b !important;
        color: #a7f3d0 !important;
        border: 1px solid #059669 !important;
        padding: 3px 8px !important;
        border-radius: 999px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  // ==========================================================
  // SHARED DOM & HIGHLIGHT UTILITIES
  // ==========================================================


  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let highlightBox = null;
  let activeHighlightedElement = null;
  let activeCandidateElements = [];
  let mouseHoveredCandidate = null;
  let highlightTimeout = null;
  let guidancePanel = null;
  let panelDismissedByUser = false;
  let activeHomeGuidance = null;

  function removeHighlight() {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }

    if (highlightBox) {
      highlightBox.remove();
      highlightBox = null;
    }

    document
      .querySelectorAll(".lantern-bright-highlight, #lantern-bright-highlight")
      .forEach((element) => element.remove());

    activeHighlightedElement = null;
    activeCandidateElements = [];
    mouseHoveredCandidate = null;
  }

  function getHighlightTarget() {
    // If mouse is currently keeping/hovering over a valid candidate, highlight ONLY it!
    if (
      mouseHoveredCandidate &&
      document.contains(mouseHoveredCandidate) &&
      isVisible(mouseHoveredCandidate)
    ) {
      return mouseHoveredCandidate;
    }

    // If multiple candidates exist (e.g. multiple Select Bus buttons)
    if (activeCandidateElements && activeCandidateElements.length > 0) {
      const valid = activeCandidateElements.filter(
        (el) => el && document.contains(el) && isVisible(el)
      );
      if (valid.length > 0) {
        // Find the one in the viewport closest to vertical center
        const vhCenter = (window.innerHeight || document.documentElement.clientHeight) / 2;
        const inView = valid.filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.bottom > 40 && rect.top < (window.innerHeight || 800) - 40;
        });

        const pool = inView.length > 0 ? inView : valid;
        pool.sort((a, b) => {
          const distA = Math.abs(a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2 - vhCenter);
          const distB = Math.abs(b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2 - vhCenter);
          return distA - distB;
        });
        return pool[0];
      }
    }

    // Default to activeHighlightedElement
    if (
      activeHighlightedElement &&
      document.contains(activeHighlightedElement) &&
      isVisible(activeHighlightedElement)
    ) {
      return activeHighlightedElement;
    }

    return null;
  }

  function repositionHighlight() {
    // If active in a portal step, refresh candidate elements from activePortalStep
    if (activePortalStep) {
      let targets = [];
      if (typeof activePortalStep.getAllElements === "function") {
        try {
          targets = activePortalStep.getAllElements();
        } catch (_) {}
      } else if (typeof activePortalStep.getElement === "function") {
        try {
          const el = activePortalStep.getElement();
          if (el && isVisible(el)) targets = [el];
        } catch (_) {}
      } else if (activePortalStep.selector) {
        targets = Array.from(document.querySelectorAll(activePortalStep.selector)).filter(isVisible);
      }
      if (targets && targets.length > 0) {
        activeCandidateElements = targets;
      }
    }

    if (
      mouseHoveredCandidate &&
      activeCandidateElements &&
      !activeCandidateElements.includes(mouseHoveredCandidate)
    ) {
      mouseHoveredCandidate = null;
    }

    const target = getHighlightTarget();
    if (!target) {
      if (highlightBox) highlightBox.style.display = "none";
      return;
    }

    activeHighlightedElement = target;
    const rect = target.getBoundingClientRect();
    const pad = 6;

    if (!highlightBox || !document.contains(highlightBox)) {
      const box = document.createElement("div");
      box.id = "lantern-bright-highlight";
      box.className = "lantern-bright-highlight";
      box.style.position = "fixed";
      box.style.pointerEvents = "none";
      box.style.zIndex = "2147483646";
      document.documentElement.appendChild(box);
      highlightBox = box;
    }

    highlightBox.style.display = "block";
    highlightBox.style.left = `${Math.max(0, rect.left - pad)}px`;
    highlightBox.style.top = `${Math.max(0, rect.top - pad)}px`;
    highlightBox.style.width = `${Math.max(36, rect.width + pad * 2)}px`;
    highlightBox.style.height = `${Math.max(28, rect.height + pad * 2)}px`;
  }

  function highlightElement(element) {
    if (!element) {
      removeHighlight();
      return;
    }
    const list = (Array.isArray(element) ? element : [element]).filter(
      (el) => el && isVisible(el)
    );
    if (list.length === 0) {
      removeHighlight();
      return;
    }

    activeCandidateElements = list;
    activeHighlightedElement = list[0];
    mouseHoveredCandidate = null;
    repositionHighlight();
  }

  function scrollAndHighlight(target) {
    if (!target) return;
    const elements = (Array.isArray(target) ? target : [target]).filter(
      (el) => el && isVisible(el)
    );
    if (elements.length === 0) return;

    activeCandidateElements = elements;
    activeHighlightedElement = elements[0];
    mouseHoveredCandidate = null;

    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }

    const anyInView = elements.some((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 40 &&
        rect.bottom <= (window.innerHeight || 800) - 40 &&
        rect.left >= 0 &&
        rect.right <= (window.innerWidth || 1200)
      );
    });

    if (!anyInView) {
      try {
        elements[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      } catch (_) {}
    }

    repositionHighlight();

    highlightTimeout = setTimeout(() => {
      repositionHighlight();
    }, 250);
  }

  // Mouse move listener: dynamically highlight the exact card, class button, or seat the user is hovering over!
  document.addEventListener(
    "mousemove",
    (e) => {
      if (!activeCandidateElements || activeCandidateElements.length <= 1) return;
      const target = e.target;
      if (!target) return;

      let matched = null;

      // 1. Direct hit: target is the candidate button itself or an icon/span inside it
      matched = activeCandidateElements.find(
        (el) => el === target || el.contains(target)
      );

      // 2. Specific item container: target is inside a specific sub-card or class box
      // (e.g. .class-quota-box in IRCTC, .seat-btn in bus, .method-option-card)
      if (!matched) {
        const itemBox = target.closest(
          ".class-quota-box, .seat-btn, .seat-pair, .method-option-card, .service-card, .bus-card-right"
        );
        if (itemBox) {
          matched = activeCandidateElements.find(
            (el) => el === itemBox || itemBox.contains(el)
          );
        }
      }

      // 3. Parent container (e.g. .train-card, .bus-card, .bus-result-card, tr, article)
      if (!matched) {
        const card = target.closest(
          ".train-card, .bus-card, .bus-result-card, .bus-seats-grid, tr, article, [role='listitem']"
        );
        if (card) {
          const candidatesInCard = activeCandidateElements.filter((el) => card.contains(el));
          if (candidatesInCard.length === 1) {
            matched = candidatesInCard[0];
          } else if (candidatesInCard.length > 1) {
            // Pick the candidate in this card closest to the mouse cursor (X, Y)
            let closestEl = null;
            let minDist = Infinity;
            candidatesInCard.forEach((el) => {
              const r = el.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const d = Math.hypot(e.clientX - cx, e.clientY - cy);
              if (d < minDist) {
                minDist = d;
                closestEl = el;
              }
            });
            matched = closestEl;
          }
        }
      }

      // 4. Proximity fallback: if mouse is within 70px of any candidate
      if (!matched) {
        let nearestCandidate = null;
        let nearestDist = Infinity;
        activeCandidateElements.forEach((el) => {
          if (!el || !isVisible(el)) return;
          const r = el.getBoundingClientRect();
          const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
          const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
          const d = Math.hypot(dx, dy);
          if (d < 70 && d < nearestDist) {
            nearestDist = d;
            nearestCandidate = el;
          }
        });
        if (nearestCandidate) {
          matched = nearestCandidate;
        }
      }

      if (matched && matched !== mouseHoveredCandidate) {
        mouseHoveredCandidate = matched;
        repositionHighlight();
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      // When scrolling, if user is already keeping a candidate visible in the viewport, preserve it!
      const isCandidateInView =
        mouseHoveredCandidate &&
        document.contains(mouseHoveredCandidate) &&
        isVisible(mouseHoveredCandidate) &&
        (() => {
          const r = mouseHoveredCandidate.getBoundingClientRect();
          const vh = window.innerHeight || 800;
          return r.bottom > 40 && r.top < vh - 40;
        })();

      if (!isCandidateInView && activeCandidateElements && activeCandidateElements.length > 1) {
        const vhCenter = (window.innerHeight || document.documentElement.clientHeight || 800) / 2;
        const vwCenter = (window.innerWidth || document.documentElement.clientWidth || 1200) / 2;
        const valid = activeCandidateElements.filter(
          (el) => el && document.contains(el) && isVisible(el)
        );
        if (valid.length > 0) {
          valid.sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            const distA = Math.hypot((ra.top + ra.height / 2) - vhCenter, (ra.left + ra.width / 2) - vwCenter);
            const distB = Math.hypot((rb.top + rb.height / 2) - vhCenter, (rb.left + rb.width / 2) - vwCenter);
            return distA - distB;
          });
          mouseHoveredCandidate = valid[0];
        }
      }
      repositionHighlight();
    },
    { passive: true, capture: true }
  );

  window.addEventListener("resize", repositionHighlight, { passive: true });

  // ==========================================================
  // SHARED SPEECH RECOGNITION (VOICE)
  // ==========================================================

  function startVoice(input, onRecognized) {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      updatePanelText(
        "Voice input is not supported in this browser. Please type your request."
      );
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      updatePanelText("Listening... (Speak in English, Manglish, or Malayalam)");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (input) {
        input.value = text;
      }
      updatePanelText(`I heard: "${text}"`);
      if (typeof onRecognized === "function") {
        onRecognized(text);
      }
    };

    recognition.onerror = () => {
      updatePanelText("Could not understand audio. Please type your request.");
    };

    try {
      recognition.start();
    } catch (err) {
      console.log("[LANTERN] Voice start error:", err);
    }
  }

  // ==========================================================
  // ==========================================================
  // SHARED DIFFICULTY DETECTION & BEHAVIOR MONITORING
  // ==========================================================

  const DIFFICULTY_THRESHOLD = 25;
  const INITIAL_GRACE_PERIOD = 8000; // 8 seconds grace period on page load
  const pageLoadTimestamp = Date.now();

  let difficultyScore = 0;
  let repeatedClicks = 0;
  let scrollCount = 0;
  let inactivityScore = 0;
  let lastClickedElement = null;
  let lastActivity = Date.now();
  let helpDismissed = false;
  let lastDismissTime = 0;
  let recentClickTimestamps = [];
  let recentScrollDirections = [];
  let lastScrollY = window.scrollY || 0;

  function resetDifficultyScores() {
    difficultyScore = 0;
    repeatedClicks = 0;
    scrollCount = 0;
    inactivityScore = 0;
    recentClickTimestamps = [];
    recentScrollDirections = [];
    lastActivity = Date.now();
  }

  function calculateDifficulty() {
    // 1. Never trigger during the initial page load grace period
    if (Date.now() - pageLoadTimestamp < INITIAL_GRACE_PERIOD) {
      return;
    }

    // 2. Respect cooldown after user explicitly dismisses assistance (45 seconds)
    if (helpDismissed) {
      if (Date.now() - lastDismissTime < 45000) {
        return;
      }
      helpDismissed = false;
    }

    const now = Date.now();

    // 3. Frustration / Rapid Clicks (3+ clicks within 3 seconds)
    recentClickTimestamps = recentClickTimestamps.filter((t) => now - t < 3000);
    const rapidClickScore = recentClickTimestamps.length >= 3 ? 25 : 0;

    // 4. Same-element repeated clicks (repeatedly clicking same button or empty area)
    const sameElementScore = repeatedClicks >= 3 ? 25 : 0;
    const clickScore = Math.max(rapidClickScore, sameElementScore);

    // 5. Wandering scroll score (scrolling up and down repeatedly searching for where to click)
    recentScrollDirections = recentScrollDirections.filter((s) => now - s.time < 6000);
    let directionChanges = 0;
    for (let i = 1; i < recentScrollDirections.length; i++) {
      if (recentScrollDirections[i].dir !== recentScrollDirections[i - 1].dir) {
        directionChanges++;
      }
    }
    const scrollScore = directionChanges >= 3 ? 25 : (scrollCount >= 15 ? 15 : 0);

    difficultyScore = clickScore + scrollScore + inactivityScore;

    // Trigger assistance only when difficulty threshold is met and no LANTERN UI is open
    if (
      difficultyScore >= DIFFICULTY_THRESHOLD &&
      !document.getElementById("lantern-guidance-message") &&
      !document.getElementById("lantern-help-prompt")
    ) {
      triggerAssistance();
    }
  }

  function triggerAssistance() {
    if (isGmail) {
      // If user was already composing an email and got stuck:
      if (gmailComposeOpen()) {
        gmailStartGuidance();
      } else {
        // If user is browsing Gmail inbox and struggling:
        showGmailHelpPrompt();
      }
    } else if (isPortal) {
      showHelpPrompt();
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      lastActivity = Date.now();
      if (
        event.target.closest?.(
          "#lantern-guidance-message, #lantern-help-prompt, #lantern-bright-highlight"
        )
      ) {
        return;
      }

      recentClickTimestamps.push(Date.now());

      if (event.target === lastClickedElement) {
        repeatedClicks++;
      } else {
        repeatedClicks = 1;
        lastClickedElement = event.target;
      }

      calculateDifficulty();
    },
    true
  );

  window.addEventListener(
    "scroll",
    () => {
      lastActivity = Date.now();
      scrollCount++;

      const currentScrollY = window.scrollY || 0;
      const dir = currentScrollY > lastScrollY ? "down" : "up";
      lastScrollY = currentScrollY;
      recentScrollDirections.push({ dir, time: Date.now() });

      calculateDifficulty();
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      lastActivity = Date.now();

      // Alt + Shift + L shortcut to reopen or summon LANTERN panel immediately
      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        panelDismissedByUser = false;
        helpDismissed = false;
        triggerAssistance();
        return;
      }

      calculateDifficulty();
    },
    true
  );

  // Periodic inactivity / hesitation monitor (checks every 2 seconds)
  setInterval(() => {
    if (document.hidden) {
      lastActivity = Date.now();
      return;
    }
    if (Date.now() - pageLoadTimestamp < INITIAL_GRACE_PERIOD) {
      return;
    }
    if (
      document.getElementById("lantern-guidance-message") ||
      document.getElementById("lantern-help-prompt")
    ) {
      return;
    }

    const inactiveMs = Date.now() - lastActivity;
    // 18+ seconds of hesitation/inactivity indicates difficulty
    if (inactiveMs >= 18000) {
      inactivityScore = 25;
      calculateDifficulty();
    } else {
      inactivityScore = 0;
    }
  }, 2000);

  // ==========================================================
  // GMAIL HELP PROMPT POPUP
  // Shown when user experiences difficulty on Gmail
  // ==========================================================

  function showGmailHelpPrompt() {
    if (
      document.getElementById("lantern-help-prompt") ||
      document.getElementById("lantern-guidance-message")
    ) {
      return;
    }

    const popup = document.createElement("div");
    popup.id = "lantern-help-prompt";

    popup.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status lantern-status-ready">READY</div>
          <button id="lantern-prompt-close" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>
      <div class="lantern-title">Need Help with Gmail?</div>
      <div class="lantern-description">
        It looks like you might need assistance. What would you like help with?
      </div>

      <div class="lantern-portal-buttons-grid">
        <button id="lantern-action-compose" class="lantern-portal-btn" type="button">
          <span>✉️</span> <span>Write Email</span>
        </button>
        <button id="lantern-action-search" class="lantern-portal-btn" type="button">
          <span>🔍</span> <span>Find Email</span>
        </button>
      </div>

      <div class="lantern-label">Ask any question</div>
      <div class="lantern-row">
        <input
          id="lantern-help-input"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN (e.g. send email, reply, attach file)..."
        >
        <button id="lantern-help-ask" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-help-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-help-close" class="lantern-secondary" type="button">
          Not now
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    const input = popup.querySelector("#lantern-help-input");
    const ask = popup.querySelector("#lantern-help-ask");
    const voice = popup.querySelector("#lantern-help-voice");
    const close = popup.querySelector("#lantern-help-close");
    const closeTop = popup.querySelector("#lantern-prompt-close");
    const composeBtn = popup.querySelector("#lantern-action-compose");
    const searchBtn = popup.querySelector("#lantern-action-search");

    input?.focus();

    const doDismiss = () => {
      popup.remove();
      helpDismissed = true;
      lastDismissTime = Date.now();
      resetDifficultyScores();
    };

    close?.addEventListener("click", doDismiss);
    closeTop?.addEventListener("click", doDismiss);

    composeBtn?.addEventListener("click", () => {
      popup.remove();
      gmailStartGuidance();
    });

    searchBtn?.addEventListener("click", () => {
      popup.remove();
      gmailGuideSearch();
    });

    const submit = () => {
      const val = (input?.value || "").trim();
      if (!val) return;
      popup.remove();
      handleGlobalRequirement(val);
    };

    ask?.addEventListener("click", submit);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });

    voice?.addEventListener("click", () => {
      startVoice(input, (recognizedText) => {
        popup.remove();
        handleGlobalRequirement(recognizedText);
      });
    });
  }

  // ==========================================================
  // SHARED HELP PROMPT POPUP (PORTALS)
  // ==========================================================

  function showHelpPrompt() {
    if (
      document.getElementById("lantern-help-prompt") ||
      document.getElementById("lantern-guidance-message")
    ) {
      return;
    }

    const popup = document.createElement("div");
    popup.id = "lantern-help-prompt";

    popup.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status lantern-status-ready">READY</div>
          <button id="lantern-help-close-x" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>
      <div class="lantern-title">Need a Hand?</div>
      <div class="lantern-description">
        It looks like you might need assistance. What would you like help with?
      </div>
      <div class="lantern-row">
        <input
          id="lantern-help-input"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN (e.g. Book KSRTC, Pay Bill)..."
        >
        <button id="lantern-help-ask" class="lantern-primary" type="button">
          Ask
        </button>
      </div>
      <div class="lantern-secondary-row">
        <button id="lantern-help-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-help-close" class="lantern-secondary" type="button">
          Not now
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    const input = popup.querySelector("#lantern-help-input");
    const ask = popup.querySelector("#lantern-help-ask");
    const voice = popup.querySelector("#lantern-help-voice");
    const close = popup.querySelector("#lantern-help-close");
    const closeX = popup.querySelector("#lantern-help-close-x");

    input?.focus();

    const doDismiss = () => {
      popup.remove();
      helpDismissed = true;
      lastDismissTime = Date.now();
      resetDifficultyScores();
    };

    close?.addEventListener("click", doDismiss);
    closeX?.addEventListener("click", doDismiss);

    const submit = () => {
      const value = (input?.value || "").trim();
      if (!value) return;
      popup.remove();
      handleGlobalRequirement(value);
    };

    ask?.addEventListener("click", submit);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });

    voice?.addEventListener("click", () => {
      startVoice(input, (recognizedText) => {
        popup.remove();
        handleGlobalRequirement(recognizedText);
      });
    });
  }

  function handleGlobalRequirement(query) {
    // Check if query specifies number of recipients (e.g. "send email to 2 people", "3 recipients")
    const countMatch = (query || "").match(/(\d+)\s*(?:recipients?|people|persons?|email\s*ids?|contacts?)/i);
    if (countMatch) {
      const parsed = parseInt(countMatch[1], 10);
      if (parsed > 0) {
        gmailRequiredRecipientCount = parsed;
        if (gmailGuidanceActive && gmailCurrentStep === "recipient") {
          gmailGuideRecipient();
          return;
        }
      }
    }

    if (typeof recognizeLanternIntent === "function") {
      const result = recognizeLanternIntent(query);

      // On LANTERN Portal Home Page: Detect the booking action ("Book Bus", "Book Train", etc.) and highlight the button!
      const isHome =
        isPortal &&
        (window.location.pathname === "/" ||
          window.location.pathname === "" ||
          Boolean(document.getElementById("home-btn-ksrtc")));
      if (isHome && result && (result.route || result.intent === "ALL_BOOKINGS")) {
        guideHomeBookingAction(result);
        return;
      }

      if (result && result.route) {
        if (isGmail) {
          const appBase =
            typeof LANTERN_CONFIG !== "undefined" && LANTERN_CONFIG.APP_URL
              ? LANTERN_CONFIG.APP_URL
              : "http://localhost:5173/";
          window.location.href = new URL(result.route, appBase).href;
        } else {
          if (window.location.pathname === result.route) {
            updatePanelText(
              `You are already on the ${result.serviceName || "booking"} page. Follow the highlighted step.`
            );
            evaluatePortalWorkflow();
          } else {
            navigateToService(result.route);
          }
        }
        return;
      }

      if (result && result.intent) {
        if (result.intent === "GMAIL_FIND_EMAIL") {
          gmailGuideSearch();
          return;
        }
        if (
          result.intent === "GMAIL_SEND_EMAIL" ||
          result.intent === "GMAIL_SEND_ATTACHMENT"
        ) {
          if (result.intent === "GMAIL_SEND_ATTACHMENT") {
            gmailAttachmentModeActive = true;
          }
          gmailStartGuidance();
          return;
        }
      }
    }

    if (isGmail) {
      gmailStartGuidance();
    } else {
      evaluatePortalWorkflow();
    }
  }

  function updatePanelText(message) {
    const element =
      guidancePanel?.querySelector(".lantern-description") ||
      document.querySelector("#lantern-guidance-message .lantern-description");
    if (element) {
      element.textContent = message;
    }
  }

  function removePanel() {
    if (guidancePanel) {
      guidancePanel.remove();
      guidancePanel = null;
    }
    document
      .querySelectorAll("#lantern-guidance-message")
      .forEach((el) => el.remove());
  }

  // =========================================================================
  // =========================================================================
  // GMAIL SPECIFIC ENGINE & WORKFLOWS
  // (100% Preserved for Gmail domain)
  // =========================================================================
  // =========================================================================

  let gmailGuidanceActive = false;
  let gmailCurrentStep = "compose";
  let gmailSessionId = 0;
  let gmailCleanupWatcher = null;
  let gmailRequiredRecipientCount = 1;
  let gmailAttachmentModeActive = false;

  let gmailStateChecker = null;

  function gmailGetWorkflowSteps() {
    if (gmailCurrentStep === "search") {
      return [
        { key: "search", number: 1, label: "Search Mail" }
      ];
    }
    if (gmailAttachmentModeActive || gmailCurrentStep === "attachment" || gmailHasAttachment()) {
      return [
        { key: "compose", number: 1, label: "Compose" },
        { key: "recipient", number: 2, label: "Recipient" },
        { key: "subject", number: 3, label: "Subject" },
        { key: "message", number: 4, label: "Message" },
        { key: "attachment", number: 5, label: "Attachment" },
        { key: "send", number: 6, label: "Send" }
      ];
    }
    return [
      { key: "compose", number: 1, label: "Compose" },
      { key: "recipient", number: 2, label: "Recipient" },
      { key: "subject", number: 3, label: "Subject" },
      { key: "message", number: 4, label: "Message" },
      { key: "send", number: 5, label: "Send" }
    ];
  }

  function gmailGetStep(key) {
    if (key === "search") {
      return { key: "search", number: 1, label: "Search Mail" };
    }
    if (key === "attachmentPrompt") {
      return { key: "attachmentPrompt", number: 5, label: "Attach File" };
    }
    const steps = gmailGetWorkflowSteps();
    return steps.find((s) => s.key === key) || steps[0];
  }

  function gmailStartStateWatcher() {
    if (gmailStateChecker) clearInterval(gmailStateChecker);
    gmailStateChecker = setInterval(() => {
      if (!gmailGuidanceActive) {
        gmailStopStateWatcher();
        return;
      }
      if (gmailCurrentStep === "search") return;

      // Real-time recipient detection & autofill count updates
      if (gmailCurrentStep === "recipient") {
        gmailUpdateRecipientDisplay();
      }

      // When the user is currently on subject, message, attachment, or prompt, DO NOT auto-advance via polling!
      if (
        gmailCurrentStep === "subject" ||
        gmailCurrentStep === "message" ||
        gmailCurrentStep === "attachment" ||
        gmailCurrentStep === "attachmentPrompt"
      ) {
        return;
      }

      const desiredStep = gmailGetCurrentState();
      if (desiredStep && desiredStep !== gmailCurrentStep) {
        gmailGuideStep(desiredStep);
      }
    }, 450);
  }

  function gmailStopStateWatcher() {
    if (gmailStateChecker) {
      clearInterval(gmailStateChecker);
      gmailStateChecker = null;
    }
  }

  function gmailStopWatcher() {
    // Only clean up step-specific handlers, keep gmailStateChecker alive during guidance!
    if (typeof gmailCleanupWatcher === "function") {
      gmailCleanupWatcher();
      gmailCleanupWatcher = null;
    }
  }

  function gmailFindSearchField() {
    const selectors = [
      'input[aria-label*="Search" i]',
      'input[placeholder*="Search" i]',
      'input[name="q"]',
      'input[role="combobox"][aria-label*="Search" i]',
      '.gb_Ie input',
      'header input[type="text"]'
    ];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailGuideSearch() {
    gmailSessionId++;
    gmailGuidanceActive = true;
    gmailCurrentStep = "search";
    gmailStopWatcher();
    removeHighlight();

    const searchField = gmailFindSearchField();
    if (searchField) {
      try { searchField.focus(); } catch (_) {}
      scrollAndHighlight(searchField);
      gmailShowPanel(
        "search",
        "Enter what you are searching for and press Enter.",
        "You can search by sender name, subject line, or keywords."
      );
    } else {
      gmailShowPanel(
        "search",
        "Looking for the Gmail search box at the top...",
        "Please wait a moment while Gmail loads."
      );
    }
  }

  function gmailFindComposeButton() {
    const selectors = [
      '[aria-label="Compose"]',
      '[title="Compose"]',
      '[data-tooltip="Compose"]',
      '[command="compose"]',
      'div[role="button"][aria-label="Compose"]',
      'button[aria-label="Compose"]',
      '.T-I.T-I-KE.L3',
      'div[gh="cm"]'
    ];

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }

    const buttons = document.querySelectorAll('div[role="button"], button');
    for (const el of buttons) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || "").trim().toLowerCase();
      if (text === "compose") return el;
    }
    return null;
  }

  function gmailFindComposeDialog() {
    const dialogs = document.querySelectorAll(
      'div[role="dialog"], form.bAs, div.AD, div.inboxsdk__compose'
    );
    for (const d of dialogs) {
      if (!isVisible(d)) continue;
      if (
        d.querySelector(
          'input[name="subjectbox"], input.aoT, div[role="textbox"][aria-label*="Message" i], div.Am, div[name="to"], div.aoD.hl'
        )
      ) {
        return d;
      }
    }

    const subj = document.querySelector('input[name="subjectbox"], input.aoT');
    if (subj) {
      return (
        subj.closest('div[role="dialog"], form, div.AD') ||
        subj.closest('table.aoP')?.parentElement ||
        subj.parentElement
      );
    }

    const msg = document.querySelector('div[role="textbox"][aria-label*="Message" i], div.Am');
    if (msg) {
      return (
        msg.closest('div[role="dialog"], form, div.AD') ||
        msg.closest('table.aoP')?.parentElement ||
        msg.parentElement
      );
    }

    return null;
  }

  function gmailFindRecipientField() {
    const compose = gmailFindComposeDialog();
    if (!compose) return null;

    // 1. Try visible active recipient input
    const activeInp = compose.querySelector(
      'input.agP.aFw, input.agP, input[aria-label="To recipients"], input[aria-label="To"], div[name="to"] input:not([type="hidden"])'
    );
    if (activeInp && isVisible(activeInp)) {
      return activeInp;
    }

    // 2. Locate the row preceding the Subject row
    const subj = gmailFindSubjectField();
    const subjRow = subj ? (subj.closest('div.aoD, tr, .a1') || subj) : null;
    if (subjRow && subjRow.previousElementSibling) {
      const prev = subjRow.previousElementSibling;
      if (isVisible(prev)) {
        const child = prev.querySelector(
          'input:not([type="hidden"]), span.aB, div.afV, [role="button"], div.vR, span.vN'
        );
        if (child && isVisible(child)) return child;
        return prev;
      }
    }

    // 3. Fallback candidates in compose
    const candidates = [
      'div[name="to"]',
      'div.aoD.hl',
      'div.aoD',
      'div[aria-label*="To recipients" i]',
      'div[aria-label*="Recipients" i]:not([role="dialog"])',
      'span.aB',
      'div.afV',
      'tr.n1vFU',
      'div.a1.aaA',
      '[peoplekit-id]'
    ];
    for (const c of candidates) {
      const el = compose.querySelector(c);
      if (el && isVisible(el)) return el;
    }

    return null;
  }

  function gmailFindSubjectField() {
    const compose = gmailFindComposeDialog();
    const selectors = [
      'input[name="subjectbox"]',
      'input[name="subject"]',
      'input[placeholder*="Subject" i]',
      'input[aria-label*="Subject" i]',
      'input.aoT'
    ];

    if (compose) {
      for (const s of selectors) {
        const el = compose.querySelector(s);
        if (isVisible(el)) return el;
      }
    }

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailFindMessageField() {
    const compose = gmailFindComposeDialog();
    const selectors = [
      'div[role="textbox"][aria-label*="Message Body" i]',
      'div[role="textbox"][aria-label*="Message" i]',
      'div[aria-label*="Message Body" i]',
      'div[contenteditable="true"][aria-label*="Message Body" i]',
      'div[contenteditable="true"][aria-label*="Message" i]',
      'div.Am.Al.editable',
      'div[contenteditable="true"][g_editable="true"]',
      'div[contenteditable="true"][role="textbox"]'
    ];

    if (compose) {
      for (const s of selectors) {
        const el = compose.querySelector(s);
        if (isVisible(el)) return el;
      }
    }

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailGetMessageText(msgField) {
    if (!msgField) return "";
    try {
      const clone = msgField.cloneNode(true);
      clone.querySelectorAll('.gmail_signature, [data-smartmail="gmail_signature"]').forEach((el) => el.remove());
      return (clone.innerText || clone.textContent || clone.value || "").trim();
    } catch (_) {
      return (msgField.innerText || msgField.textContent || msgField.value || "").trim();
    }
  }

  function gmailFindSendButton() {
    const compose = gmailFindComposeDialog();
    const selectors = [
      'div[role="button"][aria-label*="Send" i]:not([aria-label*="Schedule" i])',
      'button[aria-label*="Send" i]:not([aria-label*="Schedule" i])',
      '[data-tooltip*="Send" i]:not([data-tooltip*="Schedule" i])',
      '[title*="Send" i]:not([title*="Schedule" i])',
      'div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3'
    ];

    if (compose) {
      for (const s of selectors) {
        const el = compose.querySelector(s);
        if (isVisible(el)) return el;
      }
    }

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailFindAttachButton() {
    const compose = gmailFindComposeDialog();
    const selectors = [
      'div[command="Files"]',
      'div[aria-label*="Attach files" i]',
      'div[aria-label*="Attach" i]:not([aria-label*="Drive" i])',
      'div[data-tooltip*="Attach files" i]',
      'div[data-tooltip*="Attach" i]:not([data-tooltip*="Drive" i])',
      'div.a1.aaA.aMZ',
      'div[role="button"][aria-label*="Attach" i]'
    ];

    if (compose) {
      for (const s of selectors) {
        const el = compose.querySelector(s);
        if (isVisible(el)) return el;
      }
    }

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailHasAttachment() {
    const compose = gmailFindComposeDialog();
    if (!compose) return false;
    const selectors = [
      'div.a3I',
      'div.vI',
      'div[aria-label*="Attachment:" i]',
      'div[aria-label*="attachment" i]:not([aria-label*="Attach" i])',
      'span[download_url]',
      'div.dQ'
    ];
    for (const s of selectors) {
      const el = compose.querySelector(s);
      if (isVisible(el)) return true;
    }
    return false;
  }

  function gmailComposeOpen() {
    return Boolean(
      gmailFindComposeDialog() ||
      gmailFindSubjectField() ||
      gmailFindMessageField() ||
      gmailFindRecipientField()
    );
  }

  const GMAIL_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  function gmailIsValidEmail(val) {
    if (!val) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim());
  }

  function gmailFindAcceptedRecipients() {
    const found = [];
    const compose = gmailFindComposeDialog();
    if (!compose) return found;

    const addMatches = (text) => {
      if (!text || typeof text !== "string") return;
      const matches = text.match(GMAIL_EMAIL_REGEX);
      if (matches) {
        matches.forEach((m) => {
          const clean = m.trim().toLowerCase();
          if (clean && !found.includes(clean)) {
            found.push(clean);
          }
        });
      }
    };

    const subj = gmailFindSubjectField();
    const subjRow = subj ? (subj.closest('div.aoD, tr, .a1') || subj) : null;

    // Scan all rows strictly above the Subject row inside the compose dialog
    if (subjRow) {
      let row = subjRow.previousElementSibling;
      while (row) {
        const isFromRow = Boolean(
          row.querySelector('[aria-label*="From" i], [name="from"], .bAW') ||
          row.matches?.('.bAW') ||
          row.getAttribute?.('aria-label')?.toLowerCase()?.includes('from')
        );

        if (!isFromRow) {
          // 1. Text of the row (captures chips like "Name (email@domain.com)")
          addMatches(row.innerText || row.textContent);

          // 2. Chip attributes and inputs
          row.querySelectorAll(
            '[data-hovercard-id], [email], [data-recipient], [aria-label*="@"], div.vR, span.vN, [peoplekit-id], input'
          ).forEach((el) => {
            addMatches(el.getAttribute("data-hovercard-id"));
            addMatches(el.getAttribute("email"));
            addMatches(el.getAttribute("data-recipient"));
            addMatches(el.getAttribute("aria-label"));

            if (el.tagName === "INPUT" && el.name !== "from" && el.name !== "subjectbox" && el.name !== "subject") {
              addMatches(el.value);
            }
          });
        }
        row = row.previousElementSibling;
      }
    }

    // Also scan explicit To/Cc/Bcc inputs and active recipient inputs
    compose.querySelectorAll('input[name="to"], input[name="cc"], input[name="bcc"]').forEach((el) => {
      addMatches(el.value);
    });

    const activeInp = compose.querySelector(
      'input.agP.aFw, input.agP, input[aria-label*="To" i]:not([name="subjectbox"])'
    );
    if (activeInp && activeInp.value) {
      addMatches(activeInp.value);
    }

    return found;
  }

  function gmailGetAcceptedRecipientCount() {
    const accepted = gmailFindAcceptedRecipients();
    let count = accepted.length;

    // In Gmail, when multiple recipients are collapsed, it displays e.g. "1 more"
    const compose = gmailFindComposeDialog();
    if (compose) {
      const subj = gmailFindSubjectField();
      const subjRow = subj ? (subj.closest('div.aoD, tr, .a1') || subj) : null;
      if (subjRow) {
        let row = subjRow.previousElementSibling;
        while (row) {
          const txt = row.innerText || row.textContent || "";
          const m = txt.match(/\b(\d+)\s+more\b/i);
          if (m) {
            count += parseInt(m[1], 10) || 0;
            break;
          }
          row = row.previousElementSibling;
        }
      }
    }

    return count;
  }

  let gmailAutoAdvanceTimer = null;

  function gmailUpdateRecipientDisplay() {
    const panel = document.getElementById("lantern-guidance-message");
    if (!panel || gmailCurrentStep !== "recipient") return;

    const accepted = gmailFindAcceptedRecipients();
    const count = gmailGetAcceptedRecipientCount();

    // Update stepper target display
    const targetEl = panel.querySelector("#lantern-recip-target");
    if (targetEl) {
      targetEl.textContent = String(gmailRequiredRecipientCount);
    }

    // Update status text
    const statusEl = panel.querySelector("#lantern-recip-status");
    if (statusEl) {
      if (count >= gmailRequiredRecipientCount && count > 0) {
        statusEl.className = "lantern-recipient-status lantern-status-ok";
        statusEl.textContent = `✓ ${count} recipient${count > 1 ? "s" : ""} added`;
      } else {
        statusEl.className = "lantern-recipient-status";
        statusEl.textContent = `${count} of ${gmailRequiredRecipientCount} added`;
      }
    }

    // Update chips list
    const chipsContainer = panel.querySelector("#lantern-recipient-chips");
    if (chipsContainer) {
      chipsContainer.innerHTML = accepted
        .map((r) => `<span class="lantern-chip">✓ ${escapeHtml(r)}</span>`)
        .join("");
    }

    // Update Next button visibility
    const nextBtn = panel.querySelector("#lantern-recipient-next");
    if (nextBtn) {
      nextBtn.style.display = count >= 1 ? "flex" : "none";
    }

    // Auto-advance smoothly if required recipient count reached
    if (count >= gmailRequiredRecipientCount && count > 0) {
      if (!gmailAutoAdvanceTimer) {
        gmailAutoAdvanceTimer = setTimeout(() => {
          gmailAutoAdvanceTimer = null;
          if (gmailGuidanceActive && gmailCurrentStep === "recipient") {
            const next = gmailGetCurrentState();
            if (next !== "recipient") {
              gmailGuideStep(next);
            }
          }
        }, 700);
      }
    } else {
      if (gmailAutoAdvanceTimer) {
        clearTimeout(gmailAutoAdvanceTimer);
        gmailAutoAdvanceTimer = null;
      }
    }
  }

  function gmailShowRecipientPanel(message, note) {
    removePanel();

    const steps = gmailGetWorkflowSteps();
    const step = gmailGetStep("recipient");
    if (!step) return;

    const accepted = gmailFindAcceptedRecipients();
    const count = gmailGetAcceptedRecipientCount();

    const panel = document.createElement("div");
    panel.id = "lantern-guidance-message";
    panel.dataset.stepKey = "recipient";

    const isReady = count >= gmailRequiredRecipientCount && count > 0;
    const statusText = isReady
      ? `✓ ${count} recipient${count > 1 ? "s" : ""} added`
      : `${count} of ${gmailRequiredRecipientCount} added`;

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status">GUIDING</div>
          <button id="lantern-close-panel" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>
      <div class="lantern-progress">
        <span>STEP ${step.number} OF ${steps.length}</span>
        <span>${escapeHtml(step.label)}</span>
      </div>
      <div class="lantern-title">${escapeHtml(step.label)}</div>
      <div class="lantern-description">${escapeHtml(message)}</div>

      <div class="lantern-recipient-counter-row">
        <div class="lantern-recipient-label">
          <span>Recipients needed:</span>
          <div class="lantern-stepper">
            <button id="lantern-recip-dec" class="lantern-stepper-btn" type="button" title="Fewer recipients">−</button>
            <span id="lantern-recip-target" class="lantern-stepper-val">${gmailRequiredRecipientCount}</span>
            <button id="lantern-recip-inc" class="lantern-stepper-btn" type="button" title="Add another recipient">+</button>
          </div>
        </div>
        <div class="lantern-recipient-status ${isReady ? "lantern-status-ok" : ""}" id="lantern-recip-status">
          ${statusText}
        </div>
      </div>

      <div id="lantern-recipient-chips" class="lantern-recipient-chips-container">
        ${accepted.map((r) => `<span class="lantern-chip">✓ ${escapeHtml(r)}</span>`).join("")}
      </div>

      <button id="lantern-recipient-next" class="lantern-next-btn" type="button" style="display: ${count >= 1 ? "flex" : "none"};">
        Next: Subject &#8594;
      </button>

      <div class="lantern-label">Need help with this step?</div>
      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN..."
        >
        <button id="lantern-question-button" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-again" class="lantern-secondary" type="button">
          ↻ Explain again
        </button>
      </div>

      <div class="lantern-note">${escapeHtml(
        note || "Autofill, address suggestions, and multiple recipients are automatically detected."
      )}</div>
    `;

    document.body.appendChild(panel);
    guidancePanel = panel;

    // Stepper buttons
    panel.querySelector("#lantern-recip-dec")?.addEventListener("click", () => {
      if (gmailRequiredRecipientCount > 1) {
        gmailRequiredRecipientCount--;
        const targetEl = panel.querySelector("#lantern-recip-target");
        if (targetEl) targetEl.textContent = String(gmailRequiredRecipientCount);
        gmailUpdateRecipientDisplay();
      }
    });

    panel.querySelector("#lantern-recip-inc")?.addEventListener("click", () => {
      gmailRequiredRecipientCount++;
      const targetEl = panel.querySelector("#lantern-recip-target");
      if (targetEl) targetEl.textContent = String(gmailRequiredRecipientCount);
      gmailUpdateRecipientDisplay();
      const field = gmailFindRecipientField();
      if (field) {
        try { field.focus(); } catch (_) {}
      }
    });

    // Next step button
    panel.querySelector("#lantern-recipient-next")?.addEventListener("click", () => {
      const currentCount = gmailGetAcceptedRecipientCount();
      if (currentCount >= 1) {
        gmailRequiredRecipientCount = currentCount;
        gmailGuideSubject();
      }
    });

    // Close button
    panel.querySelector("#lantern-close-panel")?.addEventListener("click", () => {
      gmailGuidanceActive = false;
      gmailStopWatcher();
      gmailStopStateWatcher();
      removeHighlight();
      removePanel();
      helpDismissed = true;
      lastDismissTime = Date.now();
      resetDifficultyScores();
    });

    const qInput = panel.querySelector("#lantern-question");
    const qBtn = panel.querySelector("#lantern-question-button");
    const voiceBtn = panel.querySelector("#lantern-voice");
    const againBtn = panel.querySelector("#lantern-again");

    const doAsk = () => {
      const q = (qInput?.value || "").trim();
      if (!q) return;
      handleGlobalRequirement(q);
    };

    qBtn?.addEventListener("click", doAsk);
    qInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAsk();
      }
    });

    voiceBtn?.addEventListener("click", () => {
      startVoice(qInput, (t) => handleGlobalRequirement(t));
    });

    againBtn?.addEventListener("click", () => {
      gmailGuideStep(gmailCurrentStep);
    });
  }

  function gmailShowPanel(stepKey, message, note) {
    removePanel();

    const steps = gmailGetWorkflowSteps();
    const step = gmailGetStep(stepKey);
    if (!step) return;

    const panel = document.createElement("div");
    panel.id = "lantern-guidance-message";
    panel.dataset.stepKey = stepKey;

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status">GUIDING</div>
          <button id="lantern-close-panel" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>
      <div class="lantern-progress">
        <span>STEP ${step.number} OF ${steps.length}</span>
        <span>${escapeHtml(step.label)}</span>
      </div>
      <div class="lantern-title">${escapeHtml(step.label)}</div>
      <div class="lantern-description">${escapeHtml(message)}</div>

      ${stepKey === "subject" ? `
        <button id="lantern-subject-next" class="lantern-next-btn" type="button" style="display: none; margin-top: 10px; margin-bottom: 8px;">
          Next: Message Body &#8594;
        </button>
      ` : ""}

      ${stepKey === "message" ? `
        <div style="display: flex; gap: 8px; margin-top: 10px; margin-bottom: 8px;">
          <button id="lantern-message-next" class="lantern-next-btn" type="button" style="flex: 1.2; margin: 0;">
            Next: Review &amp; Send &#8594;
          </button>
          <button id="lantern-message-attach" class="lantern-secondary" type="button" style="flex: 0.9; margin: 0; padding: 0 10px; font-weight: 700; height: 38px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            📎 Attach File
          </button>
        </div>
      ` : ""}

      ${stepKey === "attachment" ? `
        <div style="display: flex; gap: 8px; margin-top: 10px; margin-bottom: 8px;">
          <button id="lantern-attachment-next" class="lantern-next-btn" type="button" style="flex: 1.2; margin: 0;">
            Next: Review &amp; Send &#8594;
          </button>
          <button id="lantern-attachment-skip" class="lantern-secondary" type="button" style="flex: 0.8; margin: 0; padding: 0 10px; font-weight: 700; height: 38px; display: flex; align-items: center; justify-content: center;">
            Skip
          </button>
        </div>
      ` : ""}

      <div class="lantern-label">Need help with this step?</div>
      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN..."
        >
        <button id="lantern-question-button" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-again" class="lantern-secondary" type="button">
          ↻ Explain again
        </button>
      </div>

      ${note ? `<div class="lantern-note">${escapeHtml(note)}</div>` : ""}
    `;

    document.body.appendChild(panel);
    guidancePanel = panel;

    // Next step triggers
    panel.querySelector("#lantern-subject-next")?.addEventListener("click", () => {
      gmailGuideMessage();
    });
    panel.querySelector("#lantern-message-next")?.addEventListener("click", () => {
      if (gmailHasAttachment()) {
        gmailGuideSend();
      } else {
        gmailPromptAttachmentChoice();
      }
    });
    panel.querySelector("#lantern-message-attach")?.addEventListener("click", () => {
      gmailGuideAttachment();
    });
    panel.querySelector("#lantern-attachment-next")?.addEventListener("click", () => {
      gmailGuideSend();
    });
    panel.querySelector("#lantern-attachment-skip")?.addEventListener("click", () => {
      gmailGuideSend();
    });

    const closeBtn = panel.querySelector("#lantern-close-panel");
    closeBtn?.addEventListener("click", () => {
      gmailGuidanceActive = false;
      gmailStopWatcher();
      gmailStopStateWatcher();
      removeHighlight();
      removePanel();
      helpDismissed = true;
      lastDismissTime = Date.now();
      resetDifficultyScores();
    });

    const qInput = panel.querySelector("#lantern-question");
    const qBtn = panel.querySelector("#lantern-question-button");
    const voiceBtn = panel.querySelector("#lantern-voice");
    const againBtn = panel.querySelector("#lantern-again");

    const doAsk = () => {
      const q = (qInput?.value || "").trim();
      if (!q) return;
      handleGlobalRequirement(q);
    };

    qBtn?.addEventListener("click", doAsk);
    qInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAsk();
      }
    });

    voiceBtn?.addEventListener("click", () => {
      startVoice(qInput, (t) => handleGlobalRequirement(t));
    });

    againBtn?.addEventListener("click", () => {
      gmailGuideStep(gmailCurrentStep);
    });
  }

  function gmailStartGuidance() {
    gmailSessionId++;
    gmailGuidanceActive = true;
    gmailCurrentStep = "compose";
    gmailStopWatcher();
    removeHighlight();
    gmailStartStateWatcher();

    if (gmailComposeOpen()) {
      gmailGuideStep(gmailGetCurrentState());
    } else {
      gmailGuideCompose();
    }
  }

  function gmailGetCurrentState() {
    if (!gmailComposeOpen()) return "compose";
    if (gmailGetAcceptedRecipientCount() < gmailRequiredRecipientCount) {
      return "recipient";
    }
    const subj = gmailFindSubjectField();
    if (!subj || !subj.value.trim()) return "subject";

    // If currently on "subject", stay on subject! Only advance when user explicitly presses Enter,
    // clicks into the message body, or clicks Next.
    if (gmailCurrentStep === "subject") {
      const msg = gmailFindMessageField();
      if (document.activeElement === msg) {
        return "message";
      }
      return "subject";
    }

    // If currently on "message", stay on message! Only advance when the user clicks Next or interacts with Send.
    if (gmailCurrentStep === "message") {
      const sendBtn = gmailFindSendButton();
      if (document.activeElement === sendBtn) {
        return "send";
      }
      return "message";
    }

    if (gmailCurrentStep === "attachmentPrompt" || gmailCurrentStep === "attachment") {
      return gmailCurrentStep;
    }

    const msg = gmailFindMessageField();
    if (!msg || !gmailGetMessageText(msg)) {
      return "message";
    }
    if (gmailAttachmentModeActive) return "attachment";
    return "send";
  }

  function gmailGuideStep(step) {
    if (!gmailGuidanceActive) return;
    gmailStopWatcher();

    if (step === "compose") return gmailGuideCompose();
    if (step === "recipient") return gmailGuideRecipient();
    if (step === "subject") return gmailGuideSubject();
    if (step === "message") return gmailGuideMessage();
    if (step === "attachment") return gmailGuideAttachment();
    if (step === "attachmentPrompt") return gmailPromptAttachmentChoice();
    if (step === "send") return gmailGuideSend();
  }

  function gmailGuideCompose() {
    gmailCurrentStep = "compose";
    const compose = gmailFindComposeButton();
    if (compose) {
      scrollAndHighlight(compose);
      gmailShowPanel(
        "compose",
        "Click Compose to start your email.",
        "LANTERN will continue automatically after you click it."
      );

      const thisSession = gmailSessionId;
      const handler = () => {
        compose.removeEventListener("click", handler, true);
        removeHighlight();
        setTimeout(() => {
          if (thisSession !== gmailSessionId || !gmailGuidanceActive) return;
          gmailGuideRecipient();
        }, 500);
      };
      compose.addEventListener("click", handler, true);
      gmailCleanupWatcher = () => compose.removeEventListener("click", handler, true);
      return;
    }

    gmailShowPanel(
      "compose",
      "I am looking for the Compose button.",
      "Please wait a moment while Gmail loads."
    );
  }

  function gmailGuideRecipient() {
    gmailCurrentStep = "recipient";
    const field = gmailFindRecipientField();
    if (!field) {
      gmailShowPanel(
        "recipient",
        "Waiting for Gmail's recipient field...",
        "The field will be detected automatically."
      );
      setTimeout(() => {
        if (gmailGuidanceActive && gmailCurrentStep === "recipient") {
          const retryField = gmailFindRecipientField();
          if (retryField) {
            gmailGuideRecipient();
          }
        }
      }, 350);
      return;
    }

    try { field.focus(); } catch (_) {}
    try { field.click(); } catch (_) {}
    scrollAndHighlight(field);

    const count = gmailGetAcceptedRecipientCount();

    let message = "Enter or autofill the recipient's email address.";
    if (count < gmailRequiredRecipientCount && count > 0) {
      message = `${count} of ${gmailRequiredRecipientCount} recipients added. Enter the next recipient.`;
    } else if (count >= gmailRequiredRecipientCount && count > 0) {
      message = `All ${count} recipient${count > 1 ? "s" : ""} detected! Click Next or fill the subject.`;
    }

    gmailShowRecipientPanel(message);

    // Event listeners on field for instant autofill & typing detection
    const onRecipientInput = () => {
      gmailUpdateRecipientDisplay();
    };

    field.addEventListener("input", onRecipientInput);
    field.addEventListener("change", onRecipientInput);
    field.addEventListener("blur", onRecipientInput);
    field.addEventListener("paste", onRecipientInput);
    field.addEventListener("keyup", (e) => {
      if (e.key === "Enter" || e.key === "," || e.key === ";") {
        onRecipientInput();
      }
    });

    gmailCleanupWatcher = () => {
      field.removeEventListener("input", onRecipientInput);
      field.removeEventListener("change", onRecipientInput);
      field.removeEventListener("blur", onRecipientInput);
      field.removeEventListener("paste", onRecipientInput);
    };

    // If target count is already met on step enter, trigger display update
    if (count >= gmailRequiredRecipientCount && count > 0) {
      gmailUpdateRecipientDisplay();
    }
  }

  function gmailGuideSubject() {
    gmailCurrentStep = "subject";
    const field = gmailFindSubjectField();
    if (!field) return;
    try { field.focus(); } catch (_) {}
    scrollAndHighlight(field);
    gmailShowPanel(
      "subject",
      "Enter a short subject for your email.",
      "Press Enter when done to move to the message body."
    );

    const panel = document.getElementById("lantern-guidance-message");
    const nextBtn = panel?.querySelector("#lantern-subject-next");

    const updateSubjectNextBtn = () => {
      if (nextBtn) {
        nextBtn.style.display = (field.value || "").trim() ? "flex" : "none";
      }
    };
    updateSubjectNextBtn();

    const advanceToMessage = () => {
      if (gmailGuidanceActive && gmailCurrentStep === "subject") {
        gmailGuideMessage();
      }
    };

    nextBtn?.addEventListener("click", advanceToMessage);

    // Only update button visibility on typing; DO NOT auto-advance on timer or input!
    const onSubjectInput = () => {
      updateSubjectNextBtn();
    };

    field.addEventListener("input", onSubjectInput);
    field.addEventListener("change", onSubjectInput);

    // Advance to message body when user presses Enter or Tab
    const onSubjectKeyDown = (e) => {
      if (e.key === "Enter" || e.key === "Tab") {
        advanceToMessage();
      }
    };
    field.addEventListener("keydown", onSubjectKeyDown);

    // Also detect clicking/focusing into the message body directly
    const msgField = gmailFindMessageField();
    const onBodyInteraction = () => {
      advanceToMessage();
    };

    if (msgField) {
      msgField.addEventListener("focus", onBodyInteraction);
      msgField.addEventListener("click", onBodyInteraction);
    }

    gmailCleanupWatcher = () => {
      field.removeEventListener("input", onSubjectInput);
      field.removeEventListener("change", onSubjectInput);
      field.removeEventListener("keydown", onSubjectKeyDown);
      if (msgField) {
        msgField.removeEventListener("focus", onBodyInteraction);
        msgField.removeEventListener("click", onBodyInteraction);
      }
    };
  }

  let gmailMessageAdvanceTimer = null;

  function gmailGuideMessage() {
    gmailCurrentStep = "message";
    const field = gmailFindMessageField();
    if (!field) {
      gmailShowPanel(
        "message",
        "Waiting for Gmail's message body...",
        "The message field will be detected automatically."
      );
      setTimeout(() => {
        if (gmailGuidanceActive && gmailCurrentStep === "message") {
          const retry = gmailFindMessageField();
          if (retry) gmailGuideMessage();
        }
      }, 300);
      return;
    }

    try { field.focus(); } catch (_) {}
    scrollAndHighlight(field);
    gmailShowPanel(
      "message",
      "Type the message you want to send.",
      "Click 'Next: Review & Send →' when finished writing, or '📎 Attach File'."
    );

    const proceedFromMessage = () => {
      if (!gmailGuidanceActive || gmailCurrentStep !== "message") return;
      if (gmailHasAttachment()) {
        gmailGuideSend();
      } else {
        gmailPromptAttachmentChoice();
      }
    };

    const panel = document.getElementById("lantern-guidance-message");
    const nextBtn = panel?.querySelector("#lantern-message-next");
    const attachBtn = panel?.querySelector("#lantern-message-attach");

    nextBtn?.addEventListener("click", proceedFromMessage);
    attachBtn?.addEventListener("click", () => {
      if (gmailGuidanceActive && gmailCurrentStep === "message") {
        gmailGuideAttachment();
      }
    });

    // If the user clicks the Gmail attach button directly while in message step
    const gmailAttachBtn = gmailFindAttachButton();
    const onAttachClick = () => {
      if (gmailGuidanceActive && gmailCurrentStep === "message") {
        gmailGuideAttachment();
      }
    };
    if (gmailAttachBtn) {
      gmailAttachBtn.addEventListener("click", onAttachClick);
    }

    // If the user clicks or focuses the Send button directly
    const sendBtn = gmailFindSendButton();
    const onSendInteraction = () => {
      if (gmailGuidanceActive && gmailCurrentStep === "message") {
        gmailGuideSend();
      }
    };

    if (sendBtn) {
      sendBtn.addEventListener("focus", onSendInteraction);
      sendBtn.addEventListener("click", onSendInteraction);
    }

    // Ctrl+Enter or Cmd+Enter: proceed
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        proceedFromMessage();
      }
    };
    field.addEventListener("keydown", onKeyDown);

    gmailCleanupWatcher = () => {
      if (sendBtn) {
        sendBtn.removeEventListener("focus", onSendInteraction);
        sendBtn.removeEventListener("click", onSendInteraction);
      }
      if (gmailAttachBtn) {
        gmailAttachBtn.removeEventListener("click", onAttachClick);
      }
      field.removeEventListener("keydown", onKeyDown);
    };
  }

  function gmailPromptAttachmentChoice() {
    gmailCurrentStep = "attachmentPrompt";
    removeHighlight();
    removePanel();

    const panel = document.createElement("div");
    panel.id = "lantern-guidance-message";
    panel.dataset.stepKey = "attachmentPrompt";

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status">ATTACHMENT</div>
          <button id="lantern-close-panel" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>
      <div class="lantern-progress">
        <span>OPTIONAL STEP</span>
        <span>Attachments</span>
      </div>
      <div class="lantern-title">Any files to attach?</div>
      <div class="lantern-description">
        Do you need to attach a document, PDF, picture, or file to this email before sending?
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; margin-bottom: 12px;">
        <button id="lantern-attach-yes" class="lantern-next-btn" type="button" style="margin: 0; background: #3b82f6; color: #ffffff;">
          📎 Yes, Attach a File
        </button>
        <button id="lantern-attach-no" class="lantern-secondary" type="button" style="height: 38px; justify-content: center; font-weight: 700;">
          No, Proceed to Send &#8594;
        </button>
      </div>

      <div class="lantern-label">Need help with this step?</div>
      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN..."
        >
        <button id="lantern-question-button" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-again" class="lantern-secondary" type="button">
          ↻ Explain again
        </button>
      </div>

      <div class="lantern-note">You can attach PDFs, images, spreadsheets, or any document from your computer.</div>
    `;

    document.body.appendChild(panel);
    guidancePanel = panel;

    panel.querySelector("#lantern-attach-yes")?.addEventListener("click", () => {
      gmailGuideAttachment();
    });

    panel.querySelector("#lantern-attach-no")?.addEventListener("click", () => {
      gmailGuideSend();
    });

    panel.querySelector("#lantern-close-panel")?.addEventListener("click", () => {
      gmailGuidanceActive = false;
      gmailStopWatcher();
      gmailStopStateWatcher();
      removeHighlight();
      removePanel();
      helpDismissed = true;
      lastDismissTime = Date.now();
      resetDifficultyScores();
    });

    const qInput = panel.querySelector("#lantern-question");
    const qBtn = panel.querySelector("#lantern-question-button");
    const voiceBtn = panel.querySelector("#lantern-voice");
    const againBtn = panel.querySelector("#lantern-again");

    const doAsk = () => {
      const q = (qInput?.value || "").trim();
      if (!q) return;
      handleGlobalRequirement(q);
    };

    qBtn?.addEventListener("click", doAsk);
    qInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAsk();
      }
    });

    voiceBtn?.addEventListener("click", () => {
      startVoice(qInput, (t) => handleGlobalRequirement(t));
    });

    againBtn?.addEventListener("click", () => {
      gmailPromptAttachmentChoice();
    });
  }

  function gmailGuideAttachment() {
    gmailCurrentStep = "attachment";
    gmailAttachmentModeActive = true;
    const attachBtn = gmailFindAttachButton();

    if (attachBtn) {
      scrollAndHighlight(attachBtn);
    }

    const hasFile = gmailHasAttachment();
    const msg = hasFile
      ? "File attached! You can attach more files, or click 'Next: Review & Send'."
      : "Click the highlighted paperclip icon below to choose a file from your computer.";
    const note = hasFile
      ? "✓ Attachment detected in your email compose box."
      : "Click 'Next: Review & Send' when done, or 'Skip' to send without attaching.";

    gmailShowPanel("attachment", msg, note);

    const panel = document.getElementById("lantern-guidance-message");
    panel?.querySelector("#lantern-attachment-next")?.addEventListener("click", () => {
      gmailGuideSend();
    });
    panel?.querySelector("#lantern-attachment-skip")?.addEventListener("click", () => {
      gmailGuideSend();
    });

    // If user clicks the Send button directly
    const sendBtn = gmailFindSendButton();
    const onSendClick = () => {
      if (gmailGuidanceActive && gmailCurrentStep === "attachment") {
        gmailGuideSend();
      }
    };
    if (sendBtn) {
      sendBtn.addEventListener("click", onSendClick);
    }

    // Monitor for attachment uploads
    const compose = gmailFindComposeDialog();
    let attachObserver = null;
    let pollTimer = null;

    const checkAttachment = () => {
      if (gmailGuidanceActive && gmailCurrentStep === "attachment") {
        if (gmailHasAttachment()) {
          const p = document.getElementById("lantern-guidance-message");
          const desc = p?.querySelector(".lantern-description");
          const noteEl = p?.querySelector(".lantern-note");
          if (desc && !desc.textContent.includes("✓")) {
            desc.textContent = "✓ File attached! You can attach more files, or click 'Next: Review & Send'.";
          }
          if (noteEl) {
            noteEl.textContent = "✓ Attachment detected in your email compose box.";
          }
        }
      }
    };

    if (compose && window.MutationObserver) {
      attachObserver = new MutationObserver(checkAttachment);
      attachObserver.observe(compose, { childList: true, subtree: true });
    }
    pollTimer = setInterval(checkAttachment, 500);

    gmailCleanupWatcher = () => {
      if (attachObserver) {
        attachObserver.disconnect();
        attachObserver = null;
      }
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (sendBtn) {
        sendBtn.removeEventListener("click", onSendClick);
      }
    };
  }

  function gmailGuideSend() {
    gmailCurrentStep = "send";
    gmailAttachmentModeActive = false;
    const btn = gmailFindSendButton();
    if (!btn) return;
    scrollAndHighlight(btn);
    gmailShowPanel(
      "send",
      "Review your email and click Send when you are ready.",
      "Safety notice: LANTERN highlights the Send button but does not auto-send."
    );
  }

  // =========================================================================
  // =========================================================================
  // LANTERN PORTAL ENGINE & WORKFLOW CONTROLLER
  // Stable In-Place UI Rendering, Mutation Filtering, & Sequential Step Logic
  // =========================================================================
  // =========================================================================

  let activePortalAdapter = null;
  let activePortalStep = null;
  let currentStepIndexOverride = 0;
  let portalGuidanceActive = true;
  let portalEvaluationDebounce = null;
  let lastKnownPathname = window.location.pathname;

  /**
   * Identifies the current portal adapter based on window.location
   */
  function getCurrentPortalAdapter() {
    const adapters = window.LANTERN_ADAPTERS || {};
    const loc = window.location;

    for (const key of Object.keys(adapters)) {
      const adapter = adapters[key];
      if (typeof adapter.matches === "function" && adapter.matches(loc)) {
        return adapter;
      }
    }
    return null;
  }

  /**
   * Main evaluator: finds the current workflow step, updates panel in-place, and highlights element.
   * Runs sequentially: exactly ONE step at a time!
   */
  function evaluatePortalWorkflow(forceRefresh = false) {
    if (!portalGuidanceActive || panelDismissedByUser) return;

    addStyles();
    const loc = window.location;
    const adapter = getCurrentPortalAdapter();

    // --------------------------------------------------------
    // CASE 1: LANDING PAGE (Route "/")
    // Clean landing page: do NOT show popup automatically.
    // Guidance activates only when a specific service is chosen or requested.
    // --------------------------------------------------------
    if (!adapter && (loc.pathname === "/" || loc.pathname === "")) {
      if (activeHomeGuidance) {
        return;
      }
      activePortalAdapter = null;
      activePortalStep = null;
      currentStepIndexOverride = 0;
      removeHighlight();
      removePanel();
      return;
    }

    // --------------------------------------------------------
    // CASE 2: UNMATCHED ROUTE
    // --------------------------------------------------------
    if (!adapter) {
      activePortalAdapter = null;
      activePortalStep = null;
      removeHighlight();
      removePanel();
      return;
    }

    activePortalAdapter = adapter;

    // --------------------------------------------------------
    // CASE 3: ACTIVE PORTAL WORKFLOW (KSRTC, IRCTC, Bharatgas, KSEB)
    // --------------------------------------------------------

    // Identify which steps currently have matching elements in the DOM
    const visibleSteps = [];
    for (let i = 0; i < adapter.steps.length; i++) {
      const s = adapter.steps[i];
      let targetEl = null;
      let allTargets = [];

      if (typeof s.getAllElements === "function") {
        try {
          allTargets = s.getAllElements();
        } catch (_) {}
      } else if (s.selector) {
        allTargets = Array.from(document.querySelectorAll(s.selector)).filter(isVisible);
      }

      if (typeof s.getElement === "function") {
        targetEl = s.getElement();
      } else if (allTargets.length > 0) {
        targetEl = allTargets[0];
      }

      if (!targetEl && allTargets.length > 0) {
        targetEl = allTargets[0];
      }

      if (targetEl && isVisible(targetEl)) {
        let isDone = false;
        if (typeof s.isComplete === "function") {
          try {
            isDone = Boolean(s.isComplete(targetEl));
          } catch (_) {
            isDone = false;
          }
        }
        visibleSteps.push({
          index: i,
          step: s,
          element: targetEl,
          allElements: allTargets && allTargets.length > 0 ? allTargets : [targetEl],
          isDone
        });
      }
    }

    if (visibleSteps.length === 0) {
      // Elements are still mounting
      return;
    }

    // Determine the active step:
    // If currentStepIndexOverride points to a valid visible step and it is NOT done, use it;
    // Otherwise, select the first visible step that is NOT completed!
    let chosen = null;

    const overrideMatch = visibleSteps.find(
      (v) => v.index === currentStepIndexOverride
    );

    if (overrideMatch && !overrideMatch.isDone) {
      chosen = overrideMatch;
    } else {
      const firstIncomplete = visibleSteps.find((v) => !v.isDone);
      if (firstIncomplete) {
        chosen = firstIncomplete;
        currentStepIndexOverride = chosen.index;
      } else if (overrideMatch) {
        chosen = overrideMatch;
      } else {
        chosen = visibleSteps[0];
        currentStepIndexOverride = chosen.index;
      }
    }

    // Allow clicking or focusing any form field to immediately switch guidance to that column!
    visibleSteps.forEach((vs) => {
      const el = vs.element;
      if (el && !el._lanternFocusBound) {
        el._lanternFocusBound = true;
        const onFocusOrClick = () => {
          if (currentStepIndexOverride !== vs.index) {
            currentStepIndexOverride = vs.index;
            schedulePortalEvaluation(50);
          }
        };
        el.addEventListener("focus", onFocusOrClick, { passive: true });
        el.addEventListener("click", onFocusOrClick, { passive: true });
      }
    });

    const { step, element, allElements } = chosen;
    activePortalStep = step;

    // Update the panel in-place (no DOM flicker or unmounting!)
    renderOrUpdateStepPanel(adapter, step, chosen.index, adapter.steps.length);

    // Highlight target element(s) smoothly with viewport awareness:
    // If step defines getAllElements specifically, use allElements;
    // Otherwise prioritize the specific element returned by getElement()!
    const targetsToHighlight =
      typeof step.getAllElements === "function" && allElements && allElements.length > 0
        ? allElements
        : (element || (allElements && allElements.length > 0 ? allElements[0] : null));
    scrollAndHighlight(targetsToHighlight);

    // Bind interaction verification to advance automatically
    bindStepActionVerification(step, targetsToHighlight, adapter);
  }

  /**
   * Binds auto-verification listeners to advance to next step when user interacts
   */
  function bindStepActionVerification(step, targets, adapter) {
    if (!targets) return;
    const elements = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);

    elements.forEach((element) => {
      if (!element || element._lanternBound) return;
      element._lanternBound = true;

      const isInput = element.tagName === "INPUT" || element.tagName === "TEXTAREA";
      const isSelect = element.tagName === "SELECT";
      const isButton =
        element.tagName === "BUTTON" ||
        element.getAttribute("role") === "button" ||
        element.getAttribute("role") === "checkbox" ||
        element.classList.contains("btn-select-bus") ||
        element.classList.contains("btn-search-primary") ||
        element.classList.contains("btn-primary") ||
        element.classList.contains("seat-btn") ||
        element.classList.contains("btn-quick-fill");

      const isRadioOrOptionCard =
        element.classList.contains("method-option-card") ||
        (element.tagName === "INPUT" && element.type === "radio") ||
        element.getAttribute("role") === "radio";

      const advanceToNext = () => {
        let done = false;
        if (typeof step.isComplete === "function") {
          try {
            done = Boolean(step.isComplete(element));
          } catch (_) {
            done = false;
          }
        }

        if (done && currentStepIndexOverride < adapter.steps.length - 1) {
          // Advance smoothly to next step
          currentStepIndexOverride++;
          schedulePortalEvaluation(100);
        }
      };

      // For buttons / selectable cards: click advances
      if (isButton) {
        element.addEventListener(
          "click",
          () => {
            setTimeout(advanceToNext, 80);
          },
          { passive: true }
        );
      }

      // For payment method radio cards: click marks chosen and advances
      if (isRadioOrOptionCard) {
        element.addEventListener(
          "click",
          () => {
            const grid = document.querySelector(".payment-methods-grid, [id$='-payment-method']");
            if (grid) grid.dataset.methodChosen = "true";
            setTimeout(advanceToNext, 60);
          },
          { passive: true }
        );
      }

      // For text and date inputs: DO NOT advance on 'input' keystrokes!
      // Wait until the user presses Enter or leaves the field (blur / change)!
      if (isInput) {
        element.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            advanceToNext();
          }
        });
        element.addEventListener("change", () => {
          advanceToNext();
        }, { passive: true });
      }

      // For select dropdowns: advance when an option is selected
      if (isSelect) {
        element.addEventListener("change", () => {
          advanceToNext();
        }, { passive: true });
      }
    });
  }

  /**
   * Debounced evaluation scheduler
   */
  function schedulePortalEvaluation(delay = 200) {
    if (portalEvaluationDebounce) {
      clearTimeout(portalEvaluationDebounce);
    }
    portalEvaluationDebounce = setTimeout(() => {
      portalEvaluationDebounce = null;
      evaluatePortalWorkflow();
    }, delay);
  }



  /**
   * Renders or updates the active step panel IN-PLACE
   * Never flickers or re-creates the entire panel node unnecessarily!
   */
  function renderOrUpdateStepPanel(adapter, step, stepIdx, totalSteps) {
    let panel = document.getElementById("lantern-guidance-message");

    const isFinalPayment = Boolean(step.isFinalPayment);
    const isConfirmation = step.stepNumber === step.totalSteps;
    const stepLabel = typeof step.getLabel === "function" ? step.getLabel() : step.label;
    const stepInstruction = typeof step.getInstruction === "function" ? step.getInstruction() : step.instruction;

    // If panel already exists and is in step mode
    if (panel && panel.dataset.panelMode === "step") {
      // If step hasn't changed, update dynamic text if needed and return
      if (panel.dataset.stepId === step.id) {
        const titleEl = panel.querySelector(".lantern-title");
        if (titleEl && titleEl.textContent !== stepLabel) {
          titleEl.textContent = stepLabel;
        }
        const descEl = panel.querySelector(".lantern-description");
        if (descEl && descEl.textContent !== stepInstruction) {
          descEl.textContent = stepInstruction;
        }
        return;
      }

      // Step changed -> update existing elements in-place to avoid recreation!
      panel.dataset.stepId = step.id;

      const progressEl = panel.querySelector(".lantern-progress");
      if (progressEl) {
        progressEl.innerHTML = `<span>STEP ${step.stepNumber} OF ${step.totalSteps}</span><span>${escapeHtml(adapter.name)}</span>`;
      }

      const titleEl = panel.querySelector(".lantern-title");
      if (titleEl) {
        titleEl.textContent = stepLabel;
      }

      const descEl = panel.querySelector(".lantern-description");
      if (descEl) {
        descEl.textContent = stepInstruction;
      }

      const statusBadge = panel.querySelector(".lantern-status");
      if (statusBadge) {
        if (isConfirmation) {
          statusBadge.className = "lantern-status lantern-status-done";
          statusBadge.textContent = "COMPLETED";
        } else if (isFinalPayment) {
          statusBadge.className = "lantern-status lantern-status-action";
          statusBadge.textContent = "USER ACTION";
        } else {
          statusBadge.className = "lantern-status";
          statusBadge.textContent = "GUIDING";
        }
      }

      const noteEl = panel.querySelector(".lantern-note");
      if (noteEl) {
        if (isFinalPayment) {
          noteEl.style.background = "#3b2605";
          noteEl.style.color = "#fbbf24";
          noteEl.innerHTML = `<strong>User Control Guarantee:</strong> LANTERN highlights the demo payment action but will NEVER submit payment automatically. Review the details and click Pay when ready.`;
        } else if (isConfirmation) {
          noteEl.style.background = "#064e3b";
          noteEl.style.color = "#a7f3d0";
          noteEl.innerHTML = `✓ Workflow successfully completed! You can review or download your demo ticket/receipt.`;
        } else {
          noteEl.style.background = "#1e293b";
          noteEl.style.color = "#94a3b8";
          noteEl.innerHTML = `Waiting for your action. Step will advance automatically when completed.`;
        }
      }

      // Show / hide Next button
      const nextBtn = panel.querySelector("#lantern-next-step");
      if (nextBtn) {
        nextBtn.style.display = isConfirmation || isFinalPayment ? "none" : "flex";
      }

      return;
    }

    // Panel does not exist or was in landing mode -> build it once
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "lantern-guidance-message";
      document.body.appendChild(panel);
    }

    panel.dataset.panelMode = "step";
    panel.dataset.stepId = step.id;
    guidancePanel = panel;

    const statusClass = isConfirmation
      ? "lantern-status-done"
      : isFinalPayment
      ? "lantern-status-action"
      : "";
    const statusText = isConfirmation
      ? "COMPLETED"
      : isFinalPayment
      ? "USER ACTION"
      : "GUIDING";

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status ${statusClass}">${statusText}</div>
          <button id="lantern-close-panel" class="lantern-close-btn" title="Minimize LANTERN">✕</button>
        </div>
      </div>

      <div class="lantern-progress">
        <span>STEP ${step.stepNumber} OF ${step.totalSteps}</span>
        <span>${escapeHtml(adapter.name)}</span>
      </div>

      <div class="lantern-title">${escapeHtml(stepLabel)}</div>

      <div class="lantern-description">${escapeHtml(stepInstruction)}</div>

      ${
        !isConfirmation && !isFinalPayment
          ? `<button id="lantern-next-step" class="lantern-next-btn" type="button">
              Next Step &#8594;
            </button>`
          : ""
      }

      <div class="lantern-label">Need assistance with this step?</div>
      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN..."
        >
        <button id="lantern-question-button" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-again" class="lantern-secondary" type="button">
          ↻ Explain again
        </button>
        <button id="lantern-stuck" class="lantern-secondary" type="button">
          ❓ I'm Stuck
        </button>
      </div>

      <div class="lantern-note" style="background: ${
        isFinalPayment ? "#3b2605" : isConfirmation ? "#064e3b" : "#1e293b"
      }; color: ${
      isFinalPayment ? "#fbbf24" : isConfirmation ? "#a7f3d0" : "#94a3b8"
    };">
        ${
          isFinalPayment
            ? "<strong>User Control Guarantee:</strong> LANTERN highlights the demo payment action but will NEVER submit payment automatically. Review the details and click Pay when ready."
            : isConfirmation
            ? "✓ Workflow successfully completed! You can review or download your demo ticket/receipt."
            : "Waiting for your action. Step will advance automatically when completed."
        }
      </div>
    `;

    // Hook listeners
    panel.querySelector("#lantern-close-panel")?.addEventListener("click", () => {
      panelDismissedByUser = true;
      removePanel();
      removeHighlight();
    });

    panel.querySelector("#lantern-next-step")?.addEventListener("click", () => {
      // 1. If confirm seats button is visible and seats are selected, click it!
      const confirmBtn =
        document.getElementById("ksrtc-confirm-seats") ||
        document.querySelector('[data-lantern-action="confirm-seats"]') ||
        document.querySelector(".seat-actions-footer .btn-primary");
      const hasSelectedSeats = Boolean(document.querySelector(".seat-btn.seat-selected"));
      if (hasSelectedSeats && confirmBtn && isVisible(confirmBtn) && !confirmBtn.disabled) {
        confirmBtn.click();
        schedulePortalEvaluation(120);
        return;
      }

      // 2. If on payment-method step, mark method as chosen and advance to payment-details
      if (activePortalStep && activePortalStep.id && activePortalStep.id.includes("payment-method")) {
        const grid = document.querySelector(".payment-methods-grid, [id$='-payment-method']");
        if (grid) grid.dataset.methodChosen = "true";
        if (currentStepIndexOverride < adapter.steps.length - 1) {
          currentStepIndexOverride++;
          schedulePortalEvaluation(50);
          return;
        }
      }

      // 3. If on payment-details step and input is empty, trigger Demo Fill for easy testing
      if (activePortalStep && activePortalStep.id && activePortalStep.id.includes("payment-details")) {
        const demoFillBtn = document.querySelector(".btn-quick-fill");
        if (demoFillBtn && isVisible(demoFillBtn)) {
          demoFillBtn.click();
          schedulePortalEvaluation(120);
          return;
        }
      }

      // 4. If active highlighted element is an action button, click it!
      const target = getHighlightTarget();
      if (
        target &&
        typeof target.click === "function" &&
        (target.tagName === "BUTTON" ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("btn-select-bus") ||
          target.classList.contains("btn-search-primary") ||
          target.classList.contains("btn-primary"))
      ) {
        target.click();
        schedulePortalEvaluation(120);
        return;
      }

      // 5. Otherwise advance index
      if (currentStepIndexOverride < adapter.steps.length - 1) {
        currentStepIndexOverride++;
        schedulePortalEvaluation(50);
      }
    });

    const qInput = panel.querySelector("#lantern-question");
    const qBtn = panel.querySelector("#lantern-question-button");
    const voiceBtn = panel.querySelector("#lantern-voice");
    const againBtn = panel.querySelector("#lantern-again");
    const stuckBtn = panel.querySelector("#lantern-stuck");

    const doAsk = () => {
      const q = (qInput?.value || "").trim();
      if (!q) return;
      handlePortalUserInput(q);
    };

    qBtn?.addEventListener("click", doAsk);
    qInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAsk();
      }
    });

    voiceBtn?.addEventListener("click", () => {
      startVoice(qInput, (t) => handlePortalUserInput(t));
    });

    againBtn?.addEventListener("click", () => {
      let targetEl = null;
      if (typeof step.getElement === "function") {
        targetEl = step.getElement();
      } else if (step.selector) {
        targetEl = document.querySelector(step.selector);
      }
      if (targetEl) {
        scrollAndHighlight(targetEl);
      }
      updatePanelText(step.instruction);
    });

    stuckBtn?.addEventListener("click", () => {
      provideStepStuckHelp(step);
    });
  }

  /**
   * Contextual help for stuck users on a specific step
   */
  function provideStepStuckHelp(step) {
    if (!step) return;
    let helpMsg = step.instruction;
    if (step.id.includes("from") || step.id.includes("to")) {
      helpMsg += " Select your station/city from the dropdown or click one of the quick suggestions.";
    } else if (step.id.includes("date")) {
      helpMsg += " Pick any upcoming travel date using the calendar picker.";
    } else if (step.id.includes("select-bus") || step.id.includes("select-train")) {
      helpMsg += " Click the Select button next to your desired service.";
    } else if (step.id.includes("seat")) {
      helpMsg += " Click on any green available seat on the seat map, then click Proceed.";
    } else if (step.id.includes("passenger")) {
      helpMsg += " Type passenger details, or click 'Auto-Fill Sample' to quickly test.";
    } else if (step.id.includes("pay")) {
      helpMsg += " This is a local demo sandbox. Click Pay to simulate the booking confirmation.";
    }
    updatePanelText(helpMsg);
  }

  /**
   * Guides user on the Landing/Home page to the detected service action
   * (e.g. "Book Bus", "Book Train", "Book Gas", "Pay Electricity Bill")
   */
  function guideHomeBookingAction(result) {
    if (!result) return;
    activeHomeGuidance = result;
    panelDismissedByUser = false;

    // Remove any help prompt popup if open
    const prompt = document.getElementById("lantern-help-prompt");
    if (prompt) prompt.remove();

    if (result.intent === "ALL_BOOKINGS") {
      const allButtons = Array.from(
        document.querySelectorAll(
          "#home-btn-ksrtc, #home-btn-irctc, #home-btn-bharatgas, #home-btn-kseb, .btn-card-action"
        )
      ).filter(isVisible);

      if (allButtons.length > 0) {
        scrollAndHighlight(allButtons);
      }
      renderOrUpdateHomePanel(result, allButtons[0] || null);
      return;
    }

    let targetButton = null;
    if (result.buttonId) {
      targetButton = document.getElementById(result.buttonId);
    }
    if (!targetButton && result.serviceId) {
      targetButton = document.querySelector(
        `[data-lantern-action="navigate-${result.serviceId}"]`
      );
    }
    if (!targetButton && result.route) {
      targetButton = document.querySelector(`a[href="${result.route}"]`);
    }

    if (targetButton) {
      scrollAndHighlight(targetButton);
      renderOrUpdateHomePanel(result, targetButton);
    } else if (result.route) {
      navigateToService(result.route);
    }
  }

  /**
   * Renders the Guidance Panel specifically for the Landing/Home page action
   */
  function renderOrUpdateHomePanel(result, targetButton) {
    addStyles();
    let panel = document.getElementById("lantern-guidance-message");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "lantern-guidance-message";
      document.body.appendChild(panel);
    }

    panel.dataset.panelMode = "home-action";
    panel.dataset.actionId = result.intent;
    guidancePanel = panel;

    const actionTitle = result.actionLabel || "Booking Detected";
    const serviceName = result.serviceName || "Service Selection";
    const instruction = result.instruction || result.message;

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-header-actions">
          <div class="lantern-status lantern-status-ready">ACTION DETECTED</div>
          <button id="lantern-close-panel" class="lantern-close-btn" title="Close LANTERN">✕</button>
        </div>
      </div>

      <div class="lantern-progress">
        <span>SERVICE DETECTED</span>
        <span>${escapeHtml(serviceName)}</span>
      </div>

      <div class="lantern-title">${escapeHtml(actionTitle)}</div>

      <div class="lantern-description">${escapeHtml(instruction)}</div>

      ${
        targetButton
          ? `<button id="lantern-next-step" class="lantern-next-btn" type="button">
              Proceed to ${escapeHtml(actionTitle)} &#8594;
            </button>`
          : ""
      }

      <div class="lantern-label">Need something else?</div>
      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN (e.g. Book Train, Pay Bill)..."
        >
        <button id="lantern-question-button" class="lantern-primary" type="button">
          Ask
        </button>
      </div>

      <div class="lantern-secondary-row">
        <button id="lantern-voice" class="lantern-secondary" type="button">
          🎤 Voice
        </button>
        <button id="lantern-again" class="lantern-secondary" type="button">
          ↻ Highlight again
        </button>
        <button id="lantern-stuck" class="lantern-secondary" type="button">
          ❓ Help
        </button>
      </div>

      <div class="lantern-note" style="background: #1e293b; color: #94a3b8;">
        Click the highlighted <strong>${escapeHtml(
          actionTitle
        )}</strong> button above to begin step-by-step guidance.
      </div>
    `;

    const closeBtn = panel.querySelector("#lantern-close-panel");
    const nextBtn = panel.querySelector("#lantern-next-step");
    const qInput = panel.querySelector("#lantern-question");
    const qBtn = panel.querySelector("#lantern-question-button");
    const voiceBtn = panel.querySelector("#lantern-voice");
    const againBtn = panel.querySelector("#lantern-again");
    const stuckBtn = panel.querySelector("#lantern-stuck");

    closeBtn?.addEventListener("click", () => {
      removeHighlight();
      removePanel();
      activeHomeGuidance = null;
      panelDismissedByUser = true;
    });

    nextBtn?.addEventListener("click", () => {
      if (targetButton) {
        targetButton.click();
      } else if (result.route) {
        navigateToService(result.route);
      }
    });

    const doAsk = () => {
      const q = (qInput?.value || "").trim();
      if (!q) return;
      handleGlobalRequirement(q);
    };

    qBtn?.addEventListener("click", doAsk);
    qInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAsk();
      }
    });

    voiceBtn?.addEventListener("click", () => {
      startVoice(qInput, (t) => handleGlobalRequirement(t));
    });

    againBtn?.addEventListener("click", () => {
      if (targetButton) {
        scrollAndHighlight(targetButton);
      }
      updatePanelText(instruction);
    });

    stuckBtn?.addEventListener("click", () => {
      updatePanelText(
        `Click the glowing '${actionTitle}' button on your screen, or click 'Proceed to ${actionTitle}' below to open the booking page.`
      );
    });
  }

  /**
   * Handles user requests/questions on portal pages
   */
  function handlePortalUserInput(userInput) {
    if (typeof recognizeLanternIntent === "function") {
      const result = recognizeLanternIntent(userInput);
      console.log("[LANTERN] Intent recognized on portal:", result);

      const isHome =
        window.location.pathname === "/" ||
        window.location.pathname === "" ||
        Boolean(document.getElementById("home-btn-ksrtc"));
      if (isHome && result && (result.route || result.intent === "ALL_BOOKINGS")) {
        guideHomeBookingAction(result);
        return;
      }

      if (result && result.route) {
        if (window.location.pathname === result.route) {
          updatePanelText(
            `You are already on the ${result.serviceName || "booking"} page. Follow the highlighted step.`
          );
          evaluatePortalWorkflow();
          return;
        } else {
          updatePanelText(`Navigating to ${result.serviceName || result.message}...`);
          navigateToService(result.route);
          return;
        }
      }

      if (result && result.intent === "LANTERN_HELP") {
        if (activePortalStep) {
          provideStepStuckHelp(activePortalStep);
        } else {
          updatePanelText("Select a service portal below to begin step-by-step guidance.");
        }
        return;
      }
    }

    // Default response: re-evaluate and give step instruction
    evaluatePortalWorkflow();
  }

  /**
   * Smoothly navigates to a service route in the SPA
   */
  function navigateToService(route) {
    let linkSelector = "";
    if (route === "/ksrtc") linkSelector = "#home-btn-ksrtc";
    if (route === "/irctc") linkSelector = "#home-btn-irctc";
    if (route === "/bharatgas") linkSelector = "#home-btn-bharatgas";
    if (route === "/kseb") linkSelector = "#home-btn-kseb";

    const link = linkSelector ? document.querySelector(linkSelector) : null;
    if (link) {
      link.click();
    } else {
      window.location.pathname = route;
    }
  }

  // ==========================================================
  // SPA ROUTE OBSERVER
  // With Mutation Filter to prevent feedback loops
  // ==========================================================

  function setupSpaRouteObserver() {
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== lastKnownPathname) {
        console.log(`[LANTERN ROUTE] SPA route changed: ${lastKnownPathname} -> ${newPath}`);
        lastKnownPathname = newPath;
        currentStepIndexOverride = 0; // Reset step index for new portal
        activeHomeGuidance = null;
        panelDismissedByUser = false;
        removeHighlight();
        schedulePortalEvaluation(150);
      }
    };

    // Monkey-patch pushState & replaceState
    const originalPushState = history.pushState;
    if (originalPushState) {
      history.pushState = function (...args) {
        const result = originalPushState.apply(this, args);
        window.dispatchEvent(new Event("lantern:locationchange"));
        return result;
      };
    }

    const originalReplaceState = history.replaceState;
    if (originalReplaceState) {
      history.replaceState = function (...args) {
        const result = originalReplaceState.apply(this, args);
        window.dispatchEvent(new Event("lantern:locationchange"));
        return result;
      };
    }

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("lantern:locationchange", handleRouteChange);

    // Periodic safety check to catch any route shifts
    setInterval(() => {
      if (window.location.pathname !== lastKnownPathname) {
        handleRouteChange();
      }
    }, 300);

    // MutationObserver to detect React DOM re-renders inside routes
    // CRITICAL: MUST filter out all LANTERN's own DOM mutations to prevent loops!
    const domObserver = new MutationObserver((mutations) => {
      const hasExternalMutation = mutations.some((m) => {
        const target = m.target;
        if (!target) return false;

        // Ignore mutations on LANTERN's own elements
        if (
          target.id &&
          (target.id.startsWith("lantern-") || target.id === "lantern-bright-highlight")
        ) {
          return false;
        }

        if (
          target.closest?.(
            "#lantern-guidance-message, #lantern-help-prompt, #lantern-bright-highlight, #lantern-styles"
          )
        ) {
          return false;
        }

        for (let i = 0; i < m.addedNodes.length; i++) {
          const n = m.addedNodes[i];
          if (n.id && (n.id.startsWith("lantern-") || n.id === "lantern-bright-highlight")) {
            return false;
          }
        }

        for (let i = 0; i < m.removedNodes.length; i++) {
          const n = m.removedNodes[i];
          if (n.id && (n.id.startsWith("lantern-") || n.id === "lantern-bright-highlight")) {
            return false;
          }
        }

        return true;
      });

      if (hasExternalMutation) {
        schedulePortalEvaluation(250);
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-checked", "disabled"]
    });

    // Delegated click listener to catch portal user interactions (seat clicks, pills, buttons, payment cards)
    document.addEventListener(
      "click",
      (e) => {
        if (!isPortal || !activePortalAdapter) return;
        if (
          e.target &&
          e.target.closest &&
          e.target.closest(
            "#lantern-guidance-message, #lantern-help-prompt, #lantern-bright-highlight"
          )
        ) {
          return;
        }

        // If the user clicked a payment method card or radio button:
        const cardOrRadio = e.target.closest?.(".method-option-card, input[name='paymentMethod']");
        if (cardOrRadio) {
          const grid = document.querySelector(".payment-methods-grid, [id$='-payment-method']");
          if (grid) {
            grid.dataset.methodChosen = "true";
          }
          if (
            activePortalStep &&
            activePortalStep.id &&
            activePortalStep.id.includes("payment-method")
          ) {
            if (currentStepIndexOverride < activePortalAdapter.steps.length - 1) {
              currentStepIndexOverride++;
            }
          }
        }

        schedulePortalEvaluation(80);
      },
      { passive: true }
    );
  }

  // Message listener from extension background/action icon
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.action === "SUMMON_LANTERN") {
        panelDismissedByUser = false;
        helpDismissed = false;
        triggerAssistance();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  // ==========================================================
  // EXTENSION INITIALIZATION
  // ==========================================================

  addStyles();

  if (isGmail) {
    console.log(
      "[LANTERN] Gmail Accessibility Assistant active in passive monitoring mode (Difficulty Detection enabled)."
    );
    // Note: Do NOT automatically start guidance on page load!
    // LANTERN box will only appear when the user experiences difficulty or requests help.
  } else if (isPortal) {
    console.log("[LANTERN] Initializing Portal Workflow Engine.");
    setupSpaRouteObserver();
    evaluatePortalWorkflow();
  }
})();