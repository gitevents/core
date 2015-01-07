gitup
=====

A node.js micro service that listens to GitHub web hooks, compiles gh-pages and manages meetup.com

## Workflow

1. Listen to GitHub Webhooks for Issues. If there's an issue labeled with the milestone for the next event:
2. Process the webhook information
3. Create or modify a JSON file or BLOB on GitHub that holds the event information with talks
4. Create or modify the event on meetup.com with the talk information. If the second/third talk are submitted, all information should be properly edited.

- The JSON file should be accesible via AJAX, so it can be queried from a GitHub page
- There should not be any database
- It should run on DigitalOcean, Amazon EC2 micro or nodejitsu, as low cost as possible for non-profit organisations and meetup groups.
