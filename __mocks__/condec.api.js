/*
 * __mock__ jiraRestHandler.js
 * Diese funktionenn sollen die Anworten von Jira immitieren, so dass andere Funktionen
 * getestet werden können ohne tatsächlich anfragen an Jira zu schicken.
 *
*/
async function createDecisionKnowledgeElement(projectKey, summary, type, description, documentationLocation, username, password, host, jiraIssueKey) {
  const prom = new Promise((resolve, reject) => {
  if (projectKey == null || type == null || username == null || password == null || host == null) {
    reject('Create request fail.' );
  }else{
    resolve({
	  url: "mock.jiraRequest.createIssue",
	  issueID: 999
    });
  }
  })
  return prom;
}

async function getDecisionKnowledgeElement(projectKey, id, documentationLocation, username, password, host)
{
  const prom = new Promise((resolve, reject) => {
  if (projectKey == null || id == null || documentationLocation == null|| username == null || password == null || host == null) {
    reject('GET request failed.');
  }else{
	resolve({
	  jiraIssueURL :  'mock.jiraRequest.getIssue',
      summary : 'mock summary',
      knowledgeType : 'issue'
	   });
  }
  })
  return prom;
}

//TODO umbenennn
export.sendGetIssueRequest = sendGetIssueRequest;
export.sendCreateIssueRequest = sendCreateIssueRequest;
