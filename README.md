<<<<<<< HEAD
gitup
=====

[![codeship](https://codeship.com/projects/3cb2d880-809c-0132-071e-4e80f7268ba4/status?branch=master)](https://codeship.com/projects/57517)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/GitEvents/gitevents?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A node.js micro service that listens to GitHub web hooks to:

1. verify event and speaker issues (bot)
2. send emails in the run up to the event
3. update meetup.com

This service will **not** generate a website for you, but an example is coming soon...
=======
# Introduction

gitevents-webhook is an npm module that can be used to process and validate GitHub originated webhooks.

# Basic usage

```
...

var config = {github: {key: 'MY_WEBHOOK_KEY'}};
var webhook = require('webhook')(config);

app.post('/hook', function(req, res) {
  webhook.process(req, function(body, err) {
    if (err) {
      res.status(err).json({msg: 'Unauthorized'}).end();
    } else {
      res.send(body);
    }
  });
});

...
```
>>>>>>> upstream/master
