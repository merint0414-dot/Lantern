import { useState } from "react";
import {
  Train,
  Calendar,
  Users,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StepIndicator from "../components/StepIndicator";
import PaymentDemo from "../components/PaymentDemo";
import ConfirmationCard from "../components/ConfirmationCard";
import { IRCTC_STATIONS, IRCTC_CLASSES, IRCTC_TRAINS } from "../data/demoData";

export default function IRCTC() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Search Fields
  const [fromStation, setFromStation] = useState("ERS");
  const [toStation, setToStation] = useState("CLT");
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [journeyClass, setJourneyClass] = useState("3A");
  const [passengersCount, setPassengersCount] = useState(1);

  // Selected Train & Class
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClassObj, setSelectedClassObj] = useState(null);

  // Passengers State
  const [passengers, setPassengers] = useState([
    { name: "", age: "", gender: "Male", berth: "Lower" }
  ]);

  // Payment & PNR
  const [paymentResult, setPaymentResult] = useState(null);
  const [demoPnr, setDemoPnr] = useState("");
  const [errors, setErrors] = useState({});

  const stepsConfig = [
    { id: "search", title: "Train Search" },
    { id: "trains", title: "Select Train" },
    { id: "passengers", title: "Passenger Info" },
    { id: "review", title: "Review Details" },
    { id: "payment", title: "Payment" },
    { id: "pnr", title: "Demo PNR" }
  ];

  const handlePassengerCountChange = (count) => {
    setPassengersCount(count);
    const updated = [...passengers];
    while (updated.length < count) {
      updated.push({ name: "", age: "", gender: "Male", berth: "No Preference" });
    }
    setPassengers(updated.slice(0, count));
  };

  // ----------------------------------------------------
  // STEP 1: SEARCH TRAINS VALIDATION
  // ----------------------------------------------------
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!fromStation) {
      errs.from = "Please select departure railway station.";
    }
    if (!toStation) {
      errs.to = "Please select destination railway station.";
    }
    if (fromStation && toStation && fromStation === toStation) {
      errs.to = "Departure and destination stations cannot be the same.";
    }
    if (!journeyDate) {
      errs.date = "Please pick journey date.";
    }
    if (!journeyClass) {
      errs.class = "Please choose booking class.";
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStepIndex(1); // Move to Train Results
    }
  };

  // ----------------------------------------------------
  // STEP 2: SELECT TRAIN
  // ----------------------------------------------------
  const handleSelectTrain = (train, cls) => {
    setSelectedTrain(train);
    setSelectedClassObj(cls);
    setCurrentStepIndex(2); // Move to Passenger Details
  };

  // ----------------------------------------------------
  // STEP 3: PASSENGER DETAILS SUBMIT
  // ----------------------------------------------------
  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    passengers.forEach((p, idx) => {
      if (!p.name.trim()) {
        errs[`name_${idx}`] = `Please enter Name for Passenger ${idx + 1}.`;
      }
      const ageNum = parseInt(p.age, 10);
      if (!p.age || isNaN(ageNum) || ageNum < 1 || ageNum > 115) {
        errs[`age_${idx}`] = `Valid age (1-115) required for Passenger ${idx + 1}.`;
      }
    });

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStepIndex(3); // Move to Review
    }
  };

  const updatePassengerField = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);

    if (errors[`${field}_${index}`]) {
      const nextErr = { ...errors };
      delete nextErr[`${field}_${index}`];
      setErrors(nextErr);
    }
  };

  // ----------------------------------------------------
  // STEP 4: PROCEED TO PAYMENT
  // ----------------------------------------------------
  const handleProceedToPayment = () => {
    setCurrentStepIndex(4); // Move to Demo Payment
  };

  // ----------------------------------------------------
  // STEP 5: PAYMENT SUCCESS -> PNR GENERATION
  // ----------------------------------------------------
  const handlePaymentSuccess = (result) => {
    const random10 = Math.floor(1000000000 + Math.random() * 9000000000);
    const newPnr = `IRCTC-DEMO-${random10}`;

    setPaymentResult(result);
    setDemoPnr(newPnr);
    setCurrentStepIndex(5); // Move to Confirmation
  };

  // Stations lookup
  const fromName = IRCTC_STATIONS.find((s) => s.code === fromStation)?.name || fromStation;
  const toName = IRCTC_STATIONS.find((s) => s.code === toStation)?.name || toStation;

  // Fare Calculation
  const unitFare = selectedClassObj?.fare || 540;
  const baseTotal = unitFare * passengersCount;
  const irctcConvenienceFee = 35.40;
  const totalAmount = baseTotal + irctcConvenienceFee;

  return (
    <div className="lantern-page-shell irctc-page-theme">
      <DemoNotice currentService="irctc" />
      <SiteHeader
        serviceId="irctc"
        title="IRCTC Railway E-Ticketing"
        subtitle="Indian Railway Catering and Tourism Corporation — NextGen Reservation System"
        badgeText="Official Demo"
      />

      <main id="main-content" className="portal-main-area">
        <div className="lantern-container">
          <StepIndicator
            steps={stepsConfig}
            currentStepIndex={currentStepIndex}
            onStepClick={(idx) => {
              if (idx < currentStepIndex && currentStepIndex !== 5) {
                setCurrentStepIndex(idx);
              }
            }}
          />

          {/* ==================================================== */}
          {/* STEP 1: SEARCH TRAINS FORM */}
          {/* ==================================================== */}
          {currentStepIndex === 0 && (
            <div className="portal-form-wrapper" aria-labelledby="irctc-search-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 1</span>
                <h2 id="irctc-search-heading" className="section-main-heading">
                  Search Indian Railways Trains
                </h2>
                <p className="section-desc">
                  Check train availability, coach classes, and live demo schedules across Kerala and South India.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="search-box-card" noValidate>
                <div className="form-fields-grid-2col">
                  {/* FROM STATION */}
                  <div className="field-group">
                    <label htmlFor="irctc-from" className="field-label">
                      <Train size={16} className="label-icon" aria-hidden="true" />
                      <span>From Station <span className="req">*</span></span>
                    </label>
                    <select
                      id="irctc-from"
                      className={`form-input ${errors.from ? "input-error" : ""}`}
                      value={fromStation}
                      onChange={(e) => {
                        setFromStation(e.target.value);
                        if (errors.from) setErrors({ ...errors, from: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.from ? "true" : "false"}
                      aria-describedby={errors.from ? "err-irctc-from" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="enter-from-station"
                      data-lantern-label="From station"
                    >
                      <option value="">-- Select Origin Railway Station --</option>
                      {IRCTC_STATIONS.map((stn) => (
                        <option key={`stn-from-${stn.code}`} value={stn.code}>
                          {stn.name} ({stn.code})
                        </option>
                      ))}
                    </select>
                    {errors.from && (
                      <p id="err-irctc-from" className="field-error-msg" role="alert">
                        {errors.from}
                      </p>
                    )}
                  </div>

                  {/* TO STATION */}
                  <div className="field-group">
                    <label htmlFor="irctc-to" className="field-label">
                      <Train size={16} className="label-icon" aria-hidden="true" />
                      <span>To Station <span className="req">*</span></span>
                    </label>
                    <select
                      id="irctc-to"
                      className={`form-input ${errors.to ? "input-error" : ""}`}
                      value={toStation}
                      onChange={(e) => {
                        setToStation(e.target.value);
                        if (errors.to) setErrors({ ...errors, to: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.to ? "true" : "false"}
                      aria-describedby={errors.to ? "err-irctc-to" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="enter-to-station"
                      data-lantern-label="To station"
                    >
                      <option value="">-- Select Destination Railway Station --</option>
                      {IRCTC_STATIONS.map((stn) => (
                        <option key={`stn-to-${stn.code}`} value={stn.code}>
                          {stn.name} ({stn.code})
                        </option>
                      ))}
                    </select>
                    {errors.to && (
                      <p id="err-irctc-to" className="field-error-msg" role="alert">
                        {errors.to}
                      </p>
                    )}
                  </div>

                  {/* DATE */}
                  <div className="field-group">
                    <label htmlFor="irctc-date" className="field-label">
                      <Calendar size={16} className="label-icon" aria-hidden="true" />
                      <span>Date of Journey <span className="req">*</span></span>
                    </label>
                    <input
                      id="irctc-date"
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
                      aria-describedby={errors.date ? "err-irctc-date" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="select-journey-date"
                      data-lantern-label="Journey date"
                    />
                    {errors.date && (
                      <p id="err-irctc-date" className="field-error-msg" role="alert">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* CLASS */}
                  <div className="field-group">
                    <label htmlFor="irctc-class" className="field-label">
                      <Layers size={16} className="label-icon" aria-hidden="true" />
                      <span>Journey Class <span className="req">*</span></span>
                    </label>
                    <select
                      id="irctc-class"
                      className={`form-input ${errors.class ? "input-error" : ""}`}
                      value={journeyClass}
                      onChange={(e) => {
                        setJourneyClass(e.target.value);
                        if (errors.class) setErrors({ ...errors, class: null });
                      }}
                      aria-required="true"
                      aria-invalid={errors.class ? "true" : "false"}
                      aria-describedby={errors.class ? "err-irctc-class" : undefined}
                      data-lantern-step="1"
                      data-lantern-action="select-travel-class"
                      data-lantern-label="Travel class"
                    >
                      {IRCTC_CLASSES.map((cls) => (
                        <option key={cls.code} value={cls.code}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {errors.class && (
                      <p id="err-irctc-class" className="field-error-msg" role="alert">
                        {errors.class}
                      </p>
                    )}
                  </div>

                  {/* PASSENGERS COUNT */}
                  <div className="field-group">
                    <label htmlFor="irctc-passengers" className="field-label">
                      <Users size={16} className="label-icon" aria-hidden="true" />
                      <span>Number of Passengers <span className="req">*</span></span>
                    </label>
                    <select
                      id="irctc-passengers"
                      className="form-input"
                      value={passengersCount}
                      onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
                      data-lantern-step="1"
                      data-lantern-action="select-passenger-count"
                      data-lantern-label="Passenger count"
                    >
                      <option value={1}>1 Passenger</option>
                      <option value={2}>2 Passengers</option>
                      <option value={3}>3 Passengers</option>
                      <option value={4}>4 Passengers</option>
                    </select>
                  </div>
                </div>

                {/* Popular Train Connections Quick Pills */}
                <div className="quick-suggestions-row">
                  <span className="suggestions-title">Direct Express Corridors:</span>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromStation("ERS");
                      setToStation("CLT");
                    }}
                  >
                    Ernakulam (ERS) → Kozhikode (CLT)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromStation("TVC");
                      setToStation("MAS");
                    }}
                  >
                    Trivandrum (TVC) → Chennai (MAS)
                  </button>
                  <button
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setFromStation("ERS");
                      setToStation("SBC");
                    }}
                  >
                    Ernakulam (ERS) → Bengaluru (SBC)
                  </button>
                </div>

                {/* SEARCH BUTTON */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    id="irctc-search"
                    className="btn-search-primary"
                    data-lantern-step="1"
                    data-lantern-action="search-trains"
                    data-lantern-label="Search trains"
                  >
                    <Train size={18} aria-hidden="true" />
                    <span>Search Trains</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: TRAIN RESULTS */}
          {/* ==================================================== */}
          {currentStepIndex === 1 && (
            <div className="portal-results-wrapper" aria-labelledby="irctc-results-heading">
              <div className="results-top-bar">
                <div>
                  <span className="section-step-kicker">STEP 2</span>
                  <h2 id="irctc-results-heading" className="section-main-heading">
                    Trains Between {fromName} and {toName}
                  </h2>
                  <p className="results-subtext">
                    Journey Date: <strong>{journeyDate}</strong> | Quota: <strong>General</strong> | Passengers: <strong>{passengersCount}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-modify-search"
                  onClick={() => setCurrentStepIndex(0)}
                  data-lantern-action="modify-train-search"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Modify Train Search</span>
                </button>
              </div>

              <div className="train-results-list" role="list">
                {IRCTC_TRAINS.map((train, idx) => (
                  <article
                    key={train.trainNumber}
                    className="train-card"
                    role="listitem"
                    aria-labelledby={`train-title-${train.trainNumber}`}
                  >
                    <div className="train-header-row">
                      <div className="train-identity">
                        <span className="train-number-badge">{train.trainNumber}</span>
                        <h3 id={`train-title-${train.trainNumber}`} className="train-name">
                          {train.trainName}
                        </h3>
                      </div>
                      <div className="runs-days" aria-label="Runs on days">
                        <span>Runs On:</span>
                        {train.runsOn.map((day) => (
                          <span key={day} className="day-pill">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="train-schedule-row">
                      <div className="sched-station">
                        <span className="time-val">{train.departure}</span>
                        <span className="station-code">{fromStation}</span>
                        <span className="station-fullname">{fromName}</span>
                      </div>

                      <div className="sched-duration" aria-hidden="true">
                        <span className="dur-text">{train.duration}</span>
                        <div className="dur-bar">
                          <span className="circle"></span>
                          <span className="bar"></span>
                          <span className="arrow">▶</span>
                        </div>
                      </div>

                      <div className="sched-station text-right">
                        <span className="time-val">{train.arrival}</span>
                        <span className="station-code">{toStation}</span>
                        <span className="station-fullname">{toName}</span>
                      </div>
                    </div>

                    {/* Classes Availability Blocks */}
                    <div className="train-classes-container">
                      <span className="classes-label">Available Classes:</span>
                      <div className="classes-grid">
                        {train.classes.map((cls, cIdx) => (
                          <div key={cls.code} className="class-quota-box">
                            <div className="class-top">
                              <strong>{cls.name} ({cls.code})</strong>
                              <span className="class-fare">₹{cls.fare}</span>
                            </div>
                            <div className="class-status-row">
                              <span
                                className={`status-pill ${
                                  cls.status === "AVAILABLE"
                                    ? "status-green"
                                    : cls.status === "RAC"
                                    ? "status-yellow"
                                    : "status-orange"
                                }`}
                              >
                                {cls.availability}
                              </span>

                              <button
                                type="button"
                                id={idx === 0 && cIdx === 0 ? "irctc-select-train" : `irctc-select-train-${train.trainNumber}-${cls.code}`}
                                className="btn-book-train"
                                onClick={() => handleSelectTrain(train, cls)}
                                data-lantern-step="2"
                                data-lantern-action="select-train"
                                data-lantern-label={`Book ${train.trainName} in ${cls.name}`}
                              >
                                <span>Select</span>
                                <ArrowRight size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: PASSENGER DETAILS */}
          {/* ==================================================== */}
          {currentStepIndex === 2 && selectedTrain && selectedClassObj && (
            <div className="portal-form-wrapper" aria-labelledby="irctc-passengers-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 3</span>
                <h2 id="irctc-passengers-heading" className="section-main-heading">
                  Enter Passenger Details
                </h2>
                <p className="section-desc">
                  Train: <strong>{selectedTrain.trainNumber} - {selectedTrain.trainName}</strong> | Class: <strong>{selectedClassObj.name}</strong> | Fare: ₹{selectedClassObj.fare} per passenger
                </p>
              </div>

              <form onSubmit={handlePassengerSubmit} className="passenger-form-card" noValidate>
                {passengers.map((passenger, pIdx) => (
                  <fieldset key={pIdx} className="passenger-fieldset">
                    <legend className="passenger-legend">
                      Passenger {pIdx + 1} of {passengersCount}
                    </legend>

                    <div className="form-fields-grid-2col">
                      {/* PASSENGER NAME */}
                      <div className="field-group">
                        <label htmlFor={pIdx === 0 ? "irctc-passenger-name" : `irctc-passenger-name-${pIdx}`} className="field-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          id={pIdx === 0 ? "irctc-passenger-name" : `irctc-passenger-name-${pIdx}`}
                          type="text"
                          className={`form-input ${errors[`name_${pIdx}`] ? "input-error" : ""}`}
                          placeholder="e.g. Vignesh Warrier"
                          value={passenger.name}
                          onChange={(e) => updatePassengerField(pIdx, "name", e.target.value)}
                          aria-required="true"
                          aria-invalid={errors[`name_${pIdx}`] ? "true" : "false"}
                          aria-describedby={errors[`name_${pIdx}`] ? `err-irctc-name-${pIdx}` : undefined}
                          data-lantern-step="3"
                          data-lantern-action="enter-passenger-name"
                          data-lantern-label="Passenger name"
                        />
                        {errors[`name_${pIdx}`] && (
                          <p id={`err-irctc-name-${pIdx}`} className="field-error-msg" role="alert">
                            {errors[`name_${pIdx}`]}
                          </p>
                        )}
                      </div>

                      {/* AGE */}
                      <div className="field-group">
                        <label htmlFor={pIdx === 0 ? "irctc-passenger-age" : `irctc-passenger-age-${pIdx}`} className="field-label">
                          Age (Years) <span className="req">*</span>
                        </label>
                        <input
                          id={pIdx === 0 ? "irctc-passenger-age" : `irctc-passenger-age-${pIdx}`}
                          type="number"
                          min={1}
                          max={115}
                          className={`form-input ${errors[`age_${pIdx}`] ? "input-error" : ""}`}
                          placeholder="e.g. 34"
                          value={passenger.age}
                          onChange={(e) => updatePassengerField(pIdx, "age", e.target.value)}
                          aria-required="true"
                          aria-invalid={errors[`age_${pIdx}`] ? "true" : "false"}
                          aria-describedby={errors[`age_${pIdx}`] ? `err-irctc-age-${pIdx}` : undefined}
                          data-lantern-step="3"
                          data-lantern-action="enter-passenger-age"
                          data-lantern-label="Passenger age"
                        />
                        {errors[`age_${pIdx}`] && (
                          <p id={`err-irctc-age-${pIdx}`} className="field-error-msg" role="alert">
                            {errors[`age_${pIdx}`]}
                          </p>
                        )}
                      </div>

                      {/* GENDER */}
                      <div className="field-group">
                        <label htmlFor={pIdx === 0 ? "irctc-passenger-gender" : `irctc-passenger-gender-${pIdx}`} className="field-label">
                          Gender <span className="req">*</span>
                        </label>
                        <select
                          id={pIdx === 0 ? "irctc-passenger-gender" : `irctc-passenger-gender-${pIdx}`}
                          className="form-input"
                          value={passenger.gender}
                          onChange={(e) => updatePassengerField(pIdx, "gender", e.target.value)}
                          data-lantern-step="3"
                          data-lantern-action="select-passenger-gender"
                          data-lantern-label="Passenger gender"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Transgender">Transgender</option>
                        </select>
                      </div>

                      {/* BERTH PREFERENCE */}
                      <div className="field-group">
                        <label htmlFor={pIdx === 0 ? "irctc-berth" : `irctc-berth-${pIdx}`} className="field-label">
                          Berth / Seat Preference
                        </label>
                        <select
                          id={pIdx === 0 ? "irctc-berth" : `irctc-berth-${pIdx}`}
                          className="form-input"
                          value={passenger.berth}
                          onChange={(e) => updatePassengerField(pIdx, "berth", e.target.value)}
                          data-lantern-step="3"
                          data-lantern-action="select-berth-preference"
                          data-lantern-label="Berth preference"
                        >
                          <option value="No Preference">No Preference</option>
                          <option value="Lower">Lower Berth</option>
                          <option value="Middle">Middle Berth</option>
                          <option value="Upper">Upper Berth</option>
                          <option value="Side Lower">Side Lower</option>
                          <option value="Side Upper">Side Upper</option>
                          <option value="Window Seat">Window Seat (Chair Car)</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                ))}

                {/* Quick Auto-Fill for Testing */}
                <div className="quick-fill-row">
                  <button
                    type="button"
                    className="btn-quick-fill"
                    onClick={() => {
                      const demoList = [
                        { name: "Vignesh Warrier", age: "34", gender: "Male", berth: "Lower" },
                        { name: "Meera Warrier", age: "31", gender: "Female", berth: "Middle" },
                        { name: "Devika Warrier", age: "62", gender: "Female", berth: "Lower" },
                        { name: "Rohan Warrier", age: "8", gender: "Male", berth: "Upper" }
                      ];
                      setPassengers(demoList.slice(0, passengersCount));
                      setErrors({});
                    }}
                  >
                    <Sparkles size={14} aria-hidden="true" />
                    <span>Auto-Fill Sample Passenger Info</span>
                  </button>
                </div>

                <div className="passenger-actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentStepIndex(1)}
                    data-lantern-action="back-to-trains"
                  >
                    Back to Trains
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    data-lantern-step="3"
                    data-lantern-action="submit-irctc-passengers"
                    data-lantern-label="Proceed to booking review"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: REVIEW BOOKING */}
          {/* ==================================================== */}
          {currentStepIndex === 3 && (
            <div className="portal-review-wrapper" aria-labelledby="irctc-review-heading">
              <div className="portal-section-intro">
                <span className="section-step-kicker">STEP 4</span>
                <h2 id="irctc-review-heading" className="section-main-heading">
                  Review Train Reservation
                </h2>
                <p className="section-desc">
                  Check your itinerary, passengers list, and ticket charges before proceeding to payment.
                </p>
              </div>

              <div className="review-cards-container">
                <div className="review-summary-card">
                  <h3 className="card-subhead">Train & Journey Summary</h3>
                  <div className="summary-table">
                    <div className="table-row">
                      <span className="row-key">Train:</span>
                      <span className="row-val font-bold">
                        {selectedTrain?.trainNumber} / {selectedTrain?.trainName}
                      </span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Route:</span>
                      <span className="row-val">
                        {fromName} ({fromStation}) → {toName} ({toStation})
                      </span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Journey Date:</span>
                      <span className="row-val">{journeyDate}</span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Departure / Arrival:</span>
                      <span className="row-val">
                        {selectedTrain?.departure} — {selectedTrain?.arrival} ({selectedTrain?.duration})
                      </span>
                    </div>
                    <div className="table-row">
                      <span className="row-key">Class & Quota:</span>
                      <span className="row-val text-badge">
                        {selectedClassObj?.name} ({selectedClassObj?.code}) | General Quota
                      </span>
                    </div>
                  </div>

                  <div className="modify-buttons-row">
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(1)}
                      data-lantern-action="modify-train"
                    >
                      Change Train / Class
                    </button>
                  </div>
                </div>

                <div className="review-summary-card">
                  <h3 className="card-subhead">Passenger List ({passengers.length})</h3>
                  <div className="summary-table">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="table-row">
                        <span className="row-key">Passenger {idx + 1}:</span>
                        <span className="row-val font-bold">
                          {p.name} ({p.age} yrs, {p.gender}) — Pref: {p.berth}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="modify-buttons-row">
                    <button
                      type="button"
                      className="btn-modify-section"
                      onClick={() => setCurrentStepIndex(2)}
                      data-lantern-action="modify-passengers"
                    >
                      Modify Passengers
                    </button>
                  </div>
                </div>

                <div className="fare-breakdown-card">
                  <h3 className="card-subhead">Ticket Fare Breakdown</h3>
                  <div className="fare-table">
                    <div className="fare-row">
                      <span>Base Ticket Fare ({passengersCount} × ₹{unitFare}):</span>
                      <span>₹{baseTotal.toFixed(2)}</span>
                    </div>
                    <div className="fare-row">
                      <span>IRCTC Convenience Fee (incl. GST):</span>
                      <span>₹{irctcConvenienceFee.toFixed(2)}</span>
                    </div>
                    <div className="fare-row total-row">
                      <span>Total Payable Amount:</span>
                      <span className="total-highlight">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="proceed-payment-action-block">
                    <button
                      type="button"
                      id="irctc-proceed-payment"
                      className="btn-proceed-large"
                      onClick={handleProceedToPayment}
                      data-lantern-step="4"
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
          {/* STEP 5: DEMO PAYMENT GATEWAY */}
          {/* ==================================================== */}
          {currentStepIndex === 4 && (
            <div className="portal-payment-container">
              <PaymentDemo
                servicePrefix="IRCTC"
                serviceId="irctc"
                amount={totalAmount}
                itemDescription={`Train ${selectedTrain?.trainNumber} - ${selectedTrain?.trainName}`}
                stepNumber={5}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setCurrentStepIndex(3)}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 6: CONFIRMATION & PNR */}
          {/* ==================================================== */}
          {currentStepIndex === 5 && (
            <ConfirmationCard
              containerId="irctc-confirmation"
              serviceName="Railway E-Ticket"
              serviceType="irctc"
              pnr={demoPnr}
              txnId={paymentResult?.txnId || "IRCTC-TXN-DEMO-12345"}
              amount={totalAmount}
              disclaimerText="DEMO TICKET — NOT VALID FOR TRAVEL"
              details={[
                { label: "Train Number & Name", value: `${selectedTrain?.trainNumber} / ${selectedTrain?.trainName}`, fullWidth: true },
                { label: "From Station", value: `${fromName} (${fromStation})` },
                { label: "To Station", value: `${toName} (${toStation})` },
                { label: "Date of Journey", value: journeyDate },
                { label: "Departure Time", value: selectedTrain?.departure },
                { label: "Class & Quota", value: `${selectedClassObj?.name} (${selectedClassObj?.code}) - General` },
                { label: "Confirmed PNR", value: demoPnr, highlight: true },
                {
                  label: "Passengers",
                  value: passengers.map((p, i) => `${i + 1}. ${p.name} (${p.age}y, ${p.gender})`).join(" | "),
                  fullWidth: true
                },
                { label: "Payment Mode", value: `${paymentResult?.paymentMethod || "UPI"} (Simulated Gateway)` },
                { label: "Total Fare Paid", value: `₹${totalAmount.toFixed(2)}`, highlight: true }
              ]}
              onReset={() => {
                setCurrentStepIndex(0);
                setSelectedTrain(null);
                setSelectedClassObj(null);
                setPassengers([{ name: "", age: "", gender: "Male", berth: "Lower" }]);
                setPassengersCount(1);
                setPaymentResult(null);
                setDemoPnr("");
              }}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
