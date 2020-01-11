const post_bot_messages = require("./postBotMessages");

const patt1 = /(?!:(?:decision|issue|pro|con|alternative):|\s)[^\s:]+(?: [^\s:]+)*\s*:(?:decision|issue|pro|con|alternative):/g;
const patt2 = /.*:(decision|issue|pro|con|alternative):/;
const patt3 = /:(decision|issue|pro|con|alternative):/g;

async function messageWithDecisionKnowledge(
  text,
  match,
  botToken,
  app,
  channel,
  user
) {
  // puts all Knowledge-Types that were found in the message in an array.
  let messageText = text;
  let elementsInMessage = messageText.match(patt1);
  console.log(elementsInMessage);
  if (elementsInMessage === null) elementsInMessage = [];

  console.log(`Anzahl der gefundenen Elemente: ${elementsInMessage.length}`);

  console.log(text);
  console.log(match);
  let knowledgetype = match;
  let docLoc = "s";
  if (knowledgetype === "issue" || knowledgetype === "decision") docLoc = "i";

  console.log(knowledgetype);
  let knowledgeElements = [];
  if (elementsInMessage.length === 1) {
    let summary = messageText.match(patt2)[0].replace(patt3, "");

    const result = await post_bot_messages.askForJiraExportSingleElement(
      app,
      botToken,
      channel,
      user,
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

    return knowledgeElements;
  } else if (elementsInMessage.length > 1) {
    elementsInMessage.forEach(element => {
      let knowledgeElement = {
        elementText: element.replace(patt3, ""),
        elementType: element.match(patt3)[0].replace(/:/g, ""),
        elementMessageType: 2
      };
      docLoc = "s";
      if (
        knowledgeElement.elementType === "issue" ||
        knowledgeElement.elementType === "decision"
      )
        docLoc = "i";
      knowledgeElement.docLoc = docLoc;
      knowledgeElements.push(knowledgeElement);
    });
    console.log(knowledgeElements);
    const result = await post_bot_messages.askForJiraExportMultElements(
      app,
      botToken,
      channel,
      user,
      knowledgeElements
    );

    knowledgeElements = addIDsToKnowledgeElements(result, knowledgeElements);
    return knowledgeElements;
  } else {
    const result = await post_bot_messages.descriptionMissing(
      app,
      botToken,
      channel,
      user,
      knowledgetype
    );
    console.log(result);
    return knowledgeElements;
  }
}

function addIDsToKnowledgeElements(result, knowledgeElements) {
  let element_ids = [];
  for (i = 4; i <= result.message.blocks.length - 3; i += 3) {
    element_ids.push(result.message.blocks[i].block_id);
  }
  let docLoc_ids = [];
  for (i = 3; i <= result.message.blocks.length - 4; i += 3) {
    docLoc_ids.push(result.message.blocks[i].block_id);
  }
  knowledgeElements.forEach((element, index) => {
    element.elementID = element_ids[index];
    element.docLocID = docLoc_ids[index];
    element.elementTS = result.ts;
  });
  return knowledgeElements;
}

module.exports.addIDsToKnowledgeElements = addIDsToKnowledgeElements;
module.exports.messageWithDecisionKnowledge = messageWithDecisionKnowledge;
