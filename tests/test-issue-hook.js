'use strict';

var
  should = require('should'),
  request = require('supertest'),
  async = require('async'),
  helper = require('./helper');

var
  open = require('./data/open'),
  closed = require('./data/closed'),
  labeled = require('./data/labeled'),
  header = require('./data/header');

describe('GitHub Issue Hook', function () {
  describe('POST /github/delivery', function () {
    it('should ignore an open issue', function (done) {
      request(helper.url)
        .post('/github/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', 'sha1=7912948d5826da014fb55149708d9a23112af18e')
        .set('content-type', 'application/json')
        .send(open)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });

    it('should process a labeled issue', function (done) {
      request(helper.url)
        .post('/github/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', 'sha1=30c18ab307fc0969eca2ba68818ee967cf381930')
        .set('content-type', 'application/json')
        .send(labeled)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });

    it('should process a closed issue', function (done) {
      request(helper.url)
        .post('/github/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', 'sha1=a2cba49b8c72d2d1a66e7b3d2c61b42ed133d1d1')
        .set('content-type', 'application/json')
        .send(closed)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });

    it('should return one event with one talk', function (done) {
      request(helper.url)
        .get('/github')
        .set('content-type', 'application/json')
        .send()
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          console.log(res.body);
          done();
        });
    });
  });
});
