// ============================================================
// LANTERN - IRCTC RAILWAY BOOKING ADAPTER
// Indian Railway Catering and Tourism Corporation workflow
// ============================================================

(() => {
  "use strict";

  const irctcAdapter = {
    id: "irctc",
    name: "IRCTC Railway Booking",
    serviceName: "IRCTC Train Booking",
    routePrefix: "/irctc",

    matches(location) {
      if (!location) return false;
      const path = location.pathname || "";
      return path === "/irctc" || path.startsWith("/irctc/");
    },

    steps: [
      // STEP 1: Departure Station
      {
        id: "irctc-from",
        stepNumber: 1,
        totalSteps: 15,
        label: "From Station",
        instruction: "Select your departure railway station.",
        instructionMl: "പുറപ്പെടുന്ന റെയിൽവേ സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-from",
        getElement() {
          return document.getElementById("irctc-from") || document.querySelector('[data-lantern-action="enter-from-station"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 2: Destination Station
      {
        id: "irctc-to",
        stepNumber: 2,
        totalSteps: 15,
        label: "To Station",
        instruction: "Select your destination railway station.",
        instructionMl: "എത്തിച്ചേരേണ്ട റെയിൽവേ സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-to",
        getElement() {
          return document.getElementById("irctc-to") || document.querySelector('[data-lantern-action="enter-to-station"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 3: Journey Date
      {
        id: "irctc-date",
        stepNumber: 3,
        totalSteps: 15,
        label: "Journey Date",
        instruction: "Select your journey date.",
        instructionMl: "യാത്രാ തീയതി തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-date",
        getElement() {
          return document.getElementById("irctc-date") || document.querySelector('[data-lantern-action="select-journey-date"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 4: Journey Class
      {
        id: "irctc-class",
        stepNumber: 4,
        totalSteps: 15,
        label: "Journey Class",
        instruction: "Choose your travel class (e.g. 3A, 2A, SL).",
        instructionMl: "നിങ്ങളുടെ യാത്രാ ക്ലാസ് തിരഞ്ഞെടുക്കുക (3A, 2A, SL).",
        selector: "#irctc-class",
        getElement() {
          return document.getElementById("irctc-class") || document.querySelector('[data-lantern-action="select-travel-class"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 5: Passengers Count
      {
        id: "irctc-passengers",
        stepNumber: 5,
        totalSteps: 15,
        label: "Passengers",
        instruction: "Select the number of passengers.",
        instructionMl: "യാത്രക്കാരുടെ എണ്ണം തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-passengers",
        getElement() {
          return document.getElementById("irctc-passengers") || document.querySelector('[data-lantern-action="select-passenger-count"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && Number(el.value) >= 1);
        }
      },

      // STEP 6: Search Trains
      {
        id: "irctc-search",
        stepNumber: 6,
        totalSteps: 15,
        label: "Search Trains",
        instruction: "Click Search Trains to find available trains.",
        instructionMl: "ലഭ്യമായ ട്രെയിനുകൾ കണ്ടെത്താൻ Search Trains ക്ലിക്ക് ചെയ്യുക.",
        selector: "#irctc-search",
        getElement() {
          return document.getElementById("irctc-search") || document.querySelector('[data-lantern-action="search-trains"]');
        },
        isComplete() {
          return Boolean(
            document.getElementById("irctc-select-train") ||
            document.querySelector(".train-results-list") ||
            document.querySelector(".btn-book-train")
          );
        }
      },

      // STEP 7: Select Train
      {
        id: "irctc-select-train",
        stepNumber: 7,
        totalSteps: 15,
        label: "Select Train",
        instruction: "Choose a train from the available results.",
        instructionMl: "ലഭ്യമായ ട്രെയിനുകളിൽ നിന്ന് ഒരെണ്ണം തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-select-train, .btn-book-train",
        getElement() {
          return (
            document.getElementById("irctc-select-train") ||
            document.querySelector(".btn-book-train") ||
            document.querySelector('[data-lantern-action="select-train"]')
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("irctc-passenger-name") ||
            document.querySelector(".passenger-fieldset") ||
            document.getElementById("irctc-proceed-payment")
          );
        }
      },

      // STEP 8: Passenger Name
      {
        id: "irctc-passenger-name",
        stepNumber: 8,
        totalSteps: 15,
        label: "Passenger Name",
        instruction: "Enter the passenger name.",
        instructionMl: "യാത്രക്കാരന്റെ പൂർണ്ണ പേര് നൽകുക.",
        selector: "#irctc-passenger-name",
        getElement() {
          return document.getElementById("irctc-passenger-name") || document.querySelector('[data-lantern-action="enter-passenger-name"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim().length >= 3);
        }
      },

      // STEP 9: Passenger Age
      {
        id: "irctc-passenger-age",
        stepNumber: 9,
        totalSteps: 15,
        label: "Passenger Age",
        instruction: "Enter the passenger age.",
        instructionMl: "യാത്രക്കാരന്റെ പ്രായം നൽകുക.",
        selector: "#irctc-passenger-age",
        getElement() {
          return document.getElementById("irctc-passenger-age") || document.querySelector('[data-lantern-action="enter-passenger-age"]');
        },
        isComplete(el) {
          if (!el) return false;
          const age = parseInt(el.value, 10);
          return Boolean(!isNaN(age) && age >= 1 && age <= 115);
        }
      },

      // STEP 10: Passenger Gender
      {
        id: "irctc-passenger-gender",
        stepNumber: 10,
        totalSteps: 15,
        label: "Passenger Gender",
        instruction: "Select the passenger gender.",
        instructionMl: "യാത്രക്കാരന്റെ ലിംഗഭേദം തിരഞ്ഞെടുക്കുക.",
        selector: "#irctc-passenger-gender",
        getElement() {
          return document.getElementById("irctc-passenger-gender") || document.querySelector('[data-lantern-action="select-passenger-gender"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 11: Berth Preference
      {
        id: "irctc-berth",
        stepNumber: 11,
        totalSteps: 15,
        label: "Berth Preference",
        instruction: "Select your berth preference.",
        instructionMl: "ബെർത്ത് തിരഞ്ഞെടുക്കുക (Lower, Middle, Upper, No Preference).",
        selector: "#irctc-berth",
        getElement() {
          return document.getElementById("irctc-berth") || document.querySelector('[data-lantern-action="select-berth-preference"]');
        },
        isComplete(el) {
          if (!el) return false;
          return Boolean(el.value && el.value.trim() !== "");
        }
      },

      // STEP 12: Review Railway Booking
      {
        id: "irctc-proceed-payment",
        stepNumber: 12,
        totalSteps: 15,
        label: "Review Booking",
        instruction: "Review your booking and continue to payment.",
        instructionMl: "ട്രെയിൻ ടിക്കറ്റ് വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റിലേക്ക് പോകുക.",
        selector: "#irctc-proceed-payment",
        getElement() {
          const proceedBtn = document.getElementById("irctc-proceed-payment");
          if (proceedBtn) return proceedBtn;
          const submitPassengerBtn = document.querySelector('button[type="submit"].btn-primary');
          if (submitPassengerBtn) return submitPassengerBtn;
          return document.querySelector(".btn-proceed-large");
        },
        isComplete() {
          return Boolean(
            document.getElementById("irctc-payment-method") ||
            document.querySelector(".payment-demo-card") ||
            document.getElementById("irctc-pay")
          );
        }
      },

      // STEP 13: Payment Method
      {
        id: "irctc-payment-method",
        stepNumber: 13,
        totalSteps: 15,
        label: "Payment Method",
        instruction: "Choose a payment method.",
        instructionMl: "പേയ്‌മെന്റ് മാർഗ്ഗം തിരഞ്ഞെടുക്കുക (UPI, Debit Card, Net Banking).",
        selector: "#irctc-payment-method",
        getElement() {
          return (
            document.getElementById("irctc-payment-method") ||
            document.querySelector(".payment-methods-grid")
          );
        },
        isComplete() {
          const upi = document.getElementById("irctc-upi-id");
          if (upi && upi.value.includes("@")) return true;
          const card = document.getElementById("irctc-card-number");
          if (card && card.value.replace(/\D/g, "").length >= 12) return true;
          const bank = document.getElementById("irctc-bank-select");
          if (bank && bank.value) return true;
          return false;
        }
      },

      // STEP 14: Payment Action (SAFETY: NEVER AUTO-CLICK)
      {
        id: "irctc-pay",
        stepNumber: 14,
        totalSteps: 15,
        label: "Make Payment",
        instruction: "Review the demo payment details and choose whether to continue.",
        instructionMl: "ഡെമോ പേയ്‌മെന്റ് വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റ് സ്ഥിരീകരിക്കാൻ ക്ലിക്ക് ചെയ്യുക.",
        isFinalPayment: true,
        selector: "#irctc-pay",
        getElement() {
          return (
            document.getElementById("irctc-pay") ||
            document.querySelector(".btn-primary-pay")
          );
        },
        isComplete() {
          return Boolean(
            document.getElementById("irctc-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        }
      },

      // STEP 15: Confirmation
      {
        id: "irctc-confirmation",
        stepNumber: 15,
        totalSteps: 15,
        label: "Booking Confirmation",
        instruction: "Your demo railway booking is complete.",
        instructionMl: "നിങ്ങളുടെ ഡെമോ ട്രെയിൻ ടിക്കറ്റ് വിജയകരമായി ബുക്ക് ചെയ്തിരിക്കുന്നു.",
        selector: "#irctc-confirmation",
        getElement() {
          return (
            document.getElementById("irctc-confirmation") ||
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
    window.LANTERN_ADAPTERS.irctc = irctcAdapter;
  }
})();
