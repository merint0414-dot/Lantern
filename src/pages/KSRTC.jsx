import { useState } from "react";
import {
  Bus,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle
} from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StepIndicator from "../components/StepIndicator";
import SeatMap from "../components/SeatMap";
import PaymentDemo from "../components/PaymentDemo";
import ConfirmationCard from "../components/ConfirmationCard";
import { KERALA_LOCATIONS, KSRTC_BUSES } from "../data/demoData";

export default function KSRTC() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form State
  const [fromLoc, setFromLoc] = useState("Thrissur");
  const [toLoc, setToLoc] = useState("Ernakulam");
  const [journeyDate, setJourneyDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [passengersCount, setPassengersCount] = useState(1);

  // Selected State
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Passenger Details State
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [passengerGender, setPassengerGender] = useState("Male");
  const [passengerMobile, setPassengerMobile] = useState("");

  // Payment & Confirmation State
  const [paymentResult, setPaymentResult] = useState(null);
  const [bookingId, setBookingId] = useState("");

  // Validation Errors
  const [errors, setErrors] = useState({});

  const stepsConfig = [
    { id: "search", title: "Search Bus" },
    { id: "results", title: "Select Bus" },
    { id: "seats", title: "Pick Seat" },
    { id: "passengers", title: "Passenger Info" },
    { id: "review", title: "Review" },
    { id: "payment", title: "Payment" },
    { id: "confirm", title: "Ticket" }
  ];

  // ----------------------------------------------------
  // STEP 5: SEARCH BUSES VALIDATION & SUBMISSION
  // ----------------------------------------------------
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!fromLoc) {
      errs.from = "Please enter departure location.";
    }
    if (!toLoc) {
      errs.to = "Please enter destination location.";
    }
    if (fromLoc && toLoc && fromLoc.toLowerCase() === toLoc.toLowerCase()) {
      errs.to = "Departure and destination cannot be identical.";
    }
    if (!journeyDate) {
      errs.date = "Please pick a journey date.";
    }
    if (Number(passengersCount) < 1) {
      errs.passengers = "Minimum 1 passenger is required.";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStepIndex(1); // Move to Results
    }
  };

  // ----------------------------------------------------
  // STEP 7: SELECT BUS
  // ----------------------------------------------------
  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]); // reset seats
    setCurrentStepIndex(2); // Move to Seat Selection
  };

  // ----------------------------------------------------
  // STEP 8: TOGGLE SEAT
  // ----------------------------------------------------
  const handleSeatToggle = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      // Limit to passengersCount
      if (selectedSeats.length < Number(passengersCount)) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        if (Number(passengersCount) === 1) {
          setSelectedSeats([seatId]);
        }
      }
    }
    if (errors.seats) {
      setErrors({ ...errors, seats: null });
    }
  };

  const handleSeatConfirm = () => {
    if (selectedSeats.length === 0) {
      setErrors({ seats: "Please choose at least 1 seat before proceeding." });
      return;
    }
    if (selectedSeats.length < Number(passengersCount)) {
      setErrors({
        seats: `You selected ${passengersCount} passenger(s). Please choose ${passengersCount} seat(s).`
      });
      return;
    }
    setCurrentStepIndex(3); // Move to Passenger Details
  };

  // ----------------------------------------------------
  // STEP 9: PASSENGER DETAILS VALIDATION
  // ----------------------------------------------------
  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!passengerName.trim()) {
      errs.name = "Please enter passenger full name.";
    } else if (passengerName.trim().length < 3) {
      errs.name = "Name must be at least 3 characters.";
    }

    const ageNum = parseInt(passengerAge, 10);
    if (!passengerAge || isNaN(ageNum)) {
      errs.age = "Please enter a valid age.";
    } else if (ageNum < 1 || ageNum > 115) {
      errs.age = "Age must be between 1 and 115.";
    }

    if (!passengerGender) {
      errs.gender = "Please select gender.";
    }

    const cleanMobile = passengerMobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Please enter 10-digit mobile number.";
    } else if (cleanMobile.length !== 10) {
      errs.mobile = "Mobile number must be exactly 10 digits.";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStepIndex(4); // Move to Review
    }
  };

  // ----------------------------------------------------
  // STEP 10: PROCEED TO PAYMENT
  // ----------------------------------------------------
  const handleProceedToPayment = () => {
    setCurrentStepIndex(5); // Move to Payment
  };

  // ----------------------------------------------------
  // STEP 12: PAYMENT SUCCESS CALLBACK
  // ----------------------------------------------------
  const handlePaymentSuccess = (result) => {
    const randomBookingNum = Math.floor(10000 + Math.random() * 90000);
    const newBookingId = `KSRTC-BOOK-DEMO-${randomBookingNum}`;

    setPaymentResult(result);
    setBookingId(newBookingId);
    setCurrentStepIndex(6); // Move to Confirmation
  };

  // Calculate Fares
  const baseFare = selectedBus ? selectedBus.fare * (selectedSeats.length || 1) : 350;
  const serviceCharge = 15;
  const totalAmount = baseFare + serviceCharge;

  return (
    <div className="lantern-page-shell ksrtc-page-theme">
      <DemoNotice currentService="ksrtc" />
      <SiteHeader
        serviceId="ksrtc"
        title="KSRTC Bus Booking"
        subtitle="Kerala State Road Transport Corporation — Online Reservation Portal"
        badgeText="Official Demo"
      />

      <main id="main-content" className="portal-main-area">
        <div className="lantern-container">
          {/* Progress Indicator */}
          <StepIndicator
            steps={stepsConfig}
            currentStepIndex={currentStepIndex}
            onStepClick={(idx) => {
              if (idx < currentStepIndex && currentStepIndex !== 6) {
                setCurrentStepIndex(idx);
              }
            }}
          />

          {/* ==================================================== */}
          {/* STEP 1-5: SEARCH BUSES FORM */}
          {/* ==================================================== */}
          {currentStepIndex === 0 && (
            <div className="portal-form-wrapper" aria-labelledby="ksrtc-search-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 1 - 5</span>
                <h2 id="ksrtc-search-heading" className="section-main-heading">
                  Search Kerala RTC Buses
                </h2>
                <p className="section-desc">
                  Select your boarding station, arrival point, and date of journey.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="search-box-card" noValidate>
                <div className="form-fields-grid-2col">
                  {/* STEP 1: FROM */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-from" className="field-label">
                      <MapPin size={16} className="label-icon" aria-hidden="true" />
                      <span>Departure Location (From) <span className="req">*</span></span>
                    </label>
                    <select
                      id="ksrtc-from"
                      className={`form-input ${errors.from ? "input-error" : ""}`}
                      value={fromLoc}
                      onChange={(e) => {
                        setFromLoc(e.target.value);
                        if (errors.from) setErrors({ ...errors, from: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.from ? "true" : "false"}
                      aria-describedby={errors.from ? "err-from" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="enter-from"
                      data-lantern-label="Departure location"
                    >
                      <option value="">-- Select Departure City --</option>
                      {KERALA_LOCATIONS.map((city) => (
                        <option key={`from-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.from && (
                      <p id="err-from" className="field-error-msg" role="alert">
                        {errors.from}
                      </p>
                    )}
                  </div>

                  {/* STEP 2: TO */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-to" className="field-label">
                      <MapPin size={16} className="label-icon" aria-hidden="true" />
                      <span>Destination Location (To) <span className="req">*</span></span>
                    </label>
                    <select
                      id="ksrtc-to"
                      className={`form-input ${errors.to ? "input-error" : ""}`}
                      value={toLoc}
                      onChange={(e) => {
                        setToLoc(e.target.value);
                        if (errors.to) setErrors({ ...errors, to: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.to ? "true" : "false"}
                      aria-describedby={errors.to ? "err-to" : undefined}
                      data-lantern-step="2"
                      data-lantern-action="enter-to"
                      data-lantern-label="Destination location"
                    >
                      <option value="">-- Select Destination City --</option>
                      {KERALA_LOCATIONS.map((city) => (
                        <option key={`to-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.to && (
                      <p id="err-to" className="field-error-msg" role="alert">
                        {errors.to}
                      </p>
                    )}
                  </div>

                  {/* STEP 3: DATE */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-date" className="field-label">
                      <Calendar size={16} className="label-icon" aria-hidden="true" />
                      <span>Journey Date <span className="req">*</span></span>
                    </label>
                    <input
                      id="ksrtc-date"
                      type="date"
                      className={`form-input ${errors.date ? "input-error" : ""}`}
                      value={journeyDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setJourneyDate(e.target.value);
                        if (errors.date) setErrors({ ...errors, date: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.date ? "true" : "false"}
                      aria-describedby={errors.date ? "err-date" : undefined}
                      data-lantern-step="3"
                      data-lantern-action="select-date"
                      data-lantern-label="Journey date"
                    />
                    {errors.date && (
                      <p id="err-date" className="field-error-msg" role="alert">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* STEP 4: PASSENGERS */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-passengers" className="field-label">
                      <Users size={16} className="label-icon" aria-hidden="true" />
                      <span>Passengers Count <span className="req">*</span></span>
                    </label>
                    <select
                      id="ksrtc-passengers"
                      className={`form-input ${errors.passengers ? "input-error" : ""}`}
                      value={passengersCount}
                      onChange={(e) => {
                        setPassengersCount(Number(e.target.value));
                        if (errors.passengers) setErrors({ ...errors, passengers: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.passengers ? "true" : "false"}
                      aria-describedby={errors.passengers ? "err-passengers" : undefined}
                      data-lantern-step="4"
                      data-lantern-action="select-passengers"
                      data-lantern-label="Passenger count"
                    >
                      <option value={1}>1 Passenger (Individual)</option>
                      <option value={2}>2 Passengers</option>
                      <option value={3}>3 Passengers</option>
                      <option value={4}>4 Passengers</option>
                    </select>
                    {errors.passengers && (
                      <p id="err-passengers" className="field-error-msg" role="alert">
                        {errors.passengers}
                      </p>
                    )}
                  </div>
                </div>

                {/* Popular Route Quick Suggestion Pills */}
                <div className="quick-suggestions-row">
                  <span className="suggestions-title">Popular Routes:</span>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromLoc("Thrissur");
                      setToLoc("Ernakulam");
                    }}
                  >
                    Thrissur → Ernakulam
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromLoc("Kozhikode");
                      setToLoc("Thiruvananthapuram");
                    }}
                  >
                    Kozhikode → Thiruvananthapuram
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromLoc("Kollam");
                      setToLoc("Kochi");
                    }}
                  >
                    Kollam → Kochi
                  </button>
                </div>

                {/* STEP 5: SEARCH BUTTON */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    id="ksrtc-search"
                    className="btn-search-primary"
                    data-lantern-step="5"
                    data-lantern-action="search-bus"
                    data-lantern-label="Search buses"
                  >
                    <Bus size={18} aria-hidden="true" />
                    <span>Search Buses</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 6-7: BUS RESULTS LIST */}
          {/* ==================================================== */}
          {currentStepIndex === 1 && (
            <div className="portal-results-wrapper" aria-labelledby="ksrtc-results-heading">
              <div className="results-top-bar">
                <div>
                  <span className="section-step-kicker">STEP 6 & 7</span>
                  <h2 id="ksrtc-results-heading" className="section-main-heading">
                    Available Buses ({fromLoc} to {toLoc})
                  </h2>
                  <p className="results-subtext">
                    Journey Date: <strong>{journeyDate}</strong> | Passengers: <strong>{passengersCount}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-modify-search"
                  onClick={() => setCurrentStepIndex(0)}
                  data-lantern-action="modify-search"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Modify Search</span>
                </button>
              </div>

              <div className="bus-results-list" role="list">
                {KSRTC_BUSES.map((bus, idx) => (
                  <article
                    key={bus.id}
                    className="bus-card"
                    role="listitem"
                    aria-labelledby={`bus-name-${bus.id}`}
                  >
                    <div className="bus-card-left">
                      <div className="bus-title-row">
                        <h3 id={`bus-name-${bus.id}`} className="bus-name">
                          {bus.name}
                        </h3>
                        <span className="bus-type-pill">{bus.type}</span>
                      </div>

                      <div className="bus-timings-grid">
                        <div className="time-block">
                          <span className="time-label">Departure</span>
                          <span className="time-val">{bus.departureTime}</span>
                          <span className="station-name">{fromLoc}</span>
                        </div>

                        <div className="duration-block" aria-hidden="true">
                          <span className="duration-text">{bus.duration}</span>
                          <div className="duration-line">
                            <span className="dot"></span>
                            <span className="line"></span>
                            <span className="arrow">▶</span>
                          </div>
                          <span className="stops-info">Direct Highway</span>
                        </div>

                        <div className="time-block">
                          <span className="time-label">Arrival</span>
                          <span className="time-val">{bus.arrivalTime}</span>
                          <span className="station-name">{toLoc}</span>
                        </div>
                      </div>

                      <div className="bus-features-row">
                        {bus.features.map((feat, fIdx) => (
                          <span key={fIdx} className="feature-chip">
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bus-card-right">
                      <div className="seat-avail-box">
                        <span className="avail-count">{bus.availableSeats} seats</span>
                        <span className="avail-label">available</span>
                      </div>

                      <div className="bus-price-box">
                        <span className="price-val">₹{bus.fare}</span>
                        <span className="price-sub">per seat</span>
                      </div>

                      <button
                        type="button"
                        id={idx === 0 ? "ksrtc-select-bus" : `ksrtc-select-bus-${idx}`}
                        className="btn-select-bus"
                        onClick={() => handleSelectBus(bus)}
                        data-lantern-step="7"
                        data-lantern-action="select-bus"
                        data-lantern-label={`Select ${bus.name}`}
                      >
                        <span>Select Bus</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 8: SEAT SELECTION */}
          {/* ==================================================== */}
          {currentStepIndex === 2 && selectedBus && (
            <div className="portal-seat-wrapper" aria-labelledby="ksrtc-seat-heading">
              <div className="section-header-banner">
                <div>
                  <span className="section-step-kicker">STEP 8</span>
                  <h2 id="ksrtc-seat-heading" className="section-main-heading">
                    Choose Your Seat on {selectedBus.name}
                  </h2>
                  <p className="section-desc">
                    {fromLoc} → {toLoc} | Departure: {selectedBus.departureTime} | Fare: ₹{selectedBus.fare} / seat
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-back-link"
                  onClick={() => setCurrentStepIndex(1)}
                  data-lantern-action="back-to-buses"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  <span>Choose Another Bus</span>
                </button>
              </div>

              {errors.seats && (
                <div className="selection-error-banner" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{errors.seats}</span>
                </div>
              )}

              <SeatMap
                bookedSeats={selectedBus.bookedSeats || []}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                maxSeats={Number(passengersCount)}
                farePerSeat={selectedBus.fare}
              />

              <div className="seat-actions-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCurrentStepIndex(1)}
                  data-lantern-action="back-to-buses"
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSeatConfirm}
                  disabled={selectedSeats.length === 0}
                  data-lantern-step="8"
                  data-lantern-action="confirm-seats"
                  data-lantern-label="Confirm seat selection"
                >
                  <span>Proceed to Passenger Details ({selectedSeats.length}/{passengersCount} seats selected)</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 9: PASSENGER DETAILS FORM */}
          {/* ==================================================== */}
          {currentStepIndex === 3 && (
            <div className="portal-form-wrapper" aria-labelledby="ksrtc-passenger-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 9</span>
                <h2 id="ksrtc-passenger-heading" className="section-main-heading">
                  Enter Passenger Details
                </h2>
                <p className="section-desc">
                  Selected Seat: <strong>{selectedSeats.join(", ")}</strong> on {selectedBus?.name}
                </p>
              </div>

              <form onSubmit={handlePassengerSubmit} className="passenger-form-card" noValidate>
                <div className="form-fields-grid-2col">
                  {/* PASSENGER NAME */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-passenger-name" className="field-label">
                      Passenger Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="ksrtc-passenger-name"
                      type="text"
                      className={`form-input ${errors.name ? "input-error" : ""}`}
                      placeholder="e.g. Anandha Krishnan"
                      value={passengerName}
                      onChange={(e) => {
                        setPassengerName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.name ? "true" : "false"}
                      aria-describedby={errors.name ? "err-pname" : undefined}
                      data-lantern-step="9"
                      data-lantern-action="enter-passenger-name"
                      data-lantern-label="Passenger name"
                    />
                    {errors.name && (
                      <p id="err-pname" className="field-error-msg" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* AGE */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-passenger-age" className="field-label">
                      Age (in years) <span className="req">*</span>
                    </label>
                    <input
                      id="ksrtc-passenger-age"
                      type="number"
                      min={1}
                      max={115}
                      className={`form-input ${errors.age ? "input-error" : ""}`}
                      placeholder="e.g. 28"
                      value={passengerAge}
                      onChange={(e) => {
                        setPassengerAge(e.target.value);
                        if (errors.age) setErrors({ ...errors, age: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.age ? "true" : "false"}
                      aria-describedby={errors.age ? "err-page" : undefined}
                      data-lantern-step="9"
                      data-lantern-action="enter-passenger-age"
                      data-lantern-label="Passenger age"
                    />
                    {errors.age && (
                      <p id="err-page" className="field-error-msg" role="alert">
                        {errors.age}
                      </p>
                    )}
                  </div>

                  {/* GENDER */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-passenger-gender" className="field-label">
                      Gender <span className="req">*</span>
                    </label>
                    <select
                      id="ksrtc-passenger-gender"
                      className={`form-input ${errors.gender ? "input-error" : ""}`}
                      value={passengerGender}
                      onChange={(e) => {
                        setPassengerGender(e.target.value);
                        if (errors.gender) setErrors({ ...errors, gender: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.gender ? "true" : "false"}
                      aria-describedby={errors.gender ? "err-pgender" : undefined}
                      data-lantern-step="9"
                      data-lantern-action="select-passenger-gender"
                      data-lantern-label="Passenger gender"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p id="err-pgender" className="field-error-msg" role="alert">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* MOBILE NUMBER */}
                  <div className="field-group">
                    <label htmlFor="ksrtc-passenger-mobile" className="field-label">
                      Contact Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      id="ksrtc-passenger-mobile"
                      type="tel"
                      maxLength={10}
                      className={`form-input ${errors.mobile ? "input-error" : ""}`}
                      placeholder="10-digit mobile number"
                      value={passengerMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPassengerMobile(val);
                        if (errors.mobile) setErrors({ ...errors, mobile: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.mobile ? "true" : "false"}
                      aria-describedby={errors.mobile ? "err-pmobile" : undefined}
                      data-lantern-step="9"
                      data-lantern-action="enter-passenger-mobile"
                      data-lantern-label="Passenger mobile"
                    />
                    {errors.mobile && (
                      <p id="err-pmobile" className="field-error-msg" role="alert">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Auto-Fill for Testing */}
                <div className="quick-fill-row">
                  <button
                    type="button"
                    className="btn-quick-fill"
                    onClick={() => {
                      setPassengerName("Gopika Narayanan");
                      setPassengerAge("32");
                      setPassengerGender("Female");
                      setPassengerMobile("9847123456");
                      setErrors({});
                    }}
                  >
                    <Sparkles size={14} aria-hidden="true" />
                    <span>Auto-Fill Sample Passenger Details</span>
                  </button>
                </div>

                <div className="passenger-actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentStepIndex(2)}
                    data-lantern-action="back-to-seats"
                  >
                    Back to Seat Map
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    data-lantern-step="9"
                    data-lantern-action="submit-passenger-details"
                    data-lantern-label="Submit passenger details"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 10: REVIEW BOOKING */}
          {/* ==================================================== */}
          {currentStepIndex === 4 && (
            <div className="portal-review-wrapper" aria-labelledby="ksrtc-review-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 10</span>
                <h2 id="ksrtc-review-heading" className="section-main-heading">
                  Review Bus Booking Summary
                </h2>
                <p className="section-desc">
                  Please verify your journey details and passenger information before payment.
                </p>
              </div>

              <div className="review-cards-container">
                <div className="review-summary-card">
                  <h3 className="card-subhead">Journey & Bus Details</h3>
                  <div className="summary-table">
                    <div className="table-row">
                      <span className="row-key">Route:</span>
                      <span className="row-val font-bold">
                        {fromLoc} → {toLoc}
                      </span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Bus Name:</span>
                      <span className="row-val">{selectedBus?.name} ({selectedBus?.type})</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Departure Time:</span>
                      <span className="row-val">{selectedBus?.departureTime}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Journey Date:</span>
                      <span className="row-val">{journeyDate}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Allocated Seat(s):</span>
                      <span className="row-val text-badge">{selectedSeats.join(", ")}</span>
                    </div>
                  </div>

                  <div className="modify-buttons-row">
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(1)}
                      data-lantern-action="modify-bus"
                    >
                      Modify Bus
                    </button>
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(2)}
                      data-lantern-action="modify-seat"
                    >
                      Modify Seat
                    </button>
                  </div>
                </div>

                <div className="review-summary-card">
                  <h3 className="card-subhead">Passenger Details</h3>
                  <div className="summary-table">
                    <div className="table-row">
                      <span className="row-key">Primary Passenger:</span>
                      <span className="row-val font-bold">{passengerName}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Age / Gender:</span>
                      <span className="row-val">
                        {passengerAge} yrs, {passengerGender}
                      </span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Mobile Number:</span>
                      <span className="row-val">+91 {passengerMobile}</span>
                    </div>
                  </div>

                  <div className="modify-buttons-row">
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(3)}
                      data-lantern-action="modify-passenger"
                    >
                      Modify Passenger
                    </button>
                  </div>
                </div>

                <div className="fare-breakdown-card">
                  <h3 className="card-subhead">Fare Breakdown</h3>
                  <div className="fare-table">
                    <div className="fare-row">
                      <span>Base Bus Fare ({selectedSeats.length} seat × ₹{selectedBus?.fare}):</span>
                      <span>₹{baseFare.toFixed(2)}</span>
                    </div>
                    <div className="fare-row">
                      <span>Online Booking Service Charge:</span>
                      <span>₹{serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="fare-row total-row">
                      <span>Total Amount Payable:</span>
                      <span className="total-highlight">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="proceed-payment-action-block">
                    <button
                      type="button"
                      id="ksrtc-proceed-payment"
                      className="btn-proceed-large"
                      onClick={handleProceedToPayment}
                      data-lantern-step="10"
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
          {/* STEP 11-12: DEMO PAYMENT GATEWAY */}
          {/* ==================================================== */}
          {currentStepIndex === 5 && (
            <div className="portal-payment-container">
              <PaymentDemo
                servicePrefix="KSRTC"
                serviceId="ksrtc"
                amount={totalAmount}
                itemDescription={`KSRTC Bus Ticket (${fromLoc} to ${toLoc})`}
                stepNumber={11}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setCurrentStepIndex(4)}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 13: CONFIRMATION */}
          {/* ==================================================== */}
          {currentStepIndex === 6 && (
            <ConfirmationCard
              containerId="ksrtc-confirmation"
              serviceName="Bus Ticket"
              serviceType="ksrtc"
              bookingId={bookingId}
              txnId={paymentResult?.txnId || "KSRTC-TXN-DEMO-12345"}
              amount={totalAmount}
              disclaimerText="DEMO ONLY — NOT A REAL BUS TICKET"
              details={[
                { label: "Origin / From", value: fromLoc },
                { label: "Destination / To", value: toLoc },
                { label: "Bus Service", value: selectedBus?.name, fullWidth: true },
                { label: "Journey Date", value: journeyDate },
                { label: "Departure Time", value: selectedBus?.departureTime },
                { label: "Seat Number(s)", value: selectedSeats.join(", "), highlight: true },
                { label: "Lead Passenger", value: `${passengerName} (${passengerAge} yrs, ${passengerGender})` },
                { label: "Passenger Mobile", value: `+91 ${passengerMobile}` },
                { label: "Payment Mode", value: `${paymentResult?.paymentMethod || "UPI"} (Simulated)` },
                { label: "Total Fare Paid", value: `₹${totalAmount.toFixed(2)}`, highlight: true }
              ]}
              onReset={() => {
                setCurrentStepIndex(0);
                setSelectedBus(null);
                setSelectedSeats([]);
                setPassengerName("");
                setPassengerAge("");
                setPassengerMobile("");
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
