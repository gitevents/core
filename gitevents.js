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

hookHandler.on('issue', function(payload) {
  debug('Processing issue from: ' + payload.sender.login);
  handler(payload).then(function (onFulfilled, onRejected) {
    console.log('Done');
  });
});

http.createServer(function(req, res) {
  handler(req, res, function() {
    res.statusCode = 404;
    res.end('no such location');
  });
});

http.listen(3000);
