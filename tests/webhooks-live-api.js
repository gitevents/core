var
  request = require('supertest'),
  config = require('../common/config'),
  crypto = require('crypto'),
  test = require('tape');

var opened = require('./data/opened');
var proposed = require('./data/proposed');
var talk = require('./data/talk');

function signBlob(key, blob) {
  return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
};

test('new issue', function(t) {
  t.plan(1);

  var json = JSON.stringify(opened);
  var calculatedSignature = signBlob(config.github.secret, json);

  request('http://127.0.0.1:3000')
    .post('/github/delivery')
    .send(json)
    .set('user-agent', 'GitHub-Hookshot')
    .set('X-GitHub-Delivery', 'E2ETest')
    .set('X-GitHub-Event', 'issues')
    .set('Content-Type', 'application/json')
    .set('X-Hub-Signature', calculatedSignature)
    .end(function(err, res) {
      t.equal(res.status, 200);
    });
});

test('create or update proposal', function(t) {
  t.plan(1);

  var json = JSON.stringify(proposed);
  var calculatedSignature = signBlob(config.github.secret, json);

  request('http://127.0.0.1:3000')
    .post('/github/delivery')
    .send(json)
    .set('user-agent', 'GitHub-Hookshot')
    .set('X-GitHub-Delivery', 'E2ETest')
    .set('x-github-event', 'issues')
    .set('content-type', 'application/json')
    .set('x-hub-signature', calculatedSignature)
    .end(function(error, res) {
      t.equal(res.status, 200);
    });
});

test('create or update talk', function(t) {
  t.plan(1);

  var json = JSON.stringify(talk);
  var calculatedSignature = signBlob(config.github.secret, json);

  request('http://127.0.0.1:3000')
    .post('/github/delivery')
    .send(json)
    .set('user-agent', 'GitHub-Hookshot')
    .set('X-GitHub-Delivery', 'E2ETest')
    .set('x-github-event', 'issues')
    .set('content-type', 'application/json')
    .set('x-hub-signature', calculatedSignature)
    .end(function(error, res) {
      t.equal(res.status, 200);
    });
});
