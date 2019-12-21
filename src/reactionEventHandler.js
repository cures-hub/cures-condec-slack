const post_bot_messages = require("./postBotMessages");
require("dotenv").config();

async function decisionKnowledgeReactionAdded(event, context, channel, app){
    let knowledgeElements = [];
    if (
        (event.reaction === "decision") |
        (event.reaction === "issue") |
        (event.reaction === "pro") |
        (event.reaction === "con") |
        (event.reaction === "alternative")
      ){
        try {
          const channelHistory = await app.client.channels.history({
            token: process.env.SLACK_USER_TOKEN,
            channel: channel,
            count: 1,
            inclusive: true,
            latest: event.item.ts
          });    
                    
          let summary = channelHistory.messages[0].text.replace(
            `:${event.reaction}:`,
            ""
          );
          let knowledgetype = event.reaction;
          let docLoc = "s";          
          if (knowledgetype === "issue" || knowledgetype === "decision") docLoc = "i"; 
          const result = await post_bot_messages.askForJiraExportSingleElement(
            app,
            context.botToken,
            channel,
            event.user,
            summary,
            knowledgetype, 
            docLoc
          );
          let knowledgeElement = {
            elementText: summary,
            elementType: knowledgetype,
            elementID: result.message.blocks[3].block_id,
            docLocID: result.message.blocks[2].block_id, 
            docLoc: docLoc, 
            elementTS: result.ts,
            elementMessageType: 1
          };
          knowledgeElements.push(knowledgeElement);
          console.log(result);
        } catch (error) {
          console.error(error);
        }
      }        
        return knowledgeElements;
}


module.exports.decisionKnowledgeReactionAdded = decisionKnowledgeReactionAdded;