// ==========================================
// LANTERN - GMAIL WORKFLOW
// ==========================================

const gmailWorkflow = {

  website: "Gmail",

  urlPattern: "mail.google.com",

  tasks: {

    // ======================================
    // TASK 1 - SEND EMAIL
    // ======================================

    SEND_EMAIL: {

      name: "Send an email",

      keywords: [
        "send email",
        "send an email",
        "compose email",
        "write email",
        "send mail",
        "email someone"
      ],

      steps: [

        {
          step: 1,
          action: "click",
          target: "compose",
          instruction:
            "Click Compose to write a new email."
        },

        {
          step: 2,
          action: "input",
          target: "recipient",
          instruction:
            "Enter the recipient's email address."
        },

        {
          step: 3,
          action: "input",
          target: "subject",
          instruction:
            "Enter the email subject."
        },

        {
          step: 4,
          action: "input",
          target: "message",
          instruction:
            "Type your message."
        },

        {
          step: 5,
          action: "click",
          target: "send",
          instruction:
            "Click Send to send the email."
        }

      ]

    },


    // ======================================
    // TASK 2 - SEND EMAIL WITH ATTACHMENT
    // ======================================

    SEND_EMAIL_WITH_ATTACHMENT: {

      name: "Send an email with attachment",

      keywords: [
        "send email with attachment",
        "send mail with attachment",
        "attach a file",
        "send assignment",
        "send document"
      ],

      steps: [

        {
          step: 1,
          action: "click",
          target: "compose",
          instruction:
            "Click Compose."
        },

        {
          step: 2,
          action: "input",
          target: "recipient",
          instruction:
            "Enter the recipient's email address."
        },

        {
          step: 3,
          action: "input",
          target: "subject",
          instruction:
            "Enter the email subject."
        },

        {
          step: 4,
          action: "input",
          target: "message",
          instruction:
            "Type your message."
        },

        {
          step: 5,
          action: "click",
          target: "attachment",
          instruction:
            "Click Attach files and choose your file."
        },

        {
          step: 6,
          action: "wait",
          target: "attachmentUpload",
          instruction:
            "Wait for the attachment to finish uploading."
        },

        {
          step: 7,
          action: "click",
          target: "send",
          instruction:
            "Click Send."
        }

      ]

    },


    // ======================================
    // TASK 3 - REPLY TO EMAIL
    // ======================================

    REPLY_EMAIL: {

      name: "Reply to an email",

      keywords: [
        "reply email",
        "reply to email",
        "reply to this email",
        "respond to email"
      ],

      steps: [

        {
          step: 1,
          action: "click",
          target: "reply",
          instruction:
            "Click Reply."
        },

        {
          step: 2,
          action: "input",
          target: "message",
          instruction:
            "Type your reply."
        },

        {
          step: 3,
          action: "click",
          target: "send",
          instruction:
            "Click Send."
        }

      ]

    },


    // ======================================
    // TASK 4 - FIND EMAIL
    // ======================================

    FIND_EMAIL: {

      name: "Find an email",

      keywords: [
        "find email",
        "search email",
        "find a mail",
        "search mail",
        "find message"
      ],

      steps: [

        {
          step: 1,
          action: "click",
          target: "search",
          instruction:
            "Click the Gmail search box."
        },

        {
          step: 2,
          action: "input",
          target: "search",
          instruction:
            "Enter the name, email address, or words you want to search for."
        },

        {
          step: 3,
          action: "press",
          target: "search",
          instruction:
            "Press Enter to search."
        }

      ]

    }

  }

};

export default gmailWorkflow;