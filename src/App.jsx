import { useState, useRef, useEffect } from "react";
import "./App.css";
import { recognizeIntent } from "./utils/intentRecognizer";
import DemoWebsite from "./DemoWebsite";

function App() {
  const [userRequest, setUserRequest] = useState("");
  const [message, setMessage] = useState("");
  const [guidanceStep, setGuidanceStep] = useState(0);

  const [language, setLanguage] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}, []);

  // --------------------------------------------------
  // SPEAK FUNCTION
  // --------------------------------------------------

  const speakMessage = (text) => {
  if (!("speechSynthesis" in window)) {
    setMessage("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = language;
  speech.rate = 0.85;
  speech.pitch = 1;
  speech.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  if (language === "ml-IN") {
    const malayalamVoice = voices.find(
      (voice) =>
        voice.lang.toLowerCase() === "ml-in" ||
        voice.lang.toLowerCase().startsWith("ml")
    );

    if (malayalamVoice) {
      speech.voice = malayalamVoice;
      console.log(
        "Malayalam voice selected:",
        malayalamVoice.name
      );
    } else {
      console.log("No Malayalam voice available.");
    }
  }

  if (language === "en-IN") {
    const englishVoice = voices.find(
      (voice) =>
        voice.lang.toLowerCase() === "en-in"
    );

    if (englishVoice) {
      speech.voice = englishVoice;
    }
  }

  speech.onstart = () => {
    setIsSpeaking(true);
  };

  speech.onend = () => {
    setIsSpeaking(false);
  };

  speech.onerror = (event) => {
    console.log(
      "Speech synthesis error:",
      event.error
    );

    setIsSpeaking(false);
  };

  window.speechSynthesis.speak(speech);
};

  // --------------------------------------------------
  // STOP SPEAKING
  // --------------------------------------------------

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };


  // --------------------------------------------------
  // START ASSISTANCE
  // --------------------------------------------------

  const handleStart = () => {
    const result = recognizeIntent(userRequest);

    if (result.intent === "REGISTER") {
      const helpMessage =
        language === "ml-IN"
          ? "ഞാൻ നിങ്ങളെ രജിസ്റ്റർ ചെയ്യാൻ സഹായിക്കാം. ഓരോ ഘട്ടമായും ഞാൻ നിങ്ങളെ നയിക്കും."
          : "I can help you register. I will guide you one step at a time.";

      setMessage(helpMessage);
      setGuidanceStep(1);

      speakMessage(helpMessage);

    } else {
      const helpMessage =
        `${result.message} (Intent: ${result.intent})`;

      setMessage(helpMessage);
      setGuidanceStep(0);

      speakMessage(helpMessage);
    }
  };


  // --------------------------------------------------
  // I'M STUCK
  // --------------------------------------------------

  const handleStuck = () => {
    const helpMessage =
      language === "ml-IN"
        ? "വിഷമിക്കേണ്ട. നിലവിലെ പ്രവർത്തനത്തിൽ ഞാൻ നിങ്ങളെ സഹായിക്കും."
        : "Don't worry. I will guide you through the current task.";

    setMessage(helpMessage);
    setGuidanceStep(1);

    speakMessage(helpMessage);
  };


  // --------------------------------------------------
  // NEXT STEP
  // --------------------------------------------------

  const handleNextStep = () => {
    setGuidanceStep((previous) => {
      if (previous >= 4) {
        return 4;
      }

      return previous + 1;
    });
  };


  // --------------------------------------------------
  // VOICE INPUT
  // --------------------------------------------------

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMessage =
        "Voice recognition is not supported in this browser. Please use Google Chrome.";

      setMessage(errorMessage);
      speakMessage(errorMessage);

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);

      const listeningMessage =
        language === "ml-IN"
          ? "കേൾക്കുന്നു... നിങ്ങളുടെ ആവശ്യം പറയൂ."
          : "Listening... Please tell me what you need.";

      setMessage(listeningMessage);
    };


    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setUserRequest(transcript);

      const receivedMessage =
        language === "ml-IN"
          ? `നിങ്ങൾ പറഞ്ഞത്: "${transcript}"`
          : `You said: "${transcript}"`;

      setMessage(receivedMessage);

      speakMessage(
        language === "ml-IN"
          ? "നിങ്ങളുടെ ആവശ്യം ലഭിച്ചു."
          : "I received your request."
      );
    };


    recognition.onerror = (event) => {
      console.log(
        "Speech recognition error:",
        event.error
      );

      const errorMessage =
        language === "ml-IN"
          ? "ക്ഷമിക്കണം. നിങ്ങളുടെ ശബ്ദം മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക."
          : "Sorry, I couldn't understand your voice. Please try again.";

      setMessage(errorMessage);

      setIsListening(false);

      speakMessage(errorMessage);
    };


    recognition.onend = () => {
      setIsListening(false);
    };


    recognitionRef.current = recognition;

    recognition.start();
  };


  // --------------------------------------------------
  // STOP LISTENING
  // --------------------------------------------------

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
  };


  // --------------------------------------------------
  // AUTO SPEAK IMPORTANT GUIDANCE
  // --------------------------------------------------

  useEffect(() => {
    if (guidanceStep === 0) {
      return;
    }

    let instruction = "";

    if (language === "ml-IN") {

      if (guidanceStep === 1) {
        instruction =
          "ഘട്ടം ഒന്ന്. നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക.";
      }

      if (guidanceStep === 2) {
        instruction =
          "ഘട്ടം രണ്ട്. നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകുക.";
      }

      if (guidanceStep === 3) {
        instruction =
          "ഘട്ടം മൂന്ന്. നിങ്ങളുടെ പാസ്‌വേഡ് സൃഷ്ടിക്കുക.";
      }

      if (guidanceStep === 4) {
        instruction =
          "ഘട്ടം നാല്. രജിസ്റ്റർ ബട്ടണിൽ ക്ലിക്ക് ചെയ്യുക.";
      }

    } else {

      if (guidanceStep === 1) {
        instruction =
          "Step 1. Enter your full name.";
      }

      if (guidanceStep === 2) {
        instruction =
          "Step 2. Enter your email address.";
      }

      if (guidanceStep === 3) {
        instruction =
          "Step 3. Create your password.";
      }

      if (guidanceStep === 4) {
        instruction =
          "Step 4. Click the Register button.";
      }
    }

    if (instruction) {
      speakMessage(instruction);
    }

  }, [guidanceStep]);


  // --------------------------------------------------
  // USER INTERFACE
  // --------------------------------------------------

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <span className="navbar-brand fw-bold fs-3">
            🔦 LANTERN
          </span>

          <span className="text-light">
            Intelligent Web Assistance
          </span>

        </div>

      </nav>


      {/* MAIN */}

      <main className="container">

        <div className="welcome-section text-center">

          <h1 className="display-5 fw-bold">
            How can I help you?
          </h1>

          <p className="lead text-muted">
            Tell LANTERN what you want to do.
          </p>

        </div>


        {/* ASSISTANT */}

        <div className="assistant-card">

          <h4 className="mb-3">
            🤖 LANTERN Assistant
          </h4>


          {/* LANGUAGE */}

          <label className="form-label fw-bold">
            🌐 Choose Language
          </label>

          <select
            className="form-select mb-3"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
          >

            <option value="en-IN">
              🇮🇳 English
            </option>

            <option value="ml-IN">
              🇮🇳 മലയാളം (Malayalam)
            </option>

          </select>


          {/* TASK */}

          <label
            htmlFor="userRequest"
            className="form-label fw-bold"
          >
            What do you need help with?
          </label>


          <textarea
            id="userRequest"
            className="form-control"
            rows="4"
            placeholder={
              language === "ml-IN"
                ? "നിങ്ങൾക്ക് എന്താണ് ചെയ്യേണ്ടത്?"
                : "Example: How do I register?"
            }
            value={userRequest}
            onChange={(event) =>
              setUserRequest(event.target.value)
            }
          />


          {/* VOICE INPUT */}

          {!isListening ? (

            <button
              className="btn btn-success w-100 mt-3"
              onClick={startVoiceRecognition}
            >
              🎤 Speak Your Task
            </button>

          ) : (

            <button
              className="btn btn-danger w-100 mt-3"
              onClick={stopVoiceRecognition}
            >
              🛑 Stop Listening
            </button>

          )}


          {/* START */}

          <button
            className="btn btn-primary w-100 mt-2"
            onClick={handleStart}
          >
            🔦 Start Assistance
          </button>


          {/* READ ALOUD */}

          <button
            className="btn btn-secondary w-100 mt-2"
            onClick={() => {

              if (message) {
                speakMessage(message);
              }

            }}
            disabled={!message}
          >
            🔊 Read Aloud
          </button>


          {/* STOP SPEECH */}

          {isSpeaking && (

            <button
              className="btn btn-dark w-100 mt-2"
              onClick={stopSpeaking}
            >
              🔇 Stop Speaking
            </button>

          )}


          {/* STUCK */}

          <button
            className="btn btn-warning w-100 mt-2"
            onClick={handleStuck}
          >
            🆘 I'm Stuck
          </button>


          {/* MESSAGE */}

          {message && (

            <div className="alert alert-info mt-4">

              <div>
                {message}
              </div>


              {guidanceStep > 0 &&
                guidanceStep < 4 && (

                <button
                  className="btn btn-warning mt-3"
                  onClick={handleNextStep}
                >
                  Next Step →
                </button>

              )}

            </div>

          )}

        </div>

      </main>


      {/* DEMO WEBSITE */}

      <DemoWebsite
        guidanceStep={guidanceStep}
        setGuidanceStep={setGuidanceStep}
      />

    </div>
  );
}

export default App;