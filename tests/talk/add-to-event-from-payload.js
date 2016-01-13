var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');

var addTalkToEventFromPayload = rewire('../../lib/talk/add-to-event-from-payload');

var configStub = {
  paths: {
    events: 'events/'
  },
  schema: {
    default_talk_url: 'http://www.example.com/talks/'
  }
};

var payload = {
  issue: {
    title: 'issue title',
    milestone: {
      description: 'milestone description',
      due_on: '2016-12-30T00:00:00Z'
    }
  }
};

var speaker = {
  avatar_url: 'http://www.example.com/speaker-avatar/john-doe',
  name: 'john doe',
  url: 'http://www.example.com/speaker/john-doe'
};

addTalkToEventFromPayload.__set__('config', configStub);

test('talk is added to event with performer', function (t) {
  /**
   * Setup inputs / outputs
   */

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id',
    performer: []
  };

  // file containing event details for the event we want to update
  var existingEventFile = {
    content: JSON.stringify(existingEvent),
    encoding: 'utf8',
    sha: 'existing-event-file-sha'
  };

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(existingEventFile);
    });
  });

  var updateEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve();
    });
  });

  addTalkToEventFromPayload.__set__('getEventFile', getEventFileSpy);
  addTalkToEventFromPayload.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub).then(function(result) {
    var spyCall = updateEventFileSpy.getCall(0);

    t.equal(updateEventFileSpy.calledOnce, true, 'updateEventFile was called');
    t.equal(spyCall.args[0], githubStub, 'correct github instance passed as argument to updateEventFile');
    t.equal(spyCall.args[1], configStub, 'correct config instance passed as argument to updateEventFile');
    t.equal(spyCall.args[2], 'events/milestone description.json', 'correct filename passed as argument to updateEventFile');
    t.equal(spyCall.args[3], existingEventFile.sha, 'correct sha passed as argument to updateEventFile');
    t.equal(spyCall.args[4], 'ewogICJpZCI6ICJleGlzdGluZy1ldmVudC1pZCIsCiAgInBlcmZvcm1lciI6IFsKICAgIHsKICAgICAgInR5cGUiOiAiUGVyc29uIiwKICAgICAgImltYWdlIjogImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vc3BlYWtlci1hdmF0YXIvam9obi1kb2UiLAogICAgICAibmFtZSI6ICJqb2huIGRvZSIsCiAgICAgICJpZCI6ICIyMDE2MTIzMC1pc3N1ZS10aXRsZSIsCiAgICAgICJzYW1lQXMiOiAiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9zcGVha2VyL2pvaG4tZG9lIiwKICAgICAgInVybCI6ICJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3RhbGtzLzIwMTYxMjMwLWlzc3VlLXRpdGxlLmh0bWwiCiAgICB9CiAgXQp9', 'correct file content passed as argument to updateEventFile');
    t.equal(spyCall.args[5], 'Updated event existing-event-id', 'correct message passed as argument to updateEventFile');
    t.equal(result.id, existingEvent.id, 'event is returned');
    t.equal(result.performer.length, 1, 'event is returned with performer');

    t.end();
  });
});

test.skip('talk is added to event with performer added to existing performers', function (t) {
  /**
   * Setup inputs / outputs
   */

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id',
    performer: [
      { id: 'performer-1' }
    ]
  };

  // file containing event details for the event we want to update
  var existingEventFile = {
    content: JSON.stringify(existingEvent),
    encoding: 'utf8',
    sha: 'existing-event-file-sha'
  };

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(existingEventFile);
    });
  });

  var updateEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve();
    });
  });

  addTalkToEventFromPayload.__set__('getEventFile', getEventFileSpy);
  addTalkToEventFromPayload.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub).then(function(result) {
    var spyCall = updateEventFileSpy.getCall(0);

    t.equal(updateEventFileSpy.calledOnce, true, 'updateEventFile was called');
    t.equal(spyCall.args[0], githubStub, 'correct github instance passed as argument to updateEventFile');
    t.equal(spyCall.args[1], configStub, 'correct config instance passed as argument to updateEventFile');
    t.equal(spyCall.args[2], 'events/milestone description.json', 'correct filename passed as argument to updateEventFile');
    t.equal(spyCall.args[3], existingEventFile.sha, 'correct sha passed as argument to updateEventFile');
    t.equal(spyCall.args[4], 'ewogICJpZCI6ICJleGlzdGluZy1ldmVudC1pZCIsCiAgInBlcmZvcm1lciI6IFsKICAgIHsKICAgICAgImlkIjogInBlcmZvcm1lci0xIgogICAgfSwKICAgIHsKICAgICAgInR5cGUiOiAiUGVyc29uIiwKICAgICAgImltYWdlIjogImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vc3BlYWtlci1hdmF0YXIvam9obi1kb2UiLAogICAgICAibmFtZSI6ICJqb2huIGRvZSIsCiAgICAgICJpZCI6ICIyMDE2MTIzMC1pc3N1ZS10aXRsZSIsCiAgICAgICJzYW1lQXMiOiAiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9zcGVha2VyL2pvaG4tZG9lIiwKICAgICAgInVybCI6ICJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3RhbGtzLzIwMTYxMjMwLWlzc3VlLXRpdGxlLmh0bWwiCiAgICB9CiAgXQp9', 'correct file content passed as argument to updateEventFile');
    t.equal(spyCall.args[5], 'Updated event existing-event-id', 'correct message passed as argument to updateEventFile');
    t.equal(result.id, existingEvent.id, 'event is returned');
    t.equal(result.performer.length, 2, 'event is returned with new performer');

    t.end();
  });
});

test.skip('talk is not added to event if it already exists', function (t) {
  /**
   * Setup inputs / outputs
   */

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id',
    performer: [
      { id: '20161230-issue-title' }
    ]
  };

  // file containing event details for the event we want to update
  var existingEventFile = {
    content: JSON.stringify(existingEvent),
    encoding: 'utf8',
    sha: 'existing-event-file-sha'
  };

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(existingEventFile);
    });
  });

  var updateEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve();
    });
  });

  addTalkToEventFromPayload.__set__('getEventFile', getEventFileSpy);
  addTalkToEventFromPayload.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub).then(function(result) {
    t.equal(updateEventFileSpy.calledOnce, false, 'updateEventFile was not called');
    t.deepEqual(result, existingEvent, 'event is returned');

    t.end();
  });
});

test.skip('error is returned if failed to update event', function (t) {
  /**
   * Setup inputs / outputs
   */

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id',
    performer: []
  };

  // file containing event details for the event we want to update
  var existingEventFile = {
    content: JSON.stringify(existingEvent),
    encoding: 'utf8',
    sha: 'existing-event-file-sha'
  };

  // update event error
  var updateEventError = 'error';

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(existingEventFile);
    });
  });

  var updateEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve, reject) {
      reject(updateEventError);
    });
  });

  addTalkToEventFromPayload.__set__('getEventFile', getEventFileSpy);
  addTalkToEventFromPayload.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub).catch(function(error) {
    t.equal(error instanceof Error, true, 'error is returned');
    t.equal(error.message, updateEventError, 'error has correct message');

    t.end();
  });
});

test.skip('error is returned if event not found', function (t) {
  /**
   * Setup inputs / outputs
   */

  // update event error
  var getEventError = 'event not found.';

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve, reject) {
      reject(getEventError);
    });
  });

  addTalkToEventFromPayload.__set__('getEventFile', getEventFileSpy);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub).catch(function(error) {
    t.equal(error, getEventError, 'error is returned');

    t.end();
  });
});
