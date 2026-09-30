// ============================================================
// LANTERN - BHARATGAS LPG BOOKING ADAPTER
// Bharat Petroleum Corporation Limited LPG refill workflow
// ============================================================

(() => {
  "use strict";

  const bharatgasAdapter = {
    id: "bharatgas",
    name: "Bharatgas LPG Booking",
    serviceName: "Bharatgas Refill Booking",
    routePrefix: "/bharatgas",

    matches(location) {
      if (!location) return false;
      const path = location.pathname || "";
      return path === "/bharatgas" || path.startsWith("/bharatgas/");
    },

    steps: [
      // STEP 1: Consumer Number
      {
        id: "bharatgas-consumer-number",
        stepNumber: 1,
        totalSteps: 10,
        label: "Consumer Number",
        instruction: "Enter your consumer number.",
        instructionMl: "നിങ്ങളുടെ ഭാരത് ഗ്യാസ് ഉപഭോക്തൃ നമ്പർ നൽകുക.",
        selector: "#bharatgas-consumer-number",
        getElement() {
          return document.getElementById("bharatgas-consumer-number") || document.querySelector('[data-lantern-action="enter-consumer-number"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim().length >= 6);
        }
      },

      // STEP 2: Mobile Number
      {
        id: "bharatgas-mobile",
        stepNumber: 2,
        totalSteps: 10,
        label: "Mobile Number",
        instruction: "Enter your registered mobile number.",
        instructionMl: "നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ നൽകുക.",
        selector: "#bharatgas-mobile",
        getElement() {
          return document.getElementById("bharatgas-mobile") || document.querySelector('[data-lantern-action="enter-mobile-number"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.replace(/\D/g, "").length === 10);
        }
      },

      // STEP 3: Continue / Verify
      {
        id: "bharatgas-continue",
        stepNumber: 3,
        totalSteps: 10,
        label: "Verify Consumer",
        instruction: "Click Verify & Continue to retrieve your LPG account.",
        instructionMl: "അക്കൗണ്ട് വിവരങ്ങൾ പരിശോധിക്കാൻ Verify & Continue ക്ലിക്ക് ചെയ്യുക.",
        selector: "#bharatgas-continue",
        getElement() {
          return document.getElementById("bharatgas-continue") || document.querySelector('[data-lantern-action="verify-consumer"]');
        },
        isComplete() {
          return Boolean(
            document.getElementById("bharatgas-cylinder-type") ||
            document.getElementById("bharatgas-proceed-payment") ||
            document.querySelector(".portal-review-wrapper")
          );
        }
      },

      // STEP 4: Cylinder Type
      {
        id: "bharatgas-cylinder-type",
        stepNumber: 4,
        totalSteps: 10,
        label: "Cylinder Type",
        instruction: "Select your cylinder type.",
        instructionMl: "ആവശ്യമായ സിലിണ്ടർ തരം തിരഞ്ഞെടുക്കുക.",
        selector: "#bharatgas-cylinder-type",
        getElement() {
          return document.getElementById("bharatgas-cylinder-type") || document.querySelector('[data-lantern-action="select-cylinder-type"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 5: Quantity
      {
        id: "bharatgas-quantity",
        stepNumber: 5,
        totalSteps: 10,
        label: "Quantity",
        instruction: "Select the cylinder quantity.",
        instructionMl: "സിലിണ്ടറുകളുടെ എണ്ണം തിരഞ്ഞെടുക്കുക.",
        selector: "#bharatgas-quantity",
        getElement() {
          return document.getElementById("bharatgas-quantity") || document.querySelector('[data-lantern-action="select-quantity"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && Number(el.value) >= 1);
        }
      },

      // STEP 6: Delivery Address
      {
        id: "bharatgas-address",
        stepNumber: 6,
        totalSteps: 10,
        label: "Delivery Address",
        instruction: "Verify or enter your delivery address.",
        instructionMl: "നിങ്ങളുടെ ഡെലിവറി വിലാസം സ്ഥിരീകരിക്കുക.",
        selector: "#bharatgas-address",
        getElement() {
          const addr = document.getElementById("bharatgas-address");
          if (addr && addr.value.trim().length >= 10) {
            const submitBtn = document.querySelector('[data-lantern-action="submit-cylinder-order"]');
            if (submitBtn) return submitBtn;
          }
          return addr || document.querySelector('[data-lantern-action="enter-delivery-address"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim().length >= 10);
        }
      },

      // STEP 7: Review Booking & Proceed
      {
        id: "bharatgas-proceed-payment",
        stepNumber: 7,
        totalSteps: 10,
        label: "Review Order",
        instruction: "Review your LPG booking and continue to payment.",
        instructionMl: "ഓർഡർ വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റിലേക്ക് പോകുക.",
        selector: "#bharatgas-proceed-payment",
        getElement() {
          const reviewBtn = document.getElementById("bharatgas-proceed-payment");
          if (reviewBtn) return reviewBtn;
          const submitOrderBtn = document.querySelector('[data-lantern-action="submit-cylinder-order"]');
          if (submitOrderBtn) return submitOrderBtn;
          return document.querySelector(".btn-proceed-large");
        },
        isComplete() {
          return Boolean(
            document.getElementById("bharatgas-payment-method") ||
            document.querySelector(".payment-demo-card") ||
            document.getElementById("bharatgas-pay")
          );
        }
      },

      // STEP 8: Payment Method
      {
        id: "bharatgas-payment-method",
        stepNumber: 8,
        totalSteps: 10,
        label: "Payment Method",
        instruction: "Choose a payment method.",
        instructionMl: "പേയ്‌മെന്റ് മാർഗ്ഗം തിരഞ്ഞെടുക്കുക (UPI, Debit Card, Net Banking).",
        selector: "#bharatgas-payment-method",
        getElement() {
          return (
            document.getElementById("bharatgas-payment-method") ||
            document.querySelector(".payment-methods-grid")
          );
        },
        isComplete() {
          const upi = document.getElementById("bharatgas-upi-id");
          if (upi && upi.value.includes("@")) return true;
          const card = document.getElementById("bharatgas-card-number");
          if (card && card.value.replace(/\D/g, "").length >= 12) return true;
          const bank = document.getElementById("bharatgas-bank-select");
          if (bank && bank.value) return true;
          return false;
        }
      },

      // STEP 9: Payment Action (SAFETY: NEVER AUTO-CLICK)
      {
        id: "bharatgas-pay",
        stepNumber: 9,
        totalSteps: 10,
        label: "Make Payment",
        instruction: "Review the demo payment details and choose whether to continue.",
        instructionMl: "ഡെമോ പേയ്‌മെന്റ് പരിശോധിച്ച് ഓർഡർ പൂർത്തിയാക്കാൻ Pay ക്ലിക്ക് ചെയ്യുക.",
        isFinalPayment: true,
        selector: "#bharatgas-pay",
        getElement() {
          return (
            document.getElementById("bharatgas-pay") ||
            document.querySelector(".btn-primary-pay")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("bharatgas-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        }
      },

      // STEP 10: Confirmation
      {
        id: "bharatgas-confirmation",
        stepNumber: 10,
        totalSteps: 10,
        label: "Booking Confirmation",
        instruction: "Your demo booking is complete.",
        instructionMl: "നിങ്ങളുടെ ഭാരത് ഗ്യാസ് സിലിണ്ടർ ബുക്കിംഗ് വിജയകരമായി പൂർത്തിയായി.",
        selector: "#bharatgas-confirmation",
        getElement() {
          return (
            document.getElementById("bharatgas-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        },
        isComplete() {
          return false; // Terminal step
        }
      }
    ]
  };

  // Register into global LANTERN adapters registry
  if (typeof window !== "undefined") {
    window.LANTERN_ADAPTERS = window.LANTERN_ADAPTERS || {};
    window.LANTERN_ADAPTERS.bharatgas = bharatgasAdapter;
  }
})();
