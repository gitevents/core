var crypto = require('crypto');
var request = require('request');

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

  /**
   * Extract the label from the payload
   */
  var label = function(payload) {
    return payload.label.name;
  }

  /**
   * Extract the repository API URL from the payload
   */
  var repositoryAPIURL = function(payload) {
    return payload.repository.url;
  }

  /**
   * Load associated GitHub issues
   *
   * Load all associated GitHub issues by querying
   * GitHub's API on the specific repo URL against
   * the label found on the payload.
   */
  var loadIssues = function(payload, callback) {
    // build the issues API query URL
    var url = repositoryAPIURL(payload) +
              '/issues?labels=' +
              encodeURIComponent(label(payload));


    var options = {
      url: url,

      // GitHub API requires a user agent
      headers: {
        'User-Agent': 'GitEvents'
      }
    };

    // make the actual HTTP request
    request(options, function (error, response, body) {
      callback(JSON.parse(body), error);
    });
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
        if (hash != signature) {
          callback(null, 403);
        } else {
          // this is a valid webhook from GitHub

          // convert body to JSON
          req.body = JSON.parse(data);

          // load all associated issues
          loadIssues(req.body, function(body, err) {
            callback(body, err);
          })
        }
      });
    }
  };
};