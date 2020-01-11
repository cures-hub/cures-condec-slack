
const fs = require("fs");

let rawUserData = fs.readFileSync("user.json");
let userData = JSON.parse(rawUserData);

// listen to the event when a user mentions this app in a message
app.event("app_mention", async ({ event, context }) => {
    console.log(event.text);
    console.log(context.botUserId);
    console.log(event.user);
    let found = userData.find(element => element.userID === event.user);
    console.log(found);
    
    if (
      event.text === `<@${context.botUserId}> login_Jira` &&
      found !== undefined
    ) {
      try {
        const result = await post_bot_messages.askForJiraLogin(
          app,
          context,
          testingAppChannelID,
          event.user
        );
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
    else {
      try {
        const result = await post_bot_messages.tellUserAboutLogin(
          app,
          context,
          testingAppChannelID,
          event.user
        );
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }
  });

// If the user has already passed his Jira Login, the App will tell him how he/she can update his Login.
function tellUserAboutLogin(app, context, channel, user) {
    const result = app.client.chat.postEphemeral({
      token: context.botToken,
      channel: channel,
      user: user,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${user}>, Du bist bereits in *Jira* eingeloggt. Um deine Login-Daten zu aktualisieren gebe ein: "@DecBot update_Jira".`
          }
        }
      ]
    });
    return result;
  }

  function askForJiraLogin(app, context, channel, user) {
    const result = app.client.chat.postEphemeral({
      token: context.botToken,
      channel: channel,
      user: user,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${user}>, logge dich in *Jira* ein damit du _Entscheidungswissen_ aus *Slack* exportieren kannst.`
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Login to Jira"
            },
            action_id: "login_click"
          }
        }
      ]
    });
    return result;
  }
  