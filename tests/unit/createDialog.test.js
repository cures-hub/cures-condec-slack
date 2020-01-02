const createDialog = require("../../src/createDialog");

test("knowledgeTypeOptions", () => {
	expect(createDialog.knowledgeTypeOptions.length).toBe(5);
});