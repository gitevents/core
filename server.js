var
  debug = require('debug')('gitup'),
  config = require('./common/config'),
  http = require('http');

// integrations
webhook = require('gitup-webhook')(config);
// twitter = require('./integrations/gitup-twitter')(config);

var server = http.createServer(function (request, response) {
  console.log('incoming');
  console.log(request);

  webhook.process(request, function (error, event) {
    if (error) {
      response.writeHeader(500, {
        'Content-Type': 'text/plain'
      });
      response.write(error);
    } else {
      response.writeHeader(500, {
        'Content-Type': 'application/json'
      });
      response.write(event);
    }
    response.end();
  });
});

server.listen(3000);

console.log('GitUp listening on 3000');
