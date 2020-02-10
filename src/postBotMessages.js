async function askForJiraExportSingleElement(
  app,
  botToken,
  channel,
  user,
  summary,
  knowledgetype,
  docLoc
) {
  let doc_loc_default_text = "Jira-Kommentar";
  if (docLoc === "i") {
    doc_loc_default_text = "Jira-Issue";
  }

    const result = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user}>, möchtest du dieses _Entscheidungswissen_:  \n  • *Typ:* :${knowledgetype}: (${knowledgetype}) \n  • *Titel*: "${summary}" \n nach *Jira* exportieren?`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `Wähle den _Dokumentationsort_ aus.`
        },

        accessory: {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select Documentation Location"
          },
          action_id: "doc_loc_choice",
          initial_option: {
            text: {
              type: "plain_text",
              text: doc_loc_default_text
            },
            value: docLoc
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Jira-Issue"
              },
              value: "i"
            },
            {
              text: {
                type: "plain_text",
                text: "Jira-Kommentar"
              },
              value: "s"
            }
          ]
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `Klicke anschließend auf *Export to Jira*.`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Export to Jira"
          },
          action_id: "single_export_click"
        }
      },
      {
        type: "divider"
      }
    ]
  });

  return result;
}

async function updateSingleItemMessage(
  app,
  userName,
  context,
  channel,
  knowledgetype,
  summary,
  jiraIssueURL,
  elementTS
) {
  const result = await app.client.chat.update({
    token: context.botToken,
    channel: channel,
    ts: elementTS,
    as_user: true,
    text: {
      type: "mrkdwn",
      text: "default Text"
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey <@${userName}>, dein _Entscheidungswissen_: \n  • *Typ* :${knowledgetype}: (${knowledgetype}) \n  • *Titel* "${summary}" \n wurde erfolgreich nach *Jira* exportiert :simple_smile:.`
        }
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: `Hier ist auch noch der *Jira-Link* dazu: ${jiraIssueURL}.`
          }
        ]
      }
    ]
  });

  return result;
}

function buildMessageBlocks(knowledgeElements) {
  let doc_loc_default_text;
  let messageBlocks = [];
  knowledgeElements.forEach((element, index) => {
    messageBlocks.push({
      type: "section",

      text: {
        type: "mrkdwn",
        text: `*Element ${index + 1}*: :${element.elementType}: ${
          element.elementText
        }`
      }
    });
    if (element.docLoc === "i") {
      doc_loc_default_text = "Jira-Issue";
    } else {
      doc_loc_default_text = "Jira-Kommentar";
    }
    messageBlocks.push({
      type: "section",

      text: {
        type: "mrkdwn",
        text: `Wähle den _Dokumentationsort_ aus.`
      },

      accessory: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Select Documentation Location"
        },
        action_id: "doc_loc_choice",
        initial_option: {
          text: {
            type: "plain_text",
            text: doc_loc_default_text
          },
          value: element.docLoc
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Jira-Issue"
            },
            value: "i"
          },
          {
            text: {
              type: "plain_text",
              text: "Jira-Kommentar"
            },
            value: "s"
          }
        ]
      }
    });
    messageBlocks.push({
      type: "section",

      text: {
        type: "mrkdwn",
        text: `Klicke anschließend auf *Export to Jira*.`
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Export to Jira"
        },
        action_id: "single_export_click"
      }
    });
  });
  return messageBlocks;
}

