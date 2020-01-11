/*
 * __mock__ jiraRestHandler.js
 * Diese funktionenn sollen die Anworten von Jira immitieren, so dass andere Funktionen
 * getestet werden können ohne tatsächlich anfragen an Jira zu schicken.
 *
*/
//TODO umbenennn
async function sendCreateIssueRequest(projectKey, summary, type, description, documentationLocation, username, password, host, issueKeyofExistingElement) {
  return Promise.resolve({
	  url: "mock.jiraRequest.createIssue",
	  issueID: 999
  });
}

//TODO umbenennn
async function sendGetIssueRequest(projectKey, id, documentationLocation, username, password, host)
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
