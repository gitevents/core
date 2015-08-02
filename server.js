var
  debug = require('debug')('gitup'),
  config = require('./common/config'),
  crypto = require('crypto'),
  http = require('http');

// integrations
var webhook = require('gitevents-webhook')(config);
// twitter = require('./integrations/gitup-twitter')(config);

/**
 * Validate incoming HTTP headers
 *
 * Check if all required HTTP headers exist and
 * throw an exception otherwise.
 */
var validateHeaders = function (req) {
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
};

var server = http.createServer(function (req, res) {
  console.log(req.method + ' ' + req.url);

  process.on('uncaughtException', function (error) {
    res.writeHeader(500, {
      'Content-Type': 'text/plain'
    });
    res.write(error.toString());
    res.end();
  });


  if (req.url === '/github/delivery' && req.method === 'POST') {
    validateHeaders(req);

    // obtain the signature from the x-hub-signature header
    var signature = req.headers['x-hub-signature'];

    // start a hasher
    req.hasher = crypto.createHmac('sha1', config.github.secret);
    req.setEncoding('utf8');
    var data = '';

    // whenever there's new incoming data update the hasher
    req.on('data', function (chunk) {
      data += chunk;
      req.hasher.update(chunk);
    });

    // when the request ends, compare signature and hash
    req.on('end', function () {
      var
        hash = 'sha1=' + req.hasher.digest('hex'),
        webhook_data = '';

      if (hash !== signature) {
        res.writeHeader(403, {
          'Content-Type': 'text/plain'
        });
        res.end();
      } else {
        // this is a valid webhook from GitHub
        // convert body to JSON
        try {
          webhook_data = JSON.parse(data);
        } catch (error) {
          res.writeHeader(500, {
            'Content-Type': 'text/plain'
          });
          res.write(error);
          res.end();
        }

        // load all associated issues
        webhook.process(webhook_data, function (error, response) {
          console.log(error, response);
          if (error) {
            res.writeHeader(500, {
              'Content-Type': 'text/plain'
            });
            res.write(error);
          } else {
            res.writeHeader(500, {
              'Content-Type': 'application/json'
            });
            res.write(response);
          }
          res.end();
        });
      }
    });
  } else {
    res.writeHeader(204, {
      'Content-Type': 'text/plain'
    });
    res.end();
  }
});

server.listen(3000);

console.log('GitUp listening on 3000');
