import { useState } from "react";
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Receipt
} from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StepIndicator from "../components/StepIndicator";
import PaymentDemo from "../components/PaymentDemo";
import ConfirmationCard from "../components/ConfirmationCard";
import { KSEB_SAMPLE_CONSUMERS } from "../data/demoData";

export default function KSEB() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form State
  const [consumerNumber, setConsumerNumber] = useState("1155023004561");
  const [billData, setBillData] = useState(null);

  // Payment Result State
  const [paymentResult, setPaymentResult] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [errors, setErrors] = useState({});

  const stepsConfig = [
    { id: "lookup", title: "Consumer Lookup" },
    { id: "bill", title: "Bill Breakdown" },
    { id: "payment", title: "Payment" },
    { id: "receipt", title: "Receipt" }
  ];

  // ----------------------------------------------------
  // STEP 1: LOOKUP CONSUMER & GENERATE DUMMY BILL
  // ----------------------------------------------------
  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    const cleanNumber = consumerNumber.trim();
    if (!cleanNumber) {
      errs.consumer = "Please enter your 13-digit KSEB Consumer Number.";
    } else if (cleanNumber.length < 10) {
      errs.consumer = "KSEB 13-digit Consumer Number required (e.g. 1155023004561).";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      let foundBill = KSEB_SAMPLE_CONSUMERS[cleanNumber];
      if (!foundBill) {
        foundBill = {
          consumerNumber: cleanNumber,
          name: "Smt. Shailaja V. Nair",
          sectionOffice: "Ernakulam Central Electrical Section (1120)",
          tariff: "LT 1A Domestic",
          meterNumber: "EM-772183",
          billNumber: `KSEB/2026/09/${Math.floor(1000 + Math.random() * 9000)}`,
          billDate: "08-Sep-2026",
          dueDate: "28-Sep-2026",
          disconnectionDate: "12-Oct-2026",
          billingPeriod: "01-Aug-2026 to 01-Sep-2026 (Monthly)",
          previousReading: 3950,
          currentReading: 4210,
          units: 260,
          energyCharge: 1480.00,
          fixedCharge: 130.00,
          fuelSurcharge: 52.00,
          electricityDuty: 148.00,
          meterRent: 20.00,
          totalAmount: 1830.00,
          address: "MG Road, Ravipuram, Ernakulam, Kerala - 682016"
        };
      }
      setBillData(foundBill);
      setCurrentStepIndex(1); // Move to Bill Details
    }
  };

  // ----------------------------------------------------
  // STEP 2: PROCEED TO PAYMENT
  // ----------------------------------------------------
  const handleProceedToPayment = () => {
    setCurrentStepIndex(2); // Move to Demo Payment
  };

  // ----------------------------------------------------
  // STEP 3: PAYMENT SUCCESS CALLBACK
  // ----------------------------------------------------
  const handlePaymentSuccess = (result) => {
    const random5 = Math.floor(10000 + Math.random() * 90000);
    const newReceiptNo = `KSEB-RCPT-${random5}`;

    setPaymentResult(result);
    setReceiptNumber(newReceiptNo);
    setCurrentStepIndex(3); // Move to Receipt
  };

  const otherChargesTotal = billData
    ? billData.fuelSurcharge + billData.electricityDuty + (billData.meterRent || 0)
    : 0;

  return (
    <div className="lantern-page-shell kseb-page-theme">
      <DemoNotice currentService="kseb" />
      <SiteHeader
        serviceId="kseb"
        title="KSEB Electricity Bill Payment"
        subtitle="Kerala State Electricity Board Limited — Quick Online Bill Payment Portal"
        badgeText="Official Demo"
      />

      <main id="main-content" className="portal-main-area">
        <div className="lantern-container">
          <StepIndicator
            steps={stepsConfig}
            currentStepIndex={currentStepIndex}
            onStepClick={(idx) => {
              if (idx < currentStepIndex && currentStepIndex !== 3) {
                setCurrentStepIndex(idx);
              }
            }}
          />

          {/* ==================================================== */}
          {/* STEP 1: CONSUMER NUMBER LOOKUP FORM */}
          {/* ==================================================== */}
          {currentStepIndex === 0 && (
            <div className="portal-form-wrapper" aria-labelledby="kseb-lookup-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 1</span>
                <h2 id="kseb-lookup-heading" className="section-main-heading">
                  Electricity Bill Lookup
                </h2>
                <p className="section-desc">
                  Enter your 13-digit KSEB Consumer Number (printed on top of your physical or digital electricity bill).
                </p>
              </div>

              <form onSubmit={handleLookupSubmit} className="search-box-card" noValidate>
                <div className="field-group">
                  <label htmlFor="kseb-consumer-number" className="field-label">
                    <Zap size={16} className="label-icon" aria-hidden="true" />
                    <span>13-Digit Consumer Number <span className="req">*</span></span>
                  </label>
                  <input
                    id="kseb-consumer-number"
                    type="text"
                    maxLength={15}
                    className={`form-input ${errors.consumer ? "input-error" : ""}`}
                    placeholder="e.g. 1155023004561"
                    value={consumerNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setConsumerNumber(val);
                      if (errors.consumer) setErrors({ ...errors, consumer: null });
                    }}
                    aria-required="true"
                    aria-invalid={errors.consumer ? "true" : "false"}
                    aria-describedby={errors.consumer ? "err-kseb-consumer" : undefined}
                    data-lantern-step="1"
                    data-lantern-action="enter-consumer-number"
                    data-lantern-label="KSEB 13-digit consumer number"
                  />
                  {errors.consumer && (
                    <p id="err-kseb-consumer" className="field-error-msg" role="alert">
                      {errors.consumer}
                    </p>
                  )}
                  <p className="field-helper-text">
                    Format: 13 digits without dashes or spaces (Section Code + Consumer ID).
                  </p>
                </div>

                {/* Sample Consumer Quick Links */}
                <div className="quick-suggestions-row">
                  <span className="suggestions-title">Sample Domestic Consumers:</span>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1155023004561");
                      setErrors({});
                    }}
                  >
                    1155023004561 (Radhakrishnan - Kaloor)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1155078009812");
                      setErrors({});
                    }}
                  >
                    1155078009812 (Deepa Menon - Thrissur)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1155099003344");
                      setErrors({});
                    }}
                  >
                    1155099003344 (Abdul Rasheed - Trivandrum)
                  </button>
                </div>

                {/* VIEW BILL BUTTON */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    id="kseb-view-bill"
                    className="btn-search-primary"
                    data-lantern-step="1"
                    data-lantern-action="view-bill"
                    data-lantern-label="View Bill"
                  >
                    <Receipt size={18} aria-hidden="true" />
                    <span>View Bill</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: BILL DETAILS */}
          {/* ==================================================== */}
          {currentStepIndex === 1 && billData && (
            <div
              id="kseb-bill-details"
              className="portal-bill-wrapper"
              aria-labelledby="kseb-bill-heading"
              data-lantern-step="2"
              data-lantern-action="review-bill-details"
              data-lantern-label="KSEB bill details"
            >
              <div className="section-header-banner">
                <div>
                  <span className="section-step-kicker">STEP 2</span>
                  <h2 id="kseb-bill-heading" className="section-main-heading">
                    Electricity Bill Details
                  </h2>
                  <p className="section-desc">
                    Consumer: <strong>{billData.name}</strong> | Section: <strong>{billData.sectionOffice}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-back-link"
                  onClick={() => setCurrentStepIndex(0)}
                  data-lantern-action="change-consumer"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  <span>Lookup Different Consumer</span>
                </button>
              </div>

              {/* Realistic Electricity Bill Card */}
              <div className="kseb-bill-card">
                {/* Bill Top Metadata */}
                <div className="bill-top-grid">
                  <div className="meta-cell">
                    <span className="cell-label">Consumer Number:</span>
                    <span className="cell-val font-mono">{billData.consumerNumber}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">Consumer Name:</span>
                    <span className="cell-val font-bold">{billData.name}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">Bill Number:</span>
                    <span className="cell-val font-mono">{billData.billNumber}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">Section Office:</span>
                    <span className="cell-val">{billData.sectionOffice}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">Billing Period:</span>
                    <span className="cell-val">{billData.billingPeriod}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">Due Date:</span>
                    <span className="cell-val due-date-highlight">{billData.dueDate}</span>
                  </div>
                </div>

                {/* Meter Reading Strip */}
                <div className="meter-readings-strip" aria-label="Meter readings and consumption">
                  <div className="reading-col">
                    <span className="r-label">Previous Meter Reading</span>
                    <span className="r-val">{billData.previousReading} kWh</span>
                  </div>
                  <div className="reading-operator" aria-hidden="true">→</div>
                  <div className="reading-col">
                    <span className="r-label">Current Meter Reading</span>
                    <span className="r-val">{billData.currentReading} kWh</span>
                  </div>
                  <div className="reading-operator" aria-hidden="true">=</div>
                  <div className="reading-col units-col">
                    <span className="r-label">Units Consumed</span>
                    <span className="r-val highlight-units">{billData.units} Units</span>
                  </div>
                </div>

                {/* Charges Breakdown Table */}
                <div className="bill-breakdown-section">
                  <h3 className="breakdown-subhead">Tariff & Charges Breakdown ({billData.tariff})</h3>
                  <div className="charges-table">
                    <div className="charge-line">
                      <span>Energy Charge ({billData.units} units):</span>
                      <span className="charge-val">₹{billData.energyCharge.toFixed(2)}</span>
                    </div>
                    <div className="charge-line">
                      <span>Fixed Charge:</span>
                      <span className="charge-val">₹{billData.fixedCharge.toFixed(2)}</span>
                    </div>
                    <div className="charge-line">
                      <span>Fuel Surcharge:</span>
                      <span className="charge-val">₹{billData.fuelSurcharge.toFixed(2)}</span>
                    </div>
                    <div className="charge-line">
                      <span>Kerala Electricity Duty (10%):</span>
                      <span className="charge-val">₹{billData.electricityDuty.toFixed(2)}</span>
                    </div>
                    <div className="charge-line">
                      <span>Meter Rent & GST:</span>
                      <span className="charge-val">₹{(billData.meterRent || 20).toFixed(2)}</span>
                    </div>
                    <div className="charge-line other-subtotal">
                      <span>Total Other Charges (Surcharge + Duty + Rent):</span>
                      <span className="charge-val font-semibold">₹{otherChargesTotal.toFixed(2)}</span>
                    </div>
                    <div className="charge-line total-bill-line">
                      <span className="total-label">Total Amount Payable:</span>
                      <span className="total-amount-val">₹{billData.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* PROCEED TO PAYMENT BUTTON */}
                <div className="bill-action-bar">
                  <div className="bill-safety-note">
                    <ShieldCheck size={18} className="note-shield" aria-hidden="true" />
                    <span>Safe Demo: No real transaction will occur. Payment will be simulated locally.</span>
                  </div>

                  <button
                    type="button"
                    id="kseb-proceed-payment"
                    className="btn-proceed-large"
                    onClick={handleProceedToPayment}
                    data-lantern-step="2"
                    data-lantern-action="proceed-to-payment"
                    data-lantern-label="Proceed to Payment"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: DEMO PAYMENT GATEWAY */}
          {/* ==================================================== */}
          {currentStepIndex === 2 && billData && (
            <div className="portal-payment-container">
              <PaymentDemo
                servicePrefix="KSEB"
                serviceId="kseb"
                amount={billData.totalAmount}
                itemDescription={`KSEB Bill ${billData.billNumber} (Consumer: ${billData.consumerNumber})`}
                stepNumber={3}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setCurrentStepIndex(1)}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: RECEIPT CONFIRMATION */}
          {/* ==================================================== */}
          {currentStepIndex === 3 && billData && (
            <ConfirmationCard
              containerId="kseb-confirmation"
              serviceName="Electricity Bill Payment"
              serviceType="kseb"
              bookingId={receiptNumber}
              txnId={paymentResult?.txnId || "KSEB-TXN-DEMO-12345"}
              amount={billData.totalAmount}
              disclaimerText="DEMO PAYMENT — NOT A REAL KSEB PAYMENT"
              details={[
                { label: "Consumer Name", value: billData.name },
                { label: "Consumer Number", value: billData.consumerNumber },
                { label: "Bill Number", value: billData.billNumber },
                { label: "Section Office", value: billData.sectionOffice, fullWidth: true },
                { label: "Billing Period", value: billData.billingPeriod },
                { label: "Units Billed", value: `${billData.units} Units (Meter: ${billData.meterNumber})` },
                { label: "Payment Channel", value: `${paymentResult?.paymentMethod || "UPI"} (Sandbox Simulated)`, highlight: true },
                { label: "Payment Date", value: paymentResult?.paidAt || new Date().toLocaleDateString() },
                { label: "Amount Paid", value: `₹${billData.totalAmount.toFixed(2)}`, highlight: true }
              ]}
              onReset={() => {
                setCurrentStepIndex(0);
                setBillData(null);
                setPaymentResult(null);
                setReceiptNumber("");
              }}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
