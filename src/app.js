"use strict";


//load enviroment variables
const dotenv = require("dotenv")

dotenv.config({ path: `${__dirname}/.env`});


const jira_rest_handler = require("./jira-rest-handler");

const reaction_event_listener = require("./reaction-eventlistener");

const message_listener = require("./message-listener");

const post_bot_messages = require("./post-bot-messages");

const create_dialog = require("./createDialog");

const { App, subtype } = require("@slack/bolt");

let knowledgeElements = [];
let allElements = [];
let elementsFromMultMessage = [];
let currentElement = {};
let description = "";
let elementsWithIssueLoc = [];
let elementsWithCommentLoc = [];
let elementsUpdateMessage = [];

const pattAppMentionGreetingGerman = /^(hallo|servus|grüß gott|grüezi|moin|guten tag|guten morgen|guten abend|tach|na)(?:$|\s+.*)/i;
const pattAppMentionGreetingEnglish = /^(hi|hey|hello|good evening|good morning|good afternoon|what's up|sup|whazzup|what's going on|yo|howdy|hiya)(?:$|\s+.*)/i;
const pattMessageWithDecisionKnowledge = /.*:(decision|issue|pro|con|alternative):.*/;
let projectKey = process.env.PROJECT_KEY;
let jiraServerURL = process.env.JIRA_SERVER;
const botUserToken = process.env.SLACK_BOT_TOKEN;
let jiraIssueURL;
let messageTS;

//Initialisiert die app mit bot token und signing secret
const app = new App({
  token: botUserToken,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Startet die App
  await app.start(process.env.PORT);
  console.log(`⚡️ Slack-Jira app is running on port: ${process.env.PORT}`);
})();

//can be used to delete old messages in a channel
async function getChannelHistory(userToken, botToken, channel, count) {
  let history = await app.client.channels.history({
    token: userToken,
    channel: channel,
    count: count
  });

  //await app.client.chat.delete({token: botToken, channel: channel, ts: history.messages[17].ts});
}

//getChannelHistory(slackUserToken, botUserToken, testingAppChannelID, 30);

//Bot tritt channel bei, wenn ein neuer Channel in dem Workspace erstellt wurde.
app.event("channel_created", async ({event, context}) => {
  const result = await app.client.channels.invite({
    token: process.env.SLACK_USER_TOKEN, 
    channel: event.channel.id,
    user: context.botUserId
  });
  return result;
});

//Bot begrüßt ein neues Mitglied, wenn es dem Channel beitritt.
app.event("member_joined_channel", async ({ event, context }) => {
  const result = await post_bot_messages.memberJoinChannelMessage(
    app,
    context.botToken,
    event.user,
    event.channel,
    context.botUserId
  );
  return result;
});

//listener für nachrichten in denen der Bot erwähnt wird
app.event("app_mention", async ({ event, context }) => {
  let botUserID = context.botUserId;

  let messageText = event.text.substring(12).trim();
  console.log(`messageText: ${messageText}`);
  let greeting = "";
  if (pattAppMentionGreetingEnglish.test(messageText)) {
    if (
      messageText.match(pattAppMentionGreetingEnglish)[0] ===
      messageText.match(pattAppMentionGreetingEnglish)[1]
    ) {
      greeting = messageText;
    } else {
      greeting = messageText.match(pattAppMentionGreetingEnglish)[1];
    }

    console.log(`messageText: ${messageText}`);
    console.log(
      `match of messageText: ${messageText.match(
        pattAppMentionGreetingEnglish
      )}`
    );

    console.log(`matched greeting: ${greeting}`);
    console.log(
      `match 1.index: ${messageText.match(pattAppMentionGreetingEnglish)[0]}`
    );
    console.log(
      `match 2.index: ${messageText.match(pattAppMentionGreetingEnglish)[1]}`
    );
    const result = await post_bot_messages.greetUserEnglish(
      app,
      context.botToken,
      event.channel,
      event.user,
      greeting,
      botUserID
    );
    console.log(result);

    return result;
  } else if (pattAppMentionGreetingGerman.test(messageText)) {
    if (
      messageText.match(pattAppMentionGreetingGerman)[0] ===
      messageText.match(pattAppMentionGreetingGerman)[1]
    ) {
      greeting = messageText;
    } else {
      greeting = messageText.match(pattAppMentionGreetingGerman)[1];
    }
    console.log(`matched greeting: ${greeting}`);
    const result = await post_bot_messages.greetUserGerman(
      app,
      context.botToken,
      event.channel,
      event.user,
      greeting,
      botUserID
    );
    return result;
  } else if (/^(help|get help).*/i.test(messageText)) {
    const result = await post_bot_messages.helpMessageEnglish(
      app,
      context.botToken,
      event.channel,
      event.user
    );
    return result;
  } else if (/^(hilfe).*/i.test(messageText)) {
    const result = await post_bot_messages.helpMessageGerman(
      app,
      context.botToken,
      event.channel,
      event.user
    );
    return result;
  } else {
    const result = await post_bot_messages.botMentionGeneralMessage(
      app,
      context.botToken,
      event.channel,
      event.user,
      botUserID
    );
    return result;
  }
});

