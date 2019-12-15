/*
 * Diese funktionenn sollen die Anworten von Jira immitieren, so dass andere Funktionen
 * getestet werden können ohne tatsächlich anfragen an Jira zu schicken.
 *
*/
async function sendCreateIssueRequest(projectKey, summary, type, description, documentationLocation, username, password, host, issueKeyofExistingElement) {
  return Promise.resolve({
	  url: "mock.jiraRequest.createIssue",
	  issueID: 999
  });
}

async function sendGetIssueRequest(projectKey, id, documentationLocation, username, password, host)
{
	return Promise.resolve(
	{
	  jiraIssueURL :  'mock.jiraRequest.getIssue',
      summary : 'mock summary',
      knowledgeType : 'issue'
	});
}

export.sendGetIssueRequest = sendGetIssueRequest;
export.sendCreateIssueRequest = sendCreateIssueRequest;