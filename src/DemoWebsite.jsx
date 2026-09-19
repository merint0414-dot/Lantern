import { useState, useEffect } from "react";
import "./DemoWebsite.css";
import { calculateDifficultyScore } from "./utils/difficultyDetector";

function DemoWebsite({
  guidanceStep,
  setGuidanceStep,
}) {
  // ==========================================
  // FORM DATA
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registered, setRegistered] = useState(false);


  // ==========================================
  // INTERACTION SIGNALS
  // ==========================================

  const [repeatedClicks, setRepeatedClicks] = useState(0);
  const [formErrors, setFormErrors] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [repeatedAttempts, setRepeatedAttempts] = useState(0);
  const [navigationCount, setNavigationCount] = useState(0);
  const [longDelay, setLongDelay] = useState(false);


  // ==========================================
  // DIFFICULTY
  // ==========================================

  const [difficulty, setDifficulty] = useState({
    score: 0,
    level: "LOW",
  });


  // ==========================================
  // AUTOMATIC HELP
  // ==========================================

  const [automaticHelp, setAutomaticHelp] = useState(false);


  // ==========================================
  // CURRENT GUIDANCE MESSAGE
  // ==========================================

  const [currentInstruction, setCurrentInstruction] =
    useState("");


  // ==========================================
  // CALCULATE DIFFICULTY
  // ==========================================

  useEffect(() => {
    const result = calculateDifficultyScore({
      repeatedClicks,
      formErrors,
      scrollCount,
      repeatedAttempts,
      navigationCount,
      longDelay,
    });

    setDifficulty(result);
  }, [
    repeatedClicks,
    formErrors,
    scrollCount,
    repeatedAttempts,
    navigationCount,
    longDelay,
  ]);


  // ==========================================
  // AUTOMATIC LANTERN ACTIVATION
  // ==========================================

  useEffect(() => {
    if (difficulty.score >= 60) {
      setAutomaticHelp(true);

      if (guidanceStep === 0) {
        setGuidanceStep(1);
      }
    }
  }, [
    difficulty.score,
    guidanceStep,
    setGuidanceStep,
  ]);


  // ==========================================
  // SCROLL DETECTION
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setScrollCount(
        (previous) => previous + 1
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  // ==========================================
  // LONG DELAY DETECTION
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setLongDelay(true);
    }, 15000);

    return () => {
      clearTimeout(timer);
    };
  }, []);


  // ==========================================
  // DETERMINE NEXT STEP
  // ==========================================

  useEffect(() => {

    // If name is empty
    if (!name) {

      setCurrentInstruction(
        "Step 1: Enter your full name."
      );

      return;
    }


    // If email is empty
    if (!email) {

      setCurrentInstruction(
        "Step 2: Enter your email address."
      );

      return;
    }


    // If password is empty
    if (!password) {

      setCurrentInstruction(
        "Step 3: Create your password."
      );

      return;
    }


    // If everything is filled
    if (!registered) {

      setCurrentInstruction(
        "Step 4: Click the Register button."
      );

    }

  }, [
    name,
    email,
    password,
    registered,
  ]);


  // ==========================================
  // AUTOMATICALLY UPDATE GUIDANCE STEP
  // ==========================================

  useEffect(() => {

    // Don't automatically change the
    // guidance before assistance starts
    if (guidanceStep === 0) {
      return;
    }


    if (!name) {

      setGuidanceStep(1);

      return;
    }


    if (!email) {

      setGuidanceStep(2);

      return;
    }


    if (!password) {

      setGuidanceStep(3);

      return;
    }


    if (!registered) {

      setGuidanceStep(4);

      return;
    }

  }, [
    name,
    email,
    password,
    registered,
    guidanceStep,
    setGuidanceStep,
  ]);


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = () => {

    setRepeatedAttempts(
      (previous) => previous + 1
    );


    if (!name || !email || !password) {

      setFormErrors(
        (previous) => previous + 1
      );

      alert(
        "Please fill all the fields."
      );

      return;
    }


    setRegistered(true);
  };


  // ==========================================
  // NEXT STEP
  // ==========================================

  const handleNextStep = () => {

    setGuidanceStep(
      (previous) => {

        if (previous >= 4) {
          return 4;
        }

        return previous + 1;
      }
    );
  };


  // ==========================================
  // I'M STUCK
  // ==========================================

  const handleStuck = () => {

    if (!name) {

      setGuidanceStep(1);

      setCurrentInstruction(
        "You're at the beginning. Enter your full name."
      );

      return;
    }


    if (!email) {

      setGuidanceStep(2);

      setCurrentInstruction(
        "You have entered your name. Now enter your email address."
      );

      return;
    }


    if (!password) {

      setGuidanceStep(3);

      setCurrentInstruction(
        "Your email is entered. Now create your password."
      );

      return;
    }


    if (!registered) {

      setGuidanceStep(4);

      setCurrentInstruction(
        "All details are entered. Click Register to complete the task."
      );

      return;
    }


    setCurrentInstruction(
      "The registration task is already completed."
    );

  };


  // ==========================================
  // START AUTOMATIC HELP
  // ==========================================

  const startAutomaticHelp = () => {

    setAutomaticHelp(false);

    handleStuck();
  };


  return (
    <div className="demo-website">


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="demo-header">

        <div className="demo-logo">
          MyDemo Website
        </div>


        <nav>

          <span
            onClick={() =>
              setNavigationCount(
                (previous) =>
                  previous + 1
              )
            }
          >
            Home
          </span>


          <span
            onClick={() =>
              setNavigationCount(
                (previous) =>
                  previous + 1
              )
            }
          >
            Products
          </span>


          <span
            onClick={() =>
              setNavigationCount(
                (previous) =>
                  previous + 1
              )
            }
          >
            Register
          </span>


          <span
            onClick={() =>
              setNavigationCount(
                (previous) =>
                  previous + 1
              )
            }
          >
            Login
          </span>

        </nav>

      </header>


      {/* ======================================
          AUTOMATIC LANTERN POPUP
      ====================================== */}

      {automaticHelp && (

        <div className="automatic-help">

          <div className="automatic-help-icon">
            🔦
          </div>


          <h3>
            LANTERN noticed that you may need help
          </h3>


          <p>
            Your interaction suggests that
            this page may be difficult to use.
          </p>


          <p className="automatic-help-question">
            Would you like LANTERN to guide you?
          </p>


          <div className="automatic-help-buttons">

            <button
              className="start-help-button"
              onClick={startAutomaticHelp}
            >
              Yes, Guide Me
            </button>


            <button
              className="continue-button"
              onClick={() =>
                setAutomaticHelp(false)
              }
            >
              Continue Myself
            </button>

          </div>

        </div>

      )}


      {/* ======================================
          DIFFICULTY MONITOR
      ====================================== */}

      <div className="difficulty-panel">

        <h4>
          🔦 LANTERN Difficulty Monitor
        </h4>


        <p>
          Interaction Difficulty Score:
          <strong>
            {" "}
            {difficulty.score}/100
          </strong>
        </p>


        <p>
          Difficulty Level:
          <strong>
            {" "}
            {difficulty.level}
          </strong>
        </p>


        <hr />


        <p>
          Repeated Clicks: {repeatedClicks}
        </p>


        <p>
          Form Errors: {formErrors}
        </p>


        <p>
          Scroll Count: {scrollCount}
        </p>


        <p>
          Repeated Attempts: {repeatedAttempts}
        </p>


        <p>
          Navigation Count: {navigationCount}
        </p>


        <p>
          Long Delay:
          {" "}
          {longDelay
            ? "Yes"
            : "No"}
        </p>

      </div>


      {/* ======================================
          SMART GUIDANCE PANEL
      ====================================== */}

      <div className="smart-guidance-panel">

        <div className="smart-guidance-icon">
          🔦
        </div>


        <div>

          <strong>
            LANTERN Guidance
          </strong>

          <p>
            {currentInstruction}
          </p>

        </div>

      </div>


      {/* ======================================
          I'M STUCK BUTTON
      ====================================== */}

      <div className="stuck-container">

        <button
          className="stuck-button"
          onClick={handleStuck}
        >
          🆘 I'm Stuck
        </button>

      </div>


      {/* ======================================
          REGISTRATION FORM
      ====================================== */}

      <div className="registration-container">

        <div className="registration-card">


          <h2>
            Create an Account
          </h2>


          <p className="registration-description">
            Fill in the details below to create
            your account.
          </p>


          {/* ==================================
              STEP 1 - NAME
          ================================== */}

          <div
            className={`form-group ${
              guidanceStep === 1
                ? "lantern-highlight"
                : ""
            }`}
          >

            <label htmlFor="name">
              Full Name
            </label>


            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />


            {guidanceStep === 1 && (

              <div className="guidance-message">

                👉 Step 1:
                Enter your full name here.

              </div>

            )}

          </div>


          {/* ==================================
              STEP 2 - EMAIL
          ================================== */}

          <div
            className={`form-group ${
              guidanceStep === 2
                ? "lantern-highlight"
                : ""
            }`}
          >

            <label htmlFor="email">
              Email Address
            </label>


            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />


            {guidanceStep === 2 && (

              <div className="guidance-message">

                👉 Step 2:
                Enter your email address here.

              </div>

            )}

          </div>


          {/* ==================================
              STEP 3 - PASSWORD
          ================================== */}

          <div
            className={`form-group ${
              guidanceStep === 3
                ? "lantern-highlight"
                : ""
            }`}
          >

            <label htmlFor="password">
              Password
            </label>


            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />


            {guidanceStep === 3 && (

              <div className="guidance-message">

                👉 Step 3:
                Create your password here.

              </div>

            )}

          </div>


          {/* ==================================
              STEP 4 - REGISTER
          ================================== */}

          <div
            className={
              guidanceStep === 4
                ? "button-guidance"
                : ""
            }
          >

            <button
              className="register-button"
              onClick={() => {

                setRepeatedClicks(
                  (previous) =>
                    previous + 1
                );

                handleRegister();

              }}
            >
              Register
            </button>


            {guidanceStep === 4 && (

              <div className="guidance-message">

                👉 Step 4:
                Click the Register button.

              </div>

            )}

          </div>


          {/* ==================================
              SUCCESS
          ================================== */}

          {registered && (

            <div className="success-message">

              🎉 Registration successful!

              <br />

              <small>
                LANTERN has detected that
                the task is complete.
              </small>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default DemoWebsite;