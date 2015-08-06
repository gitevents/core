var http = require('http');
var config = require('./common/config');
var debug = require('debug')('gitevents');
var handler = require('./lib/handler');
var gitWebhook = require('github-webhook-handler');

var hookHandler = gitWebhook({
  path: '/github/delivery',
  secret: config.github.secret
});

hookHandler.on('error', function(err) {
  console.log(err);
});

hookHandler.on('issues', function(event) {
  debug('New event: ' + event.event);

  if (event.payload) {
    handler(event.payload).then(function(onFulfilled, onRejected) {
      console.log('Done');
    });
  }
});

http.createServer(function(req, res) {
  hookHandler(req, res, function(err) {
    res.statusCode = 404;
    res.end();
  });
}).listen(3000);
