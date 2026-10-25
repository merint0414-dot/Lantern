// ============================================================
// LANTERN - KSRTC BUS BOOKING ADAPTER
// Official Kerala State Road Transport Corporation workflow
// ============================================================

(() => {
  "use strict";

  function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

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
        totalSteps: 17,
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
        totalSteps: 17,
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
        totalSteps: 17,
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
        totalSteps: 17,
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
        totalSteps: 17,
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
        totalSteps: 17,
        label: "Select Bus",
        instruction: "Choose a bus from the available results.",
        instructionMl: "ലഭ്യമായ ലിസ്റ്റിൽ നിന്ന് നിങ്ങളുടെ ബസ് തിരഞ്ഞെടുക്കുക.",
        selector: "#ksrtc-select-bus, [id^='ksrtc-select-bus'], .btn-select-bus, [data-lantern-action='select-bus']",
        getElement() {
          const all = Array.from(
            document.querySelectorAll("#ksrtc-select-bus, [id^='ksrtc-select-bus'], .btn-select-bus, [data-lantern-action='select-bus']")
          ).filter(isElementVisible);
          const vh = window.innerHeight || 800;
          const inView = all.find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top >= 40 && rect.bottom <= vh - 40;
          });
          return inView || all[0] || null;
        },
        getAllElements() {
          return Array.from(
            document.querySelectorAll("#ksrtc-select-bus, [id^='ksrtc-select-bus'], .btn-select-bus, [data-lantern-action='select-bus']")
          ).filter(isElementVisible);
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
        totalSteps: 17,
        label: "Seat Selection",
        instruction: "Select your preferred available seat.",
        instructionMl: "നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ട സീറ്റ് തിരഞ്ഞെടുക്കുക.",
        getInstruction() {
          const selected = document.querySelectorAll(".seat-btn.seat-selected").length;
          const instr = document.querySelector(".seat-map-instruction");
          let req = 1;
          if (instr) {
            const m = instr.textContent.match(/select\s+(\d+)\s+seat/i);
            if (m) req = parseInt(m[1], 10);
          }
          if (selected > 0 && selected < req) {
            const rem = req - selected;
            return `Please select ${rem} more available seat${rem > 1 ? "s" : ""}.`;
          }
          return "Select your preferred available seat.";
        },
        selector: ".seat-btn.seat-available, .seat-selection-container, #ksrtc-seat-selection",
        getElement() {
          const selected = document.querySelectorAll(".seat-btn.seat-selected");
          const confirmBtn =
            document.getElementById("ksrtc-confirm-seats") ||
            document.querySelector('[data-lantern-action="confirm-seats"]') ||
            document.querySelector(".seat-actions-footer .btn-primary");
          const instr = document.querySelector(".seat-map-instruction");
          let req = 1;
          if (instr) {
            const m = instr.textContent.match(/select\s+(\d+)\s+seat/i);
            if (m) req = parseInt(m[1], 10);
          }
          if (selected.length >= req && confirmBtn && !confirmBtn.disabled) {
            return confirmBtn;
          }
          return (
            document.querySelector(".seat-btn.seat-available") ||
            document.getElementById("ksrtc-seat-selection") ||
            document.querySelector(".portal-seat-wrapper")
          );
        },
        getAllElements() {
          const avail = Array.from(document.querySelectorAll(".seat-btn.seat-available")).filter(isElementVisible);
          return avail.length > 0 ? avail : [document.getElementById("ksrtc-seat-selection")].filter(Boolean);
        },
        isComplete() {
          const selected = document.querySelectorAll(".seat-btn.seat-selected").length;
          const instr = document.querySelector(".seat-map-instruction");
          let req = 1;
          if (instr) {
            const m = instr.textContent.match(/select\s+(\d+)\s+seat/i);
            if (m) req = parseInt(m[1], 10);
          }
          return selected >= (req || 1);
        }
      },

      // STEP 8: Confirm Seats / Proceed to Passenger Details
      {
        id: "ksrtc-confirm-seats",
        stepNumber: 8,
        totalSteps: 17,
        label: "Proceed to Passenger Details",
        instruction: "Seats selected! Click Proceed to Passenger Details to continue.",
        instructionMl: "സീറ്റ് തിരഞ്ഞെടുത്തു! തുടരാൻ Proceed to Passenger Details ക്ലിക്ക് ചെയ്യുക.",
        selector: '#ksrtc-confirm-seats, [data-lantern-action="confirm-seats"], .seat-actions-footer .btn-primary',
        getElement() {
          return (
            document.getElementById("ksrtc-confirm-seats") ||
            document.querySelector('[data-lantern-action="confirm-seats"]') ||
            document.querySelector(".seat-actions-footer .btn-primary")
          );
        },
        getAllElements() {
          const btn =
            document.getElementById("ksrtc-confirm-seats") ||
            document.querySelector('[data-lantern-action="confirm-seats"]') ||
            document.querySelector(".seat-actions-footer .btn-primary");
          return btn && isElementVisible(btn) ? [btn] : [];
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-passenger-name") ||
            document.querySelector(".passenger-form-card") ||
            document.getElementById("ksrtc-proceed-payment")
          );
        }
      },

      // STEP 9: Passenger Name
      {
        id: "ksrtc-passenger-name",
        stepNumber: 9,
        totalSteps: 17,
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

      // STEP 10: Passenger Age
      {
        id: "ksrtc-passenger-age",
        stepNumber: 10,
        totalSteps: 17,
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

      // STEP 11: Passenger Gender
      {
        id: "ksrtc-passenger-gender",
        stepNumber: 11,
        totalSteps: 17,
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

      // STEP 12: Passenger Mobile
      {
        id: "ksrtc-passenger-mobile",
        stepNumber: 12,
        totalSteps: 17,
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

      // STEP 13: Review Booking & Proceed
      {
        id: "ksrtc-proceed-payment",
        stepNumber: 13,
        totalSteps: 17,
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

      // STEP 14: Payment Method
      {
        id: "ksrtc-payment-method",
        stepNumber: 14,
        totalSteps: 17,
        label: "Payment Method",
        instruction: "Choose your preferred payment method.",
        instructionMl: "ഒരു പേയ്‌മെന്റ് മാർഗ്ഗം തിരഞ്ഞെടുക്കുക (UPI, Debit Card, Net Banking).",
        selector: "#ksrtc-payment-method, .payment-methods-grid",
        getElement() {
          return (
            document.getElementById("ksrtc-payment-method") ||
            document.querySelector(".payment-methods-grid")
          );
        },
        getAllElements() {
          const cards = Array.from(document.querySelectorAll(".method-option-card")).filter(isElementVisible);
          return cards.length > 0 ? cards : [document.getElementById("ksrtc-payment-method")].filter(Boolean);
        },
        isComplete() {
          const grid = document.getElementById("ksrtc-payment-method") || document.querySelector(".payment-methods-grid");
          const upi = document.getElementById("ksrtc-upi-id");
          const card = document.getElementById("ksrtc-card-number");
          const bank = document.getElementById("ksrtc-bank-select");
          if (upi && upi.value.trim() !== "") return true;
          if (card && card.value.trim() !== "") return true;
          if (bank && bank.value.trim() !== "") return true;
          return Boolean(grid && grid.dataset.methodChosen === "true");
        }
      },

      // STEP 15: Enter Payment Details
      {
        id: "ksrtc-payment-details",
        stepNumber: 15,
        totalSteps: 17,
        label: "Payment Details",
        instruction: "Enter your payment details or click Demo Fill to test.",
        instructionMl: "പേയ്‌മെന്റ് വിവരങ്ങൾ നൽകുക, അല്ലെങ്കിൽ Demo Fill ക്ലിക്ക് ചെയ്യുക.",
        getInstruction() {
          const upi = document.getElementById("ksrtc-upi-id");
          if (upi && isElementVisible(upi)) {
            return "Enter your UPI ID (e.g. user@okhdfcbank) or click Demo Fill.";
          }
          const card = document.getElementById("ksrtc-card-number");
          if (card && isElementVisible(card)) {
            return "Enter card details or click Auto-Fill Demo Card Details.";
          }
          const bank = document.getElementById("ksrtc-bank-select");
          if (bank && isElementVisible(bank)) {
            return "Select your bank from the dropdown list.";
          }
          return "Enter your payment details or click Demo Fill to test.";
        },
        selector: "#ksrtc-upi-id, #ksrtc-card-number, #ksrtc-bank-select, .btn-quick-fill, .method-fields-container",
        getElement() {
          const upi = document.getElementById("ksrtc-upi-id");
          if (upi && isElementVisible(upi)) return upi;
          const card = document.getElementById("ksrtc-card-number");
          if (card && isElementVisible(card)) return card;
          const bank = document.getElementById("ksrtc-bank-select");
          if (bank && isElementVisible(bank)) return bank;
          return document.querySelector(".btn-quick-fill") || document.querySelector(".method-fields-container");
        },
        getAllElements() {
          const upi = document.getElementById("ksrtc-upi-id");
          const card = document.getElementById("ksrtc-card-number");
          const bank = document.getElementById("ksrtc-bank-select");
          const fillBtn = document.querySelector(".btn-quick-fill");
          const list = [upi, card, bank, fillBtn].filter(Boolean).filter(isElementVisible);
          return list.length > 0 ? list : [document.querySelector(".method-fields-container")].filter(Boolean);
        },
        isComplete() {
          const upi = document.getElementById("ksrtc-upi-id");
          if (upi && isElementVisible(upi)) return Boolean(upi.value && upi.value.includes("@"));
          const card = document.getElementById("ksrtc-card-number");
          if (card && isElementVisible(card)) return Boolean(card.value && card.value.replace(/\D/g, "").length >= 12);
          const bank = document.getElementById("ksrtc-bank-select");
          if (bank && isElementVisible(bank)) return Boolean(bank.value && bank.value.trim() !== "");
          return false;
        }
      },

      // STEP 16: Payment Action (SAFETY: NEVER AUTO-CLICK)
      {
        id: "ksrtc-pay",
        stepNumber: 16,
        totalSteps: 17,
        label: "Make Payment",
        instruction: "Review the demo payment details and choose whether to continue.",
        instructionMl: "ഡെമോ പേയ്‌മെന്റ് വിവരങ്ങൾ പരിശോധിച്ച് പേയ്‌മെന്റ് പൂർത്തിയാക്കാൻ ക്ലിക്ക് ചെയ്യുക.",
        isFinalPayment: true,
        selector: "#ksrtc-pay, .btn-primary-pay",
        getElement() {
          return (
            document.getElementById("ksrtc-pay") ||
            document.querySelector(".btn-primary-pay")
          );
        },
        getAllElements() {
          const btn = document.getElementById("ksrtc-pay") || document.querySelector(".btn-primary-pay");
          return btn && isElementVisible(btn) ? [btn] : [];
        },
        isComplete() {
          return Boolean(
            document.getElementById("ksrtc-confirmation") ||
            document.querySelector(".confirmation-card-shell")
          );
        }
      },

      // STEP 17: Confirmation
      {
        id: "ksrtc-confirmation",
        stepNumber: 17,
        totalSteps: 17,
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
