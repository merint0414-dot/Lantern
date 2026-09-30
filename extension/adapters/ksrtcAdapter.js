// ============================================================
// LANTERN - KSRTC BUS BOOKING ADAPTER
// Official Kerala State Road Transport Corporation workflow
// ============================================================

(() => {
  "use strict";

  const ksrtcAdapter = {
    id: "ksrtc",
    name: "KSRTC Bus Booking",
    serviceName: "KSRTC Bus Booking",
    routePrefix: "/ksrtc",

    matches(location) {
      if (!location) return false;
      const path = location.pathname || "";
      return path === "/ksrtc" || path.startsWith("/ksrtc/");
    },

    steps: [
      // STEP 1: Departure Location
      {
        id: "ksrtc-from",
        stepNumber: 1,
        totalSteps: 15,
        label: "Departure Location",
        instruction: "Enter your departure location.",
        instructionMl: "നിങ്ങളുടെ പുറപ്പെടുന്ന സ്ഥലം തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-from",
        getElement() {
          return document.getElementById("ksrtc-from") || document.querySelector('[data-lantern-action="enter-from"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 2: Destination
      {
        id: "ksrtc-to",
        stepNumber: 2,
        totalSteps: 15,
        label: "Destination",
        instruction: "Enter your destination.",
        instructionMl: "നിങ്ങളുടെ ലക്ഷ്യസ്ഥാനം തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-to",
        getElement() {
          return document.getElementById("ksrtc-to") || document.querySelector('[data-lantern-action="enter-to"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 3: Journey Date
      {
        id: "ksrtc-date",
        stepNumber: 3,
        totalSteps: 15,
        label: "Journey Date",
        instruction: "Select your journey date.",
        instructionMl: "യാത്രാ തീയതി തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-date",
        getElement() {
          return document.getElementById("ksrtc-date") || document.querySelector('[data-lantern-action="select-date"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 4: Passengers
      {
        id: "ksrtc-passengers",
        stepNumber: 4,
        totalSteps: 15,
        label: "Passengers",
        instruction: "Select the number of passengers.",
        instructionMl: "യാത്രക്കാരുടെ എണ്ണം തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-passengers",
        getElement() {
          return document.getElementById("ksrtc-passengers") || document.querySelector('[data-lantern-action="select-passengers"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && Number(el.value) >= 1);
        }
      },

      // STEP 5: Search Buses
      {
        id: "ksrtc-search",
        stepNumber: 5,
        totalSteps: 15,
        label: "Search Buses",
        instruction: "Click Search Buses to find available buses.",
        instructionMl: "ലഭ്യമായ ബസുകൾ കണ്ടെത്താൻ Search Buses ക്ലിക്ക് ചെയ്യുക.",
        selector: "#ksrtc-search",
        getElement() {
          return document.getElementById("ksrtc-search") || document.querySelector('[data-lantern-action="search-bus"]');
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-select-bus") ||
            document.querySelector(".bus-results-list") ||
            document.querySelector(".btn-select-bus")
          );
        }
      },

      // STEP 6: Select Bus
      {
        id: "ksrtc-select-bus",
        stepNumber: 6,
        totalSteps: 15,
        label: "Select Bus",
        instruction: "Choose a bus from the available results.",
        instructionMl: "ലഭ്യമായ ലിസ്റ്റിൽ നിന്ന് നിങ്ങളുടെ ബസ് തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-select-bus, .btn-select-bus",
        getElement() {
          return (
            document.getElementById("ksrtc-select-bus") ||
            document.querySelector(".btn-select-bus") ||
            document.querySelector('[data-lantern-action="select-bus"]')
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-seat-selection") ||
            document.querySelector(".portal-seat-wrapper") ||
            document.querySelector(".seat-selection-container")
          );
        }
      },

      // STEP 7: Seat Selection
      {
        id: "ksrtc-seat-selection",
        stepNumber: 7,
        totalSteps: 15,
        label: "Seat Selection",
        instruction: "Select your preferred available seat.",
        instructionMl: "നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ട സീറ്റ് തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-seat-selection",
        getElement() {
          const selected = document.querySelector(".seat-btn.seat-selected");
          const confirmBtn = document.querySelector('[data-lantern-action="confirm-seats"]');
          if (selected && confirmBtn && !confirmBtn.disabled) {
            return confirmBtn;
          }
          return (
            document.querySelector(".seat-btn.seat-available") ||
            document.getElementById("ksrtc-seat-selection") ||
            document.querySelector(".portal-seat-wrapper")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-passenger-name") ||
            document.querySelector(".passenger-form-card") ||
            document.getElementById("ksrtc-proceed-payment")
          );
        }
      },

      // STEP 8: Passenger Name
      {
        id: "ksrtc-passenger-name",
        stepNumber: 8,
        totalSteps: 15,
        label: "Passenger Name",
        instruction: "Enter the passenger name.",
        instructionMl: "യാത്രക്കാരന്റെ പേര് നൽകുക.",
        selector: "#ksrtc-passenger-name",
        getElement() {
          return document.getElementById("ksrtc-passenger-name") || document.querySelector('[data-lantern-action="enter-passenger-name"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim().length >= 3);
        }
      },

      // STEP 9: Passenger Age
      {
        id: "ksrtc-passenger-age",
        stepNumber: 9,
        totalSteps: 15,
        label: "Passenger Age",
        instruction: "Enter the passenger age.",
        instructionMl: "യാത്രക്കാരന്റെ പ്രായം നൽകുക.",
        selector: "#ksrtc-passenger-age",
        getElement() {
          return document.getElementById("ksrtc-passenger-age") || document.querySelector('[data-lantern-action="enter-passenger-age"]');
        },
        isComplete(el) {
          if (!el) return false;
          const age = parseInt(el.value, 10);
          return Boolean(!isNaN(age) && age >= 1 && age <= 115);
        }
      },

      // STEP 10: Passenger Gender
      {
        id: "ksrtc-passenger-gender",
        stepNumber: 10,
        totalSteps: 15,
        label: "Passenger Gender",
        instruction: "Select the passenger gender.",
        instructionMl: "യാത്രക്കാരന്റെ ലിംഗഭേദം തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-passenger-gender",
        getElement() {
          return document.getElementById("ksrtc-passenger-gender") || document.querySelector('[data-lantern-action="select-passenger-gender"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 11: Passenger Mobile
      {
        id: "ksrtc-passenger-mobile",
        stepNumber: 11,
        totalSteps: 15,
        label: "Passenger Mobile",
        instruction: "Enter the passenger mobile number.",
        instructionMl: "ബന്ധപ്പെടാനുള്ള മൊബൈൽ നമ്പർ നൽകുക.",
        selector: "#ksrtc-passenger-mobile",
        getElement() {
          const mobileInput = document.getElementById("ksrtc-passenger-mobile");
          if (mobileInput && mobileInput.value.replace(/\D/g, "").length === 10) {
            const submitBtn = document.querySelector('[data-lantern-action="submit-passenger-details"]');
            if (submitBtn) return submitBtn;
          }
          return mobileInput || document.querySelector('[data-lantern-action="enter-passenger-mobile"]');
        },
        isComplete(el) {
          if (!el) return false;
          const clean = (el.value || "").replace(/\D/g, "");
          return clean.length === 10;
        }
      },

      // STEP 12: Review Booking & Proceed
      {
        id: "ksrtc-proceed-payment",
        stepNumber: 12,
        totalSteps: 15,
        label: "Review Booking",
        instruction: "Review your booking and continue to payment.",
        instructionMl: "ബുക്കിംഗ് വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റിലേക്ക് പോകുക.",
        selector: "#ksrtc-proceed-payment",
        getElement() {
          return (
            document.getElementById("ksrtc-proceed-payment") ||
            document.querySelector('[data-lantern-action="submit-passenger-details"]') ||
            document.querySelector(".btn-proceed-large")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-payment-method") ||
            document.querySelector(".payment-demo-card") ||
            document.getElementById("ksrtc-pay")
          );
        }
      },

      // STEP 13: Payment Method
      {
        id: "ksrtc-payment-method",
        stepNumber: 13,
        totalSteps: 15,
        label: "Payment Method",
        instruction: "Choose a payment method.",
        instructionMl: "ഒരു പേയ്‌മെന്റ് മാർഗ്ഗം തിരഞ്ഞെടുക്കുക (UPI, Debit Card, Net Banking).",
        selector: "#ksrtc-payment-method",
        getElement() {
          return (
            document.getElementById("ksrtc-payment-method") ||
            document.querySelector(".payment-methods-grid")
          );
        },
        isComplete() {
          // Complete if payment details are typed in or selected
          const upi = document.getElementById("ksrtc-upi-id");
          if (upi && upi.value.includes("@")) return true;
          const card = document.getElementById("ksrtc-card-number");
          if (card && card.value.replace(/\D/g, "").length >= 12) return true;
          const bank = document.getElementById("ksrtc-bank-select");
          if (bank && bank.value) return true;
          return false;
        }
      },

      // STEP 14: Payment Action (SAFETY: NEVER AUTO-CLICK)
      {
        id: "ksrtc-pay",
        stepNumber: 14,
        totalSteps: 15,
        label: "Make Payment",
        instruction: "Review the demo payment details and choose whether to continue.",
        instructionMl: "ഡെമോ പേയ്‌മെന്റ് വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റ് പൂർത്തിയാക്കാൻ ക്ലിക്ക് ചെയ്യുക.",
        isFinalPayment: true,
        selector: "#ksrtc-pay",
        getElement() {
          return (
            document.getElementById("ksrtc-pay") ||
            document.querySelector(".btn-primary-pay")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        }
      },

      // STEP 15: Confirmation
      {
        id: "ksrtc-confirmation",
        stepNumber: 15,
        totalSteps: 15,
        label: "Booking Confirmation",
        instruction: "Your demo booking is complete.",
        instructionMl: "നിങ്ങളുടെ ഡെമോ ബുക്കിംഗ് വിജയകരമായി പൂർത്തിയായി.",
        selector: "#ksrtc-confirmation",
        getElement() {
          return (
            document.getElementById("ksrtc-confirmation") ||
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
    window.LANTERN_ADAPTERS.ksrtc = ksrtcAdapter;
  }
})();
