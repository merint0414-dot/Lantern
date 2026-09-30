// ==========================================
// LANTERN - INTENT RECOGNIZER
// English + Malayalam + Manglish + Gmail
// ==========================================

const intents = {
  REGISTER: [
    // English
    "register",
    "registration",
    "sign up",
    "signup",
    "create account",
    "new account",
    "join",
    "create an account",

    // Malayalam
    "രജിസ്റ്റർ",
    "രജിസ്ട്രേഷൻ",
    "രജിസ്റ്റര്",
    "അക്കൗണ്ട് ഉണ്ടാക്കണം",
    "അക്കൗണ്ട് ഉണ്ടാക്കാൻ",
    "രജിസ്റ്റർ ചെയ്യണം",
    "രജിസ്റ്റർ ചെയ്യാൻ",

    // Manglish
    "register cheyyanam",
    "registration cheyyanam",
    "account undakkanam",
    "account undakkan",
  ],

  LOGIN: [
    // English
    "login",
    "log in",
    "sign in",
    "signin",
    "access account",

    // Malayalam
    "ലോഗിൻ",
    "ലോഗിന്",
    "സൈൻ ഇൻ",
    "അക്കൗണ്ടിൽ കയറണം",
    "അക്കൗണ്ടിൽ പ്രവേശിക്കണം",

    // Manglish
    "login cheyyanam",
    "login cheyyan",
    "sign in cheyyanam",
  ],

  FORGOT_PASSWORD: [
    // English
    "forgot password",
    "forgot my password",
    "reset password",
    "password reset",
    "cannot remember password",
    "can't remember password",

    // Malayalam
    "പാസ്‌വേഡ് മറന്നു",
    "പാസ്വേഡ് മറന്നു",
    "പാസ്‌വേഡ് ഓർമ്മയില്ല",
    "പാസ്വേഡ് ഓർമ്മയില്ല",
    "പാസ്‌വേഡ് മാറ്റണം",

    // Manglish
    "password marannu",
    "password ormayilla",
    "password maattanam",
  ],

  SEARCH: [
    // English
    "search",
    "find",
    "look for",
    "search for",
    "find a product",
    "find an item",

    // Malayalam
    "തിരയണം",
    "തിരയുക",
    "തിരയാൻ",
    "കണ്ടെത്തണം",
    "കണ്ടെത്താൻ",
    "എങ്ങനെ തിരയും",

    // Manglish
    "search cheyyanam",
    "search cheyyan",
    "thirayanam",
    "kandethanam",
  ],

  // ==========================================
  // GMAIL INTENTS
  // ==========================================

  GMAIL_SEND_EMAIL: [
    // English
    "send email",
    "send an email",
    "compose email",
    "write email",
    "send mail",
    "email someone",

    // Malayalam
    "ഇമെയിൽ അയക്കണം",
    "മെയിൽ അയക്കണം",
    "ഇമെയിൽ അയയ്ക്കണം",
    "മെയിൽ അയയ്ക്കണം",

    // Manglish
    "email ayakkanam",
    "email ayakkan",
    "mail ayakkanam",
    "mail ayakkan",
    "email send cheyyanam",
    "mail send cheyyanam",
  ],

  GMAIL_SEND_ATTACHMENT: [
    // English
    "send email with attachment",
    "send mail with attachment",
    "attach a file",
    "send assignment",
    "send document",
    "send file",
    "email with attachment",

    // Malayalam
    "ഫയൽ അറ്റാച്ച് ചെയ്ത് അയക്കണം",
    "ഫയൽ അയക്കണം",
    "ഡോക്യുമെന്റ് അയക്കണം",
    "അസൈൻമെന്റ് അയക്കണം",

    // Manglish
    "file attach cheyyanam",
    "file attach cheythu ayakkanam",
    "assignment ayakkanam",
    "document ayakkanam",
    "file ayakkanam",
  ],

  GMAIL_REPLY: [
    // English
    "reply email",
    "reply to email",
    "reply to this email",
    "respond to email",
    "reply to a mail",

    // Malayalam
    "ഇമെയിലിന് മറുപടി നൽകണം",
    "മെയിലിന് മറുപടി നൽകണം",
    "ഇമെയിലിന് റിപ്ലൈ ചെയ്യണം",

    // Manglish
    "email reply cheyyanam",
    "mail reply cheyyanam",
    "emailinu reply cheyyanam",
    "mailinu reply cheyyanam",
  ],

  GMAIL_FIND_EMAIL: [
    // English
    "find email",
    "search email",
    "find a mail",
    "search mail",
    "find message",
    "find an email",

    // Malayalam
    "ഇമെയിൽ കണ്ടെത്തണം",
    "മെയിൽ കണ്ടെത്തണം",
    "ഇമെയിൽ തിരയണം",
    "മെയിൽ തിരയണം",

    // Manglish
    "email kandethanam",
    "mail kandethanam",
    "email search cheyyanam",
    "mail search cheyyanam",
  ],
};