app.action("export_help_click_english", async ({ body, ack, context }) => {
  ack();
  await post_bot_messages.exportHelpMessageEnglish(
    app,
    context.botToken,
    body.channel.id,
    body.user.id
  );
});

app.action("export_help_click_german", async ({ body, ack, context }) => {
  ack();
  await post_bot_messages.exportHelpMessageGerman(
    app,
    context.botToken,
    body.channel.id,
    body.user.id
  );
});

app.action("import_help_click_english", async ({ body, ack, context }) => {
  ack();
  await post_bot_messages.importHelpMessageEnglish(
    app,
    context.botToken,
    body.channel.id,
    body.user.id
  );
});

app.action("import_help_click_german", async ({ body, ack, context }) => {
  ack();
  await post_bot_messages.importHelpMessageGerman(
    app,
    context.botToken,
    body.channel.id,
    body.user.id
  );
});

//handler für Nachrichten in denen Entscheidungswissen gefunden wurde
async function decisionKnowledgeMessageHandler(
  text,
  match,
  botToken,
  user,
  channel
) {
  knowledgeElements = await message_listener.messageWithDecisionKnowledge(
    text,
    match,
    botToken,
    app,
    channel,
    user
  );
  allElements.push(...knowledgeElements);
  if (knowledgeElements.length > 0) {
    if (knowledgeElements[0].elementMessageType === 2) {
      elementsFromMultMessage.push(knowledgeElements);
    }
  }
  console.log(`Mult-Message-Elemente: ${elementsFromMultMessage.length}`);
  console.log("Alle Elemente aktualisiert:");
  allElements.forEach(element => {
    console.log(element);
  });
}

//listener für Nachrichten in denen ein oder meherere "Entscheidungswissen-Emoji" vorkommen.
app.message(pattMessageWithDecisionKnowledge, async ({ message, context }) => {
  decisionKnowledgeMessageHandler(
    context.matches[0],
    context.matches[1],
    context.botToken,
    message.user,
    message.channel
  );
});

//listenener für Nachrichten, die bearbeitet wurden und ein "Entscheidungswissen-Emoji" hinzugefügt wurde
app.message(subtype("message_changed"), ({ message, context }) => {
  if (pattMessageWithDecisionKnowledge.test(message.message.text)) {
    let regexResult = message.message.text.match(
      pattMessageWithDecisionKnowledge
    );
    decisionKnowledgeMessageHandler(
      regexResult[0],
      regexResult[1],
      context.botToken,
      message.message.user
    );
  }
});

//listener für das Hinzufügen einer Reaktion mit einem "Entscheidungswissen-Emoji"
app.event("reaction_added", async ({ event, context }) => {
  knowledgeElements = await reaction_event_listener.decisionKnowledgeReactionAdded(
    event,
    context,
    event.item.channel,
    app
  );
  allElements.push(...knowledgeElements);
  console.log("Alle Elemente aktualisiert:");
  allElements.forEach(element => {
    console.log(element);
  });
});

