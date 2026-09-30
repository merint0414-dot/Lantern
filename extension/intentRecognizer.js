// ==========================================
// LANTERN - EXTENSION INTENT RECOGNIZER
// ==========================================

console.log(
  "LANTERN intent recognizer loaded."
);


// ==========================================
// NORMALIZE USER INPUT
// ==========================================

function normalizeText(text) {

  return (
    text || ""
  )
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

}


// ==========================================
// GMAIL - SEND EMAIL
// ==========================================

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


  return phrases.some(
    (phrase) =>
      text.includes(phrase)
  );

}


// ==========================================
// GMAIL - REPLY EMAIL
// ==========================================

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


  return phrases.some(
    (phrase) =>
      text.includes(phrase)
  );

}


// ==========================================
// GMAIL - FIND EMAIL
// ==========================================

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


  return phrases.some(
    (phrase) =>
      text.includes(phrase)
  );

}


// ==========================================
// MAIN INTENT RECOGNIZER
// ==========================================

function recognizeLanternIntent(
  userInput
) {

  const text =
    normalizeText(
      userInput
    );


  console.log(
    "LANTERN: Recognizing intent:",
    text
  );


  if (!text) {

    return {

      intent: "UNKNOWN",

      confidence: 0,

      message:
        "Please tell me what you need help with."

    };

  }


  // ------------------------------------------
  // SEND EMAIL
  // ------------------------------------------

  if (
    isSendEmailRequest(text)
  ) {

    return {

      intent:
        "GMAIL_SEND_EMAIL",

      confidence:
        0.95,

      message:
        "I can help you send an email."

    };

  }


  // ------------------------------------------
  // REPLY EMAIL
  // ------------------------------------------

  if (
    isReplyEmailRequest(text)
  ) {

    return {

      intent:
        "GMAIL_REPLY",

      confidence:
        0.95,

      message:
        "I can help you reply to an email."

    };

  }


  // ------------------------------------------
  // FIND EMAIL
  // ------------------------------------------

  if (
    isFindEmailRequest(text)
  ) {

    return {

      intent:
        "GMAIL_FIND_EMAIL",

      confidence:
        0.95,

      message:
        "I can help you find an email."

    };

  }


  // ------------------------------------------
  // UNKNOWN
  // ------------------------------------------

  return {

    intent:
      "UNKNOWN",

    confidence:
      0,

    message:
      "I couldn't understand that request."

  };

}