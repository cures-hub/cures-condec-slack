const post_bot_messages = require("./post-bot-messages");

const http_requests = require("./jira-rest-handler");

async function singleExportClick(
  body,
  ack,
  context,
  respond,
  summary,
  knowledgetype,
  jiraIssueURL,
  app,
  channel
) {
  try {
    // Acknowledge the action
    ack();

    jiraIssueURL = await http_requests.sendCreateIssueRequest(
      "TES",
      `"${summary}"`,
      `${knowledgetype}`,
      `"${summary}"`,
      "i",
      username,
      password
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
    respond({
      response_type: "replace_original",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey <@${
              body.user.name
            }>, dein Entscheidungswissen: ":${knowledgetype}: ${summary}" wurde erfolgreich nach *Jira* exportiert. :simple_smile:`
          }
        },
        {
          type: "section",
          block_id: "section567",
          text: {
            type: "mrkdwn",
            text: `Hier der Jira-Link dazu: <${jiraIssueURL}> `
          }
        }
      ]
    });
  }
  else {
    const result = await post_bot_messages.sendErrorToUser(
        app,
        context,
        channel,
        body.user.id
      );
      console.log(result);
  }
}

module.exports.singleExportClick = singleExportClick;
