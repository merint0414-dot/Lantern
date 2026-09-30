// ============================================================
// LANTERN - EXTENSION INTENT RECOGNIZER
// Multilingual Intent Detection (English, Manglish, Malayalam)
// Supports Gmail, KSRTC, IRCTC, Bharatgas, KSEB, and Help intents
// ============================================================

console.log("[LANTERN] Intent recognizer loaded.");

// ============================================================
// NORMALIZE USER INPUT
// ============================================================

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================
// GMAIL - SEND EMAIL
// ============================================================

function isSendEmailRequest(text) {
  const phrases = [
    // English
    "send email",
    "send an email",
    "send mail",
    "send a mail",
    "compose email",
    "write email",
    "write an email",
    "email someone",
    "help me send an email",
    "i want to send an email",
    "i need to send an email",

    // Manglish
    "email ayakkanam",
    "mail ayakkanam",
    "email ayakkan",
    "mail ayakkan",
    "oru email ayakkanam",
    "oru mail ayakkanam",
    "enikku email ayakkanam",
    "enikku oru email ayakkanam",
    "enikku mail ayakkanam",
    "enikku oru mail ayakkanam",
    "email ayakkan help venam",
    "mail ayakkan help venam",

    // Malayalam
    "ഇമെയിൽ അയക്കണം",
    "ഇമെയിൽ അയയ്ക്കണം",
    "ഇമെയിൽ അയക്കാൻ സഹായിക്കൂ",
    "ഇമെയിൽ അയയ്ക്കാൻ സഹായിക്കൂ",
    "എനിക്ക് ഒരു ഇമെയിൽ അയക്കണം",
    "എനിക്ക് ഇമെയിൽ അയക്കണം",
    "എനിക്ക് ഒരു മെയിൽ അയക്കണം",
    "എനിക്ക് മെയിൽ അയക്കണം",
    "ഒരു ഇമെയിൽ അയക്കണം",
    "ഒരു മെയിൽ അയക്കണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// GMAIL - REPLY EMAIL
// ============================================================

function isReplyEmailRequest(text) {
  const phrases = [
    // English
    "reply email",
    "reply to email",
    "reply to this email",
    "respond to email",
    "reply to a mail",

    // Manglish
    "email reply cheyyanam",
    "mail reply cheyyanam",
    "emailinu reply",
    "mailinu reply",
    "emailinu marupadi",
    "mailinu marupadi",

    // Malayalam
    "ഇമെയിലിന് മറുപടി",
    "ഇമെയിൽ മറുപടി",
    "മെയിലിന് മറുപടി",
    "മെയിൽ മറുപടി",
    "ഇമെയിലിന് മറുപടി നൽകണം",
    "മെയിലിന് മറുപടി നൽകണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// GMAIL - FIND EMAIL
// ============================================================

function isFindEmailRequest(text) {
  const phrases = [
    // English
    "find email",
    "find an email",
    "find a mail",
    "search email",
    "search mail",
    "find message",
    "search message",

    // Manglish
    "email kandethanam",
    "mail kandethanam",
    "email kandupidikkanam",
    "mail kandupidikkanam",
    "email thirayanam",
    "mail thirayanam",

    // Malayalam
    "ഇമെയിൽ കണ്ടെത്തണം",
    "മെയിൽ കണ്ടെത്തണം",
    "ഇമെയിൽ കണ്ടുപിടിക്കണം",
    "മെയിൽ കണ്ടുപിടിക്കണം",
    "ഇമെയിൽ തിരയണം",
    "മെയിൽ തിരയണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// KSRTC - BUS BOOKING
// ============================================================

function isKsrtcRequest(text) {
  const phrases = [
    // English
    "ksrtc",
    "book ksrtc",
    "ksrtc bus",
    "book bus",
    "bus booking",
    "bus ticket",
    "reserve bus",
    "reserve bus ticket",
    "kerala rtc",
    "help me book a bus",
    "i want to book a bus",
    "book bus ticket",

    // Manglish
    "ksrtc bus book cheyyanam",
    "bus book cheyyanam",
    "ksrtc ticket edukkenam",
    "bus ticket edukkenam",
    "oru bus book cheyyanam",
    "ksrtc pokanam",
    "busil pokanam",
    "ksrtc bus booking",
    "ksrtc help",
    "enikku bus book cheyyanam",
    "bus yathra",

    // Malayalam
    "കെ.എസ്.ആർ.ടി.സി",
    "കെഎസ്ആർടിസി",
    "ബസ് ബുക്ക് ചെയ്യണം",
    "കെഎസ്ആർടിസി ബസ്",
    "ബസ് ടിക്കറ്റ് എടുക്കണം",
    "കെഎസ്ആർടിസി ബുക്കിംഗ്",
    "ബസ് യാത്ര",
    "എനിക്ക് ബസ് ബുക്ക് ചെയ്യണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// IRCTC - RAILWAY BOOKING
// ============================================================

function isIrctcRequest(text) {
  const phrases = [
    // English
    "irctc",
    "book train",
    "irctc train",
    "book irctc",
    "railway booking",
    "train ticket",
    "reserve train",
    "reserve train ticket",
    "book railway ticket",
    "help me book a train",
    "i want to book a train",
    "train booking",

    // Manglish
    "train book cheyyanam",
    "irctc train book cheyyanam",
    "train ticket edukkenam",
    "railway ticket edukkenam",
    "oru train book cheyyanam",
    "trainil pokanam",
    "irctc help",
    "enikku train book cheyyanam",
    "rail ticket",

    // Malayalam
    "ട്രെയിൻ ബുക്ക് ചെയ്യണം",
    "ട്രെയിൻ ടിക്കറ്റ് എടുക്കണം",
    "ഐ.ആർ.സി.ടി.സി",
    "ഐആർസിടിസി",
    "റെയിൽവേ ടിക്കറ്റ് ബുക്കിംഗ്",
    "ട്രെയിൻ യാത്ര",
    "എനിക്ക് ട്രെയിൻ ബുക്ക് ചെയ്യണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// BHARATGAS - LPG BOOKING
// ============================================================

function isBharatgasRequest(text) {
  const phrases = [
    // English
    "bharatgas",
    "bharat gas",
    "book gas",
    "gas booking",
    "lpg cylinder",
    "lpg refill",
    "cylinder booking",
    "gas cylinder",
    "help me book gas",
    "i want to book gas",
    "book bharatgas",
    "refill booking",

    // Manglish
    "gas book cheyyanam",
    "bharatgas book cheyyanam",
    "cylinder book cheyyanam",
    "gas cylinder book cheyyanam",
    "gas kazhinju",
    "gas refill",
    "enikku gas book cheyyanam",
    "aduppu gas",

    // Malayalam
    "ഗ്യാസ് ബുക്ക് ചെയ്യണം",
    "ഭാരത് ഗ്യാസ്",
    "ഭാരത്ഗ്യാസ്",
    "സിലിണ്ടർ ബുക്ക് ചെയ്യണം",
    "എൽ.പി.ജി ബുക്കിംഗ്",
    "ഗ്യാസ് സിലിണ്ടർ",
    "എനിക്ക് ഗ്യാസ് ബുക്ക് ചെയ്യണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// KSEB - ELECTRICITY BILL PAYMENT
// ============================================================

function isKsebRequest(text) {
  const phrases = [
    // English
    "kseb",
    "electricity bill",
    "pay electricity bill",
    "pay kseb bill",
    "current bill",
    "power bill",
    "pay kseb",
    "electricity bill payment",
    "help me pay electricity bill",
    "i want to pay electricity bill",
    "pay current bill",

    // Manglish
    "kseb bill adakkanam",
    "current bill adakkanam",
    "current bill pay cheyyanam",
    "electricity bill adakkanam",
    "kseb payment",
    "current charge",
    "enikku kseb bill adakkanam",
    "electric bill",

    // Malayalam
    "വൈദ്യുതി ബിൽ അടയ്ക്കണം",
    "കറന്റ് ബിൽ അടയ്ക്കണം",
    "കെ.എസ്.ഇ.ബി",
    "കെഎസ്ഇബി",
    "കെ.എസ്.ഇ.ബി ബിൽ അടയ്ക്കണം",
    "കെഎസ്ഇബി പേയ്മെന്റ്",
    "വൈദ്യുതി ബിൽ",
    "എനിക്ക് കെഎസ്ഇബി ബിൽ അടയ്ക്കണം"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// GENERAL HELP / STUCK
// ============================================================

function isHelpOrStuckRequest(text) {
  const phrases = [
    // English
    "help me",
    "i am stuck",
    "i'm stuck",
    "what do i do",
    "confused",
    "cannot proceed",
    "can't proceed",
    "where to click",
    "what is next",
    "explain again",
    "assist me",

    // Manglish
    "enikku help venam",
    "stuck aayi",
    "ariyunilla",
    "entha cheyyendathu",
    "sahayam venam",
    "engane cheyyum",
    "manasilavunnilla",

    // Malayalam
    "എന്നെ സഹായിക്കൂ",
    "സഹായം വേണം",
    "എനിക്ക് മനസ്സിലാകുന്നില്ല",
    "എന്ത് ചെയ്യണം",
    "വഴി അറിയില്ല",
    "സഹായിക്കാമോ"
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

// ============================================================
// MAIN INTENT RECOGNIZER
// ============================================================

function recognizeLanternIntent(userInput) {
  const text = normalizeText(userInput);

  console.log("[LANTERN] Recognizing intent for:", text);

  if (!text) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      message: "Please tell me what you need help with."
    };
  }

  // ----------------------------------------------------------
  // KSRTC BUS BOOKING
  // ----------------------------------------------------------
  if (isKsrtcRequest(text)) {
    return {
      intent: "BOOK_KSRTC_BUS",
      confidence: 0.95,
      route: "/ksrtc",
      serviceId: "ksrtc",
      message: "I can help you book a KSRTC bus ticket step by step."
    };
  }

  // ----------------------------------------------------------
  // IRCTC RAILWAY BOOKING
  // ----------------------------------------------------------
  if (isIrctcRequest(text)) {
    return {
      intent: "BOOK_IRCTC_TRAIN",
      confidence: 0.95,
      route: "/irctc",
      serviceId: "irctc",
      message: "I can help you book an IRCTC train ticket step by step."
    };
  }

  // ----------------------------------------------------------
  // BHARATGAS LPG BOOKING
  // ----------------------------------------------------------
  if (isBharatgasRequest(text)) {
    return {
      intent: "BOOK_BHARATGAS",
      confidence: 0.95,
      route: "/bharatgas",
      serviceId: "bharatgas",
      message: "I can help you book your Bharatgas LPG cylinder refill."
    };
  }

  // ----------------------------------------------------------
  // KSEB ELECTRICITY BILL PAYMENT
  // ----------------------------------------------------------
  if (isKsebRequest(text)) {
    return {
      intent: "PAY_KSEB_BILL",
      confidence: 0.95,
      route: "/kseb",
      serviceId: "kseb",
      message: "I can help you check and pay your KSEB electricity bill."
    };
  }

  // ----------------------------------------------------------
  // GMAIL - SEND EMAIL
  // ----------------------------------------------------------
  if (isSendEmailRequest(text)) {
    return {
      intent: "GMAIL_SEND_EMAIL",
      confidence: 0.95,
      message: "I can help you send an email."
    };
  }

  // ----------------------------------------------------------
  // GMAIL - REPLY EMAIL
  // ----------------------------------------------------------
  if (isReplyEmailRequest(text)) {
    return {
      intent: "GMAIL_REPLY",
      confidence: 0.95,
      message: "I can help you reply to an email."
    };
  }

  // ----------------------------------------------------------
  // GMAIL - FIND EMAIL
  // ----------------------------------------------------------
  if (isFindEmailRequest(text)) {
    return {
      intent: "GMAIL_FIND_EMAIL",
      confidence: 0.95,
      message: "I can help you find an email."
    };
  }

  // ----------------------------------------------------------
  // GENERAL HELP / STUCK
  // ----------------------------------------------------------
  if (isHelpOrStuckRequest(text)) {
    return {
      intent: "LANTERN_HELP",
      confidence: 0.9,
      message: "I am right here to help you. I will guide you to the current step."
    };
  }

  // ----------------------------------------------------------
  // UNKNOWN
  // ----------------------------------------------------------
  return {
    intent: "UNKNOWN",
    confidence: 0,
    message: "I couldn't understand that request. Try asking 'Book KSRTC bus', 'Book train', 'Book gas', or 'Pay electricity bill'."
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.recognizeLanternIntent = recognizeLanternIntent;
}