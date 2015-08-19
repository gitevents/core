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
var mockEvents = require('./mock/events');
var mockEmptyProposals = require('./mock/empty_proposals');
var mockProposals = require('./mock/proposals');
var mockUpdatedProposal = require('./mock/updated_proposal');
var mockCreatedProposal = require('./mock/created_proposal');

// Meetup Mock Responses
var mockMeetupEvent = require('./mock/meetup_event');

test('When a new issue is created without labels, do nothing.', function(t) {
  t.plan(1);

  nock('https://api.github.com:443')
    .get('/users/gitevents')
    .query({
      'access_token': config.github.token
    })
    .reply(200, mockUser);

  handler(opened).then(function(onRejected, onFulfilled) {
    // nothing happens here.
  }, function(onRejected) {
    t.throws(onRejected, 'No data.');
  });
});

test('When a proposal is passed the first time, generate proposals.json', function(t) {
  t.plan(1);

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

  handler(proposed).then(function(onFulfilled, onRejected) {
    t.equals(onRejected, undefined);
  });
});

test('When the same proposal is passed again, update proposals.json', function(t) {
  t.plan(1);

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
    .reply(200, mockProposals)
    .put('/repos/gitevents/Testing/contents/proposals.json')
    .query({
      'access_token': config.github.token
    })
    .reply(201, mockCreatedProposal);

  handler(proposed).then(function(onFulfilled, onRejected) {
    t.equals(onRejected, undefined);
  });
});

test('When a proposal is marked as talk, update proposals.json and event.json', function(t) {
  t.plan(1);

  nock('https://api.github.com:443')
    .get('/repos/gitevents/Testing/contents/proposals.json')
    .query({
      'access_token': config.github.token
    })
    .reply(200, mockProposals)

  .put('/repos/gitevents/Testing/contents/proposals.json')
    .query({
      'access_token': config.github.token
    })
    .reply(200)

  .get('/repos/gitevents/Testing/contents/events-2015.json')
    .query({
      'access_token': config.github.token
    })
    .reply(404)

  .put('/repos/gitevents/Testing/contents/events-2015.json')
    .query({
      'access_token': config.github.token
    })
    .reply(201, mockEvents);

  nock('https://api.meetup.com:443')
    .post('/2/event')
    .query(true)
    .reply(200, mockMeetupEvent);

  handler(talk).then(function(onFulfilled, onRejected) {
    t.equals(onRejected, undefined);
  });
});