async function askForJiraExportMultElements(
  app,
  botToken,
  channel,
  user,
  knowledgeElements
) {
  let messageBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${user}>, ich habe mehrere *Entscheidungswissen-Elemente* in deiner Nachricht gefunden: `
      }
    },
    {
      type: "divider"
    }
  ];
  elementBlocks = buildMessageBlocks(knowledgeElements);
  messageBlocks.push(...elementBlocks);
  messageBlocks.push({
    type: "divider"
  });
  messageBlocks.push({
    type: "section",

    text: {
      type: "mrkdwn",
      text: `Hier kannst du alle Elemente gleichzeitig nach *Jira* exportieren: `
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Export all"
      },
      action_id: "export-all-click"
    }
  });

  const result = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    user: user,
    blocks: messageBlocks
  });
  console.log(`MultItemMessageTS: ${result.ts}`);
  return result;
}

async function tellUserAboutSuccesfullUploadtoJira(
  app,
  userName,
  user,
  botToken,
  channel,
  knowledgetype,
  summary,
  jiraIssueURL
) {
  const result = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey <@${userName}>, dein _Entscheidungswissen_: \n  • *Typ* :${knowledgetype}: (${knowledgetype}) \n  • *Titel* "${summary}" \n wurde erfolgreich nach *Jira* exportiert :simple_smile:.`
        }
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: `Hier ist auch noch der *Jira-Link* dazu: ${jiraIssueURL}.`
          }
        ]
      }
    ]
  });
  return result;
}

async function updateMultItemMessage(
  app,
  userID,
  context,
  channel,
  elementTS,
  knowledgeElements
) {
  let messageBlocks = [];
  if (knowledgeElements.length > 1) {
    messageBlocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${userID}>, ich habe mehrere *Entscheidungswissen-Elemente* in deiner Nachricht gefunden: `
        }
      },
      {
        type: "divider"
      }
    );
  } else {
    messageBlocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${userID}>, ich habe folgendes *Entscheidungswissen-Element* in deiner Nachricht gefunden: `
        }
      },
      {
        type: "divider"
      }
    );
  }
  elementBlocks = buildMessageBlocks(knowledgeElements);
  messageBlocks.push(...elementBlocks);
  messageBlocks.push({
    type: "divider"
  });
  if (knowledgeElements.length > 1) {
    messageBlocks.push({
      type: "section",

      text: {
        type: "mrkdwn",
        text: `Hier kannst du alle Elemente gleichzeitig nach *Jira* exportieren: `
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Export all"
        },
        action_id: "export-all-click"
      }
    });
  } else {
    messageBlocks.push({
      type: "divider"
    });
  }
  const result = await app.client.chat.update({
    token: context.botToken,
    channel: channel,
    ts: elementTS,
    as_user: true,
    text: {
      type: "mrkdwn",
      text: "default Text"
    },
    blocks: messageBlocks
  });
  console.log(result);

  return result;
}

async function descriptionMissing(app, botToken, channel, user, knowledgetype) {
  const result = await app.client.chat.postEphemeral({
    token: botToken,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user}>, um dein Entscheidungswissen :${knowledgetype}: nach *Jira* zu exportieren, beschreibe es *vor* dem Emoji.`
        }
      }
    ]
  });
  return result;
}

async function memberJoinChannelMessage(app, botToken, user, channel, botUserID) {
  const result = await app.client.chat.postEphemeral({
    token: botToken,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hello <@${user}>! My name is DecBot and I want to make life easier for you :smiley:.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `If you want to find out more about my skills, just type in: "<@${botUserID}> help".`
        }
      }
    ]
  });
  return result;
}

async function greetUserEnglish(
  app,
  token,
  channel,
  user,
  greeting,
  botUserID
) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${greeting} <@${user}>! :smiley: I am DecBot and I want to make life easier for you.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `❓ If you want to find out more about my skills, just type in  "<@${botUserID}> help". :nerd_face: `
        }
      }
    ]
  });
  return result;
}

async function greetUserGerman(app, token, channel, user, greeting, botUserID) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${greeting} <@${user}>! :smiley: mein Name ist DecBot und ich will dir dein Leben erleichtern.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `❓ Wenn du mehr darüber erfahren willst, was ich alles kann, dann gebe einfach "<@${botUserID}> Hilfe" ein. :nerd_face: `
        }
      }
    ]
  });
  return result;
}

async function helpMessageEnglish(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there 👋 I'm DecBot. I'm here to help you to keep track on all of your _decision knowledge_.\nIn order to achieve this, I provide two main *features*:`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*1️⃣ Export* _decision knowledge_ from *Slack* to *Jira*. \n 👀Click on the button, if you want to know more about this awesome feature. `
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Show me more"
          },
          action_id: "export_help_click_english"
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*2️⃣ Import* _decision knowledge_ from *Jira* to *Slack*. \n 👀Click on the button and I will tell you more. :nerd_face:`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Show me more"
          },
          action_id: "import_help_click_english"
        }
      },
      {
        type: "divider"
      }
    ]
  });
  return result;
}

