/* createDialog.js
 * Dieses Modul umfasst den Exportdialog von Entscheidungswissen nach Jira.
 * Layout und callback_id bei clicken von Buttons im Dialog werden festgelegt.
 */
 
// Mögliche Entscheidungswissenstypen.
const knowledgeTypeOptions = [
  { label: "Issue", value: "issue" },
  { label: "Alternative", value: "alternative" },
  { label: "Pro-Argument", value: "pro" },
  { label: "Con-Argument", value: "con" },
  { label: "Entscheidung", value: "decision" }
];

// Öffnet den Exportdialog wird für ein einzelnes Enscheidungswissenselement.
async function openSingleItemDialog(app, user, button_trigger_id, dialog_token, summary, knowledgetype, documentationLocation, projectKey, jiraServer) {
  let dialog_elements = [];
  if (documentationLocation === "s") {
    dialog_elements.push({
      type: "text",
      label: "Issue-Key",
      name: "issue_key",
      hint: `Gebe den Jira-Issue-Key des zugehörigen Jira Issues ein, zu welchem dein Entscheidungswissen als Kommentar hinzugefügt werden soll.`
    });
  }
  dialog_elements.push(
    {
      type: "text",
      label: "Project-Key",
      name: "project_key",
      max_length: 20,
      min_length: 1,
      hint: `Gebe den Project-Key des Jira-Projects an.`,
      value: projectKey
    },
    {
      type: "text",
      label: "Jira-Server",
      name: "jira_server",
      subtype: "url",
      hint: `Base-URL des Jira-Servers.`,
      value: jiraServer
    },
    {
      type: "select",
      label: "Wissenstyp",
      name: "elementType",
      value: knowledgetype,
      options: knowledgeTypeOptions
    },
    {
      type: "text",
      label: "Zusammenfassung",
      name: "elementText",
      min_length: 1,
      hint: `Gebe eine kurze Zusammenfassung über das Entscheidungswissen an.`,
      value: `${summary}`
    },
    {
      type: "textarea",
      label: "Beschreibung",
      name: "description",
      hint: `Beschreibe das Enscheidungswissen möglichst genau.`,
      value: `${summary} \n \n Dieses Entscheidungswissen wurde exportiert aus [Slack] von ${user}.`
    }
  );
  await app.client.dialog.open({
    token: dialog_token,
    dialog: {
      callback_id: "exportdialog-46e2b0",
      title: "Export nach Jira",
      submit_label: "Okay",
      state: "Limo",
      elements: dialog_elements
    },
    trigger_id: button_trigger_id
  });
}

// Öffnet den Exportdialog wird für mehrere Enscheidungswissenselemente.
async function openMultItemDialog(app, user, button_trigger_id, dialog_token, elementsWithIssueLoc, elementsWithCommentLoc, projectKey, jiraServer) {
  let dialog_elements = [];
  dialog_elements.push(
    {
      type: "text",
      label: "Project-Key",
      name: "project_key",
      max_length: 20,
      min_length: 1,
      hint: `Gebe den Project-Key des Jira-Projects an.`,
      value: projectKey
    },
    {
      type: "text",
      label: "Jira-Server",
      name: "jira_server",
      subtype: "url",
      hint: `Base-URL des Jira-Servers.`,
      value: jiraServer
    }
  );

  if (elementsWithIssueLoc.length > 0) {

    let issueOptions = [];
    elementsWithIssueLoc.forEach(element => {
      let text = element.elementText.substring(0, 50);      
      
      issueOptions.push({
        label: `(${element.elementType}) ${text}...`,
        value: element.elementID
      });
    });
    elementsWithCommentLoc.forEach(element => {
      let text = element.elementText.substring(0, 30);      
        dialog_elements.push({
          type: "select",
          label: "Issue",
          name: element.elementID,
          value: issueOptions[0].value,
          options: issueOptions,
          hint: `Wähle das Jira-Issue zu welchem (${element.elementType}) "${text}..." als Kommentar hinzugefügt werden soll.`
        });      
    });
  } else {
    elementsWithCommentLoc.forEach(element => {
      let text = element.elementText.substring(0, 30);
      dialog_elements.push({
        type: "text",
        label: "Issue-Key",
        name: element.elementID,
        hint: `Gebe den Jira-Issue-Key des zugehörigen Jira Issues ein, zu welchem (${element.elementType}) ${text}... als Kommentar hinzugefügt werden soll.`
      });
    });
  }

  await app.client.dialog.open(
  {
    token: dialog_token,
    dialog: {
      callback_id: "exportdialog-73f4x0",
      title: "Export nach Jira",
      submit_label: "Okay",
      state: user,
      elements: dialog_elements
    },
    trigger_id: button_trigger_id
  });
}

module.exports.openMultItemDialog = openMultItemDialog;
module.exports.openSingleItemDialog = openSingleItemDialog;
