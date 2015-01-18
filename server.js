var
  debug = require('debug')('gitup'),
  config = require('./common/config'),
  http = require('http');

// integrations
webhook = require('gitevents-webhook')(config);
// twitter = require('./integrations/gitup-twitter')(config);

var server = http.createServer(function (req, res) {
  console.log(req.method + ' ' + req.url);

  process.on('uncaughtException', function (error) {
    res.writeHeader(500, {
      'Content-Type': 'text/plain'
    });
    res.write(error.toString());
    res.end();
  });


  if (req.url === '/github/delivery' && req.method === 'POST') {
    var body = '';

    req.on('data', function (chunk) {
      body += chunk.toString();
    });

    req.on('end', function () {
      req.body = body;

      // testing github webhooks.
      console.log(body);

      webhook.process(req, function (error, event) {
        if (error) {
          res.writeHeader(500, {
            'Content-Type': 'text/plain'
          });
          res.write(error);
        } else {
          res.writeHeader(500, {
            'Content-Type': 'application/json'
          });
          res.write(event);
        }
        res.end();
      });
    });
  } else {
    res.writeHeader(204, {
      'Content-Type': 'text/plain'
    });
    res.end();
  }
});

server.listen(3000);

console.log('GitUp listening on 3000');