async function helpMessageGerman(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hallo 👋 Ich bin DecBot. Ich bin hier, um dir dabei zu helfen den Überblick über dein _Entscheidungswissen_ zu behalten. \nUm das zu erreichen, biete ich dir zwei tolle *Features* an:`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*1️⃣ Exportiere* _Entscheidungswissen_ aus *Slack* nach *Jira*. \n 👀Klicke auf den Button, wenn du mehr über dieses tolle Feature erfahren willst. `
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Zeig mir mehr"
          },
          action_id: "export_help_click_german"
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*2️⃣ Importiere* _Entscheidungswissen_ aus *Jira* nach *Slack*. \n 👀Klicke auf den Button und ich erzähle dir mehr darüber. :nerd_face:`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Zeig mir mehr"
          },
          action_id: "import_help_click_german"
        }
      },
      {
        type: "divider"
      }
    ]
  });
  return result;
}

async function botMentionGeneralMessage(app, token, channel, user, botUserID) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hello <@${user}>. I am DecBot and I can do great things that will improve your workflow.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `If you want to find out more about my skills, just type in  "<@${botUserID}> help". :nerd_face:`
        }
      }
    ]
  });
  return result;
}

async function exportHelpMessageEnglish(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `To *export* your _decision knowledge_ from *Slack* to your *Jira* project you need to perform the following actions:`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*1️⃣* When you are writing a Message in Slack that contains _decision knowlege_ use these _tags_ for certain types: `
        }
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: "*Issue*: :issue:"
          },
          {
            type: "mrkdwn",
            text: "*Decision*: :decision:"
          },
          {
            type: "mrkdwn",
            text: "*Alternative*: :alternative:"
          },
          {
            type: "mrkdwn",
            text: "*Pro-Argument*: :pro:"
          },
          {
            type: "mrkdwn",
            text: "*Con-Argument*: :con:"
          }
        ]
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*2️⃣* Choose the _documentation location_ (Jira-Issue or Jira-Issue-Comment) from the select menu that I will provide for you.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*3️⃣* Click on the *'Export to Jira'* button. A dialog wil open. \n Revise all data of your _decision knowledge_ and change them where necessary. \ Then submit the dialog and your _decision knowlege_ will be exported to *Jira* :tada:.`
        }
      },
      {
        type: "divider"
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: `*:exclamation:* Always use the emojis (:issue:,:decision:,:alternative:,:pro:,:con:) *behind* the text that you want to mark as _decision knowledge_ in your message \n You can also mark multiple Decision Knowledge-Elements in one Message and Export them all at the same time :wink:.`
          }
        ]
      }
    ]
  });
  return result;
}

async function importHelpMessageEnglish(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `This feature will come soon! :wrench:`
        }
      }
    ]
  });
  return result;
}

async function importHelpMessageGerman(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Dieses Feature kommt bald! :wrench:`
        }
      }
    ]
  });
  return result;
}

