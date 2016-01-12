var test = require('tape');
var sinon = require('sinon');

var createEventFile = require('../../lib/github/create-event-file');

var configStub = {
  github: {
    org: 'foo',
    repos: {
      gitevent: 'bar'
    }
  }
}

test('correct params are used to create file', function (t) {
  t.plan(1);

  var filepath = 'foo/bar/baz';
  var content = 'foo bar baz';
  var message = 'bar baz qux';

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(params, cb) {
        cb(null, {});
      })
    }
  };

  var query = {
    user: configStub.github.org,
    repo: configStub.github.repos.gitevent,
    path: filepath,
    content: content,
    message: message
  };

  createEventFile(githubMock, configStub, filepath, content, message).then(function() {
    t.equal(
      githubMock.repos.createFile.calledWith(query),
      true,
      'github.repos.createFile called with the correct parameters'
    );

    t.end();
  });
});

test('promise rejects with error when file is not created', function (t) {
  t.plan(1);

  var createFileError = new Error();

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(createFileError);
      })
    }
  };

  createEventFile(githubMock, configStub).catch(function(error) {
    t.equal(error, createFileError, 'error is returned');

    t.end();
  })
});

test('promise resolves with result when file is created', function (t) {
  t.plan(1);

  var createFileResult = 'foo';

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(null, createFileResult);
      })
    }
  };

  createEventFile(githubMock, configStub).then(function(result) {
    t.equal(result, createFileResult, 'result is returned');

    t.end();
  })
});
