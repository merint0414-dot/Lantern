// ============================================================
// LANTERN - KSEB ELECTRICITY BILL PAYMENT ADAPTER
// Kerala State Electricity Board Limited Quick Pay workflow
// ============================================================

(() => {
  "use strict";

  const ksebAdapter = {
    id: "kseb",
    name: "KSEB Bill Payment",
    serviceName: "KSEB Electricity Payment",
    routePrefix: "/kseb",

    matches(location) {
      if (!location) return false;
      const path = location.pathname || "";
      return path === "/kseb" || path.startsWith("/kseb/");
    },

    steps: [
      // STEP 1: Consumer Number
      {
        id: "kseb-consumer-number",
        stepNumber: 1,
        totalSteps: 7,
        label: "Consumer Number",
        instruction: "Enter your KSEB consumer number.",
        instructionMl: "നിങ്ങളുടെ 13 അക്ക കെ.എസ്.ഇ.ബി ഉപഭോക്തൃ നമ്പർ നൽകുക.",
        selector: "#kseb-consumer-number",
        getElement() {
          return document.getElementById("kseb-consumer-number") || document.querySelector('[data-lantern-action="enter-consumer-number"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.replace(/\D/g, "").length >= 10);
        }
      },

      // STEP 2: View Bill
      {
        id: "kseb-view-bill",
        stepNumber: 2,
        totalSteps: 7,
        label: "View Bill",
        instruction: "Click View Bill to retrieve the demo bill.",
        instructionMl: "നിങ്ങളുടെ കറന്റ് ബിൽ കാണാൻ View Bill ക്ലിക്ക് ചെയ്യുക.",
        selector: "#kseb-view-bill",
        getElement() {
          return document.getElementById("kseb-view-bill") || document.querySelector('[data-lantern-action="view-bill"]');
        },
        isComplete() {
          return Boolean(
            document.getElementById("kseb-bill-details") ||
            document.getElementById("kseb-proceed-payment") ||
            document.querySelector(".portal-bill-wrapper")
          );
        }
      },

      // STEP 3: Bill Details
      {
        id: "kseb-bill-details",
        stepNumber: 3,
        totalSteps: 7,
        label: "Bill Details",
        instruction: "Review your electricity bill details.",
        instructionMl: "വൈദ്യുതി ബിൽ വിവരങ്ങളും യൂണിറ്റ് തുകകളും പരിശോധിക്കുക.",
        selector: "#kseb-bill-details",
        getElement() {
          return (
            document.getElementById("kseb-bill-details") ||
            document.querySelector(".portal-bill-wrapper") ||
            document.querySelector(".bill-breakdown-section")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("kseb-proceed-payment") ||
            document.getElementById("kseb-payment-method")
          );
        }
      },

      // STEP 4: Proceed to Payment
      {
        id: "kseb-proceed-payment",
        stepNumber: 4,
        totalSteps: 7,
        label: "Proceed to Payment",
        instruction: "Click Proceed to Payment to continue.",
        instructionMl: "പേയ്‌മെന്റിലേക്ക് കടക്കാൻ Proceed to Payment ക്ലിക്ക് ചെയ്യുക.",
        selector: "#kseb-proceed-payment",
        getElement() {
          return (
            document.getElementById("kseb-proceed-payment") ||
            document.querySelector(".btn-proceed-large")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("kseb-payment-method") ||
            document.querySelector(".payment-demo-card") ||
            document.getElementById("kseb-pay")
          );
        }
      },

      // STEP 5: Payment Method
      {
        id: "kseb-payment-method",
        stepNumber: 5,
        totalSteps: 7,
        label: "Payment Method",
        instruction: "Choose a payment method.",
        instructionMl: "പേയ്‌മെന്റ് മാർഗ്ഗം തിരഞ്ഞെടുക്കുക (UPI, Debit Card, Net Banking).",
        selector: "#kseb-payment-method",
        getElement() {
          return (
            document.getElementById("kseb-payment-method") ||
            document.querySelector(".payment-methods-grid")
          );
        },
        isComplete() {
          const upi = document.getElementById("kseb-upi-id");
          if (upi && upi.value.includes("@")) return true;
          const card = document.getElementById("kseb-card-number");
          if (card && card.value.replace(/\D/g, "").length >= 12) return true;
          const bank = document.getElementById("kseb-bank-select");
          if (bank && bank.value) return true;
          return false;
        }
      },

      // STEP 6: Payment Action (SAFETY: NEVER AUTO-CLICK)
      {
        id: "kseb-pay",
        stepNumber: 6,
        totalSteps: 7,
        label: "Make Payment",
        instruction: "Review the demo payment details and choose whether to continue.",
        instructionMl: "ഡെമോ ബിൽ തുക പരിശോധിച്ച് ബിൽ അടയ്ക്കാൻ Pay ക്ലിക്ക് ചെയ്യുക.",
        isFinalPayment: true,
        selector: "#kseb-pay",
        getElement() {
          return (
            document.getElementById("kseb-pay") ||
            document.querySelector(".btn-primary-pay")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("kseb-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        }
      },

      // STEP 7: Confirmation / Receipt
      {
        id: "kseb-confirmation",
        stepNumber: 7,
        totalSteps: 7,
        label: "Payment Confirmation",
        instruction: "Your demo electricity bill payment is complete.",
        instructionMl: "നിങ്ങളുടെ കെ.എസ്.ഇ.ബി വൈദ്യുതി ബിൽ പേയ്‌മെന്റ് വിജയകരമായി പൂർത്തിയായി.",
        selector: "#kseb-confirmation",
        getElement() {
          return (
            document.getElementById("kseb-confirmation") ||
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
    window.LANTERN_ADAPTERS.kseb = ksebAdapter;
  }
})();