async function exportHelpMessageGerman(app, token, channel, user) {
  const result = await app.client.chat.postEphemeral({
    token: token,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Um dein _Entscheidungswissen_ aus *Slack* in dein *Jira* Projekt zu *exportieren* musst du folgende Schritte ausführen:`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*1️⃣* Wenn du eine Nachricht in Slack verfasst, markiere darin enthaltenes _Enscheidungswissen_ mit folgenden _tags_ für bestimmte Typen: `
        }
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: "*Entscheidungsproblem*: :issue:"
          },
          {
            type: "mrkdwn",
            text: "*Entscheidung*: :decision:"
          },
          {
            type: "mrkdwn",
            text: "*Alternative*: :alternative:"
          },
          {
            type: "mrkdwn",
            text: "*Pro-Argument*: :pro:"
          },
          {
            type: "mrkdwn",
            text: "*Con-Argument*: :con:"
          }
        ]
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*2️⃣* Wähle den _Dokumentations Ort_ (Jira-Issue or Jira-Issue-Kommentar) aus Auswahl-Menu, welches ich dir bereitstelle.`
        }
      },
      {
        type: "section",

        text: {
          type: "mrkdwn",
          text: `*3️⃣* Klicke auf den *'Export to Jira'* Button. Ein Dialog wird sich öffnen. \n Überprüfe die Daten auf Richtigkeit und ändere sie gegebenfalls. \n Dann schicke den Dialog ab und dein _Entscheidungswissen_ wird nach *Jira* exportiert :tada:.`
        }
      },
      {
        type: "divider"
      },
      {
        type: "context",

        elements: [
          {
            type: "mrkdwn",
            text: `*:exclamation:* Verwende die emojis (:issue:,:decision:,:alternative:,:pro:,:con:) *immer nach*  dem Text den du als _Entscheidungswissen_ in deiner Nachricht markieren möchtest. \n Pro-Tip: Du kannst auch beliebig viele Enscheidungswissen-Elemente in einer Nachricht markieren und gleichzeitig exportieren :wink:.`
          }
        ]
      }
    ]
  });
  return result;
}

async function sendErrorToUser(app, context, channel, user, knowledgeElement) {
  const result = await app.client.chat.postEphemeral({
    token: context.botToken,
    channel: channel,
    user: user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user}> Dein Entscheidungswissen (:${knowledgeElement.elementType}: ${knowledgeElement.elementText}) konnte leider nicht nach Jira exportiert werden. :disappointed: \n Überprüfe deine Angaben und die Erreichbarkeit des Jira-Servers. \n Versuche es später nochmal oder frage den Admin.`
        }
      }
    ]
  });
  return result;
}


async function sendChangedDesicionKnowledgeToChannel(  app, user, botToken, channel, knowledgetype, summary, jiraIssueURL){

  const result = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    user: user,
    blocks:[
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Dieses _Enscheidungswissen_  wurde im Jira aktualisiert: \n
				• *Typ* :${knowledgetype}: (${knowledgetype}) \n
				• *Titel* : "${summary}" \n`
        }
      },
      {
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Get to Jira"
					},
					"url": "${jiraIssueURL}"
				 }
			  ]
		}
    ]
}

module.exports.askForJiraExportSingleElement = askForJiraExportSingleElement;
module.exports.updateSingleItemMessage = updateSingleItemMessage;
module.exports.askForJiraExportMultElements = askForJiraExportMultElements;
module.exports.updateMultItemMessage = updateMultItemMessage;
module.exports.tellUserAboutSuccesfullUploadtoJira = tellUserAboutSuccesfullUploadtoJira;
module.exports.descriptionMissing = descriptionMissing;
module.exports.memberJoinChannelMessage = memberJoinChannelMessage;
module.exports.greetUserEnglish = greetUserEnglish;
module.exports.greetUserGerman = greetUserGerman;
module.exports.sendErrorToUser = sendErrorToUser;
module.exports.helpMessageEnglish = helpMessageEnglish;
module.exports.helpMessageGerman = helpMessageGerman;
module.exports.exportHelpMessageEnglish = exportHelpMessageEnglish;
module.exports.exportHelpMessageGerman = exportHelpMessageGerman;
module.exports.importHelpMessageEnglish = importHelpMessageEnglish;
module.exports.importHelpMessageGerman = importHelpMessageGerman;
module.exports.botMentionGeneralMessage = botMentionGeneralMessage;
module.exports.sendChangedDesicionKnowledgeToChannel = sendChangedDesicionKnowledgeToChannel;
