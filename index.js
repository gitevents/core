var crypto = require('crypto');

module.exports = function (config) {
  if (!config.github) {
    throw new Error('No configuration found');
  }

  // extract 'github' config section
  config = config.github;

  /**
   * Validate incoming HTTP headers
   *
   * Check if all required HTTP headers exist and
   * throw an exception otherwise.
   */
  var validateHeaders = function(req) {
    var validHeaders = [
      'x-hub-signature',
      'x-github-event',
      'x-github-delivery'
    ];
    for (var i in validHeaders) {
      if (!req.headers[validHeaders[i]]) {
        throw new Error('No ' + validHeaders[i] + ' found on request');
      }
    }
  }

  return {
    process: function(req, callback) {
      validateHeaders(req);

      // obtain the signature from the x-hub-signature header
      var signature = req.headers['x-hub-signature'];

      // start a hasher
      req.hasher = crypto.createHmac('sha1', config.key);
      req.setEncoding('utf8');
      var data = '';

      // whenever there's new incoming data update the hasher
      req.on('data', function (chunk) {
        data += chunk;
        req.hasher.update(chunk);
      });

      // when the request ends, compare signature and hash
      req.on('end', function() {
        var hash = 'sha1=' + req.hasher.digest('hex');
        if (hash != received_sig) {
          callback(null, 403);
        } else {
          // this is a valid webhook from GitHub

          // convert body to JSON
          req.body = JSON.parse(data);

          // TODO: contact GitHub
          // TODO
          // Get all issues with the same label as the one
          // from the webhook and return the whole object
          //
          // Also get associated milestones and parse them

          // callback the caller passing the JSON body
          callback(req.body, null);
        }
      });
    }
  };
};