var
  test = require('tape'),
  crypto = require('crypto'),
  config = require('../common/development'),
  labeled = require('./data/labeled'),
  http = require('http');

var post = function post(data, fn) {
  var post_data, post_options, request, hash, signature;

  if (typeof data === 'object') {
    try {
      post_data = JSON.stringify(data);
    } catch (e) {
      throw e;
    }
  } else {
    post_data = data;
  }

  var hash_data = new Buffer(post_data);
  hash = crypto.createHmac('sha1', config.github.secret);
  signature = hash.update(hash_data, 'utf8').digest('hex');

  post_options = {
    host: '127.0.0.1',
    port: '3000',
    path: '/github/delivery',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': post_data.length,
      'x-github-event': 'issues',
      'x-github-delivery': 'a71ed180-9f12-11e4-8338-400304b2bf4a',
      'content-type': 'application/json',
      'x-hub-signature': 'sha1=' + signature
    }
  };

  // Set up the request
  request = http.request(post_options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log(chunk);
    });

    res.on('end', function (error, result) {
      console.log('end');
      fn(null);
    });
  });

  // post the data
  request.write(post_data);
  request.end();
};

test('webhook', function (t) {
  t.plan(0);

  post(labeled, function (error, result) {
    console.log(error, result);
  });

  t.end();
});