// Listener für das select menu der Documentation Location.
app.action("doc_loc_choice", async ({ ack, action, body }) => {
  ack();
  allElements.forEach(element => {
    if (element.docLocID === body.actions[0].block_id) {
      element.docLoc = action.selected_option.value;
      console.log(element);
    }
  });
});

// listens for the user to click on the "Export to Jira"-Button and opens a dialog
app.action("single_export_click", async ({ body, ack, context }) => {
  ack();
  console.log(`Button Block-ID: ${body.actions[0].block_id}`);
  console.log("Alle Elemente:");
  allElements.forEach(element => {
    console.log(element);
  });
  allElements.forEach(element => {
    if (element.elementID === body.actions[0].block_id) {
      currentElement = element;
      console.log(element);
    }
  });
  await create_dialog.openSingleItemDialog(
    app,
    body.user.name,
    body.trigger_id,
    context.botToken,
    currentElement.elementText,
    currentElement.elementType,
    currentElement.docLoc,
    projectKey,
    jiraServerURL
  );
});

// listens for the single-item dialog submission and gets triggered when a user submits the dialog
app.action(
  { callback_id: "exportdialog-46e2b0" },
  async ({ ack, action, context, body }) => {
    try {
      ack();
      let keyOfExistingJiraIssue = 0;
      if (typeof action.submission.issue_key !== "undefined")
        keyOfExistingJiraIssue = action.submission.issue_key.trim();
      projectKey = action.submission.project_key.trim();
      currentElement.elementText = action.submission.elementText;
      currentElement.elementType = action.submission.elementType;
      description = action.submission.description;
      jiraServerURL = action.submission.jira_server.trim();

      let jiraIssueData = await jira_rest_handler.sendCreateIssueRequest(
        projectKey,
        currentElement.elementText,
        currentElement.elementType,
        description,
        currentElement.docLoc,
        process.env.JIRA_USERNAME,
        process.env.JIRA_PASSWORD,
        jiraServerURL,
        keyOfExistingJiraIssue
      );
      jiraIssueURL = jiraIssueData.url;
      console.log(`Returned URL: ${jiraIssueURL}`);

      if (typeof jiraIssueURL !== "undefined") {
        if (currentElement.elementMessageType === 1) {
          allElements.forEach((element, index) => {
            if (element.elementID === currentElement.elementID) {
              allElements.splice(index, 1);
            }
          });
          await post_bot_messages.updateSingleItemMessage(
            app,
            body.user.name,
            context,
            body.channel.id,
            currentElement.elementType,
            currentElement.elementText,
            jiraIssueURL,
            currentElement.elementTS
          );
        } else {
          await post_bot_messages.tellUserAboutSuccesfullUploadtoJira(
            app,
            body.user.name,
            action.user,
            context.botToken,
            body.channel.id,
            currentElement.elementType,
            currentElement.elementText,
            jiraIssueURL
          );
          let elementsUpdateMessage = [];
          elementsFromMultMessage.forEach((element, index) => {
            if (element[0].elementTS === currentElement.elementTS) {
              elementsUpdateMessage.push(...element);
              elementsFromMultMessage.splice(index, 1);
            }
          });
          elementsUpdateMessage.forEach((element, index) => {
            if (element.elementID === currentElement.elementID) {
              elementsUpdateMessage.splice(index, 1);
            }
          });
          if (elementsUpdateMessage.length > 0) {
            let result = await post_bot_messages.updateMultItemMessage(
              app,
              body.user.id,
              context,
              body.channel.id,
              currentElement.elementTS,
              elementsUpdateMessage
            );
            elementsUpdateMessage = message_listener.addIDsToKnowledgeElements(
              result,
              elementsUpdateMessage
            );
            elementsFromMultMessage.push(elementsUpdateMessage);
            allElements.forEach((element, index) => {
              if (element.elementTS === currentElement.elementTS) {
                allElements.splice(index, 1);
              }
            });
            allElements.push(...elementsUpdateMessage);
          } else {
            app.client.chat.delete({
              token: context.botToken,
              channel: body.channel.id,
              ts: currentElement.elementTS
            });
          }
        }
      } else {
        throw new UploadToJiraFailedException(
          "URL is undefined",
          currentElement
        );
      }
    } catch (error) {
      console.error(error);
      await post_bot_messages.sendErrorToUser(
        app,
        context,
        body.channel.id,
        body.user.id,
        error.knowledgeElement
      );
      console.log(error.name + ":" + error.message);
    }
  }
);

