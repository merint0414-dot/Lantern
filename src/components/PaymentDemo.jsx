import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Building,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { DEMO_PAYMENT_BANKS } from "../data/demoData";

export default function PaymentDemo({
  servicePrefix = "DEMO",
  serviceId = "ksrtc",
  amount = 350,
  onPaymentSuccess,
  onCancel,
  stepNumber = 11
}) {
  const [method, setMethod] = useState("upi"); // upi, debit, credit, netbanking
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Dynamic IDs based on service
  const methodSelectId = `${serviceId}-payment-method`;
  const payButtonId = `${serviceId}-pay`;

  // Quick auto-fill for testing
  const handleAutoFill = () => {
    if (method === "upi") {
      setUpiId("demo.user@okhdfcbank");
    } else if (method === "debit" || method === "credit") {
      setCardNumber("4532 8812 3456 7890");
      setCardExpiry("12/28");
      setCardCvv("742");
      setCardHolder("DEMO TEST USER");
    } else if (method === "netbanking") {
      setSelectedBank(DEMO_PAYMENT_BANKS[0]);
    }
    setErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (method === "upi") {
      if (!upiId.trim()) {
        errs.upiId = "Please enter your UPI ID (e.g., user@okhdfcbank).";
      } else if (!upiId.includes("@")) {
        errs.upiId = "Invalid format. UPI ID must include '@' (e.g., yourname@bank).";
      }
    } else if (method === "debit" || method === "credit") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (!cleanCard) {
        errs.cardNumber = "Please enter a 16-digit card number.";
      } else if (cleanCard.length < 12) {
        errs.cardNumber = "Card number must be at least 12-16 digits.";
      }

      if (!cardExpiry.trim()) {
        errs.cardExpiry = "Enter expiry (MM/YY).";
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errs.cardExpiry = "Expiry must be in MM/YY format.";
      }

      if (!cardCvv.trim()) {
        errs.cardCvv = "Enter 3-digit CVV.";
      } else if (cardCvv.length < 3) {
        errs.cardCvv = "CVV must be 3 or 4 digits.";
      }

      if (!cardHolder.trim()) {
        errs.cardHolder = "Please enter cardholder name.";
      }
    } else if (method === "netbanking") {
      if (!selectedBank) {
        errs.selectedBank = "Please select your bank from the list.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setPaymentFailed(false);
    setProcessingStatus("Connecting to Demo Payment Gateway...");

    // Simulated multi-stage delay for realistic feel
    setTimeout(() => {
      setProcessingStatus("Authorizing simulated sandbox transaction...");
    }, 800);

    setTimeout(() => {
      setProcessingStatus("Verifying dummy token with bank server...");
    }, 1500);

    setTimeout(() => {
      if (simulateFailure) {
        setIsProcessing(false);
        setPaymentFailed(true);
      } else {
        setIsProcessing(false);
        const random5 = Math.floor(10000 + Math.random() * 90000);
        const generatedTxnId = `${servicePrefix}-TXN-DEMO-${random5}`;
        if (onPaymentSuccess) {
          onPaymentSuccess({
            txnId: generatedTxnId,
            paymentMethod: method.toUpperCase(),
            amount: amount,
            paidAt: new Date().toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short"
            })
          });
        }
      }
    }, 2200);
  };

  return (
    <div className="payment-demo-card" aria-labelledby="payment-gateway-heading">
      <div className="payment-card-header">
        <div className="gateway-brand">
          <div className="gateway-icon-badge" aria-hidden="true">
            <Lock size={20} />
          </div>
          <div>
            <h2 id="payment-gateway-heading" className="gateway-title">
              DEMO PAYMENT GATEWAY
            </h2>
            <p className="gateway-subtitle">
              Simulated sandbox checkout — No actual money is charged
            </p>
          </div>
        </div>

        <div className="payment-amount-box" aria-label={`Amount to pay: Rupees ${amount}`}>
          <span className="amount-label">Total Payable</span>
          <span className="amount-val">₹{Number(amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-safety-alert" role="status">
        <ShieldCheck size={18} className="shield-icon" aria-hidden="true" />
        <span>
          <strong>Safe Demo Sandbox:</strong> All payment details entered below are processed only in browser memory. Never enter real CVVs, ATM pins, or bank passwords.
        </span>
      </div>

      {/* Processing State Modal / Overlay */}
      {isProcessing && (
        <div
          className="payment-processing-overlay"
          role="dialog"
          aria-modal="true"
          aria-live="assertive"
          aria-labelledby="processing-text"
        >
          <div className="processing-dialog-card">
            <Loader2 size={48} className="spinner-animation" aria-hidden="true" />
            <h3 id="processing-text" className="processing-title">
              Processing Payment...
            </h3>
            <p className="processing-status-step">{processingStatus}</p>
            <div className="processing-progress-bar" aria-hidden="true">
              <div className="progress-fill"></div>
            </div>
            <p className="processing-hint">Please do not refresh or close this tab.</p>
          </div>
        </div>
      )}

      {/* Payment Failure Notification */}
      {paymentFailed && (
        <div
          className="payment-failure-banner"
          role="alert"
          aria-labelledby="failure-title"
        >
          <div className="failure-icon-col">
            <AlertCircle size={28} aria-hidden="true" />
          </div>
          <div className="failure-text-col">
            <h3 id="failure-title" className="failure-heading">
              Payment Failed (Simulated Test)
            </h3>
            <p className="failure-msg">
              Your test bank declined the simulated authorization. You can retry with a different method or toggle simulation mode.
            </p>
            <div className="failure-actions-row">
              <button
                type="button"
                className="btn-retry"
                onClick={() => {
                  setPaymentFailed(false);
                  setSimulateFailure(false);
                }}
                data-lantern-action="retry-payment"
              >
                <RefreshCw size={15} aria-hidden="true" />
                <span>Try Again (Simulate Success)</span>
              </button>
              <button
                type="button"
                className="btn-change-method"
                onClick={() => setPaymentFailed(false)}
                data-lantern-action="change-payment-method"
              >
                Change Payment Method
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="btn-cancel-pay"
                  onClick={onCancel}
                  data-lantern-action="cancel-payment"
                >
                  Cancel & Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {!paymentFailed && (
        <form onSubmit={handlePay} noValidate>
          {/* Payment Method Selector */}
          <fieldset className="payment-methods-fieldset">
            <legend className="fieldset-legend">
              <span className="legend-step-num">Step {stepNumber}:</span> Select Demo Payment Method
            </legend>

            <div
              id={methodSelectId}
              className="payment-methods-grid"
              role="radiogroup"
              aria-label="Payment Method Options"
              data-lantern-step={stepNumber}
              data-lantern-action="select-payment-method"
              data-lantern-label="Payment method"
            >
              <label
                className={`method-option-card ${method === "upi" ? "selected" : ""}`}
                htmlFor={`${serviceId}-method-upi`}
              >
                <input
                  type="radio"
                  id={`${serviceId}-method-upi`}
                  name="paymentMethod"
                  value="upi"
                  checked={method === "upi"}
                  onChange={() => {
                    setMethod("upi");
                    setErrors({});
                  }}
                  data-lantern-action="select-method-upi"
                />
                <div className="method-icon-wrap" aria-hidden="true">
                  <Smartphone size={22} />
                </div>
                <div className="method-label-col">
                  <span className="method-name">UPI / QR</span>
                  <span className="method-desc">GPay, PhonePe, Paytm, BHIM</span>
                </div>
              </label>

              <label
                className={`method-option-card ${method === "debit" ? "selected" : ""}`}
                htmlFor={`${serviceId}-method-debit`}
              >
                <input
                  type="radio"
                  id={`${serviceId}-method-debit`}
                  name="paymentMethod"
                  value="debit"
                  checked={method === "debit"}
                  onChange={() => {
                    setMethod("debit");
                    setErrors({});
                  }}
                  data-lantern-action="select-method-debit"
                />
                <div className="method-icon-wrap" aria-hidden="true">
                  <CreditCard size={22} />
                </div>
                <div className="method-label-col">
                  <span className="method-name">Debit Card</span>
                  <span className="method-desc">RuPay, Visa, MasterCard</span>
                </div>
              </label>

              <label
                className={`method-option-card ${method === "credit" ? "selected" : ""}`}
                htmlFor={`${serviceId}-method-credit`}
              >
                <input
                  type="radio"
                  id={`${serviceId}-method-credit`}
                  name="paymentMethod"
                  value="credit"
                  checked={method === "credit"}
                  onChange={() => {
                    setMethod("credit");
                    setErrors({});
                  }}
                  data-lantern-action="select-method-credit"
                />
                <div className="method-icon-wrap" aria-hidden="true">
                  <CreditCard size={22} />
                </div>
                <div className="method-label-col">
                  <span className="method-name">Credit Card</span>
                  <span className="method-desc">All Major Cards</span>
                </div>
              </label>

              <label
                className={`method-option-card ${method === "netbanking" ? "selected" : ""}`}
                htmlFor={`${serviceId}-method-netbanking`}
              >
                <input
                  type="radio"
                  id={`${serviceId}-method-netbanking`}
                  name="paymentMethod"
                  value="netbanking"
                  checked={method === "netbanking"}
                  onChange={() => {
                    setMethod("netbanking");
                    setErrors({});
                  }}
                  data-lantern-action="select-method-netbanking"
                />
                <div className="method-icon-wrap" aria-hidden="true">
                  <Building size={22} />
                </div>
                <div className="method-label-col">
                  <span className="method-name">Net Banking</span>
                  <span className="method-desc">SBI, Federal, HDFC, Kerala Bank</span>
                </div>
              </label>
            </div>
          </fieldset>

          {/* Method Specific Fields */}
          <div className="method-fields-container">
            {method === "upi" && (
              <div className="upi-fields-box">
                <div className="field-group">
                  <label htmlFor={`${serviceId}-upi-id`} className="field-label">
                    Virtual Payment Address (UPI ID) <span className="req">*</span>
                  </label>
                  <div className="input-with-action">
                    <input
                      id={`${serviceId}-upi-id`}
                      type="text"
                      className={`form-input ${errors.upiId ? "input-error" : ""}`}
                      placeholder="e.g. mobile@oksbi, yourname@upi"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (errors.upiId) setErrors({ ...errors, upiId: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.upiId ? "true" : "false"}
                      aria-describedby={errors.upiId ? "upi-err" : undefined}
                      data-lantern-step={stepNumber}
                      data-lantern-action="enter-upi-id"
                      data-lantern-label="UPI ID"
                    />
                    <button
                      type="button"
                      className="btn-quick-fill"
                      onClick={() => {
                        setUpiId("demo.user@okhdfcbank");
                        if (errors.upiId) setErrors({ ...errors, upiId: null });
                      }}
                      title="Auto-fill sample UPI ID"
                    >
                      <Sparkles size={13} aria-hidden="true" />
                      <span>Demo Fill</span>
                    </button>
                  </div>
                  {errors.upiId && (
                    <p id="upi-err" className="field-error-msg" role="alert">
                      {errors.upiId}
                    </p>
                  )}
                  <p className="field-helper-text">
                    Supported handles: @okhdfcbank, @oksbi, @paytm, @ybl, @axl
                  </p>
                </div>
              </div>
            )}

            {(method === "debit" || method === "credit") && (
              <div className="card-fields-box">
                <div className="field-group">
                  <label htmlFor={`${serviceId}-card-number`} className="field-label">
                    Card Number <span className="req">*</span>
                  </label>
                  <input
                    id={`${serviceId}-card-number`}
                    type="text"
                    maxLength={19}
                    className={`form-input ${errors.cardNumber ? "input-error" : ""}`}
                    placeholder="4532 8812 3456 7890"
                    value={cardNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      val = val.substring(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumber(formatted);
                      if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
                    }}
                    aria-required="true"
                    aria-invalid={errors.cardNumber ? "true" : "false"}
                    aria-describedby={errors.cardNumber ? "card-err" : undefined}
                    data-lantern-step={stepNumber}
                    data-lantern-action="enter-card-number"
                    data-lantern-label="Card number"
                  />
                  {errors.cardNumber && (
                    <p id="card-err" className="field-error-msg" role="alert">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="card-sub-grid">
                  <div className="field-group">
                    <label htmlFor={`${serviceId}-card-expiry`} className="field-label">
                      Expiry Date <span className="req">*</span>
                    </label>
                    <input
                      id={`${serviceId}-card-expiry`}
                      type="text"
                      maxLength={5}
                      className={`form-input ${errors.cardExpiry ? "input-error" : ""}`}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 3) {
                          val = val.substring(0, 2) + "/" + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                        if (errors.cardExpiry) setErrors({ ...errors, cardExpiry: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.cardExpiry ? "true" : "false"}
                      aria-describedby={errors.cardExpiry ? "expiry-err" : undefined}
                      data-lantern-step={stepNumber}
                      data-lantern-action="enter-card-expiry"
                      data-lantern-label="Card expiry"
                    />
                    {errors.cardExpiry && (
                      <p id="expiry-err" className="field-error-msg" role="alert">
                        {errors.cardExpiry}
                      </p>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor={`${serviceId}-card-cvv`} className="field-label">
                      CVV / CVC <span className="req">*</span>
                    </label>
                    <input
                      id={`${serviceId}-card-cvv`}
                      type="password"
                      maxLength={4}
                      className={`form-input ${errors.cardCvv ? "input-error" : ""}`}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCardCvv(val);
                        if (errors.cardCvv) setErrors({ ...errors, cardCvv: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.cardCvv ? "true" : "false"}
                      aria-describedby={errors.cardCvv ? "cvv-err" : undefined}
                      data-lantern-step={stepNumber}
                      data-lantern-action="enter-card-cvv"
                      data-lantern-label="Card CVV"
                    />
                    {errors.cardCvv && (
                      <p id="cvv-err" className="field-error-msg" role="alert">
                        {errors.cardCvv}
                      </p>
                    )}
                  </div>

                  <div className="field-group span-2">
                    <label htmlFor={`${serviceId}-card-holder`} className="field-label">
                      Cardholder Name <span className="req">*</span>
                    </label>
                    <input
                      id={`${serviceId}-card-holder`}
                      type="text"
                      className={`form-input ${errors.cardHolder ? "input-error" : ""}`}
                      placeholder="Name as printed on card"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value.toUpperCase());
                        if (errors.cardHolder) setErrors({ ...errors, cardHolder: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.cardHolder ? "true" : "false"}
                      aria-describedby={errors.cardHolder ? "holder-err" : undefined}
                      data-lantern-step={stepNumber}
                      data-lantern-action="enter-card-holder"
                      data-lantern-label="Cardholder name"
                    />
                    {errors.cardHolder && (
                      <p id="holder-err" className="field-error-msg" role="alert">
                        {errors.cardHolder}
                      </p>
                    )}
                  </div>
                </div>

                <div className="quick-fill-row">
                  <button
                    type="button"
                    className="btn-quick-fill"
                    onClick={handleAutoFill}
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    <span>Auto-Fill Demo Card Details</span>
                  </button>
                </div>
              </div>
            )}

            {method === "netbanking" && (
              <div className="netbanking-fields-box">
                <div className="field-group">
                  <label htmlFor={`${serviceId}-bank-select`} className="field-label">
                    Select Your Bank <span className="req">*</span>
                  </label>
                  <select
                    id={`${serviceId}-bank-select`}
                    className={`form-input ${errors.selectedBank ? "input-error" : ""}`}
                    value={selectedBank}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      if (errors.selectedBank) setErrors({ ...errors, selectedBank: null });
                    }}
                    aria-required="true"
                    aria-invalid={errors.selectedBank ? "true" : "false"}
                    aria-describedby={errors.selectedBank ? "bank-err" : undefined}
                    data-lantern-step={stepNumber}
                    data-lantern-action="select-bank"
                    data-lantern-label="Select Net Banking"
                  >
                    <option value="">-- Choose Bank for Demo Authorization --</option>
                    {DEMO_PAYMENT_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  {errors.selectedBank && (
                    <p id="bank-err" className="field-error-msg" role="alert">
                      {errors.selectedBank}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sandbox Simulation Options */}
          <div className="demo-simulation-controls">
            <label className="toggle-failure-label" htmlFor="toggle-sim-fail">
              <input
                type="checkbox"
                id="toggle-sim-fail"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
              />
              <span>Simulate Payment Failure (to test error handling & retry flow)</span>
            </label>
          </div>

          {/* Submission and Action Buttons */}
          <div className="payment-actions-footer">
            {onCancel && (
              <button
                type="button"
                className="btn-back-review"
                onClick={onCancel}
                data-lantern-action="back-to-review"
              >
                Back to Review
              </button>
            )}

            <button
              type="submit"
              id={payButtonId}
              className="btn-primary-pay"
              data-lantern-step={stepNumber + 1}
              data-lantern-action="complete-payment"
              data-lantern-label={`Pay Rupees ${amount}`}
            >
              <Lock size={16} aria-hidden="true" />
              <span>Pay ₹{Number(amount).toFixed(2)}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
