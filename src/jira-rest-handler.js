const rp = require("request-promise");

async function sendCreateIssueRequest(
  projectKey,
  summary,
  type,
  description,
  documentationLocation,
  username,
  password,
  host,
  issueKeyofExistingElement
) {
  console.log(`URL für Request: ${host}`);
  console.log(`Issue-Key für Request: ${issueKeyofExistingElement}`);
  let options = {
    method: "POST",
    uri: `${host}/rest/decisions/latest/decisions/createDecisionKnowledgeElement.json`,
    body: {
      projectKey: projectKey,
      summary: `${summary} [SLACK]`,
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
  if (issueKeyofExistingElement !== 0) {
    options.uri = `${host}/rest/decisions/latest/decisions/createDecisionKnowledgeElement.json?keyOfExistingElement=${issueKeyofExistingElement}`;
  }
  let issueData = {};
  await rp(options)
    .then(function(body) {
      console.log("Upload successful!  Server responded with:", body);
      issueData.url = body.url;
      issueData.issueID = body.id;
      return issueData;
    })
    .catch(function(err) {
      return console.error("upload failed:", err);
    });
  return issueData;
}

async function sendGetIssueRequest(
  projectKey,
  id,
  documentationLocation,
  username,
  password,
  host
) {
  let jiraIssueData = {};
  let options = {
    method: "GET",
    uri: `${host}/rest/decisions/latest/decisions/getDecisionKnowledgeElement.json`,

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
  await rp(options)
    .then(function(body) {
      console.log("GET-Request successful!  Server responded with:", body);
      console.log(`URL: ${body.url}`);
      jiraIssueData.jiraIssueURL = body.url;
      jiraIssueData.summary = body.summary;
      jiraIssueData.knowledgeType = body.type;
      console.log(`JiraIssueURL: ${jiraIssueData.jiraIssueURL}`);
    })
    .catch(function(err) {
      return console.error("GET-Request failed:", err);
    });

  return jiraIssueData;
}

async function linkIssueRequest(
  projectKey,
  knowledgeTypeOfChild,
  idOfParent,
  documentationLocationOfParent,
  idOfChild,
  documentationLocationOfChild,
  username,
  password,
  host
) {
  let options = {
    method: "POST",
    uri: `${host}/rest/decisions/latest/decisions/createLink.json`,

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
  await rp(options)
    .then(function(body) {
      console.log("Link-Request successful! Server responded with:", body);
    })
    .catch(function(err) {
      return console.error("Link-Request failed:", err);
    });

  return;
}

module.exports.linkIssueRequest = linkIssueRequest;
module.exports.sendCreateIssueRequest = sendCreateIssueRequest;
module.exports.sendGetIssueRequest = sendGetIssueRequest;