// listens for the user to click on the "Export all"-Button and opens a dialog
app.action("export-all-click", async ({ body, ack, context }) => {
  ack();
  let knowledgeElementsForDialog = [];
  elementsFromMultMessage.forEach(element => {
    if (element[0].elementTS === body.message.ts) {
      knowledgeElementsForDialog.push(...element);
    }
  });
  elementsWithIssueLoc = knowledgeElementsForDialog.filter(
    element => element.docLoc === "i"
  );
  elementsWithCommentLoc = knowledgeElementsForDialog.filter(
    element => element.docLoc === "s"
  );
  await create_dialog.openMultItemDialog(
    app,
    body.user.name,
    body.trigger_id,
    context.botToken,
    elementsWithIssueLoc,
    elementsWithCommentLoc,
    projectKey,
    jiraServerURL
  );
});

// listens for the mult-item dialog submission and gets triggered when a user submits the dialog
app.action(
  { callback_id: "exportdialog-73f4x0" },
  async ({ ack, action, context, body }) => {
    try {
      ack();
      let keyOfExistingJiraIssue = 0;
      let userName = body.user.name;
      elementsUpdateMessage = elementsWithIssueLoc.concat(
        elementsWithCommentLoc
      );
      let numOfMultMessageElements =
        elementsWithIssueLoc.length + elementsWithCommentLoc.length;
      let numOfElementsWithIssueLoc = elementsWithIssueLoc.length;
      projectKey = action.submission.project_key.trim();
      console.log(`Erhaltener Project-Key: ${projectKey}`);
      jiraServerURL = action.submission.jira_server.trim();
      console.log(`Erhaltener Server-URL: ${jiraServerURL}`);
      if (numOfElementsWithIssueLoc > 0) {
        await sendIssueRequests(
          userName,
          body.user.id,
          elementsWithIssueLoc,
          projectKey,
          keyOfExistingJiraIssue,
          action,
          context,
          body.channel.id
        );

        if (elementsWithCommentLoc.length > 0) {
          await sendCommentRequests(
            userName,
            body.user.id,
            elementsWithCommentLoc,
            elementsWithIssueLoc,
            projectKey,
            keyOfExistingJiraIssue,
            action,
            context,
            body.channel.id
          );
        }
        if (numOfElementsWithIssueLoc > 1) {
          elementsWithIssueLoc.forEach((element, index) => {
            if (index + 1 !== numOfElementsWithIssueLoc) {
              jira_rest_handler.linkIssueRequest(
                projectKey,
                elementsWithIssueLoc[index + 1].elementType,
                element.jiraID,
                "i",
                elementsWithIssueLoc[index + 1].jiraID,
                "i",
                process.env.JIRA_USERNAME,
                process.env.JIRA_PASSWORD,
                jiraServerURL
              );
            }
          });
        }
      } else {
        for (const commentElement of elementsWithCommentLoc) {
          try {
            messageTS = commentElement.elementTS;
            description = `${commentElement.elementText} \n \n Dieses Entscheidungswissen wurde exportiert aus [Slack] von ${userName}.`;
            keyOfExistingJiraIssue = action.submission[
              commentElement.elementID
            ].trim();
            console.log(`Erhaltener Issue-Key: ${keyOfExistingJiraIssue}`);

            let jiraIssueData = await jira_rest_handler.sendCreateIssueRequest(
              projectKey,
              commentElement.elementText,
              commentElement.elementType,
              description,
              commentElement.docLoc,
              process.env.JIRA_USERNAME,
              process.env.JIRA_PASSWORD,
              jiraServerURL,
              keyOfExistingJiraIssue              
            );
            jiraIssueURL = jiraIssueData.url;
            console.log(`Returned URL Comment: ${jiraIssueURL}`);
            if (typeof jiraIssueURL !== "undefined") {
              allElements.forEach((knowledgeElement, index) => {
                if (knowledgeElement.elementID === commentElement.elementID) {
                  allElements.splice(index, 1);
                }
              });
              elementsUpdateMessage.forEach((updateElement, index) => {
                if (updateElement.elementID === commentElement.elementID) {
                  elementsUpdateMessage.splice(index, 1);
                }
              });
              await post_bot_messages.tellUserAboutSuccesfullUploadtoJira(
                app,
                body.user.name,
                action.user,
                context.botToken,
                body.channel.id,
                commentElement.elementType,
                commentElement.elementText,
                jiraIssueURL
              );
              elementsFromMultMessage.forEach((knowledgeElement, index1) => {
                if (
                  knowledgeElement[0].elementTS === commentElement.elementTS
                ) {
                  knowledgeElement.forEach((elementFromMessage, index2) => {
                    if (
                      commentElement.elementID === elementFromMessage.elementID
                    ) {
                      knowledgeElement.splice(index2, 1);
                    }
                  });
                }
                if (knowledgeElement.length === 0) {
                  elementsFromMultMessage.splice(index1, 1);
                }
              });
            } else {
              throw new UploadToJiraFailedException(
                "URL is undefined",
                commentElement
              );
            }
          } catch (error) {
            console.error(error);
            await post_bot_messages.sendErrorToUser(
              app,
              context,
              body.channel.id,
              body.user.id,
              error.knowledgeElement
            );
            console.log(error.name + ":" + error.message);
          }
        }
      }

      if (
        elementsUpdateMessage.length > 0 &&
        elementsUpdateMessage.length < numOfMultMessageElements
      ) {
        let result = post_bot_messages.updateMultItemMessage(
          app,
          body.user.id,
          context,
          body.channel.id,
          messageTS,
          elementsUpdateMessage
        );
        elementsUpdateMessage = message_listener.addIDsToKnowledgeElements(
          result,
          elementsUpdateMessage
        );
        elementsFromMultMessage.push(elementsUpdateMessage);
        allElements.push(...elementsUpdateMessage);
      } else if (elementsUpdateMessage.length === 0) {
        app.client.chat.delete({
          token: context.botToken,
          channel: body.channel.id,
          ts: messageTS
        });
      }
    } catch (error) {
      console.error(error);
      await post_bot_messages.sendErrorToUser(
        app,
        context,
        body.channel.id,
        body.user.id,
        error.knowledgeElement
      );
      console.log(error.name + ":" + error.message);
    }
  }
);

