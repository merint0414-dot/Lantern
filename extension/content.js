// ============================================================
// LANTERN - GMAIL CONTENT SCRIPT
// Step-by-step Gmail accessibility guidance
// ============================================================

(() => {
  "use strict";

  // ==========================================================
  // ONLY RUN ON GMAIL
  // ==========================================================

  const hostname = window.location.hostname;

  if (
    hostname !== "mail.google.com" &&
    !hostname.endsWith(".mail.google.com")
  ) {
    return;
  }

  console.log("LANTERN: Gmail content script loaded.");

  // ==========================================================
  // WORKFLOW
  // ==========================================================

  const WORKFLOW = [
    {
      key: "compose",
      number: 1,
      label: "Compose"
    },
    {
      key: "recipient",
      number: 2,
      label: "Recipient"
    },
    {
      key: "subject",
      number: 3,
      label: "Subject"
    },
    {
      key: "message",
      number: 4,
      label: "Message"
    },
    {
      key: "send",
      number: 5,
      label: "Send"
    }
  ];

  // ==========================================================
  // STATE
  // ==========================================================

  let guidanceActive = false;

  let currentStep = "compose";

  let sessionId = 0;

  let guidancePanel = null;

  let highlightBox = null;

  let cleanupWatcher = null;

  // ==========================================================
  // RECIPIENT STATE
  // ==========================================================

  let requiredRecipientCount = 1;

  let recipientCountSet = false;

  // ==========================================================
  // DIFFICULTY DETECTION
  // Internal only
  // ==========================================================

  const DIFFICULTY_THRESHOLD = 20;

  let difficultyScore = 0;

  let repeatedClicks = 0;

  let scrollCount = 0;

  let inactivityScore = 0;

  let lastClickedElement = null;

  let lastActivity = Date.now();

  let inactivityDetected = false;

  let helpPromptShown = false;

  let helpDismissed = false;

  // ==========================================================
  // STYLES
  // ==========================================================

  function addStyles() {
    if (
      document.getElementById(
        "lantern-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "lantern-styles";

    style.textContent = `

      /* =====================================
         LANTERN PANEL
         ===================================== */

      #lantern-guidance-message,
      #lantern-help-prompt {

        position: fixed !important;

        right: 24px !important;

        bottom: 24px !important;

        width: 390px !important;

        max-width:
          calc(100vw - 32px) !important;

        box-sizing: border-box !important;

        padding: 20px !important;

        background:
          #17191b !important;

        color:
          #ffffff !important;

        border:
          1px solid #383c40 !important;

        border-top:
          4px solid #d9a900 !important;

        border-radius:
          16px !important;

        box-shadow:
          0 20px 60px
          rgba(0,0,0,.40) !important;

        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif !important;

        z-index:
          2147483647 !important;
      }

      .lantern-header {

        display: flex !important;

        align-items: center !important;

        gap: 8px !important;

        margin-bottom: 14px !important;
      }

      .lantern-brand {

        display: flex !important;

        align-items: center !important;

        gap: 8px !important;

        font-size: 19px !important;

        font-weight: 800 !important;
      }

      .lantern-status {

        margin-left: auto !important;

        padding:
          5px 9px !important;

        border-radius:
          999px !important;

        background:
          #063d25 !important;

        color:
          #5ee39b !important;

        font-size: 9px !important;

        font-weight: 800 !important;

        letter-spacing:
          .5px !important;
      }

      .lantern-progress {

        display: flex !important;

        justify-content:
          space-between !important;

        margin-bottom: 9px !important;

        color:
          #a4a8ad !important;

        font-size: 11px !important;

        font-weight: 750 !important;

        text-transform:
          uppercase !important;
      }

      .lantern-title {

        margin-bottom: 7px !important;

        color:
          #ffffff !important;

        font-size: 23px !important;

        font-weight: 800 !important;
      }

      .lantern-description {

        margin-bottom: 15px !important;

        color:
          #c5c8cc !important;

        font-size: 14px !important;

        line-height: 1.5 !important;
      }

      .lantern-label {

        margin-bottom: 7px !important;

        color:
          #a7abb0 !important;

        font-size: 11px !important;

        font-weight: 700 !important;
      }

      .lantern-row {

        display: flex !important;

        gap: 8px !important;

        margin-bottom: 10px !important;
      }

      .lantern-input {

        flex: 1 !important;

        width: 100% !important;

        height: 42px !important;

        box-sizing:
          border-box !important;

        padding:
          0 12px !important;

        border:
          1px solid #484c51 !important;

        border-radius:
          9px !important;

        background:
          #202326 !important;

        color:
          #ffffff !important;

        outline: none !important;

        font-size: 13px !important;
      }

      .lantern-input:focus {

        border-color:
          #d9a900 !important;

        box-shadow:
          0 0 0 3px
          rgba(217,169,0,.15) !important;
      }

      .lantern-primary {

        height: 42px !important;

        padding:
          0 16px !important;

        border:
          1px solid #c49600 !important;

        border-radius:
          9px !important;

        background:
          #d9a900 !important;

        color:
          #171717 !important;

        font-weight:
          800 !important;

        cursor:
          pointer !important;
      }

      .lantern-secondary-row {

        display: flex !important;

        gap: 9px !important;

        margin-top: 8px !important;
      }

      .lantern-secondary {

        flex: 1 !important;

        height: 40px !important;

        border:
          1px solid #474b50 !important;

        border-radius:
          9px !important;

        background:
          #202326 !important;

        color:
          #d0d3d6 !important;

        cursor:
          pointer !important;

        font-size:
          12px !important;

        font-weight:
          700 !important;
      }

      .lantern-note {

        margin-top: 12px !important;

        padding:
          10px !important;

        border-radius:
          8px !important;

        background:
          #3b3105 !important;

        color:
          #f0d76d !important;

        font-size:
          11px !important;

        line-height:
          1.45 !important;
      }

      .lantern-toggle-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-top: 10px !important;
        margin-bottom: 6px !important;
        padding: 8px 12px !important;
        background: #202326 !important;
        border: 1px solid #484c51 !important;
        border-radius: 9px !important;
      }

      .lantern-toggle-info {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        color: #e5e7eb !important;
        user-select: none !important;
      }

      .lantern-toggle-icon {
        font-size: 15px !important;
      }

      .lantern-switch {
        position: relative !important;
        display: inline-block !important;
        width: 42px !important;
        height: 22px !important;
        flex-shrink: 0 !important;
      }

      .lantern-switch input {
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
      }

      .lantern-slider {
        position: absolute !important;
        cursor: pointer !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: #4b5563 !important;
        transition: all 0.2s ease !important;
        border-radius: 22px !important;
      }

      .lantern-slider:before {
        position: absolute !important;
        content: "" !important;
        height: 16px !important;
        width: 16px !important;
        left: 3px !important;
        bottom: 3px !important;
        background-color: #ffffff !important;
        transition: all 0.2s ease !important;
        border-radius: 50% !important;
      }

      .lantern-switch input:checked + .lantern-slider {
        background-color: #f5b800 !important;
      }

      .lantern-switch input:checked + .lantern-slider:before {
        transform: translateX(20px) !important;
        background-color: #111827 !important;
      }

      .lantern-next-btn {

        width: 100% !important;

        margin-top: 12px !important;

        margin-bottom: 4px !important;

        padding: 10px 14px !important;

        font-size: 13px !important;

        font-weight: 750 !important;

        background: #f59e0b !important;

        color: #111827 !important;

        border: none !important;

        border-radius: 8px !important;

        cursor: pointer !important;

        display: flex !important;

        align-items: center !important;

        justify-content: center !important;

        gap: 6px !important;

        transition: all 0.15s ease !important;

        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3) !important;
      }

      .lantern-next-btn:hover {

        background: #d97706 !important;

        transform: translateY(-1px) !important;
      }

      /* =====================================
         HIGHLIGHT
         ===================================== */

      #lantern-bright-highlight {

        position: fixed !important;

        box-sizing:
          border-box !important;

        border:
          4px solid #ffd000 !important;

        border-radius:
          9px !important;

        pointer-events:
          none !important;

        z-index:
          2147483646 !important;

        animation:
          lanternPulse 1s infinite !important;
      }

      @keyframes lanternPulse {

        0%, 100% {

          box-shadow:
            0 0 8px #ffd000,
            0 0 22px #ffd000,
            0 0 40px
            rgba(255,208,0,.75);

          opacity: .82;
        }

        50% {

          box-shadow:
            0 0 14px #ffd000,
            0 0 32px #ffd000,
            0 0 65px
            rgba(255,208,0,.95);

          opacity: 1;
        }
      }

      @keyframes lanternAppear {

        from {

          opacity: 0;

          transform:
            translateY(12px)
            scale(.98);
        }

        to {

          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }

      #lantern-guidance-message,
      #lantern-help-prompt {

        animation:
          lanternAppear
          .22s
          ease-out;
      }

    `;

    document.documentElement.appendChild(
      style
    );
  }

  // ==========================================================
  // BASIC HELPERS
  // ==========================================================

  function isVisible(element) {

    if (!element) {
      return false;
    }

    const rect =
      element.getBoundingClientRect();

    const style =
      window.getComputedStyle(
        element
      );

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
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  let attachmentModeActive = false;

  function getWorkflowSteps() {
    if (attachmentModeActive) {
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

  function getStep(key) {
    const steps = getWorkflowSteps();
    return steps.find(step => step.key === key) || steps[0];
  }

  // ==========================================================
  // CLEANUP
  // ==========================================================

  function stopWatcher() {

    if (
      typeof cleanupWatcher ===
      "function"
    ) {
      cleanupWatcher();
      cleanupWatcher = null;
    }
  }

  // ==========================================================
  // ELEMENT FINDERS
  // ==========================================================

  function findComposeButton() {
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

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    const buttons = document.querySelectorAll('div[role="button"], button');
    for (const element of buttons) {
      if (!isVisible(element)) continue;
      const text = (element.innerText || element.textContent || "").trim().replace(/\s+/g, " ").toLowerCase();
      if (text === "compose") {
        return element;
      }
    }

    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    for (const element of tooltipElements) {
      if (!isVisible(element)) continue;
      const tooltip = (element.getAttribute("data-tooltip") || "").trim().toLowerCase();
      if (tooltip === "compose") {
        return element;
      }
    }

    const ariaElements = document.querySelectorAll('[aria-label]');
    for (const element of ariaElements) {
      if (!isVisible(element)) continue;
      const aria = (element.getAttribute("aria-label") || "").trim().toLowerCase();
      if (aria === "compose" || aria.includes("compose")) {
        return element;
      }
    }

    return null;
  }

  function findRecipientField() {
    const selectors = [
      'input[aria-label="To recipients"]',
      'input[aria-label="To"]',
      'input[aria-label*="recipient" i]',
      'input[placeholder*="recipient" i]',
      'input[role="combobox"][aria-label*="recipient" i]',
      'input[role="combobox"][aria-label*="to" i]',
      'input.agP.aFw',
      'input[name="to"]:not([type="hidden"])',
      '[role="combobox"][aria-label*="recipient" i]',
      '[role="combobox"][aria-label*="to" i]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    const combos = document.querySelectorAll('[role="combobox"]');
    for (const element of combos) {
      if (!isVisible(element)) continue;
      const aria = (element.getAttribute("aria-label") || "").toLowerCase();
      if (aria.includes("recipient") || aria === "to" || aria.includes("to recipients")) {
        return element;
      }
    }

    return null;
  }

  function findSubjectField() {
    const selectors = [
      'input[name="subjectbox"]',
      'input[name="subject"]',
      'input[placeholder*="Subject" i]',
      'input[aria-label*="Subject" i]',
      'input.aoT'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    return null;
  }

  function findMessageField() {
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

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    const elements = document.querySelectorAll('[contenteditable="true"]');
    for (const element of elements) {
      if (!isVisible(element)) continue;
      const aria = (element.getAttribute("aria-label") || "").toLowerCase();
      if (aria.includes("recipient") || aria === "to" || aria.includes("subject")) {
        continue;
      }
      return element;
    }

    return null;
  }

  function findSendButton() {
    const selectors = [
      'div[role="button"][aria-label*="Send" i]:not([aria-label*="Schedule" i]):not([aria-label*="More" i])',
      'button[aria-label*="Send" i]:not([aria-label*="Schedule" i])',
      '[data-tooltip*="Send" i]:not([data-tooltip*="Schedule" i])',
      '[title*="Send" i]:not([title*="Schedule" i])',
      'div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3',
      'div[role="button"][aria-label="Send"]',
      'button[aria-label="Send"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    return null;
  }

  function isSubjectArea(target) {
    if (!target) return false;
    const field = findSubjectField();
    if (field && (target === field || field.contains(target))) {
      return true;
    }
    if (target.closest) {
      if (target.closest('input[name="subjectbox"], input[name="subject"], input.aoT, div.aoD.azl, div.a1.aoR')) {
        return true;
      }
      const parentRow = target.closest('tr, div[role="row"]');
      if (parentRow && parentRow.querySelector('input[name="subjectbox"], input[name="subject"], input.aoT')) {
        return true;
      }
    }
    return false;
  }

  function isMessageArea(target) {
    if (!target) return false;
    const field = findMessageField();
    if (field && (target === field || field.contains(target))) {
      return true;
    }
    if (target.closest) {
      if (target.closest('div[role="textbox"][aria-label*="Message" i], div.Am.Al.editable, div[contenteditable="true"], div.editable')) {
        return true;
      }
      if (target.closest('td.Ap, div.Ap, div.Ar.Au')) {
        return true;
      }
    }
    return false;
  }

  function isSendArea(target) {
    if (!target) return false;
    const button = findSendButton();
    if (button && (target === button || button.contains(target))) {
      return true;
    }
    if (target.closest) {
      if (target.closest('div[role="button"][aria-label*="Send" i], button[aria-label*="Send" i], .T-I-atl, [data-tooltip*="Send" i]')) {
        return true;
      }
    }
    return false;
  }

  function findAttachmentButton() {
    const selectors = [
      'div[command="Files"]',
      'div[aria-label*="Attach files" i]',
      'div[data-tooltip*="Attach files" i]',
      'div[title*="Attach files" i]',
      'div[aria-label*="Attach" i]:not([aria-label*="Schedule" i])',
      'button[aria-label*="Attach files" i]',
      'button[data-tooltip*="Attach files" i]',
      'div.a1.aaA.a3I',
      'div[role="button"][data-tooltip*="Attach" i]',
      'div.wG.fV'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (isVisible(element)) {
        return element;
      }
    }

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      const parentBtn = fileInput.closest('div[role="button"], button') || fileInput.parentElement;
      if (parentBtn && isVisible(parentBtn)) {
        return parentBtn;
      }
    }

    return null;
  }

  function isAttachmentArea(target) {
    if (!target) return false;
    const button = findAttachmentButton();
    if (button && (target === button || button.contains(target))) {
      return true;
    }
    if (target.closest) {
      if (target.closest('div[command="Files"], [aria-label*="Attach" i], [data-tooltip*="Attach" i], div.a1.aaA.a3I, input[type="file"]')) {
        return true;
      }
    }
    return false;
  }

  // ==========================================================
  // EMAIL EXTRACTION & VALIDATION
  // ==========================================================

  function isValidEmail(value) {
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  function extractEmailAddresses(text) {
    if (!text) return [];
    const matches = String(text).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi);
    if (!matches) return [];
    return matches.map(e => e.trim().toLowerCase());
  }

  function findComposeContainer() {
    const recipient = findRecipientField();
    if (recipient) {
      const dialog = recipient.closest('[role="dialog"], .M9, .AD');
      if (dialog) return dialog;
      return recipient.closest('table, form') || recipient.parentElement;
    }
    return document.querySelector('[role="dialog"], .M9, .AD') || document.body;
  }

  function findAcceptedRecipients() {
    const container = findComposeContainer() || document.body;
    const found = [];

    // Method 1: [email] attribute
    container.querySelectorAll("[email]").forEach(el => {
      const email = (el.getAttribute("email") || "").trim().toLowerCase();
      if (isValidEmail(email)) found.push(email);
    });

    // Method 2: data-hovercard-id
    container.querySelectorAll("[data-hovercard-id]").forEach(el => {
      const val = (el.getAttribute("data-hovercard-id") || "").trim().toLowerCase();
      if (isValidEmail(val)) found.push(val);
    });

    // Method 3: Chips, tokens, gridcells, options
    container.querySelectorAll('[role="gridcell"], [role="option"], [people-kit-token], .vR, .afV').forEach(el => {
      if (!isVisible(el)) return;
      const text = (el.innerText || el.textContent || "").trim();
      found.push(...extractEmailAddresses(text));
    });

    // Method 4: All input[name="to"] (hidden or visible)
    document.querySelectorAll('input[name="to"]').forEach(input => {
      if (input.value) {
        found.push(...extractEmailAddresses(input.value));
      }
    });

    // Method 5: Active recipient input field (typed or autofilled)
    const field = findRecipientField();
    if (field) {
      const val = (field.value || field.innerText || field.textContent || "").trim();
      if (val) {
        found.push(...extractEmailAddresses(val));
      }
    }

    // Method 6: Compose header area text
    const headerArea = container.querySelector('tr.hl, div.fX, [aria-label*="To"], [aria-label*="recipient" i]');
    if (headerArea) {
      found.push(...extractEmailAddresses(headerArea.innerText || headerArea.textContent || ""));
    }

    return [...new Set(found.filter(isValidEmail))];
  }

  function getRecipientValue() {
    const field = findRecipientField();
    if (!field) return "";
    return (field.value || field.innerText || field.textContent || "").trim();
  }

  // ==========================================================
  // COMPLETION CHECKS
  // ==========================================================

  function recipientComplete() {
    const accepted = findAcceptedRecipients();
    console.log("LANTERN: Accepted recipients:", accepted);
    const count = Math.max(1, requiredRecipientCount);
    return accepted.length >= count;
  }

  function subjectComplete() {
    const field = findSubjectField();
    if (!field) return false;
    return String(field.value || field.textContent || "").trim().length > 0;
  }

  function messageComplete() {
    const field = findMessageField();
    if (!field) return false;
    return String(field.innerText || field.textContent || field.value || "").trim().length > 0;
  }

  function composeOpen() {
    return Boolean(
      findRecipientField() ||
      findSubjectField() ||
      findMessageField()
    );
  }

  function getCurrentState() {
    if (!composeOpen()) {
      return "compose";
    }
    if (!recipientComplete()) {
      return "recipient";
    }
    if (!subjectComplete()) {
      return "subject";
    }
    if (!messageComplete()) {
      return "message";
    }
    if (attachmentModeActive) {
      return "attachment";
    }
    return "send";
  }

  // ==========================================================
  // HIGHLIGHT
  // ==========================================================

  let highlightTimeout = null;
  let activeHighlightedElement = null;

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
      .forEach(element => element.remove());

    activeHighlightedElement = null;
  }

  function highlightElement(element) {
    removeHighlight();

    if (!element || !isVisible(element)) {
      return;
    }

    activeHighlightedElement = element;

    const rect = element.getBoundingClientRect();
    const box = document.createElement("div");
    box.id = "lantern-bright-highlight";

    const pad = 6;
    box.style.position = "fixed";
    box.style.left = `${Math.max(0, rect.left - pad)}px`;
    box.style.top = `${Math.max(0, rect.top - pad)}px`;
    box.style.width = `${Math.max(36, rect.width + pad * 2)}px`;
    box.style.height = `${Math.max(28, rect.height + pad * 2)}px`;
    box.style.pointerEvents = "none";
    box.style.zIndex = "2147483646";

    document.documentElement.appendChild(box);
    highlightBox = box;
  }

  function repositionHighlight() {
    if (!highlightBox || !activeHighlightedElement || !document.contains(activeHighlightedElement)) {
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
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    } catch (_) {}

    // Highlight immediately without delay
    highlightElement(element);

    // Re-verify alignment once smooth scrolling has completed
    highlightTimeout = setTimeout(() => {
      if (document.contains(element)) {
        highlightElement(element);
      }
    }, 200);
  }

  window.addEventListener("scroll", repositionHighlight, { passive: true, capture: true });
  window.addEventListener("resize", repositionHighlight, { passive: true });

  // ==========================================================
  // PANEL
  // ==========================================================

  function removePanel() {
    if (guidancePanel) {
      guidancePanel.remove();
      guidancePanel = null;
    }

    document
      .querySelectorAll("#lantern-guidance-message")
      .forEach(element => element.remove());
  }

  function showPanel(stepKey, message, note) {
    removePanel();

    const steps = getWorkflowSteps();
    const step = getStep(stepKey);
    if (!step) {
      return;
    }

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

      <div class="lantern-toggle-row">
        <div class="lantern-toggle-info">
          <span class="lantern-toggle-icon">📎</span>
          <span class="lantern-toggle-text">Highlight attachment files</span>
        </div>
        <label class="lantern-switch" title="Toggle highlight for attachment files">
          <input
            id="lantern-attachment-toggle"
            type="checkbox"
            ${attachmentModeActive ? "checked" : ""}
          >
          <span class="lantern-slider"></span>
        </label>
      </div>

      ${
        stepKey === "recipient"
          ? `
            <div class="lantern-label">How many people should receive this email?</div>
            <div class="lantern-row">
              <input
                id="lantern-recipient-count"
                class="lantern-input"
                type="number"
                min="1"
                max="50"
                value="${requiredRecipientCount}"
              >
              <button
                id="lantern-recipient-set"
                class="lantern-primary"
                type="button"
              >
                Set
              </button>
            </div>
          `
          : ""
      }

      <div class="lantern-label">Need help with this step?</div>

      <div class="lantern-row">
        <input
          id="lantern-question"
          class="lantern-input"
          type="text"
          placeholder="Ask LANTERN..."
        >
        <button
          id="lantern-question-button"
          class="lantern-primary"
          type="button"
        >
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

      ${
        stepKey === "subject"
          ? `
            <button id="lantern-next-step" class="lantern-next-btn" type="button">
              Next: Body Section &#8594;
            </button>
          `
          : stepKey === "message"
          ? `
            <button id="lantern-next-step" class="lantern-next-btn" type="button">
              ${attachmentModeActive ? "Next: Attach Files &#8594;" : "Next: Send Button &#8594;"}
            </button>
          `
          : stepKey === "attachment"
          ? `
            <button id="lantern-next-step" class="lantern-next-btn" type="button">
              Next: Send Button &#8594;
            </button>
          `
          : ""
      }

      ${note ? `<div class="lantern-note">${escapeHtml(note)}</div>` : ""}
    `;

    document.body.appendChild(panel);
    guidancePanel = panel;

    // Attachment toggle switch
    const attachToggle = panel.querySelector("#lantern-attachment-toggle");
    attachToggle?.addEventListener("change", event => {
      event.stopPropagation();
      attachmentModeActive = attachToggle.checked;
      console.log("LANTERN: Attachment toggle changed:", attachmentModeActive);

      if (attachmentModeActive) {
        const attachBtn = findAttachmentButton();
        if (attachBtn) {
          scrollAndHighlight(attachBtn);
          updatePanelText("Attachment highlighted! Click the paperclip icon to select files.");
        } else {
          updatePanelText("Attachment mode ON. The paperclip icon will be highlighted in Compose.");
        }
      } else {
        guideStep(currentStep);
      }

      showPanel(currentStep, message, note);
    });

    // Next step button (Subject -> Body, or Message -> Attach/Send)
    const nextBtn = panel.querySelector("#lantern-next-step");
    nextBtn?.addEventListener("click", event => {
      event.stopPropagation();
      if (currentStep === "subject") {
        moveToMessage();
      } else if (currentStep === "message") {
        if (attachmentModeActive) {
          moveToAttachment();
        } else {
          moveToSend();
        }
      } else if (currentStep === "attachment") {
        moveToSend();
      }
    });

    // Question
    const questionInput = panel.querySelector("#lantern-question");
    const questionButton = panel.querySelector("#lantern-question-button");

    function askQuestion() {
      const question = (questionInput?.value || "").trim();
      if (!question) return;
      handleQuestion(question);
    }

    questionButton?.addEventListener("click", askQuestion);
    questionInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        askQuestion();
      }
    });

    // Voice
    panel.querySelector("#lantern-voice")?.addEventListener("click", () => {
      startVoice(questionInput);
    });

    // Explain again
    panel.querySelector("#lantern-again")?.addEventListener("click", () => {
      guideStep(currentStep);
    });

    // Recipient count configuration
    if (stepKey === "recipient") {
      const countInput = panel.querySelector("#lantern-recipient-count");
      const countButton = panel.querySelector("#lantern-recipient-set");

      const onCountChange = () => {
        if (countInput && countInput.value) {
          setRecipientCount(countInput.value);
        }
      };

      countButton?.addEventListener("click", onCountChange);
      countInput?.addEventListener("change", onCountChange);
      countInput?.addEventListener("input", onCountChange);
      countInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          onCountChange();
        }
      });
    }
  }

  function updatePanelText(message) {
    const element = guidancePanel?.querySelector(".lantern-description");
    if (element) {
      element.textContent = message;
    }
  }

  // ==========================================================
  // RECIPIENT COUNT CONFIGURATION
  // ==========================================================

  function setRecipientCount(value) {
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1) {
      updatePanelText("Please enter a valid number of recipients.");
      return;
    }

    requiredRecipientCount = count;
    recipientCountSet = true;
    console.log("LANTERN: Required recipients =", requiredRecipientCount);

    const accepted = findAcceptedRecipients();
    if (accepted.length >= requiredRecipientCount) {
      updatePanelText(`Target of ${count} recipient${count === 1 ? "" : "s"} reached! Moving to Subject...`);
      setTimeout(() => {
        if (guidanceActive && currentStep === "recipient") {
          moveToSubject();
        }
      }, 300);
      return;
    }

    updatePanelText(
      `Enter ${count} recipient${count === 1 ? "" : "s"} (${accepted.length} of ${count} added). Press Enter after each email.`
    );
  }

  let lastReportedRecipientCount = -1;
  function checkRecipientNow() {
    if (!guidanceActive || currentStep !== "recipient") {
      return;
    }

    const accepted = findAcceptedRecipients();

    const count = Math.max(1, requiredRecipientCount);

    if (accepted.length >= count) {
      moveToSubject();
      return;
    }

    if (count > 1 && accepted.length !== lastReportedRecipientCount) {
      lastReportedRecipientCount = accepted.length;
      updatePanelText(
        `Enter ${count} recipients (${accepted.length} of ${count} added). Add ${count - accepted.length} more.`
      );
    }
  }

  function commitRecipientInput() {
    const field = findRecipientField();
    if (field && field.value && field.value.trim().length > 0) {
      try {
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
        field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", code: "Tab", keyCode: 9, which: 9, bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        field.blur();
      } catch (_) {}
    }
  }

  // ==========================================================
  // NAVIGATION: MOVE TO NEXT COLUMNS
  // ==========================================================

  function moveToRecipient() {
    if (!guidanceActive) return;
    console.log("LANTERN: Moving to RECIPIENT");

    stopWatcher();
    removeHighlight();
    currentStep = "recipient";

    const thisSession = sessionId;
    setTimeout(() => {
      if (thisSession !== sessionId || !guidanceActive) return;
      guideRecipient();
    }, 250);
  }

  function moveToSubject() {
    if (!guidanceActive || currentStep !== "recipient") {
      return;
    }

    console.log("LANTERN: RECIPIENT COMPLETE -> Moving to SUBJECT");

    stopWatcher();
    commitRecipientInput();

    currentStep = "subject";
    guideSubject();
  }

  function moveToMessage() {
    if (!guidanceActive || currentStep !== "subject") {
      return;
    }

    console.log("LANTERN: SUBJECT COMPLETE -> Moving to MESSAGE BODY");

    stopWatcher();

    currentStep = "message";
    guideMessage();
  }

  function moveToAttachment() {
    if (!guidanceActive || currentStep !== "message") {
      return;
    }

    console.log("LANTERN: MESSAGE COMPLETE -> Moving to ATTACHMENT");

    stopWatcher();

    currentStep = "attachment";
    guideAttachment();
  }

  function moveToSend() {
    if (!guidanceActive || (currentStep !== "message" && currentStep !== "attachment")) {
      return;
    }

    console.log("LANTERN: Moving to SEND BUTTON");

    stopWatcher();

    currentStep = "send";
    guideSend();
  }

  // ==========================================================
  // WATCHERS
  // ==========================================================

  function watchRecipient() {
    stopWatcher();
    let stopped = false;
    lastReportedRecipientCount = -1;

    const check = () => {
      if (stopped || !guidanceActive || currentStep !== "recipient") {
        cleanup();
        return;
      }
      checkRecipientNow();
    };

    const interval = setInterval(check, 400);

    const field = findRecipientField();
    if (field) {
      field.addEventListener("input", check, true);
      field.addEventListener("change", check, true);
    }
    document.addEventListener("click", check, true);
    document.addEventListener("paste", () => setTimeout(check, 100), true);
    document.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === "Tab" || event.key === ",") {
        setTimeout(check, 100);
      }
    }, true);

    function cleanup() {
      if (stopped) return;
      stopped = true;
      clearInterval(interval);
      if (field) {
        field.removeEventListener("input", check, true);
        field.removeEventListener("change", check, true);
      }
      document.removeEventListener("click", check, true);
      if (cleanupWatcher === cleanup) {
        cleanupWatcher = null;
      }
    }

    cleanupWatcher = cleanup;
    check();
  }

  function watchSubject(field) {
    stopWatcher();
    let stopped = false;

    const tryAdvance = () => {
      if (stopped || !guidanceActive || currentStep !== "subject") return;
      cleanup();
      moveToMessage();
    };

    const handleClick = event => {
      if (stopped || !guidanceActive || currentStep !== "subject") return;

      // Only respond to primary (left) mouse clicks
      if (event.button !== 0 && event.button !== undefined) return;

      // Ignore clicks inside the LANTERN panel (panel buttons handle themselves)
      if (guidancePanel && guidancePanel.contains(event.target)) {
        return;
      }

      // DO NOT stop highlighting if the user clicks inside the Subject column!
      if (isSubjectArea(event.target)) {
        console.log("LANTERN: Click inside Subject column -> keep highlighting Subject");
        return;
      }

      console.log("LANTERN: Mouse click recognized outside Subject column:", event.target);

      // 1. If clicked directly into the message body area:
      if (isMessageArea(event.target)) {
        tryAdvance();
        return;
      }

      // 2. If subject has content and user clicked outside:
      if (subjectComplete()) {
        tryAdvance();
        return;
      }

      updatePanelText("Enter a subject, then click into the message body (or click Next) to continue.");
    };

    const handleInput = () => {
      if (stopped) return;
      if (subjectComplete()) {
        updatePanelText("Subject entered. Click into the message body area (or click Next) to continue.");
      }
    };

    // Keep highlight aligned with subject input
    const alignInterval = setInterval(() => {
      if (stopped) return;
      repositionHighlight();
    }, 150);

    field.addEventListener("input", handleInput, true);
    field.addEventListener("change", handleInput, true);
    document.addEventListener("click", handleClick, true);

    function cleanup() {
      if (stopped) return;
      stopped = true;
      clearInterval(alignInterval);
      field.removeEventListener("input", handleInput, true);
      field.removeEventListener("change", handleInput, true);
      document.removeEventListener("click", handleClick, true);
      if (cleanupWatcher === cleanup) cleanupWatcher = null;
    }

    cleanupWatcher = cleanup;
  }

  function watchMessage(field) {
    stopWatcher();
    let stopped = false;

    const tryAdvance = () => {
      if (stopped || !guidanceActive || currentStep !== "message") return;
      cleanup();
      if (attachmentModeActive) {
        moveToAttachment();
      } else {
        moveToSend();
      }
    };

    const handleClick = event => {
      if (stopped || !guidanceActive || currentStep !== "message") return;

      // Only respond to primary (left) mouse clicks
      if (event.button !== 0 && event.button !== undefined) return;

      // Ignore clicks inside the LANTERN panel (panel buttons handle themselves)
      if (guidancePanel && guidancePanel.contains(event.target)) {
        return;
      }

      // DO NOT stop highlighting if the user clicks inside the Body area!
      if (isMessageArea(event.target)) {
        console.log("LANTERN: Click inside Body area -> keep highlighting Body");
        return;
      }

      console.log("LANTERN: Mouse click recognized outside Body area:", event.target);

      // If user clicked directly on the Send button:
      if (isSendArea(event.target)) {
        cleanup();
        guidanceActive = false;
        removeHighlight();
        showCompletion();
        return;
      }

      // If user clicked directly on the Attach files button:
      if (isAttachmentArea(event.target)) {
        cleanup();
        attachmentModeActive = true;
        moveToAttachment();
        return;
      }

      // If message has content, move to next step:
      if (messageComplete()) {
        tryAdvance();
        return;
      }

      updatePanelText("Type your message, then click outside (or click Next) to continue.");
    };

    const handleInput = () => {
      if (stopped) return;
      if (messageComplete()) {
        updatePanelText("Message entered. Click outside the body (or click Next) to highlight the Send button.");
      }
    };

    // Keep highlight aligned as message body changes size
    const alignInterval = setInterval(() => {
      if (stopped) return;
      repositionHighlight();
    }, 150);

    field.addEventListener("input", handleInput, true);
    field.addEventListener("keyup", handleInput, true);
    document.addEventListener("click", handleClick, true);

    function cleanup() {
      if (stopped) return;
      stopped = true;
      clearInterval(alignInterval);
      field.removeEventListener("input", handleInput, true);
      field.removeEventListener("keyup", handleInput, true);
      document.removeEventListener("click", handleClick, true);
      if (cleanupWatcher === cleanup) cleanupWatcher = null;
    }

    cleanupWatcher = cleanup;
  }

  // ==========================================================
  // GUIDANCE FLOW
  // ==========================================================

  function startGuidance() {
    sessionId++;
    guidanceActive = true;
    currentStep = "compose";
    requiredRecipientCount = 1;
    recipientCountSet = false;
    stopWatcher();
    removeHighlight();

    if (composeOpen()) {
      guideStep(getCurrentState());
    } else {
      guideCompose();
    }
  }

  function guideStep(step) {
    if (!guidanceActive) return;
    stopWatcher();

    if (step === "compose") {
      guideCompose();
      return;
    }
    if (step === "recipient") {
      guideRecipient();
      return;
    }
    if (step === "subject") {
      guideSubject();
      return;
    }
    if (step === "message") {
      guideMessage();
      return;
    }
    if (step === "attachment") {
      guideAttachment();
      return;
    }
    if (step === "send") {
      guideSend();
      return;
    }
  }

  function guideCompose() {
    currentStep = "compose";

    if (composeOpen()) {
      console.log("LANTERN: Compose window already open.");
      removeHighlight();
      const state = getCurrentState();
      guideStep(state);
      return;
    }

    const compose = findComposeButton();
    if (compose) {
      console.log("LANTERN: Compose button found.");
      scrollAndHighlight(compose);
      showPanel(
        "compose",
        "Click Compose to start your email.",
        "LANTERN will continue automatically after you click it."
      );

      const thisSession = sessionId;
      const handler = () => {
        compose.removeEventListener("click", handler, true);
        removeHighlight();
        console.log("LANTERN: Compose clicked.");

        waitForElement(composeOpen, () => {
          if (thisSession !== sessionId || !guidanceActive) return;
          moveToRecipient();
        });
      };

      compose.addEventListener("click", handler, true);
      cleanupWatcher = () => {
        compose.removeEventListener("click", handler, true);
      };
      return;
    }

    showPanel(
      "compose",
      "I am looking for the Compose button.",
      "Please wait a moment. LANTERN will detect it automatically."
    );

    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(() => {
      if (!guidanceActive || currentStep !== "compose") {
        clearInterval(interval);
        return;
      }

      attempts++;
      const composeButton = findComposeButton();
      if (composeButton) {
        clearInterval(interval);
        removeHighlight();
        scrollAndHighlight(composeButton);
        showPanel(
          "compose",
          "Click Compose to start your email.",
          "LANTERN will continue automatically after you click it."
        );

        const thisSession = sessionId;
        const handler = () => {
          composeButton.removeEventListener("click", handler, true);
          removeHighlight();
          waitForElement(composeOpen, () => {
            if (thisSession !== sessionId || !guidanceActive) return;
            moveToRecipient();
          });
        };

        composeButton.addEventListener("click", handler, true);
        cleanupWatcher = () => {
          composeButton.removeEventListener("click", handler, true);
        };
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        updatePanelText("I still cannot find the Compose button. Please make sure Gmail is fully loaded.");
      }
    }, 500);

    cleanupWatcher = () => {
      clearInterval(interval);
    };
  }

  function guideRecipient() {
    currentStep = "recipient";

    const field = findRecipientField();
    if (!field) {
      showPanel(
        "recipient",
        "I am waiting for Gmail's recipient field.",
        "The field will be detected automatically."
      );
      cleanupWatcher = waitForElement(findRecipientField, () => guideRecipient());
      return;
    }

    // Auto-focus the Recipient field!
    try {
      field.focus();
    } catch (_) {}

    scrollAndHighlight(field);

    const count = Math.max(1, requiredRecipientCount);
    const accepted = findAcceptedRecipients();

    if (accepted.length >= count) {
      moveToSubject();
      return;
    }

    showPanel(
      "recipient",
      count === 1
        ? "Enter the recipient's email address and press Enter."
        : `Enter ${count} recipients (${accepted.length} of ${count} added).`,
      "First set how many people should receive this email."
    );

    watchRecipient();
  }

  function guideSubject() {
    currentStep = "subject";

    const field = findSubjectField();
    if (!field) {
      showPanel(
        "subject",
        "I am waiting for Gmail's Subject field.",
        "The field will be detected automatically."
      );
      cleanupWatcher = waitForElement(findSubjectField, () => guideSubject());
      return;
    }

    // Auto-focus the Subject field!
    try {
      field.focus();
    } catch (_) {}

    scrollAndHighlight(field);

    showPanel(
      "subject",
      "Enter a short subject for your email.",
      "LANTERN will wait and keep highlighting Subject until you click into the message body."
    );

    watchSubject(field);
  }

  function guideMessage() {
    currentStep = "message";

    const field = findMessageField();
    if (!field) {
      showPanel(
        "message",
        "I am waiting for Gmail's message box.",
        "The field will be detected automatically."
      );
      cleanupWatcher = waitForElement(findMessageField, () => guideMessage());
      return;
    }

    // Auto-focus only if the user hasn't already focused inside the body
    try {
      if (document.activeElement !== field && !field.contains(document.activeElement)) {
        field.focus();
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(field);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } catch (_) {}

    scrollAndHighlight(field);

    showPanel(
      "message",
      "Type the message you want to send.",
      "LANTERN will keep highlighting the body until you click to highlight the Send button."
    );

    watchMessage(field);
  }

  function guideAttachment() {
    currentStep = "attachment";

    const button = findAttachmentButton();
    if (!button) {
      showPanel(
        "attachment",
        "I am looking for Gmail's Attach files button.",
        "Please make sure the Compose window is open."
      );
      cleanupWatcher = waitForElement(findAttachmentButton, () => guideAttachment());
      return;
    }

    scrollAndHighlight(button);

    showPanel(
      "attachment",
      "Click the Attach files button to choose your file.",
      "After attaching your file, click Next: Send Button to proceed."
    );

    watchAttachment(button);
  }

  function watchAttachment(button) {
    stopWatcher();
    let stopped = false;

    const tryAdvance = () => {
      if (stopped || !guidanceActive || currentStep !== "attachment") return;
      cleanup();
      moveToSend();
    };

    const handleClick = event => {
      if (stopped || !guidanceActive || currentStep !== "attachment") return;
      if (event.button !== 0 && event.button !== undefined) return;
      if (guidancePanel && guidancePanel.contains(event.target)) return;

      // If user clicked Send directly:
      if (isSendArea(event.target)) {
        cleanup();
        guidanceActive = false;
        removeHighlight();
        showCompletion();
        return;
      }

      // If user clicked on the Attach files button itself:
      if (isAttachmentArea(event.target)) {
        updatePanelText("File chooser opened. Select your file, then click Next: Send Button when ready.");
        return;
      }
    };

    const alignInterval = setInterval(() => {
      if (stopped) return;
      repositionHighlight();
    }, 150);

    document.addEventListener("click", handleClick, true);

    function cleanup() {
      if (stopped) return;
      stopped = true;
      clearInterval(alignInterval);
      document.removeEventListener("click", handleClick, true);
      if (cleanupWatcher === cleanup) cleanupWatcher = null;
    }

    cleanupWatcher = cleanup;
  }

  function guideSend() {
    currentStep = "send";

    const button = findSendButton();
    if (!button) {
      showPanel(
        "send",
        "I could not find the Send button.",
        "Please make sure the Compose window is open."
      );
      cleanupWatcher = waitForElement(findSendButton, () => guideSend());
      return;
    }

    scrollAndHighlight(button);

    showPanel(
      "send",
      "Review your email and click Send when you are ready.",
      "LANTERN has highlighted the Send button."
    );

    const thisSession = sessionId;
    const handler = event => {
      if (!isSendArea(event.target)) {
        return;
      }
      document.removeEventListener("click", handler, true);
      if (thisSession !== sessionId) {
        return;
      }
      guidanceActive = false;
      removeHighlight();
      showCompletion();
    };

    document.addEventListener("click", handler, true);
    cleanupWatcher = () => {
      document.removeEventListener("click", handler, true);
    };
  }

  function showCompletion() {
    removePanel();

    const panel = document.createElement("div");
    panel.id = "lantern-guidance-message";
    panel.innerHTML = `
      <div class="lantern-header">
        <div class="lantern-brand">
          🔦 LANTERN
        </div>
        <div class="lantern-status">
          DONE
        </div>
      </div>
      <div class="lantern-title">
        Email sent
      </div>
      <div class="lantern-description">
        Your email has been sent successfully.
      </div>
    `;

    document.body.appendChild(panel);
    guidancePanel = panel;

    setTimeout(() => {
      if (guidancePanel === panel) {
        panel.remove();
        guidancePanel = null;
      }
    }, 4000);
  }

  // ==========================================================
  // WAIT FOR ELEMENT
  // ==========================================================

  function waitForElement(
    finder,
    complete
  ) {

    let stopped =
      false;

    const interval =
      setInterval(
        () => {

          if (
            stopped
          ) {
            return;
          }

          const element =
            finder();

          if (
            element
          ) {

            stopped =
              true;

            clearInterval(
              interval
            );

            complete();
          }

        },
        400
      );

    return () => {

      stopped =
        true;

      clearInterval(
        interval
      );
    };
  }

  // ==========================================================
  // WAIT FOR CONDITION
  // ==========================================================

  function waitForCondition(
    condition,
    complete
  ) {

    let stopped =
      false;

    const interval =
      setInterval(
        () => {

          if (
            stopped
          ) {
            return;
          }

          let result =
            false;

          try {

            result =
              Boolean(
                condition()
              );

          } catch (_) {

            result =
              false;
          }

          if (
            result
          ) {

            stopped =
              true;

            clearInterval(
              interval
            );

            complete();
          }

        },
        300
      );

    return () => {

      stopped =
        true;

      clearInterval(
        interval
      );
    };
  }

  // ==========================================================
  // QUESTION HANDLER
  // ==========================================================

  function handleQuestion(
    question
  ) {

    const text =
      question
        .toLowerCase()
        .trim();

    if (
      text.includes(
        "start again"
      ) ||
      text.includes(
        "from beginning"
      ) ||
      text.includes(
        "start from compose"
      )
    ) {

      startGuidance();

      return;
    }

    if (
      text.includes(
        "recipient"
      ) ||
      text.includes(
        "receiver"
      ) ||
      text.includes(
        "email address"
      )
    ) {

      guideRecipient();

      return;
    }

    if (
      text.includes(
        "subject"
      )
    ) {

      guideSubject();

      return;
    }

    if (
      text.includes(
        "message"
      ) ||
      text.includes(
        "body"
      )
    ) {

      guideMessage();

      return;
    }

    if (
      text.includes(
        "send"
      )
    ) {

      guideStep(
        getCurrentState()
      );

      return;
    }

    updatePanelText(
      "I will check your Gmail page and guide you to the next step."
    );

    setTimeout(
      () => {

        guideStep(
          getCurrentState()
        );

      },
      500
    );
  }

  // ==========================================================
  // VOICE
  // ==========================================================

  function startVoice(
    input
  ) {

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {

      updatePanelText(
        "Voice input is not available. Please type your request."
      );

      return;
    }

    const recognition =
      new Recognition();

    recognition.lang =
      "en-IN";

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognition.onstart =
      () => {

        updatePanelText(
          "Listening..."
        );
      };

    recognition.onresult =
      event => {

        const text =
          event.results[0][0]
            .transcript;

        if (
          input
        ) {

          input.value =
            text;
        }

        updatePanelText(
          `I heard: ${text}`
        );
      };

    recognition.onerror =
      () => {

        updatePanelText(
          "I could not hear you. Please type your request."
        );
      };

    try {

      recognition.start();

    } catch (error) {

      console.log(
        "LANTERN voice error:",
        error
      );
    }
  }

  // ==========================================================
  // HELP PROMPT
  // ==========================================================

  function showHelpPrompt() {

    if (
      document.getElementById(
        "lantern-help-prompt"
      )
    ) {

      return;
    }

    const popup =
      document.createElement(
        "div"
      );

    popup.id =
      "lantern-help-prompt";

    popup.innerHTML = `

      <div class="lantern-header">

        <div class="lantern-brand">

          🔦 LANTERN

        </div>

        <div class="lantern-status">

          READY

        </div>

      </div>

      <div class="lantern-description">

        It looks like you may need help.
        What would you like to do?

      </div>

      <div class="lantern-row">

        <input
          id="lantern-help-input"
          class="lantern-input"
          type="text"
          placeholder="What do you need?"
        >

        <button
          id="lantern-help-ask"
          class="lantern-primary"
          type="button"
        >
          Ask
        </button>

      </div>

      <div class="lantern-secondary-row">

        <button
          id="lantern-help-voice"
          class="lantern-secondary"
          type="button"
        >
          🎤 Voice
        </button>

        <button
          id="lantern-help-close"
          class="lantern-secondary"
          type="button"
        >
          Not now
        </button>

      </div>

    `;

    document.body.appendChild(
      popup
    );

    const input =
      popup.querySelector(
        "#lantern-help-input"
      );

    const ask =
      popup.querySelector(
        "#lantern-help-ask"
      );

    const voice =
      popup.querySelector(
        "#lantern-help-voice"
      );

    const close =
      popup.querySelector(
        "#lantern-help-close"
      );

    input?.focus();

    const submit =
      () => {

        const value =
          (
            input?.value ||
            ""
          ).trim();

        if (!value) {
          return;
        }

        popup.remove();

        handleRequirement(
          value
        );
      };

    ask?.addEventListener(
      "click",
      submit
    );

    input?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          submit();
        }

      }
    );

    voice?.addEventListener(
      "click",
      () =>
        startVoice(input)
    );

    close?.addEventListener(
      "click",
      () => {

        popup.remove();

        helpDismissed =
          true;
      }
    );
  }

  // ==========================================================
  // EMAIL INTENT
  // ==========================================================

  function isSendEmailRequest(
    text
  ) {

    const value =
      text.toLowerCase();

    return (

      value.includes(
        "send email"
      ) ||

      value.includes(
        "send an email"
      ) ||

      value.includes(
        "send mail"
      ) ||

      value.includes(
        "compose email"
      ) ||

      value.includes(
        "write email"
      ) ||

      value.includes(
        "write an email"
      ) ||

      value.includes(
        "email ayakkanam"
      ) ||

      value.includes(
        "mail ayakkanam"
      ) ||

      value.includes(
        "email ayakkan"
      ) ||

      value.includes(
        "mail ayakkan"
      ) ||

      value.includes(
        "ഇമെയിൽ അയക്കണം"
      ) ||

      value.includes(
        "ഇമെയിൽ അയയ്ക്കണം"
      ) ||

      value.includes(
        "എനിക്ക് ഒരു ഇമെയിൽ അയക്കണം"
      ) ||

      value.includes(
        "എനിക്ക് ഇമെയിൽ അയക്കണം"
      )

    );
  }

  // ==========================================================
  // REQUIREMENT
  // ==========================================================

  function handleRequirement(
    requirement
  ) {

    console.log(
      "LANTERN requirement:",
      requirement
    );

    if (
      isSendEmailRequest(
        requirement
      )
    ) {

      startGuidance();

      return;
    }

    const text =
      requirement
        .toLowerCase();

    if (
      text.includes("help") ||
      text.includes("stuck") ||
      text.includes("confused") ||
      text.includes("cannot") ||
      text.includes("can't")
    ) {

      startGuidance();

      return;
    }

    startGuidance();
  }

  // ==========================================================
  // DIFFICULTY DETECTION
  // ==========================================================

  function calculateDifficulty() {

    const clickScore =
      repeatedClicks >= 3
        ? (repeatedClicks - 2) * 3
        : 0;

    const scrollScore =
      scrollCount >= 10
        ? Math.floor(
            scrollCount / 5
          )
        : 0;

    difficultyScore =
      clickScore +
      scrollScore +
      inactivityScore;

    if (
      difficultyScore >=
        DIFFICULTY_THRESHOLD &&
      !helpPromptShown &&
      !helpDismissed &&
      !guidanceActive
    ) {

      helpPromptShown =
        true;

      showHelpPrompt();
    }
  }

  // ==========================================================
  // CLICK DETECTION
  // ==========================================================

  document.addEventListener(
    "click",
    event => {

      lastActivity =
        Date.now();

      // Ignore LANTERN UI.

      if (
        event.target.closest?.(
          "#lantern-guidance-message, #lantern-help-prompt"
        )
      ) {

        return;
      }

      if (
        event.target ===
        lastClickedElement
      ) {

        repeatedClicks++;

      } else {

        repeatedClicks =
          1;

        lastClickedElement =
          event.target;
      }

      calculateDifficulty();

    },
    true
  );

  // ==========================================================
  // SCROLL DETECTION
  // ==========================================================

  window.addEventListener(
    "scroll",
    () => {

      lastActivity =
        Date.now();

      scrollCount++;

      calculateDifficulty();

    },
    true
  );

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  document.addEventListener(
    "keydown",
    event => {

      lastActivity =
        Date.now();

      // ----------------------------------------
      // MANUAL TEST / HIDDEN TRIGGER
      // Alt + Shift + L
      // ----------------------------------------

      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "l"
      ) {

        event.preventDefault();

        showHelpPrompt();
      }

      calculateDifficulty();

    },
    true
  );

  // ==========================================================
  // INACTIVITY
  // ==========================================================

  setInterval(
    () => {

      const inactive =
        Date.now() -
        lastActivity;

      if (
        inactive >= 30000 &&
        !inactivityDetected
      ) {

        inactivityDetected =
          true;

        inactivityScore +=
          10;

        calculateDifficulty();
      }

      if (
        inactive < 30000
      ) {

        inactivityDetected =
          false;
      }

    },
    10000
  );

  // ==========================================================
  // GMAIL DOM MONITOR
  // ==========================================================

  let composeClosedCount = 0;
  setInterval(() => {
    if (!guidanceActive || currentStep === "compose") {
      composeClosedCount = 0;
      return;
    }

    if (!composeOpen()) {
      composeClosedCount++;
      // Require 2 consecutive checks (approx 3 seconds) to confirm compose is actually closed
      if (composeClosedCount >= 2) {
        composeClosedCount = 0;
        if (currentStep === "send") {
          console.log("LANTERN: Compose window closed on send step -> Email sent.");
          guidanceActive = false;
          removeHighlight();
          showCompletion();
          return;
        }
        console.log("LANTERN: Compose window closed, resetting to compose step.");
        startGuidance();
      }
    } else {
      composeClosedCount = 0;
    }
  }, 1500);

  // ==========================================================
  // INITIALIZE
  // ==========================================================

  addStyles();

  console.log(
    "LANTERN: Gmail assistant ready."
  );

  console.log(
    "LANTERN: Press Alt + Shift + L to manually test."
  );

})();