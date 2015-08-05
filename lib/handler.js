var debug = require('debug')('gitevents-handler');
var config = require('../common/config');

var CreateHandler = require('github-webhook-handler');
var handler = CreateHandler({
  path: '/github/delivery',
  secret: config.github.secret
});

// integrations
var webhook = require('gitevents-webhook')(config);
var meetup = require('gitevents-meetup')(config);
// twitter = require('./integrations/gitup-twitter')(config);

module.exports = function(req, res) {
  if (req.method === 'POST') {
    handler(req, res, function() {
      res.statusCode(204);
      res.end();
    });
  }
};

handler.on('error', function(err) {
  console.log(err);
});

handler.on('event', function(payload) {
  debug('Processing from: ' + payload.sender.login);
  webhook.process(payload, function(error, event) {
    if (event) {
      meetup(event).then(function(onFulfilled, onRejected) {
        console.log(onFulfilled);
      });
    } else {

    }
  });
});