async function sendIssueRequests(
  userName,
  userID,
  elementList,
  projectKey,
  issueKey,
  action,
  context, 
  channel
) {
  for (const element of elementList) {
    try {
      messageTS = element.elementTS;
      description = `${element.elementText} \n \n Dieses Entscheidungswissen wurde exportiert aus [Slack] von ${userName}.`;
      console.log('Issue-Key vor sendCreateIssueRequest:');
      console.log(issueKey);
      
      let jiraIssueData = await jira_rest_handler.sendCreateIssueRequest(
        projectKey,
        element.elementText,
        element.elementType,
        description,
        element.docLoc,
        process.env.JIRA_USERNAME,
        process.env.JIRA_PASSWORD,
        jiraServerURL,
        issueKey
      );

      jiraIssueURL = jiraIssueData.url;
      element.jiraID = jiraIssueData.issueID;
      console.log(`JIRA-ID: ${element.jiraID}`);
      console.log(`Returned URL Issue: ${jiraIssueURL}`);
      if (typeof jiraIssueURL !== "undefined") {
        element.issueKey = `${jiraIssueURL}`.split("/").pop();
        console.log(`Element Issue-Key: ${element.issueKey}`);
        allElements.forEach((knowledgeElement, index) => {
          if (knowledgeElement.elementID === element.elementID) {
            allElements.splice(index, 1);
          }
        });
        elementsUpdateMessage.forEach((updateElement, index) => {
          if (updateElement.elementID === element.elementID) {
            elementsUpdateMessage.splice(index, 1);
          }
        });
        await post_bot_messages.tellUserAboutSuccesfullUploadtoJira(
          app,
          userName,
          action.user,
          context.botToken,
          channel,
          element.elementType,
          element.elementText,
          jiraIssueURL
        );
        console.log(`Anzahl Mult-Elemente: ${elementsFromMultMessage.length}`);

        elementsFromMultMessage.forEach((knowledgeElement, index1) => {
          if (knowledgeElement[0].elementTS === element.elementTS) {
            knowledgeElement.forEach((elementFromMessage, index2) => {
              if (element.elementID === elementFromMessage.elementID) {
                knowledgeElement.splice(index2, 1);
              }
            });
          }
          if (knowledgeElement.length === 0) {
            elementsFromMultMessage.splice(index1, 1);
          }
        });
      } else {
        throw new UploadToJiraFailedException("URL is undefined", element);
      }
    } catch (error) {
      console.error(error);
      await post_bot_messages.sendErrorToUser(
        app,
        context,
        channel,
        userID,
        error.knowledgeElement
      );
      console.log(error.name + ":" + error.message);
    }
  }
}

