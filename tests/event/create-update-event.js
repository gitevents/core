var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');

var createUpdateEvent = rewire('../../lib/event/create-update-event');

var configStub = {
  about: 'about',
  paths: {
    events: 'events/'
  }
};

createUpdateEvent.__set__('config', configStub);

test('event file is updated if one exists for the event', function (t) {
  /**
   * Setup inputs / outputs
   */

  // new or existing event
  var newOrExistingEvent = {
    id: 'new-or-existing-event-id',
    name: 'new-or-existing-event-name'
  };

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id'
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

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.resolve(existingEventFile)
  );

  var githubEventFileUpdateSpy = sinon.spy(function() {
    return Promise.resolve(newOrExistingEvent);
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    update: githubEventFileUpdateSpy
  });

  createUpdateEvent.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).then(function(result) {
    var spyCall = githubEventFileUpdateSpy.getCall(0);

    t.equal(githubEventFileStub.alwaysCalledWith(githubStub), true, 'correct github instance used to interact with github');
    t.equal(spyCall.args[0], 'events/new-or-existing-event-id.json', 'correct filename used to update event file');
    t.equal(spyCall.args[1], existingEventFile.sha, 'correct sha used to update event file');
    t.equal(spyCall.args[2], 'ewogICJpZCI6ICJuZXctb3ItZXhpc3RpbmctZXZlbnQtaWQiLAogICJuYW1lIjogIm5ldy1vci1leGlzdGluZy1ldmVudC1uYW1lIgp9', 'correct file content used to update event file');
    t.equal(spyCall.args[3], 'Updated event existing-event-id', 'correct message used to update event file');
    t.equal(result, newOrExistingEvent, 'event is returned');

    t.end();
  });
});

test('error is returned if file failed to update event', function (t) {
  /**
   * Setup inputs / outputs
   */

  // new or existing event
  var newOrExistingEvent = {
    id: 'new-or-existing-event-id',
    name: 'new-or-existing-event-name'
  };

  // event we want to update
  var existingEvent = {
    id: 'existing-event-id'
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

  createUpdateEvent.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).catch(function(result) {
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub), true, 'correct github instance used to interact with github');
    t.equal(result instanceof Error, true, 'error is returned');
    t.equal(result.message, updateEventError, 'error has correct message');

    t.end();
  });
});

test('event file is created if one does not exist for the event', function (t) {
  /**
   * Setup inputs / outputs
   */

  // error returned from getEventFile
  var getEventRrror = {
    code: 404
  };

  // new or existing event
  var newOrExistingEvent = {
    id: 'new-or-existing-event-id',
    name: 'new-or-existing-event-name'
  };

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.reject(getEventRrror)
  );

  var githubEventFileCreateSpy = sinon.spy(function() {
    return Promise.resolve(newOrExistingEvent);
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    create: githubEventFileCreateSpy
  });

  createUpdateEvent.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).then(function(result) {
    var spyCall = githubEventFileCreateSpy.getCall(0);

    t.equal(githubEventFileStub.alwaysCalledWith(githubStub), true, 'correct github instance used to interact with github');
    t.equal(spyCall.args[0], 'events/new-or-existing-event-id.json', 'correct filename used to create event file');
    t.equal(spyCall.args[1], 'ewogICJpZCI6ICJuZXctb3ItZXhpc3RpbmctZXZlbnQtaWQiLAogICJuYW1lIjogIm5ldy1vci1leGlzdGluZy1ldmVudC1uYW1lIiwKICAiYWJvdXQiOiAiYWJvdXQiCn0=', 'correct file content used to create event file');
    t.equal(spyCall.args[2], 'Created event new-or-existing-event-id', 'correct message used to create event file');
    t.equal(result, newOrExistingEvent, 'event is returned');
    t.equal(result.about, 'about', 'event.about is set');

    t.end();
  });
});

test('error is returned if the file failed was not created', function (t) {
  /**
   * Setup inputs / outputs
   */

  // error returned from getEventFile
  var getEventError = {
    code: 404
  };

  // new or existing event
  var newOrExistingEvent = {
    id: 'new-or-existing-event-id',
    name: 'new-or-existing-event-name'
  };

  // create event error
  var createEventError = 'error';

  /**
   * Setup spies
   */

  var githubStub = sinon.stub();

  var githubEventFileGetStub = sinon.stub().returns(
    Promise.reject(getEventError)
  );

  var githubEventFileCreateSpy = sinon.spy(function() {
    return Promise.reject(createEventError);
  });

  var githubEventFileStub = sinon.stub().returns({
    get: githubEventFileGetStub,
    create: githubEventFileCreateSpy
  });

  createUpdateEvent.__set__('githubEventFile', githubEventFileStub);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).catch(function(result) {
    t.equal(githubEventFileStub.alwaysCalledWith(githubStub), true, 'correct github instance used to interact with github');
    t.equal(result instanceof Error, true, 'error is returned');
    t.equal(result.message, createEventError, 'error has correct message');

    t.end();
  });
});
