/*
 * __mock__condec.api.js
 * Diese funktionenn sollen die Anworten von Jira immitieren, so dass andere Funktionen
 * getestet werden können ohne tatsächlich anfragen an Jira zu schicken.
 *
*/

async function createDecisionKnowledgeElement(projectKey, summary, type, description, documentationLocation, username, password, host, issueKeyofExistingElement) {
  return Promise.resolve({
	  url: "mock.jiraRequest.createIssue",
	  issueID: 999
  });
}


async function getDecisionKnowledgeElement(projectKey, id, documentationLocation, username, password, host)
{
  if(projectKey == null || id == null || documentationLocation == null || username == null || password == null || host == null){
    return Promise.resolve(new error("DecisionElement request failed. ProjektKey, ID, DocLoc, Username, Password oder host is null."))
  }
	return Promise.resolve(
	{
	  jiraIssueURL :  'mock.jiraRequest.getIssue',
      summary : 'mock summary',
      knowledgeType : 'mock issue'
	});
}

//TODO umbenennn
export.getDecisionKnowledgeElement = getDecisionKnowledgeElement;
export.createDecisionKnowledgeElement = createDecisionKnowledgeElement;
