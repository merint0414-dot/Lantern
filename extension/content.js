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
      #lantern-bright-highlight {
        position: fixed !important;
        box-sizing: border-box !important;
        border: 4px solid #ffd000 !important;
        border-radius: 9px !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
        animation: lanternBrightPulse 1s infinite !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  // ==========================================================
  // SHARED DOM & HIGHLIGHT UTILITIES
  // ==========================================================

  let highlightBox = null;
  let activeHighlightedElement = null;
  let highlightTimeout = null;
  let guidancePanel = null;
  let panelDismissedByUser = false;

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
      .querySelectorAll("#lantern-bright-highlight")
      .forEach((element) => element.remove());

    activeHighlightedElement = null;
  }

  function highlightElement(element) {
    if (!element || !isVisible(element)) {
      removeHighlight();
      return;
    }

    activeHighlightedElement = element;
    const rect = element.getBoundingClientRect();
    const pad = 6;

    // In-place reuse of highlightBox to avoid DOM mutation loops
    if (!highlightBox || !document.contains(highlightBox)) {
      const box = document.createElement("div");
      box.id = "lantern-bright-highlight";
      box.style.position = "fixed";
      box.style.pointerEvents = "none";
      box.style.zIndex = "2147483646";
      document.documentElement.appendChild(box);
      highlightBox = box;
    }

    highlightBox.style.left = `${Math.max(0, rect.left - pad)}px`;
    highlightBox.style.top = `${Math.max(0, rect.top - pad)}px`;
    highlightBox.style.width = `${Math.max(36, rect.width + pad * 2)}px`;
    highlightBox.style.height = `${Math.max(28, rect.height + pad * 2)}px`;
  }

  function repositionHighlight() {
    if (
      !highlightBox ||
      !activeHighlightedElement ||
      !document.contains(activeHighlightedElement)
    ) {
      return;
    }
    const rect = activeHighlightedElement.getBoundingClientRect();
    const pad = 6;
    highlightBox.style.left = `${Math.max(0, rect.left - pad)}px`;
    highlightBox.style.top = `${Math.max(0, rect.top - pad)}px`;
    highlightBox.style.width = `${Math.max(36, rect.width + pad * 2)}px`;
    highlightBox.style.height = `${Math.max(28, rect.height + pad * 2)}px`;
  }

  function scrollAndHighlight(element) {
    if (!element) return;

    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }

    try {
      const rect = element.getBoundingClientRect();
      const inView =
        rect.top >= 60 &&
        rect.bottom <= window.innerHeight - 60 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!inView) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }
    } catch (_) {}

    highlightElement(element);

    highlightTimeout = setTimeout(() => {
      if (document.contains(element)) {
        repositionHighlight();
      }
    }, 250);
  }

  window.addEventListener("scroll", repositionHighlight, {
    passive: true,
    capture: true
  });
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
  // SHARED DIFFICULTY DETECTION
  // ==========================================================

  const DIFFICULTY_THRESHOLD = 25;
  let difficultyScore = 0;
  let repeatedClicks = 0;
  let scrollCount = 0;
  let inactivityScore = 0;
  let lastClickedElement = null;
  let lastActivity = Date.now();
  let inactivityDetected = false;
  let helpPromptShown = false;
  let helpDismissed = false;

  function calculateDifficulty() {
    const clickScore =
      repeatedClicks >= 4 ? (repeatedClicks - 3) * 3 : 0;
    const scrollScore =
      scrollCount >= 12 ? Math.floor(scrollCount / 6) : 0;

    difficultyScore = clickScore + scrollScore + inactivityScore;

    // Only show help prompt if NO guidance panel is already active on screen!
    if (
      difficultyScore >= DIFFICULTY_THRESHOLD &&
      !helpPromptShown &&
      !helpDismissed &&
      !document.getElementById("lantern-guidance-message")
    ) {
      helpPromptShown = true;
      showHelpPrompt();
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      lastActivity = Date.now();
      if (
        event.target.closest?.(
          "#lantern-guidance-message, #lantern-help-prompt"
        )
      ) {
        return;
      }

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
      calculateDifficulty();
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      lastActivity = Date.now();

      // Alt + Shift + L shortcut to reopen or test LANTERN panel
      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        panelDismissedByUser = false;
        if (isPortal) {
          evaluatePortalWorkflow(true);
        } else {
          showHelpPrompt();
        }
      }

      calculateDifficulty();
    },
    true
  );

  setInterval(() => {
    const inactive = Date.now() - lastActivity;
    if (inactive >= 35000 && !inactivityDetected) {
      inactivityDetected = true;
      inactivityScore += 10;
      calculateDifficulty();
    }
    if (inactive < 35000) {
      inactivityDetected = false;
    }
  }, 10000);

  // ==========================================================
  // SHARED HELP PROMPT POPUP
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
        <div class="lantern-status lantern-status-ready">READY</div>
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

    input?.focus();

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

    close?.addEventListener("click", () => {
      popup.remove();
      helpDismissed = true;
    });
  }

  function handleGlobalRequirement(query) {
    if (typeof recognizeLanternIntent === "function") {
      const result = recognizeLanternIntent(query);
      if (result && result.route) {
        window.location.href = result.route;
        return;
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

  function gmailGetWorkflowSteps() {
    if (gmailAttachmentModeActive) {
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
    const steps = gmailGetWorkflowSteps();
    return steps.find((s) => s.key === key) || steps[0];
  }

  function gmailStopWatcher() {
    if (typeof gmailCleanupWatcher === "function") {
      gmailCleanupWatcher();
      gmailCleanupWatcher = null;
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

  function gmailFindRecipientField() {
    const selectors = [
      'input[aria-label="To recipients"]',
      'input[aria-label="To"]',
      'input[aria-label*="recipient" i]',
      'input[placeholder*="recipient" i]',
      'input[role="combobox"][aria-label*="recipient" i]',
      'input[role="combobox"][aria-label*="to" i]',
      'input.agP.aFw',
      'input[name="to"]:not([type="hidden"])'
    ];

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailFindSubjectField() {
    const selectors = [
      'input[name="subjectbox"]',
      'input[name="subject"]',
      'input[placeholder*="Subject" i]',
      'input[aria-label*="Subject" i]',
      'input.aoT'
    ];

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailFindMessageField() {
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

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailFindSendButton() {
    const selectors = [
      'div[role="button"][aria-label*="Send" i]:not([aria-label*="Schedule" i])',
      'button[aria-label*="Send" i]:not([aria-label*="Schedule" i])',
      '[data-tooltip*="Send" i]:not([data-tooltip*="Schedule" i])',
      '[title*="Send" i]:not([title*="Schedule" i])',
      'div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3'
    ];

    for (const s of selectors) {
      const el = document.querySelector(s);
      if (isVisible(el)) return el;
    }
    return null;
  }

  function gmailComposeOpen() {
    return Boolean(
      gmailFindRecipientField() ||
      gmailFindSubjectField() ||
      gmailFindMessageField()
    );
  }

  function gmailIsValidEmail(val) {
    if (!val) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim());
  }

  function gmailFindAcceptedRecipients() {
    const found = [];
    document.querySelectorAll("[email]").forEach((el) => {
      const e = (el.getAttribute("email") || "").trim().toLowerCase();
      if (gmailIsValidEmail(e)) found.push(e);
    });

    const field = gmailFindRecipientField();
    if (field && gmailIsValidEmail(field.value)) {
      found.push(field.value.trim().toLowerCase());
    }

    return [...new Set(found)];
  }

  function gmailShowPanel(stepKey, message, note) {
    removePanel();

    const steps = gmailGetWorkflowSteps();
    const step = gmailGetStep(stepKey);
    if (!step) return;

    const panel = document.createElement("div");
    panel.id = "lantern-guidance-message";

    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          <span>🔦</span>
          <span>LANTERN</span>
        </div>
        <div class="lantern-status">GUIDING</div>
      </div>
      <div class="lantern-progress">
        <span>STEP ${step.number} OF ${steps.length}</span>
        <span>${escapeHtml(step.label)}</span>
      </div>
      <div class="lantern-title">${escapeHtml(step.label)}</div>
      <div class="lantern-description">${escapeHtml(message)}</div>

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

    if (gmailComposeOpen()) {
      gmailGuideStep(gmailGetCurrentState());
    } else {
      gmailGuideCompose();
    }
  }

  function gmailGetCurrentState() {
    if (!gmailComposeOpen()) return "compose";
    if (gmailFindAcceptedRecipients().length < gmailRequiredRecipientCount) {
      return "recipient";
    }
    const subj = gmailFindSubjectField();
    if (!subj || !subj.value.trim()) return "subject";
    const msg = gmailFindMessageField();
    if (!msg || !(msg.innerText || msg.textContent || msg.value || "").trim()) {
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
      return;
    }

    try { field.focus(); } catch (_) {}
    scrollAndHighlight(field);
    gmailShowPanel(
      "recipient",
      "Enter the recipient's email address and press Enter.",
      "LANTERN will detect when the recipient is added."
    );
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
      "Click into the message body when done."
    );
  }

  function gmailGuideMessage() {
    gmailCurrentStep = "message";
    const field = gmailFindMessageField();
    if (!field) return;
    try { field.focus(); } catch (_) {}
    scrollAndHighlight(field);
    gmailShowPanel(
      "message",
      "Type the message you want to send.",
      "LANTERN will guide you to Send when ready."
    );
  }

  function gmailGuideSend() {
    gmailCurrentStep = "send";
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
    // Guidance activates only when a specific service is chosen.
    // --------------------------------------------------------
    if (!adapter && (loc.pathname === "/" || loc.pathname === "")) {
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
      if (typeof s.getElement === "function") {
        targetEl = s.getElement();
      } else if (s.selector) {
        targetEl = document.querySelector(s.selector);
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
        visibleSteps.push({ index: i, step: s, element: targetEl, isDone });
      }
    }

    if (visibleSteps.length === 0) {
      // Elements are still mounting
      return;
    }

    // Determine the active step:
    // If currentStepIndexOverride points to a valid visible step, use it;
    // Otherwise, select the first visible step that is NOT completed!
    let chosen = null;

    // First check if current overridden index is valid and visible
    const overrideMatch = visibleSteps.find(
      (v) => v.index === currentStepIndexOverride
    );

    if (overrideMatch) {
      chosen = overrideMatch;
    } else {
      // Find the first uncompleted visible step
      const firstUncompleted = visibleSteps.find((v) => !v.isDone);
      if (firstUncompleted) {
        chosen = firstUncompleted;
        currentStepIndexOverride = firstUncompleted.index;
      } else {
        // All visible steps are completed -> pick the last visible step (e.g. submit button, confirmation)
        chosen = visibleSteps[visibleSteps.length - 1];
        currentStepIndexOverride = chosen.index;
      }
    }

    const { step, element } = chosen;
    activePortalStep = step;

    // Update the panel in-place (no DOM flicker or unmounting!)
    renderOrUpdateStepPanel(adapter, step, chosen.index, adapter.steps.length);

    // Highlight target element smoothly
    scrollAndHighlight(element);

    // Bind interaction verification to advance automatically
    bindStepActionVerification(step, element, adapter);
  }

  /**
   * Binds auto-verification listeners to advance to next step when user interacts
   */
  function bindStepActionVerification(step, element, adapter) {
    if (!element || element._lanternBound) return;
    element._lanternBound = true;

    const onUserInteraction = () => {
      // Check if step is now complete
      let done = false;
      if (typeof step.isComplete === "function") {
        try {
          done = Boolean(step.isComplete(element));
        } catch (_) {
          done = false;
        }
      }

      if (done && currentStepIndexOverride < adapter.steps.length - 1) {
        // Step complete -> advance to next step smoothly
        currentStepIndexOverride++;
      }

      schedulePortalEvaluation(150);
    };

    element.addEventListener("input", onUserInteraction, { passive: true });
    element.addEventListener("change", onUserInteraction, { passive: true });

    // For buttons or selectable chips
    element.addEventListener(
      "click",
      () => {
        setTimeout(onUserInteraction, 80);
      },
      { passive: true }
    );
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

    // If panel already exists and is in step mode
    if (panel && panel.dataset.panelMode === "step") {
      // If step hasn't changed, just update status note and return
      if (panel.dataset.stepId === step.id) {
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
        titleEl.textContent = step.label;
      }

      const descEl = panel.querySelector(".lantern-description");
      if (descEl) {
        descEl.textContent = step.instruction;
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

      <div class="lantern-title">${escapeHtml(step.label)}</div>

      <div class="lantern-description">${escapeHtml(step.instruction)}</div>

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
   * Handles user requests/questions on portal pages
   */
  function handlePortalUserInput(userInput) {
    if (typeof recognizeLanternIntent === "function") {
      const result = recognizeLanternIntent(userInput);
      console.log("[LANTERN] Intent recognized on portal:", result);

      if (result && result.route) {
        if (window.location.pathname !== result.route) {
          updatePanelText(`Navigating to ${result.message}...`);
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
      attributes: false
    });
  }

  // ==========================================================
  // EXTENSION INITIALIZATION
  // ==========================================================

  addStyles();

  if (isGmail) {
    console.log("[LANTERN] Initializing Gmail Accessibility Assistant.");
    gmailStartGuidance();
  } else if (isPortal) {
    console.log("[LANTERN] Initializing Portal Workflow Engine.");
    setupSpaRouteObserver();
    evaluatePortalWorkflow();
  }
})();