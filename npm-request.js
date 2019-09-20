const request = require("request");

function getIssue(
  projectKey,
  id,
  documentationLocation,
  username,
  password
) {

  let options = {
    host: "https://cures.ifi.uni-heidelberg.de",
    path:
      "/jira/rest/decisions/latest/decisions/getDecisionKnowledgeElement.json",
    method: "GET",
    
    
  };

  request.get(
    {
      uri: options.host + options.path,
      auth: {
        user: username,
        pass: password,
        sendImmediately: true
      },
      qs: {"id": id, "projectKey": projectKey, "documentationLocation": documentationLocation}
    },
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error("request failed:", err);
      }
      console.log("Request successful!  Server responded with:", body);
    }
  );
}

getIssue(
  "TES",  
  "15442",
  "i",
  "rgerner", 
  "25trUVagRT"
);
