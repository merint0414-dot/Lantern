import { useState, useEffect, useRef } from "react";
import { highlightElement } from "./utils/elementDetector";
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
  const [simpleMode, setSimpleMode] = useState(false);

  const [registered, setRegistered] = useState(false);


  // ==========================================
  // INTERACTION SIGNALS
  // INTERNAL - NOT SHOWN TO USER
  // ==========================================

  const [repeatedClicks, setRepeatedClicks] = useState(0);
  const [formErrors, setFormErrors] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [repeatedAttempts, setRepeatedAttempts] = useState(0);
  const [navigationCount, setNavigationCount] = useState(0);
  const [longDelay, setLongDelay] = useState(false);


  // ==========================================
  // DIFFICULTY
  // INTERNAL - NOT SHOWN TO USER
  // ==========================================

  const [difficulty, setDifficulty] = useState({
    score: 0,
    level: "LOW",
  });


  // ==========================================
  // AUTOMATIC HELP
  // ==========================================

  const [automaticHelp, setAutomaticHelp] = useState(false);

  const previousDifficultyScore =
    useRef(0);


  // ==========================================
  // CURRENT GUIDANCE MESSAGE
  // ==========================================

  const [currentInstruction, setCurrentInstruction] =
    useState("");


  // ==========================================
  // CALCULATE DIFFICULTY
  // INTERNAL LOGIC
  // ==========================================

  useEffect(() => {

    const result =
      calculateDifficultyScore({
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

    // Activate LANTERN when difficulty
    // crosses the threshold

    if (
      difficulty.score >= 60 &&
      previousDifficultyScore.current < 60
    ) {

      setAutomaticHelp(true);
    }

    // Store current score internally

    previousDifficultyScore.current =
      difficulty.score;

  }, [difficulty.score]);


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

    const timer =
      setTimeout(() => {

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

    // Step 1 - Name

    if (!name) {

      setCurrentInstruction(
        "Step 1: Enter your full name."
      );

      return;
    }


    // Step 2 - Email

    if (!email) {

      setCurrentInstruction(
        "Step 2: Enter your email address."
      );

      return;
    }


    // Step 3 - Password

    if (!password) {

      setCurrentInstruction(
        "Step 3: Create your password."
      );

      return;
    }


    // Step 4 - Register

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
  // UI ELEMENT DETECTION
  // ==========================================

  useEffect(() => {

    if (guidanceStep === 0) {
      return;
    }

    const stepTargets = {

      1: "name",
      2: "email",
      3: "password",
      4: "registerButton",

    };

    const targetName =
      stepTargets[guidanceStep];

    if (!targetName) {
      return;
    }

    const timer =
      setTimeout(() => {

        highlightElement(targetName);

      }, 300);

    return () => {

      clearTimeout(timer);

    };

  }, [guidanceStep]);


  // ==========================================
  // AUTOMATIC VOICE GUIDANCE
  // ==========================================

  useEffect(() => {

    if (guidanceStep === 0) {
      return;
    }

    let instruction = "";


    // ========================================
    // SIMPLE LANGUAGE
    // ========================================

    if (simpleMode) {

      if (guidanceStep === 1) {

        instruction =
          "Step 1. Enter your name.";

      }

      else if (guidanceStep === 2) {

        instruction =
          "Step 2. Enter your email.";

      }

      else if (guidanceStep === 3) {

        instruction =
          "Step 3. Create a password.";

      }

      else if (guidanceStep === 4) {

        instruction =
          "Step 4. Click Register.";

      }

    }


    // ========================================
    // NORMAL LANGUAGE
    // ========================================

    else {

      if (guidanceStep === 1) {

        instruction =
          "Step 1. Enter your full name in the Full Name field.";

      }

      else if (guidanceStep === 2) {

        instruction =
          "Step 2. Enter your email address in the Email Address field.";

      }

      else if (guidanceStep === 3) {

        instruction =
          "Step 3. Create a password in the Password field.";

      }

      else if (guidanceStep === 4) {

        instruction =
          "Step 4. Click the Register button to complete the registration.";

      }

    }


    if (!instruction) {
      return;
    }


    setCurrentInstruction(
      instruction
    );


    // Voice output

    if ("speechSynthesis" in window) {

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          instruction
        );

      speech.lang = "en-US";
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );

    }

  }, [
    guidanceStep,
    simpleMode,
  ]);


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = () => {

    setRepeatedAttempts(
      (previous) => previous + 1
    );


    // Check required fields

    if (
      !name ||
      !email ||
      !password
    ) {

      setFormErrors(
        (previous) => previous + 1
      );

      alert(
        "Please fill all the fields."
      );

      return;
    }


    // Registration completed

    setRegistered(true);


    // ========================================
    // RESET INTERACTION DIFFICULTY
    // INTERNAL ONLY
    // ========================================

    setRepeatedClicks(0);
    setFormErrors(0);
    setScrollCount(0);
    setRepeatedAttempts(0);
    setNavigationCount(0);
    setLongDelay(false);


    // Move guidance to completed state

    setGuidanceStep(0);


    // Completion message

    const completionMessage =
      simpleMode
        ? "Task completed successfully."
        : "Registration completed successfully. You have finished the task.";


    setCurrentInstruction(
      completionMessage
    );


    // Read completion message aloud

    if ("speechSynthesis" in window) {

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          completionMessage
        );

      speech.lang = "en-US";
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );

    }

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
  // I'M STUCK - SMART GUIDANCE
  // ==========================================

  const handleStuck = () => {

    let step = 0;
    let instruction = "";


    // Step 1 - Name

    if (!name.trim()) {

      step = 1;

      if (simpleMode) {

        instruction =
          "Enter your name.";

      }

      else {

        instruction =
          "Please enter your full name in the Full Name field.";

      }

    }


    // Step 2 - Email

    else if (!email.trim()) {

      step = 2;

      if (simpleMode) {

        instruction =
          "Enter your email.";

      }

      else {

        instruction =
          "Please enter your email address in the Email Address field.";

      }

    }


    // Step 3 - Password

    else if (!password.trim()) {

      step = 3;

      if (simpleMode) {

        instruction =
          "Create a password.";

      }

      else {

        instruction =
          "Please create a password in the Password field.";

      }

    }


    // Step 4 - Register

    else if (!registered) {

      step = 4;

      if (simpleMode) {

        instruction =
          "Click Register.";

      }

      else {

        instruction =
          "All details are entered. Click the Register button to complete the registration.";

      }

    }


    // Task completed

    else {

      instruction =
        "The registration task is already completed.";

    }


    // Update guidance step

    if (step !== 0) {

      setGuidanceStep(
        step
      );

    }


    // Show instruction

    setCurrentInstruction(
      instruction
    );


    // Speak instruction

    if ("speechSynthesis" in window) {

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          instruction
        );

      speech.lang = "en-US";
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );

    }

  };


  // ==========================================
  // EXPLAIN AGAIN + VOICE
  // ==========================================

  const handleExplainAgain = () => {

    let explanation = "";


    // ========================================
    // SIMPLE LANGUAGE
    // ========================================

    if (simpleMode) {

      if (guidanceStep === 1) {

        explanation =
          "Step 1: Enter your name.";

      }

      else if (guidanceStep === 2) {

        explanation =
          "Step 2: Enter your email.";

      }

      else if (guidanceStep === 3) {

        explanation =
          "Step 3: Create a password.";

      }

      else if (guidanceStep === 4) {

        explanation =
          "Step 4: Click Register.";

      }

      else {

        explanation =
          "Please start the guided assistance first.";

      }

    }


    // ========================================
    // NORMAL LANGUAGE
    // ========================================

    else {

      if (guidanceStep === 1) {

        explanation =
          "Step 1: Enter your full name in the Full Name field.";

      }

      else if (guidanceStep === 2) {

        explanation =
          "Step 2: Enter your email address in the Email Address field.";

      }

      else if (guidanceStep === 3) {

        explanation =
          "Step 3: Create a password in the Password field.";

      }

      else if (guidanceStep === 4) {

        explanation =
          "Step 4: Click the Register button to create your account.";

      }

      else {

        explanation =
          "Please start the guided assistance first.";

      }

    }


    // Show explanation

    setCurrentInstruction(
      explanation
    );


    // ========================================
    // RE-HIGHLIGHT CURRENT UI ELEMENT
    // ========================================

    if (guidanceStep > 0) {

      const stepTargets = {

        1: "name",
        2: "email",
        3: "password",
        4: "registerButton",

      };

      const targetName =
        stepTargets[guidanceStep];

      if (targetName) {

        highlightElement(
          targetName
        );

      }

    }


    // Speak explanation

    if ("speechSynthesis" in window) {

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          explanation
        );

      speech.lang = "en-US";
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );

    }

  };


  // ==========================================
  // START AUTOMATIC HELP
  // ==========================================

  const startAutomaticHelp = () => {

    setAutomaticHelp(false);

    handleStuck();

  };


  // ==========================================
  // USER INTERFACE
  // ==========================================

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
              onClick={
                startAutomaticHelp
              }
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
          SMART GUIDANCE PANEL
          USER-FACING LANTERN PANEL
      ====================================== */}

      <div className="smart-guidance-panel">

        <div className="smart-guidance-icon">
          🔦
        </div>


        <div>

          <strong>
            🔦 LANTERN Guidance
          </strong>


          {/* Step Progress */}

          {guidanceStep > 0 && (

            <div className="guidance-progress">

              Step {guidanceStep} of 4

            </div>

          )}


          {/* Task Completed */}

          {guidanceStep === 0 &&
            registered && (

              <div className="guidance-progress">

                ✓ Task Completed

              </div>

            )}


          {/* Current Instruction */}

          <p>
            {currentInstruction}
          </p>


          {/* Read Aloud */}

          <button
            className="read-aloud-button"
            onClick={() => {

              if (!currentInstruction) {
                return;
              }

              if (
                "speechSynthesis" in window
              ) {

                window.speechSynthesis.cancel();

                const speech =
                  new SpeechSynthesisUtterance(
                    currentInstruction
                  );

                speech.lang = "en-US";
                speech.rate = 0.9;
                speech.pitch = 1;

                window.speechSynthesis.speak(
                  speech
                );

              }

            }}
          >

            🔊 Read Aloud

          </button>

        </div>

      </div>


      {/* ======================================
          I'M STUCK BUTTONS
      ====================================== */}

      <div className="stuck-container">

        <button
          className="stuck-button"
          onClick={handleStuck}
        >
          I'm Stuck
        </button>


        <button
          className="explain-button"
          onClick={handleExplainAgain}
        >
          Explain Again
        </button>


        <button
          className="simple-button"
          onClick={() =>
            setSimpleMode(
              !simpleMode
            )
          }
        >
          {simpleMode
            ? "Normal Language"
            : "Simple Language"}
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

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>


            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              onBlur={() => {

                if (name.trim()) {

                  setGuidanceStep(2);

                }

              }}
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

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>


            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              onBlur={() => {

                if (email.trim()) {

                  setGuidanceStep(3);

                }

              }}
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

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>


            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              onBlur={() => {

                if (password.trim()) {

                  setGuidanceStep(4);

                }

              }}
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

          <div className="button-guidance">

            <button
              id="registerButton"
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