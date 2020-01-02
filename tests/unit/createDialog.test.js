const createDialog = require("../../src/createDialog");
console.log(createDialog);

test('knowledgeTypeOptions', () => {
	expect(createDialog.knowledgeTypeOptions.length).toBe(5);
});