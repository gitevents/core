var handler = require('../lib/handler');
var config = require('../common/config');
var nock = require('nock');
var test = require('tape');

// GitHub Webhook Data
var opened = require('./data/opened');
var proposed = require('./data/proposed');
var talk = require('./data/talk');

// GitHub Mock Responses
var mockUser = require('./mock/user');
var mockEmptyProposals = require('./mock/empty_proposals');
var mockUpdatedProposal = require('./mock/updated_proposal');
var mockCreatedProposal = require('./mock/created_proposal');

nock('https://api.github.com:443')
  .get('/users/gitevents')
  .query({
    'access_token': config.github.token
  })
  .reply(200, mockUser)
  .get('/repos/gitevents/Testing/contents/proposals.json')
  .query({
    'access_token': config.github.token
  })
  .reply(404)
  .put('/repos/gitevents/Testing/contents/proposals.json')
  .query({
    'access_token': config.github.token
  })
  .reply(201, mockCreatedProposal);

test('new issue', function(t) {
  t.plan(2);

  handler(opened, function(error, result) {
    t.equals(error, null);
    t.equals(result, 'Done.');
  });
});

test('create or update talk', function(t) {
  t.plan(2);

  handler(proposed, function(error, result) {
    t.equals(error, null);
    t.equals(result, 'Done.');
  });
});
