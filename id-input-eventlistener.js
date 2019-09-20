const post_bot_messages = require("./post-bot-messages");

const http_requests = require("./jira-rest-handler");

async function issueIdInputEvent(
  body,
  ack,
  context,

  summary,
  knowledgetype,
  app,
  channel,
  issueId
) {
  let jiraIssueURL;
  try {
    // Acknowledge the action
    ack();

    jiraIssueURL = await http_requests.sendGetIssueRequest(
      "TES",
      `${issueId}`,
      "i",
      "rgerner",
      "25trUVagRT"
    );
  } catch (error) {
    console.error(error);
    const result = await post_bot_messages.sendErrorToUser(
      app,
      context,
      channel,
      body.user.id
    );
    console.log(result);
  }
  if (jiraIssueURL !== undefined) {
      
    const result = app.client.chat.postEphemeral({
      token: context.botToken,
      channel: channel,
      user: body.user.id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${
              body.user.name
            }>, hier kannst du dein _Entscheidungswissen_: ":${knowledgetype}: ${summary}" als Kommentar zu diesem *Jira-Issue* ${jiraIssueURL} hinzufügen.`
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Export to Jira"
            },
            action_id: "single_export_click"
          }
        }
      ],
      options: [
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*"
          },
          value: "value-0"
        },
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*"
          },
          value: "value-1"
        },
        {
          text: {
            type: "plain_text",
            text: "*this is plain_text text*"
          },
          value: "value-2"
        }
      ]
    });
    return result;
  } else {
    const result = await post_bot_messages.sendErrorToUser(
      app,
      context,
      channel,
      body.user.id
    );
    console.log(result);
  }
}

module.exports.issueIdInputEvent = issueIdInputEvent;
