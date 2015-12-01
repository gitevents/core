var talks = require('../lib/talks');
var test = require('tape');

test.skip('issue: opened does nothing.', function(t) {
  // issue_opened.json
  // live tested
});

test.skip('issue: labeled "proposal" does nothing.', function(t) {
  // labeled_proposal.json
  // live tested
});

test.skip('issue: labeled "talk" - throw error when a milestone is missing', function(t) {
  // labeled_talk_without_milestone.json
  // live tested
});

test.skip('issue: labeled "talk" - creates a new event file at first run with valid data', function(t) {
  // labeled_talk_with_milestone.json
  // live tested
});

test.skip('issue: labeled "talk" - udates talk information in an event', function(t) {
  // comment_created.json
  // each comment from the issue owner should trigger an update on the talk
  // a comment from the repo owner should also trigger an update, just in case
});

test.skip('issue: labeled "talk" - verify important data isn\'t overwritten with an update', function(t) {
  // labeled_talk_with_milestone.json
  // check that talk.speaker, created_at etc. are the same as before and everything else is updated
});

test.skip('issue: unlabeled "talk" should remove a talk from the event', function(t) {
  // unlabeled_talk_with_milestone.json
  //TODO: remove talk not implemented yet
});

test.skip('issue: closed should move a talk to `history.json`', function(t) {
  // closed_talk.json
  //TODO: archive talk not implemented yet
});
