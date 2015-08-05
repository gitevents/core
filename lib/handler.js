var debug = require('debug')('gitevents-handler');
var config = require('../common/config');

// integrations
var webhook = require('gitevents-webhook')(config);
var meetup = require('gitevents-meetup')(config);
// twitter = require('./integrations/gitup-twitter')(config);

module.exports = function(payload, callback) {
  debug('Processing from: ' + payload.sender.login);
  webhook.process(payload, function(error, event) {
    if (error) {
      return callback(error);
    }

    if (event) {
      meetup(event).then(function(onFulfilled, onRejected) {
        console.log(onFulfilled);
      });
    } else {

    }
    return callback(null, 'Done.');
  });
};
