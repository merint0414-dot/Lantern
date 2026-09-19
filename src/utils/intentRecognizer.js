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

    // Manglish / Malayalam-English
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
};


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

  for (const [intent, keywords] of Object.entries(intents)) {
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

  return {
    intent: "UNKNOWN",
    confidence: 0,
    message:
      "I'm not sure what you need help with. Please describe your problem.",
  };
}


function getIntentMessage(intent, input) {
  switch (intent) {
    case "REGISTER":
      if (
        /[\u0D00-\u0D7F]/.test(input)
      ) {
        return "നിങ്ങൾക്ക് രജിസ്റ്റർ ചെയ്യാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with registration.";

    case "LOGIN":
      if (
        /[\u0D00-\u0D7F]/.test(input)
      ) {
        return "നിങ്ങൾക്ക് ലോഗിൻ ചെയ്യാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with login.";

    case "FORGOT_PASSWORD":
      if (
        /[\u0D00-\u0D7F]/.test(input)
      ) {
        return "നിങ്ങളുടെ പാസ്‌വേഡ് വീണ്ടെടുക്കാൻ ഞാൻ സഹായിക്കാം.";
      }

      return "I understand that you need help resetting your password.";

    case "SEARCH":
      if (
        /[\u0D00-\u0D7F]/.test(input)
      ) {
        return "നിങ്ങൾക്ക് എന്തെങ്കിലും തിരയാൻ സഹായം വേണമെന്ന് ഞാൻ മനസ്സിലാക്കി.";
      }

      return "I understand that you need help with searching.";

    default:
      return "I understand your request.";
  }
}