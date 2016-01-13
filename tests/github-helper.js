var test = require('tape');
var sinon = require('sinon');
var rewire = require('rewire');

var githubHelper = rewire('../lib/github-helper');

var configStub = {
  github: {
    org: 'foo',
    repos: {
      gitevent: 'bar'
    }
  }
}

githubHelper.__set__('config', configStub);

test('getEventFile: correct params are used to get file', function (t) {
  t.plan(1);

  var filepath = 'foo/bar/baz';
  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(null, {});
      })
    }
  };

  var query = {
    user: configStub.github.org,
    repo: configStub.github.repos.gitevent,
    path: filepath
  };

  githubHelper(githubMock).getEventFile(filepath).then(function() {
    t.equal(
      githubMock.repos.getContent.calledWith(query),
      true,
      'github.repos.getContent called with the correct query parameters'
    );

    t.end();
  });
});

test('getEventFile: promise rejects with error object when file is not found', function (t) {
  t.plan(1);

  var errorObj = { code: 404 };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(errorObj);
      })
    }
  };

  githubHelper(githubMock).getEventFile().catch(function(error) {
    t.deepEqual(error, errorObj, 'error object is returned');

    t.end();
  })
});

test('getEventFile: promise resolves with file object when file is found', function (t) {
  t.plan(1);

  var fileObj = { content: 'quz' };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(null, fileObj);
      })
    }
  };

  githubHelper(githubMock).getEventFile().then(function(file) {
    t.deepEqual(file, fileObj, 'file object is returned');

    t.end();
  })
});

test('createEventFile: correct params are used to create file', function (t) {
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

  githubHelper(githubMock).createEventFile(filepath, content, message).then(function() {
    t.equal(
      githubMock.repos.createFile.calledWith(query),
      true,
      'github.repos.createFile called with the correct parameters'
    );

    t.end();
  });
});

test('createEventFile: promise rejects with error when file is not created', function (t) {
  t.plan(1);

  var createFileError = new Error();

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(createFileError);
      })
    }
  };

  githubHelper(githubMock).createEventFile().catch(function(error) {
    t.equal(error, createFileError, 'error is returned');

    t.end();
  })
});

test('createEventFile: promise resolves with result when file is created', function (t) {
  t.plan(1);

  var createFileResult = 'foo';

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(null, createFileResult);
      })
    }
  };

  githubHelper(githubMock).createEventFile().then(function(result) {
    t.equal(result, createFileResult, 'result is returned');

    t.end();
  })
});

test('updateEventFile: correct params are used to update file', function (t) {
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

  githubHelper(githubMock).updateEventFile(filepath, sha, content, message).then(function() {
    t.equal(
      githubMock.repos.updateFile.calledWith(query),
      true,
      'github.repos.updateFile called with the correct parameters'
    );

    t.end();
  });
});

test('updateEventFile: promise rejects with error when file is not updated', function (t) {
  t.plan(1);

  var updateFileError = new Error();

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(updateFileError);
      })
    }
  };

  githubHelper(githubMock).updateEventFile().catch(function(error) {
    t.equal(error, updateFileError, 'error is returned');

    t.end();
  })
});

test('updateEventFile: promise resolves with result when file is updated', function (t) {
  t.plan(1);

  var updateFileResult = 'foo';

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(null, updateFileResult);
      })
    }
  };

  githubHelper(githubMock).updateEventFile().then(function(result) {
    t.equal(result, updateFileResult, 'result is returned');

    t.end();
  })
});
