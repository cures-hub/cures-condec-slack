/*
 This module implements the communication with the ConDec REST API and the JIRA API.
 REST-calls to Jira are created.
 Knowledge elements documented in Jira can be accessed, created, and linked.
 Newly created decision knowledge elements can either be documented as separate Jira issues (documentation location "i") 
 or in the description/a comment of an existing Jira issue (documentation location "s").

 Requires
 * request-promise node module
    
 Is required by
 * app.js
 */
const requestPromise = require("request-promise");

/**
 * Creates a new decision knowledge element in an existing Jira project. The
 * decision knowledge element can either be documented as a separate Jira issue
 * (documentation location "i") or in the description/a comment of an existing
 * Jira issue (documentation location "s").
 * 
 * external references: app.js, buttonEventHandler.js
 */
async function createDecisionKnowledgeElement(projectKey, summary, type, description, documentationLocation, 
		username, password, host, jiraIssueKey) {
  console.log("URL for request: ${host}");
  console.log("Jira issue key for request: ${jiraIssueKey}");
  let options = {
    method: "POST",
    uri: "${host}/rest/knowledge/latest/decisions/createDecisionKnowledgeElement.json",
    body: {
      projectKey: projectKey,
      summary: "${summary} [SLACK]",
      type: type,
      description: description,
      documentationLocation: documentationLocation
    },
    json: true,
    auth: {
      user: username,
      pass: password,
      sendImmediately: true
    }
  };
  if (jiraIssueKey !== 0) {
    options.uri += "?keyOfExistingElement=${jiraIssueKey}";
  }
  await requestPromise(options)
    .then(function(element) {
      console.log("Upload successful! Server responded with:", element);
      return element;
    })
    .catch(function(error) {
      console.error("upload failed:", error);
      return error;
    });
  return null;
}

/**
 * Retrieves an existing decision knowledge element from Jira.
 * 
 * external references: none
 */
async function getDecisionKnowledgeElement(projectKey, id, documentationLocation, username, password, host) {
  let options = {
    method: "GET",
    uri: "${host}/rest/knowledge/latest/decisions/getDecisionKnowledgeElement.json",
    json: true,
    auth: {
      user: username,
      pass: password,
      sendImmediately: true
    },
    qs: {
      id: id,
      projectKey: projectKey,
      documentationLocation: documentationLocation
    }
  };
  await requestPromise(options)
    .then(function(element) {
      console.log("GET-Request successful! Server responded with:", element);
      console.log("URL: ${element.url}");
      return element;
    })
    .catch(function(error) {
      console.error("GET-Request failed:", error);
      return error;
    });
  return null;
}

/**
 * Creates a link between two knowledge elements.
 * 
 * external references: app.js
 */
async function createLink(projectKey, knowledgeTypeOfChild, idOfParent, documentationLocationOfParent, idOfChild, 
		documentationLocationOfChild, username, password, host) {
  let options = {
    method: "POST",
    uri: "${host}/rest/knowledge/latest/decisions/createLink.json",
    json: true,
    auth: {
      user: username,
      pass: password,
      sendImmediately: true
    },
    qs: {
      projectKey: projectKey,
      knowledgeTypeOfChild: knowledgeTypeOfChild,
      idOfParent: idOfParent,
      documentationLocationOfParent: documentationLocationOfParent,
      idOfChild: idOfChild,
      documentationLocationOfChild: documentationLocationOfChild
    }
  };
  await requestPromise(options)
    .then(function(body) {
      console.log("Link-Request successful! Server responded with:", body);
    })
    .catch(function(error) {
      console.error("Link-Request failed:", error)
      return error;
    });

  return;
}

module.exports.createDecisionKnowledgeElement = createDecisionKnowledgeElement;
module.exports.getDecisionKnowledgeElement = getDecisionKnowledgeElement;
module.exports.createLink = createLink;