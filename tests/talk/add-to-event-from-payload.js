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
   * Setup spies & stubs
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.resolve(existingEventFile)
  );

  var githubEventFileUpdateSpy = sinon.spy(function() {
    return Promise.resolve();
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    update: githubEventFileUpdateSpy
  });

  addTalkToEventFromPayload.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub, configStub).then(function(result) {
    var spyCall = githubEventFileUpdateSpy.getCall(0);
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub, configStub), true, 'correct github & config instance used');
    t.equal(spyCall.args[0], 'events/milestone description.json', 'correct filename used to update event file');
    t.equal(spyCall.args[1], existingEventFile.sha, 'correct sha used to update event file');
    t.equal(spyCall.args[2], 'ewogICJpZCI6ICJleGlzdGluZy1ldmVudC1pZCIsCiAgInBlcmZvcm1lciI6IFsKICAgIHsKICAgICAgInR5cGUiOiAiUGVyc29uIiwKICAgICAgImltYWdlIjogImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vc3BlYWtlci1hdmF0YXIvam9obi1kb2UiLAogICAgICAibmFtZSI6ICJqb2huIGRvZSIsCiAgICAgICJpZCI6ICIyMDE2MTIzMC1pc3N1ZS10aXRsZSIsCiAgICAgICJzYW1lQXMiOiAiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9zcGVha2VyL2pvaG4tZG9lIiwKICAgICAgInVybCI6ICJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3RhbGtzLzIwMTYxMjMwLWlzc3VlLXRpdGxlLmh0bWwiCiAgICB9CiAgXQp9', 'correct file content used to update event file');
    t.equal(spyCall.args[3], 'Updated event existing-event-id', 'correct message used to update event file');
    t.equal(result.id, existingEvent.id, 'event is returned');
    t.equal(result.performer.length, 1, 'event is returned with performer');

    t.end();
  });
});

test('talk is added to event with performer added to existing performers', function (t) {
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
   * Setup spies & stubs
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.resolve(existingEventFile)
  );

  var githubEventFileUpdateSpy = sinon.spy(function() {
    return Promise.resolve();
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    update: githubEventFileUpdateSpy
  });

  addTalkToEventFromPayload.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub, configStub).then(function(result) {
    var spyCall = githubEventFileUpdateSpy.getCall(0);

    t.equal(githubEventFileStub.alwaysCalledWith(githubStub, configStub), true, 'correct github & config instance used');
    t.equal(spyCall.args[0], 'events/milestone description.json', 'correct filename used to update event file');
    t.equal(spyCall.args[1], existingEventFile.sha, 'correct sha used to update event file');
    t.equal(spyCall.args[2], 'ewogICJpZCI6ICJleGlzdGluZy1ldmVudC1pZCIsCiAgInBlcmZvcm1lciI6IFsKICAgIHsKICAgICAgImlkIjogInBlcmZvcm1lci0xIgogICAgfSwKICAgIHsKICAgICAgInR5cGUiOiAiUGVyc29uIiwKICAgICAgImltYWdlIjogImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vc3BlYWtlci1hdmF0YXIvam9obi1kb2UiLAogICAgICAibmFtZSI6ICJqb2huIGRvZSIsCiAgICAgICJpZCI6ICIyMDE2MTIzMC1pc3N1ZS10aXRsZSIsCiAgICAgICJzYW1lQXMiOiAiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9zcGVha2VyL2pvaG4tZG9lIiwKICAgICAgInVybCI6ICJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3RhbGtzLzIwMTYxMjMwLWlzc3VlLXRpdGxlLmh0bWwiCiAgICB9CiAgXQp9', 'correct file content used to update event file');
    t.equal(spyCall.args[3], 'Updated event existing-event-id', 'correct message used to update event file');
    t.equal(result.id, existingEvent.id, 'event is returned');
    t.equal(result.performer.length, 2, 'event is returned with new performer');

    t.end();
  });
});

test('talk is not added to event if it already exists', function (t) {
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
   * Setup spies & stubs
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
      Promise.resolve(existingEventFile)
  );

  var githubEventFileUpdateSpy = sinon.spy(function() {
    return new Promise.resolve();
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    update: githubEventFileUpdateSpy
  });

  addTalkToEventFromPayload.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub, configStub).then(function(result) {
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub, configStub), true, 'correct github & config instance used');
    t.equal(githubEventFileUpdateSpy.calledOnce, false, 'updateEventFile was not called');
    t.deepEqual(result, existingEvent, 'event is returned');

    t.end();
  });
});

test('error is returned if failed to update event', function (t) {
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
   * Setup spies & stubs
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.resolve(existingEventFile)
  );

  var githubEventFileUpdateSpy = sinon.spy(function() {
    return Promise.reject(updateEventError);
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    update: githubEventFileUpdateSpy
  });

  addTalkToEventFromPayload.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub, configStub).catch(function(error) {
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub, configStub), true, 'correct github & config instance used');
    t.equal(error instanceof Error, true, 'error is returned');
    t.equal(error.message, updateEventError, 'error has correct message');

    t.end();
  });
});

test('error is returned if event not found', function (t) {
  /**
   * Setup inputs / outputs
   */

  // update event error
  var getEventError = 'event not found.';

  /**
   * Setup spies & stubs
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.reject(getEventError)
  );

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub
  });

  addTalkToEventFromPayload.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  addTalkToEventFromPayload(payload, speaker, githubStub, configStub).catch(function(error) {
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub, configStub), true, 'correct github & config instance used');
    t.equal(error, getEventError, 'error is returned');

    t.end();
  });
});
