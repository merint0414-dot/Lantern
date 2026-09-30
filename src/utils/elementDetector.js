// ==========================================
// LANTERN - UI ELEMENT DETECTOR
// Demo Website + Real Website Support
// ==========================================


// ==========================================
// DEMO WEBSITE SELECTORS
// ==========================================

const demoSelectors = {

  name: "#name",

  email: "#email",

  password: "#password",

  registerButton: "#registerButton",

};


// ==========================================
// FIND ELEMENT BY TEXT / ATTRIBUTE
// ==========================================

function findByAttributes(attributes) {

  for (const attribute of attributes) {

    const elements =
      document.querySelectorAll(
        `[${attribute.name}]`
      );

    for (const element of elements) {

      const value =
        element
          .getAttribute(attribute.name)
          ?.toLowerCase();

      if (
        value &&
        value.includes(attribute.value.toLowerCase())
      ) {

        return element;

      }
    }
  }

  return null;
}


// ==========================================
// FIND ELEMENT BY VISIBLE TEXT
// ==========================================

function findByText(textValues) {

  const elements =
    document.querySelectorAll(
      "button, a, div, span, input"
    );

  for (const element of elements) {

    const text =
      element.innerText
        ?.trim()
        .toLowerCase();

    if (!text) {
      continue;
    }

    for (const value of textValues) {

      if (
        text === value.toLowerCase() ||
        text.includes(value.toLowerCase())
      ) {

        return element;

      }
    }
  }

  return null;
}


// ==========================================
// GMAIL ELEMENT DETECTION
// ==========================================

const gmailDetectors = {

  // ----------------------------------------
  // COMPOSE
  // ----------------------------------------

  compose: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "compose",
        },

        {
          name: "title",
          value: "compose",
        },

      ]);

    if (element) {
      return element;
    }

    return findByText([
      "Compose",
    ]);
  },


  // ----------------------------------------
  // RECIPIENT
  // ----------------------------------------

  recipient: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "to recipients",
        },

        {
          name: "name",
          value: "to",
        },

        {
          name: "placeholder",
          value: "recipients",
        },

      ]);

    if (element) {
      return element;
    }

    return findByAttributes([
      {
        name: "aria-label",
        value: "recipients",
      },
    ]);
  },


  // ----------------------------------------
  // SUBJECT
  // ----------------------------------------

  subject: () => {

    const element =
      findByAttributes([

        {
          name: "name",
          value: "subjectbox",
        },

        {
          name: "placeholder",
          value: "subject",
        },

        {
          name: "aria-label",
          value: "subject",
        },

      ]);

    if (element) {
      return element;
    }

    return findByText([
      "Subject",
    ]);
  },


  // ----------------------------------------
  // MESSAGE
  // ----------------------------------------

  message: () => {

    const elements =
      document.querySelectorAll(
        '[contenteditable="true"]'
      );

    for (const element of elements) {

      const ariaLabel =
        element
          .getAttribute("aria-label")
          ?.toLowerCase();

      const role =
        element
          .getAttribute("role")
          ?.toLowerCase();

      if (
        ariaLabel?.includes("message") ||
        role === "textbox"
      ) {

        return element;

      }
    }

    return null;
  },


  // ----------------------------------------
  // ATTACHMENT
  // ----------------------------------------

  attachment: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "attach files",
        },

        {
          name: "title",
          value: "attach files",
        },

      ]);

    if (element) {
      return element;
    }

    return findByText([
      "Attach files",
    ]);
  },


  // ----------------------------------------
  // SEND
  // ----------------------------------------

  send: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "send",
        },

        {
          name: "title",
          value: "send",
        },

      ]);

    if (element) {
      return element;
    }

    return findByText([
      "Send",
    ]);
  },


  // ----------------------------------------
  // REPLY
  // ----------------------------------------

  reply: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "reply",
        },

        {
          name: "title",
          value: "reply",
        },

      ]);

    if (element) {
      return element;
    }

    return findByText([
      "Reply",
    ]);
  },


  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  search: () => {

    const element =
      findByAttributes([

        {
          name: "aria-label",
          value: "search mail",
        },

        {
          name: "placeholder",
          value: "search mail",
        },

        {
          name: "name",
          value: "q",
        },

      ]);

    if (element) {
      return element;
    }

    return null;
  },


  // ----------------------------------------
  // ATTACHMENT UPLOAD
  // ----------------------------------------

  attachmentUpload: () => {

    const fileInputs =
      document.querySelectorAll(
        'input[type="file"]'
      );

    if (fileInputs.length > 0) {

      return fileInputs[
        fileInputs.length - 1
      ];

    }

    return null;
  },

};


// ==========================================
// FIND ELEMENT
// ==========================================

export function findElement(targetName) {

  // ----------------------------------------
  // Check Gmail detectors
  // ----------------------------------------

  if (
    gmailDetectors[targetName]
  ) {

    const element =
      gmailDetectors[targetName]();

    if (element) {

      console.log(
        `LANTERN: Gmail element detected - ${targetName}`
      );

      return element;

    }

    console.log(
      `LANTERN: Gmail element not found - ${targetName}`
    );

    return null;
  }


  // ----------------------------------------
  // Check demo website
  // ----------------------------------------

  const selector =
    demoSelectors[targetName];

  if (!selector) {

    console.log(
      `LANTERN: No selector found for ${targetName}`
    );

    return null;
  }


  const element =
    document.querySelector(selector);


  if (element) {

    console.log(
      `LANTERN: Demo element detected - ${targetName}`
    );

  } else {

    console.log(
      `LANTERN: Demo element not found - ${targetName}`
    );

  }


  return element;
}


// ==========================================
// REMOVE ALL LANTERN HIGHLIGHTS
// ==========================================

export function removeAllHighlights() {

  const highlightedElements =
    document.querySelectorAll(
      ".lantern-highlight"
    );

  highlightedElements.forEach(
    (element) => {

      element.classList.remove(
        "lantern-highlight"
      );

    }
  );
}


// ==========================================
// HIGHLIGHT ELEMENT
// ==========================================

export function highlightElement(
  targetName
) {

  removeAllHighlights();


  const element =
    findElement(targetName);


  if (!element) {

    console.log(
      `LANTERN: Cannot highlight ${targetName}`
    );

    return null;
  }


  element.classList.add(
    "lantern-highlight"
  );


  element.scrollIntoView({

    behavior: "smooth",

    block: "center",

  });


  console.log(
    `LANTERN: Highlighted ${targetName}`
  );


  return element;
}


// ==========================================
// CHECK IF ELEMENT EXISTS
// ==========================================

export function elementExists(
  targetName
) {

  return (
    findElement(targetName) !== null
  );
}