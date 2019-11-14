# cures-condec-slack

[![Build Status](https://travis-ci.org/cures-hub/cures-condec-slack.svg?branch=master)](https://travis-ci.org/cures-hub/cures-condec-slack)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7f2fd422ae9c4d0e959d014e99f37a19)](https://www.codacy.com/manual/UHD/cures-condec-slack?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=cures-hub/cures-condec-slack&amp;utm_campaign=Badge_Grade)[![Codecoverage](https://codecov.io/gh/cures-hub/cures-condec-slack/branch/master/graph/badge.svg)](https://codecov.io/gh/cures-hub/cures-condec-slack/branch/master)
[![GitHub contributors](https://img.shields.io/github/contributors/cures-hub/cures-condec-slack.svg)](https://github.com/cures-hub/cures-condec-slack/graphs/contributors)

The CURES ConDec Slack plug-in enables the user to export decision knowledge from Slack to [JIRA](https://de.atlassian.com/software/jira).
Decision knowledge covers knowledge about decisions, the problems they address, solution proposals, their context, and justifications (rationale).

## Installation

### Prerequisites
The following prerequisites are necessary to compile and run the plug-in from source code:
- Node.js

### Download of executable JavaScript source code
The executable JavaScript source code files for the latest release can be found here: https://github.com/cures-hub/cures-condec-slack/releases/latest

### Creation of a Slack App

Before you can CURES ConDec Slack, you need to create a new Slack App:
1. go to https://api.slack.com/apps and click on 'Create New App'
2. give it a meaningful name and choose the workspace you want to install the App on
3. on 'Basic Information' you can customize your App with a description and an App icon
4. on 'Interactive Components', use the toggle to turn it on, put in the URL of your http-server followed by /slack/events
5. on 'Bot Users' add a bot-user and give it an expressive name
6. on 'Install App' install the App to your Slack workspace
7. on 'OAuth & Permissions' add these Permission Scopes:
  - 'channels:write'
  - 'chat:write:bot'
  - 'chat:write:user'
  - 'emoji:read'
  - 'bot'
  - 'reactions:read'
8. on 'Event Subscriptions' use the toggle to turn it on and put in the URL of your http-server followed by /slack/events
9. subscribe to these bot-events:
  - 'app_mention'
  - 'channel_created'
  - 'member_joined_channel'
  - 'message.channels'
  - 'reaction_added'


### Configuration of environment variables

Copy the content of the env-Template.txt file, create a new .env file and paste the copied content into it.
You can find the Slack Signing Secret on your 'Basic Information' page and the Bot User Token on the 'OAuth & Permission' page.
Use the port of your http-server.
The Jira server and project key are default values that you can use for the export of decision knowledge from slack to your Jira project.
Put in the Jira username and pw of your Jira account.
When you have added all values to the variables save the .env file.
Next Step is to install all needed dependencies:
```
npm install
```
Then you can run the code via:
```
node app
```

### Configuration of Slack workspace
Before you can use all functionality of CURES ConDec Slack, you need to add these custom emojis to your Slack workspace:
- :issue:
- :decision:
- :alternative:
- :pro:
- :con:
You can use the custom icons from images.
You can add the app to any channel of your Slack workspace via the settings of that channel.
