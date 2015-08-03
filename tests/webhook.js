var
  request = require('supertest'),
  config = require('../common/config'),
  crypto = require('crypto'),
  test = require('tape');

var opened = require('./data/opened');
var proposed = require('./data/proposed');
var talk = require('./data/talk');

// test('new issue', function(t) {
//   t.plan(1);
//
//   var hmac = crypto.createHmac('sha1', config.github.secret);
//   hmac.update(JSON.stringify(opened));
//   var calculatedSignature = 'sha1=' + hmac.digest('hex');
//
//   request('http://127.0.0.1:3000')
//     .post('/github/delivery')
//     .send(JSON.stringify(opened))
//     .set('user-agent', 'GitHub-Hookshot')
//     .set('x-github-event', 'issues')
//     .set('content-type', 'application/json')
//     .set('x-hub-signature', calculatedSignature)
//     .end(function(err, res) {
//       t.equal(res.status, 204);
//     });
// });
//
// test('create or update proposal', function(t) {
//   t.plan(1);
//
//   var hmac = crypto.createHmac('sha1', config.github.secret);
//   hmac.update(JSON.stringify(proposed));
//   var calculatedSignature = 'sha1=' + hmac.digest('hex');
//
//   request('http://127.0.0.1:3000')
//     .post('/github/delivery')
//     .send(JSON.stringify(proposed))
//     .set('user-agent', 'GitHub-Hookshot')
//     .set('x-github-event', 'issues')
//     .set('content-type', 'application/json')
//     .set('x-hub-signature', calculatedSignature)
//     .end(function(error, res) {
//       console.log(error);
//       t.equal(res.status, 204);
//     });
// });

test('create or update talk', function(t) {
  t.plan(1);

  var hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(JSON.stringify(talk));
  var calculatedSignature = 'sha1=' + hmac.digest('hex');

  request('http://127.0.0.1:3000')
    .post('/github/delivery')
    .send(JSON.stringify(talk))
    .set('user-agent', 'GitHub-Hookshot')
    .set('x-github-event', 'issues')
    .set('content-type', 'application/json')
    .set('x-hub-signature', calculatedSignature)
    .end(function(error, res) {
      console.log(error);
      t.equal(res.status, 204);
    });
});