// ==========================================
// MAIN INTENT RECOGNITION
// ==========================================

export function recognizeIntent(userInput) {
  if (!userInput) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      message: "Please tell me what you need help with.",
    };
  }

  const input = userInput.toLowerCase().trim();

  if (!input) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      message: "Please tell me what you need help with.",
    };
  }

  // ------------------------------------------
  // Check Gmail intents first
  // ------------------------------------------
  // Gmail phrases such as "send email" also
  // contain words like "search" or "mail".
  // Checking Gmail first avoids wrong matching.
  // ------------------------------------------

  const gmailIntentOrder = [
    "GMAIL_SEND_ATTACHMENT",
    "GMAIL_SEND_EMAIL",
    "GMAIL_REPLY",
    "GMAIL_FIND_EMAIL",
  ];

  for (const intent of gmailIntentOrder) {
    const keywords = intents[intent];

    for (const keyword of keywords) {
      if (input.includes(keyword.toLowerCase())) {
        return {
          intent: intent,
          confidence: 1,
          message: getIntentMessage(intent, input),
        };
      }
    }
  }


  // ------------------------------------------
  // Check existing intents
  // ------------------------------------------

  for (const [intent, keywords] of Object.entries(intents)) {

    // Skip Gmail intents because they were
    // already checked above.
    if (intent.startsWith("GMAIL_")) {
      continue;
    }

    for (const keyword of keywords) {

      if (input.includes(keyword.toLowerCase())) {

        return {
          intent: intent,
          confidence: 1,
          message: getIntentMessage(intent, input),
        };

      }

    }
  }


  // ------------------------------------------
  // Unknown intent
  // ------------------------------------------

  return {
    intent: "UNKNOWN",
    confidence: 0,
    message:
      "I'm not sure what you need help with. Please describe your problem.",
  };
}


// ==========================================
// INTENT MESSAGE
// ==========================================

function getIntentMessage(intent, input) {

  const isMalayalam =
    /[\u0D00-\u0D7F]/.test(input);


  switch (intent) {

    case "REGISTER":

      if (isMalayalam) {
        return "നിങ്ങൾക്ക് രജിസ്റ്റർ ചെയ്യാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with registration.";


    case "LOGIN":

      if (isMalayalam) {
        return "നിങ്ങൾക്ക് ലോഗിൻ ചെയ്യാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with login.";


    case "FORGOT_PASSWORD":

      if (isMalayalam) {
        return "നിങ്ങളുടെ പാസ്‌വേഡ് വീണ്ടെടുക്കാൻ ഞാൻ സഹായിക്കാം.";
      }

      return "I understand that you need help resetting your password.";


    case "SEARCH":

      if (isMalayalam) {
        return "നിങ്ങൾക്ക് എന്തെങ്കിലും തിരയാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with searching.";


    // ========================================
    // GMAIL MESSAGES
    // ========================================

    case "GMAIL_SEND_EMAIL":

      if (isMalayalam) {
        return "നിങ്ങൾക്ക് Gmail വഴി ഒരു ഇമെയിൽ അയക്കാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you want to send an email using Gmail.";


    case "GMAIL_SEND_ATTACHMENT":

      if (isMalayalam) {
        return "Gmail വഴി ഒരു ഫയൽ അറ്റാച്ച് ചെയ്ത് അയക്കാൻ ഞാൻ സഹായിക്കാം.";
      }

      return "I understand that you want to send an email with an attachment.";


    case "GMAIL_REPLY":

      if (isMalayalam) {
        return "Gmail-ൽ ഒരു ഇമെയിലിന് മറുപടി നൽകാൻ ഞാൻ സഹായിക്കാം.";
      }

      return "I understand that you want to reply to an email.";


    case "GMAIL_FIND_EMAIL":

      if (isMalayalam) {
        return "Gmail-ൽ ഒരു ഇമെയിൽ കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം.";
      }

      return "I understand that you want to find an email.";


    default:

      return "I understand your request.";
  }
}