var debug = require('debug')('gitevents-handler');
var config = require('../common/config');

// integrations
var webhook = require('gitevents-webhook')(config);
var meetup = require('gitevents-meetup')(config);
// twitter = require('./integrations/gitup-twitter')(config);

module.exports = function process(payload) {
  return new Promise(
    function(resolve, reject) {
      debug('Starting.');
      webhook(payload).then(function(event, onRejected) {
        if (event) {
          meetup(event).then(function(onFulfilled, onRejected) {
            resolve(null);
          });
        } else {
          reject(new Error('No data.'));
        }
      });
    }
  );
};
