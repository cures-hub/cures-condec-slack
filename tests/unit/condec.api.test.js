const conDecAPI = require("../../src/jiraRestHandler");
let issueData = {};

test("Test createDecisionKnowledgeElement with empty input", async () => {
	  return conDecAPI.sendCreateIssueRequest().catch(e => expect(e).toMatch("error"));
});