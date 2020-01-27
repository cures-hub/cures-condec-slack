/*
 * __mock__ jiraRestHandler.js
 * Diese funktionenn sollen die Anworten von Jira immitieren, so dass andere Funktionen
 * getestet werden können ohne tatsächlich anfragen an Jira zu schicken.
 *
*/
//TODO umbenennn
async function createDecisionKnowledgeElement(projectKey, summary, type, description, documentationLocation, username, password, host, jiraIssueKey) {
  if (projectKey == null || type == null || username == null || password == null || host == null) {
    return Promise.resolve();
  }
  return Promise.resolve({
	  url: "mock.jiraRequest.createIssue",
	  issueID: 999
  });
}

async function getDecisionKnowledgeElement(projectKey, id, documentationLocation, username, password, host)
{
	return Promise.resolve(
	{
	  jiraIssueURL :  'mock.jiraRequest.getIssue',
      summary : 'mock summary',
      knowledgeType : 'issue'
	});
}

//TODO umbenennn
export.sendGetIssueRequest = sendGetIssueRequest;
export.sendCreateIssueRequest = sendCreateIssueRequest;
