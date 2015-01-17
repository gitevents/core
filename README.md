# Introduction

gitup-webhook is an npm module that can be used to process and validate GitHub originated webhooks.

# Basic usage

```
...
var webhook = require('webhook');

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
