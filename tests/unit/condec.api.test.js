const conDecAPI = require("../../src/condec.api");

test("Test createDecisionKnowledgeElement with empty input", async () => {
	  return conDecAPI.createDecisionKnowledgeElement().catch(e => expect(e).toMatch("error"));
});

test("Test getDecisionKnowledgeElement with empty input", async () => {
	  return conDecAPI.getDecisionKnowledgeElement().catch(e => expect(e).toMatch("error"));
});

test("Test createLink with empty input", async () => {
	  return conDecAPI.createLink().catch(e => expect(e).toMatch("error"));
});