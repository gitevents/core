var crypto = require('crypto');

module.exports = function (config) {
  if (!config.github) {
    throw new Error('No configuration found');
  }
  config = config.github;

  return {
    process: function(req, callback) {
      if (!req.headers['x-hub-signature']) {
        throw new Error('No X-Hub-Signature found on request');
      }

      if (!req.headers['x-github-event']) {
        throw new Error('No X-Github-Event found on request');
      }

      if (!req.headers['x-github-delivery']) {
        throw new Error('No X-Github-Delivery found on request');
      }

      var received_sig = req.headers['x-hub-signature'];
      req.hasher = crypto.createHmac('sha1', config.key);
      req.setEncoding('utf8');
      var data = '';
      req.on('data', function (chunk) {
        data += chunk;
        req.hasher.update(chunk);
      });
      req.on('end', function() {
        req.body = JSON.parse(data);
        var hash = 'sha1=' + req.hasher.digest('hex');
        if (hash != received_sig) {
          callback(null, 403);
        } else {
          // this is a valid webhook from GitHub

          // contact GitHub
          //
          // Get all issues with the same label as the one
          // from the webhook and return the whole object
          //
          // Also get associated milestones and parse them
          callback(req.body, null);
        }
      });
    }
  };
};