//todo
async function sendCommentRequests(
  userName,
  userID,
  elementsWithCommentLoc,
  elementsWithIssueLoc,
  projectKey,
  issueKey,
  action,
  context, 
  channel
) {
  for (const commentElement of elementsWithCommentLoc) {
    for (const issueElement of elementsWithIssueLoc) {
      try {
        if (
          action.submission[commentElement.elementID] === issueElement.elementID
        ) {
          description = `${commentElement.elementText} \n \n Dieses Entscheidungswissen wurde exportiert aus [Slack] von ${userName}.`;
          issueKey = issueElement.issueKey;

          let jiraIssueData = await jira_rest_handler.sendCreateIssueRequest(
            projectKey,
            commentElement.elementText,
            commentElement.elementType,
            description,
            commentElement.docLoc,
            process.env.JIRA_USERNAME,
            process.env.JIRA_PASSWORD,
            jiraServerURL,
            issueKey
          );
          jiraIssueURL = jiraIssueData.url;
          console.log(`Returned URL Comment: ${jiraIssueURL}`);
          if (typeof jiraIssueURL !== "undefined") {
            allElements.forEach((knowledgeElement, index) => {
              if (knowledgeElement.elementID === commentElement.elementID) {
                allElements.splice(index, 1);
              }
            });
            elementsUpdateMessage.forEach((updateElement, index) => {
              if (updateElement.elementID === commentElement.elementID) {
                elementsUpdateMessage.splice(index, 1);
              }
            });

            await post_bot_messages.tellUserAboutSuccesfullUploadtoJira(
              app,
              userName,
              action.user,
              context.botToken,
              channel,
              commentElement.elementType,
              commentElement.elementText,
              jiraIssueURL
            );
            elementsFromMultMessage.forEach((knowledgeElement, index1) => {
              if (knowledgeElement[0].elementTS === commentElement.elementTS) {
                knowledgeElement.forEach((elementFromMessage, index2) => {
                  if (
                    commentElement.elementID === elementFromMessage.elementID
                  ) {
                    knowledgeElement.splice(index2, 1);
                  }
                });
              }
              if (knowledgeElement.length === 0) {
                elementsFromMultMessage.splice(index1, 1);
              }
            });
          } else {
            throw new UploadToJiraFailedException(
              "URL is undefined",
              commentElement
            );
          }
        }
      } catch (error) {
        console.error(error);
        await post_bot_messages.sendErrorToUser(
          app,
          context,
          channel,
          userID,
          error.knowledgeElement
        );
        console.log(error.name + ":" + error.message);
      }
    }
  }
}

function UploadToJiraFailedException(message, knowledgeElement) {
  this.message = message;
  this.knowledgeElement = knowledgeElement;
  this.name = "UploadToJiraFailedException";
}

app.error(error => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
