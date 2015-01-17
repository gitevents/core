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
