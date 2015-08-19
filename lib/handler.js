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
      webhook(payload).then(function(event, rejected) {
        if (rejected) {
          reject(rejected);
        } else if (event !== undefined) {
          meetup(event).then(function(onFulfilled, onRejected) {
            // TODO: return meetup ID and store in event for further reference
            resolve(null);
          });
          // TODO: add Twitter integration
          // TODO: add LanYrd intgegration
        } else {
          reject(new Error('No data.'));
        }
      });
    }
  );
};
