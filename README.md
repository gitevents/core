gitup
=====

A node.js micro service that listens to GitHub web hooks, compiles gh-pages and manages meetup.com

## Technical (Bot) Workflow

1. Listen to GitHub Webhooks for Issues. If there's an issue labeled with the milestone for the next event:
2. Process the webhook information
3. Create or modify a JSON file or BLOB on GitHub that holds the event information with talks
4. Create or modify the event on meetup.com with the talk information. If the second/third talk are submitted, all information should be properly edited.

- The JSON file should be accesible via AJAX, so it can be queried from a GitHub page
- There should not be any database
- It should run on DigitalOcean, Amazon EC2 micro or nodejitsu, as low cost as possible for non-profit organisations and meetup groups.

## User/Admin Workflow

1. Create a Webhook for your repository on Issues and point it to your bot-IP.
2. Create a GitHub Issue in your repo and label it 'talk proposal' (that's what the bot listens to)
3. Assign the Issue to a milestone. A milestone represents an event and can have some meta information (time;place;address right now, separated by ;)
4. Once the issue has a label and a milestone, it can be processed for JSON storage. GitUp needs your GitHub credentials (API key) to create a file in your repo with the talk and event information.
5. External services are triggered (meetup.com etc.) and populated from the JSON

You'll never have to edit mutliple platforms ever again. You can make an AJAX request from your event website to the main JSON file, and meetup and other services will be automatically managed by GitUp bot.
