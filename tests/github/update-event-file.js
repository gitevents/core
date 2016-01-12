var test = require('tape');
var sinon = require('sinon');

var updateEventFile = require('../../lib/github/update-event-file');

var configStub = {
  github: {
    org: 'foo',
    repos: {
      gitevent: 'bar'
    }
  }
}

test('correct params are used to update file', function (t) {
  t.plan(1);

  var filepath = 'foo/bar/baz';
  var sha = 'foo';
  var content = 'foo bar baz';
  var message = 'bar baz qux';

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(params, cb) {
        cb(null, {});
      })
    }
  };

  var query = {
    user: configStub.github.org,
    repo: configStub.github.repos.gitevent,
    path: filepath,
    sha: sha,
    content: content,
    message: message
  };

  updateEventFile(githubMock, configStub, filepath, sha, content, message).then(function() {
    t.equal(
      githubMock.repos.updateFile.calledWith(query),
      true,
      'github.repos.updateFile called with the correct parameters'
    );

    t.end();
  });
});

test('promise rejects with error when file is not updated', function (t) {
  t.plan(1);

  var updateFileError = new Error();

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(updateFileError);
      })
    }
  };

  updateEventFile(githubMock, configStub).catch(function(error) {
    t.equal(error, updateFileError, 'error is returned');

    t.end();
  })
});

test('promise resolves with result when file is updated', function (t) {
  t.plan(1);

  var updateFileResult = 'foo';

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(null, updateFileResult);
      })
    }
  };

  updateEventFile(githubMock, configStub).then(function(result) {
    t.equal(result, updateFileResult, 'result is returned');

    t.end();
  })
});
