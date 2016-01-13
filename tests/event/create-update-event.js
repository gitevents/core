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

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(existingEventFile);
    });
  });

  var updateEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(newOrExistingEvent);
    });
  });

  createUpdateEvent.__set__('getEventFile', getEventFileSpy);
  createUpdateEvent.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).then(function(result) {
    var spyCall = updateEventFileSpy.getCall(0);

    t.equal(updateEventFileSpy.calledOnce, true, 'updateEventFile was called');
    t.equal(spyCall.args[0], githubStub, 'correct github instance passed as argument to updateEventFile');
    t.equal(spyCall.args[1], configStub, 'correct config instance passed as argument to updateEventFile');
    t.equal(spyCall.args[2], 'events/new-or-existing-event-id.json', 'correct filename passed as argument to updateEventFile');
    t.equal(spyCall.args[3], existingEventFile.sha, 'correct sha passed as argument to updateEventFile');
    t.equal(spyCall.args[4], 'ewogICJpZCI6ICJuZXctb3ItZXhpc3RpbmctZXZlbnQtaWQiLAogICJuYW1lIjogIm5ldy1vci1leGlzdGluZy1ldmVudC1uYW1lIgp9', 'correct file content passed as argument to updateEventFile');
    t.equal(spyCall.args[5], 'Updated event existing-event-id', 'correct message passed as argument to updateEventFile');
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

  createUpdateEvent.__set__('getEventFile', getEventFileSpy);
  createUpdateEvent.__set__('updateEventFile', updateEventFileSpy);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).catch(function(result) {
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

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve, reject) {
      reject(getEventRrror);
    });
  });

  var createEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve) {
      resolve(newOrExistingEvent);
    });
  });

  createUpdateEvent.__set__('getEventFile', getEventFileSpy);
  createUpdateEvent.__set__('createEventFile', createEventFileSpy);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).then(function(result) {
    var spyCall = createEventFileSpy.getCall(0);

    t.equal(createEventFileSpy.calledOnce, true, 'createEventFile was called');
    t.equal(spyCall.args[0], githubStub, 'correct github instance passed as argument to createEventFile');
    t.equal(spyCall.args[1], configStub, 'correct config instance passed as argument to createEventFile');
    t.equal(spyCall.args[2], 'events/new-or-existing-event-id.json', 'correct filename passed as argument to createEventFile');
    t.equal(spyCall.args[3], 'ewogICJpZCI6ICJuZXctb3ItZXhpc3RpbmctZXZlbnQtaWQiLAogICJuYW1lIjogIm5ldy1vci1leGlzdGluZy1ldmVudC1uYW1lIiwKICAiYWJvdXQiOiAiYWJvdXQiCn0=', 'correct file content passed as argument to createEventFile');
    t.equal(spyCall.args[4], 'Created event new-or-existing-event-id', 'correct message passed as argument to createEventFile');
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

  var getEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve, reject) {
      reject(getEventError);
    });
  });

  var createEventFileSpy = sinon.spy(function() {
    return new Promise(function(resolve, reject) {
      reject(createEventError);
    });
  });

  createUpdateEvent.__set__('getEventFile', getEventFileSpy);
  createUpdateEvent.__set__('createEventFile', createEventFileSpy);

  /**
   * Make assertions
   */

  createUpdateEvent(newOrExistingEvent, githubStub).catch(function(result) {
    t.equal(result instanceof Error, true, 'error is returned');
    t.equal(result.message, createEventError, 'error has correct message');

    t.end();
  });
});
