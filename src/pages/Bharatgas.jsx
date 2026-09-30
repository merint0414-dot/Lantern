import { useState } from "react";
import {
  Flame,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Layers,
  Truck
} from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StepIndicator from "../components/StepIndicator";
import PaymentDemo from "../components/PaymentDemo";
import ConfirmationCard from "../components/ConfirmationCard";
import {
  BHARATGAS_SAMPLE_CONSUMERS,
  BHARATGAS_CYLINDER_TYPES
} from "../data/demoData";

export default function Bharatgas() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Verification Form Inputs
  const [consumerNumber, setConsumerNumber] = useState("1002345678");
  const [mobileNumber, setMobileNumber] = useState("9847123456");

  // Verified Customer State
  const [customer, setCustomer] = useState(null);

  // Cylinder Selection & Address
  const [selectedCylinderType, setSelectedCylinderType] = useState(
    "14.2 kg Domestic Subsidized"
  );
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Payment & Booking Result
  const [paymentResult, setPaymentResult] = useState(null);
  const [bookingId, setBookingId] = useState("");

  const [errors, setErrors] = useState({});

  const stepsConfig = [
    { id: "verify", title: "Consumer Verification" },
    { id: "details", title: "Cylinder & Address" },
    { id: "review", title: "Review Order" },
    { id: "payment", title: "Payment" },
    { id: "confirm", title: "Confirmation" }
  ];

  // ----------------------------------------------------
  // STEP 1: CONSUMER VERIFICATION
  // ----------------------------------------------------
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const errs = {};

    const cleanConsumer = consumerNumber.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (!cleanConsumer) {
      errs.consumer = "Please enter your 10-digit Consumer Number.";
    } else if (cleanConsumer.length < 6) {
      errs.consumer = "Consumer number must be at least 6 to 10 digits.";
    }

    if (!cleanMobile) {
      errs.mobile = "Please enter your Registered Mobile Number.";
    } else if (cleanMobile.length !== 10) {
      errs.mobile = "Mobile number must be exactly 10 digits.";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      let foundCustomer = BHARATGAS_SAMPLE_CONSUMERS[cleanConsumer];
      if (!foundCustomer) {
        foundCustomer = {
          consumerNumber: cleanConsumer,
          name: "Smt. Latha Madhavan",
          mobile: cleanMobile,
          distributor: "Kerala State BPCL Gas Agency, Ernakulam",
          district: "Ernakulam",
          cylinderType: "14.2 kg Domestic Subsidized",
          address: "12/481, Orchid Gardens, Kaloor-Kadavanthra Road, Kochi, Kerala - 682017",
          subsidyStatus: "Active Aadhaar Linked",
          lastRefillDate: "14-Jul-2026",
          svNumber: "SV/8821901"
        };
      }
      setCustomer(foundCustomer);
      setDeliveryAddress(foundCustomer.address);
      setSelectedCylinderType(foundCustomer.cylinderType);
      setCurrentStepIndex(1); // Move to Customer Details & Selection
    }
  };

  // ----------------------------------------------------
  // STEP 2: CYLINDER SELECTION SUBMIT
  // ----------------------------------------------------
  const handleCylinderSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!selectedCylinderType) {
      errs.cylinder = "Please choose cylinder type.";
    }
    if (quantity < 1 || quantity > 3) {
      errs.quantity = "Allowed quantity is between 1 and 3 cylinders.";
    }
    if (!deliveryAddress.trim()) {
      errs.address = "Please verify or provide your delivery address.";
    } else if (deliveryAddress.trim().length < 10) {
      errs.address = "Delivery address must be detailed (at least 10 characters).";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStepIndex(2); // Move to Review
    }
  };

  // ----------------------------------------------------
  // STEP 3: PROCEED TO PAYMENT
  // ----------------------------------------------------
  const handleProceedToPayment = () => {
    setCurrentStepIndex(3); // Move to Payment
  };

  // ----------------------------------------------------
  // STEP 4: PAYMENT SUCCESS CALLBACK
  // ----------------------------------------------------
  const handlePaymentSuccess = (result) => {
    const random5 = Math.floor(10000 + Math.random() * 90000);
    const newBookingId = `GAS-BOOK-DEMO-${random5}`;

    setPaymentResult(result);
    setBookingId(newBookingId);
    setCurrentStepIndex(4); // Move to Confirmation
  };

  const activeCylinderObj =
    BHARATGAS_CYLINDER_TYPES.find((c) => c.type === selectedCylinderType) ||
    BHARATGAS_CYLINDER_TYPES[0];
  const cylinderCost = activeCylinderObj.price * quantity;
  const deliveryCharge = activeCylinderObj.deliveryFee;
  const totalAmount = cylinderCost + deliveryCharge;

  return (
    <div className="lantern-page-shell bharatgas-page-theme">
      <DemoNotice currentService="bharatgas" />
      <SiteHeader
        serviceId="bharatgas"
        title="Bharatgas LPG Booking"
        subtitle="Bharat Petroleum Corporation Limited — Online Refill Reservation"
        badgeText="Official Demo"
      />

      <main id="main-content" className="portal-main-area">
        <div className="lantern-container">
          <StepIndicator
            steps={stepsConfig}
            currentStepIndex={currentStepIndex}
            onStepClick={(idx) => {
              if (idx < currentStepIndex && currentStepIndex !== 4) {
                setCurrentStepIndex(idx);
              }
            }}
          />

          {/* ==================================================== */}
          {/* STEP 1: CONSUMER VERIFICATION FORM */}
          {/* ==================================================== */}
          {currentStepIndex === 0 && (
            <div className="portal-form-wrapper" aria-labelledby="bharatgas-verify-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 1</span>
                <h2 id="bharatgas-verify-heading" className="section-main-heading">
                  Consumer Verification
                </h2>
                <p className="section-desc">
                  Enter your registered Bharatgas LPG Consumer Number and 10-digit mobile number to access refill booking.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="search-box-card" noValidate>
                <div className="form-fields-grid-2col">
                  {/* CONSUMER NUMBER */}
                  <div className="field-group">
                    <label htmlFor="bharatgas-consumer-number" className="field-label">
                      <User size={16} className="label-icon" aria-hidden="true" />
                      <span>Bharatgas Consumer Number <span className="req">*</span></span>
                    </label>
                    <input
                      id="bharatgas-consumer-number"
                      type="text"
                      className={`form-input ${errors.consumer ? "input-error" : ""}`}
                      placeholder="e.g. 1002345678"
                      value={consumerNumber}
                      onChange={(e) => {
                        setConsumerNumber(e.target.value);
                        if (errors.consumer) setErrors({ ...errors, consumer: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.consumer ? "true" : "false"}
                      aria-describedby={errors.consumer ? "err-bg-consumer" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="enter-consumer-number"
                      data-lantern-label="Consumer number"
                    >
                    </input>
                    {errors.consumer && (
                      <p id="err-bg-consumer" className="field-error-msg" role="alert">
                        {errors.consumer}
                      </p>
                    )}
                  </div>

                  {/* REGISTERED MOBILE */}
                  <div className="field-group">
                    <label htmlFor="bharatgas-mobile" className="field-label">
                      <Phone size={16} className="label-icon" aria-hidden="true" />
                      <span>Registered Mobile Number <span className="req">*</span></span>
                    </label>
                    <input
                      id="bharatgas-mobile"
                      type="tel"
                      maxLength={10}
                      className={`form-input ${errors.mobile ? "input-error" : ""}`}
                      placeholder="10-digit registered mobile"
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setMobileNumber(val);
                        if (errors.mobile) setErrors({ ...errors, mobile: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.mobile ? "true" : "false"}
                      aria-describedby={errors.mobile ? "err-bg-mobile" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="enter-mobile-number"
                      data-lantern-label="Mobile number"
                    />
                    {errors.mobile && (
                      <p id="err-bg-mobile" className="field-error-msg" role="alert">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Auto-Fill Sample Profiles */}
                <div className="quick-suggestions-row">
                  <span className="suggestions-title">Test Demo Consumer Profiles:</span>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1002345678");
                      setMobileNumber("9847123456");
                      setErrors({});
                    }}
                  >
                    Ananya Ramesh (Kozhikode)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1009876543");
                      setMobileNumber("9447654321");
                      setErrors({});
                    }}
                  >
                    Suresh Kumar (Ernakulam)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setConsumerNumber("1005544332");
                      setMobileNumber("9745112233");
                      setErrors({});
                    }}
                  >
                    Mariam Varghese (Trivandrum)
                  </button>
                </div>

                {/* CONTINUE BUTTON */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    id="bharatgas-continue"
                    className="btn-search-primary"
                    data-lantern-step="1"
                    data-lantern-action="verify-consumer"
                    data-lantern-label="Verify and Continue"
                  >
                    <ShieldCheck size={18} aria-hidden="true" />
                    <span>Verify & Continue</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: VERIFIED DETAILS & CYLINDER SELECTION */}
          {/* ==================================================== */}
          {currentStepIndex === 1 && customer && (
            <div className="portal-form-wrapper" aria-labelledby="bharatgas-order-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 2</span>
                <h2 id="bharatgas-order-heading" className="section-main-heading">
                  Verified Consumer Details & Refill Selection
                </h2>
                <p className="section-desc">
                  Consumer verified successfully. Choose cylinder type, refill quantity, and verify doorstep delivery address.
                </p>
              </div>

              {/* Verified Consumer Badge Card */}
              <div className="verified-consumer-card" aria-label="Verified Customer Profile">
                <div className="verified-badge-top">
                  <div className="verified-icon-box" aria-hidden="true">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="verified-kicker">Bharatgas Verified Consumer Record</span>
                    <h3 className="verified-name">{customer.name}</h3>
                  </div>
                </div>

                <div className="verified-grid-3col">
                  <div className="verified-item">
                    <span className="v-label">Consumer No:</span>
                    <span className="v-val font-mono">{customer.consumerNumber}</span>
                  </div>
                  <div className="verified-item">
                    <span className="v-label">LPG Distributor:</span>
                    <span className="v-val">{customer.distributor}</span>
                  </div>
                  <div className="verified-item">
                    <span className="v-label">Registered Mobile:</span>
                    <span className="v-val">+91 {customer.mobile}</span>
                  </div>
                  <div className="verified-item">
                    <span className="v-label">DBT Subsidy Status:</span>
                    <span className="v-val text-green">{customer.subsidyStatus}</span>
                  </div>
                  <div className="verified-item">
                    <span className="v-label">Subscription Voucher:</span>
                    <span className="v-val font-mono">{customer.svNumber}</span>
                  </div>
                  <div className="verified-item">
                    <span className="v-label">Last Refill Date:</span>
                    <span className="v-val">{customer.lastRefillDate}</span>
                  </div>
                </div>
              </div>

              {/* Order Selection Form */}
              <form onSubmit={handleCylinderSubmit} className="passenger-form-card" noValidate>
                <div className="form-fields-grid-2col">
                  {/* CYLINDER TYPE */}
                  <div className="field-group">
                    <label htmlFor="bharatgas-cylinder-type" className="field-label">
                      <Flame size={16} className="label-icon" aria-hidden="true" />
                      <span>Select Cylinder Type <span className="req">*</span></span>
                    </label>
                    <select
                      id="bharatgas-cylinder-type"
                      className={`form-input ${errors.cylinder ? "input-error" : ""}`}
                      value={selectedCylinderType}
                      onChange={(e) => {
                        setSelectedCylinderType(e.target.value);
                        if (errors.cylinder) setErrors({ ...errors, cylinder: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.cylinder ? "true" : "false"}
                      aria-describedby={errors.cylinder ? "err-bg-cylinder" : undefined}
                      data-lantern-step="2"
                      data-lantern-action="select-cylinder-type"
                      data-lantern-label="Cylinder type"
                    >
                      {BHARATGAS_CYLINDER_TYPES.map((cyl) => (
                        <option key={cyl.type} value={cyl.type}>
                          {cyl.name} — ₹{cyl.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {errors.cylinder && (
                      <p id="err-bg-cylinder" className="field-error-msg" role="alert">
                        {errors.cylinder}
                      </p>
                    )}
                    <p className="field-helper-text">
                      {activeCylinderObj.description}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="field-group">
                    <label htmlFor="bharatgas-quantity" className="field-label">
                      <Layers size={16} className="label-icon" aria-hidden="true" />
                      <span>Cylinder Quantity <span className="req">*</span></span>
                    </label>
                    <select
                      id="bharatgas-quantity"
                      className={`form-input ${errors.quantity ? "input-error" : ""}`}
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(Number(e.target.value));
                        if (errors.quantity) setErrors({ ...errors, quantity: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.quantity ? "true" : "false"}
                      aria-describedby={errors.quantity ? "err-bg-qty" : undefined}
                      data-lantern-step="2"
                      data-lantern-action="select-quantity"
                      data-lantern-label="Cylinder quantity"
                    >
                      <option value={1}>1 Cylinder (Standard Household Refill)</option>
                      <option value={2}>2 Cylinders (Double Bottle Connection)</option>
                      <option value={3}>3 Cylinders</option>
                    </select>
                    {errors.quantity && (
                      <p id="err-bg-qty" className="field-error-msg" role="alert">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* DELIVERY ADDRESS */}
                  <div className="field-group span-2">
                    <label htmlFor="bharatgas-address" className="field-label">
                      <MapPin size={16} className="label-icon" aria-hidden="true" />
                      <span>Registered Delivery Address <span className="req">*</span></span>
                    </label>
                    <textarea
                      id="bharatgas-address"
                      rows={3}
                      className={`form-input ${errors.address ? "input-error" : ""}`}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: null });
                      }}
                      placeholder="Street address, building, landmarks, pin code"
                      aria-required="true"
                      aria-invalid={errors.address ? "true" : "false"}
                      aria-describedby={errors.address ? "err-bg-addr" : undefined}
                      data-lantern-step="2"
                      data-lantern-action="enter-delivery-address"
                      data-lantern-label="Delivery address"
                    />
                    {errors.address && (
                      <p id="err-bg-addr" className="field-error-msg" role="alert">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="passenger-actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentStepIndex(0)}
                    data-lantern-action="back-to-verify"
                  >
                    Change Consumer
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    data-lantern-step="2"
                    data-lantern-action="confirm-cylinder-selection"
                    data-lantern-label="Proceed to review booking"
                  >
                    <span>Proceed to Review Order</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: REVIEW BOOKING */}
          {/* ==================================================== */}
          {currentStepIndex === 2 && customer && (
            <div className="portal-review-wrapper" aria-labelledby="bharatgas-review-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 3</span>
                <h2 id="bharatgas-review-heading" className="section-main-heading">
                  Review LPG Refill Order
                </h2>
                <p className="section-desc">
                  Verify customer details, selected cylinder, delivery address, and price breakdown.
                </p>
              </div>

              <div className="review-cards-container">
                <div className="review-summary-card">
                  <h3 className="card-subhead">Consumer & Distributor Details</h3>
                  <div className="summary-table">
                    <div className="table-row">
                      <span className="row-key">Consumer Name:</span>
                      <span className="row-val font-bold">{customer.name}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Consumer Number:</span>
                      <span className="row-val font-mono">{customer.consumerNumber}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">LPG Distributor:</span>
                      <span className="row-val">{customer.distributor}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Delivery Address:</span>
                      <span className="row-val">{deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="modify-buttons-row">
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(1)}
                      data-lantern-action="modify-gas-details"
                    >
                      Modify Details / Address
                    </button>
                  </div>
                </div>

                <div className="fare-breakdown-card">
                  <h3 className="card-subhead">LPG Price Breakdown</h3>
                  <div className="fare-table">
                    <div className="fare-row">
                      <span>{activeCylinderObj.name} ({quantity} × ₹{activeCylinderObj.price.toFixed(2)}):</span>
                      <span>₹{cylinderCost.toFixed(2)}</span>
                    </div>
                    <div className="fare-row">
                      <span>Doorstep Delivery & Handling:</span>
                      <span>{deliveryCharge === 0 ? "FREE (Included)" : `₹${deliveryCharge.toFixed(2)}`}</span>
                    </div>
                    <div className="fare-row total-row">
                      <span>Total Amount Payable:</span>
                      <span className="total-highlight">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="delivery-time-callout">
                    <Truck size={18} aria-hidden="true" />
                    <span>Estimated doorstep delivery within 24 to 48 hours of demo booking.</span>
                  </div>

                  <div className="proceed-payment-action-block">
                    <button
                      type="button"
                      id="bharatgas-proceed-payment"
                      className="btn-proceed-large"
                      onClick={handleProceedToPayment}
                      data-lantern-step="3"
                      data-lantern-action="proceed-to-payment"
                      data-lantern-label="Proceed to Payment"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: DEMO PAYMENT GATEWAY */}
          {/* ==================================================== */}
          {currentStepIndex === 3 && (
            <div className="portal-payment-container">
              <PaymentDemo
                servicePrefix="GAS"
                serviceId="bharatgas"
                amount={totalAmount}
                itemDescription={`Bharatgas Refill (${quantity}x ${activeCylinderObj.name})`}
                stepNumber={4}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setCurrentStepIndex(2)}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 5: CONFIRMATION */}
          {/* ==================================================== */}
          {currentStepIndex === 4 && (
            <ConfirmationCard
              containerId="bharatgas-confirmation"
              serviceName="LPG Cylinder Refill"
              serviceType="bharatgas"
              bookingId={bookingId}
              txnId={paymentResult?.txnId || "GAS-TXN-DEMO-12345"}
              amount={totalAmount}
              disclaimerText="DEMO GAS BOOKING — NOT A REAL BOOKING"
              details={[
                { label: "Customer Name", value: customer?.name },
                { label: "Consumer Number", value: customer?.consumerNumber },
                { label: "LPG Distributor", value: customer?.distributor, fullWidth: true },
                { label: "Cylinder Type", value: activeCylinderObj?.name },
                { label: "Refill Quantity", value: `${quantity} Cylinder(s)` },
                { label: "Delivery Address", value: deliveryAddress, fullWidth: true },
                { label: "Payment Status", value: `${paymentResult?.paymentMethod || "UPI"} (Simulated Success)`, highlight: true },
                { label: "Expected Delivery", value: "24-48 Hours (Simulated Window)" },
                { label: "Total Amount Paid", value: `₹${totalAmount.toFixed(2)}`, highlight: true }
              ]}
              onReset={() => {
                setCurrentStepIndex(0);
                setCustomer(null);
                setPaymentResult(null);
                setBookingId("");
              }}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
