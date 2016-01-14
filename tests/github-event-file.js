var test = require('tape');
var sinon = require('sinon');
var rewire = require('rewire');

var githubEventFile = rewire('../lib/github-event-file');

var configStub = {
  github: {
    org: 'foo',
    repos: {
      gitevent: 'bar'
    }
  }
}

githubEventFile.__set__('config', configStub);

test('get: correct params are used to get file', function (t) {
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

  githubEventFile(githubMock).get(filepath).then(function() {
    t.equal(
      githubMock.repos.getContent.calledWith(query),
      true,
      'github.repos.getContent called with the correct query parameters'
    );

    t.end();
  });
});

test('get: promise rejects with error object when file is not found', function (t) {
  t.plan(1);

  var errorObj = { code: 404 };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(errorObj);
      })
    }
  };

  githubEventFile(githubMock).get().catch(function(error) {
    t.deepEqual(error, errorObj, 'error object is returned');

    t.end();
  })
});

test('get: promise resolves with file object when file is found', function (t) {
  t.plan(1);

  var fileObj = { content: 'quz' };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(null, fileObj);
      })
    }
  };

  githubEventFile(githubMock).get().then(function(file) {
    t.deepEqual(file, fileObj, 'file object is returned');

    t.end();
  })
});

test('create: correct params are used to create file', function (t) {
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

  githubEventFile(githubMock).create(filepath, content, message).then(function() {
    t.equal(
      githubMock.repos.createFile.calledWith(query),
      true,
      'github.repos.createFile called with the correct parameters'
    );

    t.end();
  });
});

test('create: promise rejects with error when file is not created', function (t) {
  t.plan(1);

  var createFileError = new Error();

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(createFileError);
      })
    }
  };

  githubEventFile(githubMock).create().catch(function(error) {
    t.equal(error, createFileError, 'error is returned');

    t.end();
  })
});

test('create: promise resolves with result when file is created', function (t) {
  t.plan(1);

  var createFileResult = 'foo';

  var githubMock = {
    repos: {
      createFile: sinon.spy(function(query, cb) {
        cb(null, createFileResult);
      })
    }
  };

  githubEventFile(githubMock).create().then(function(result) {
    t.equal(result, createFileResult, 'result is returned');

    t.end();
  })
});

test('update: correct params are used to update file', function (t) {
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

  githubEventFile(githubMock).update(filepath, sha, content, message).then(function() {
    t.equal(
      githubMock.repos.updateFile.calledWith(query),
      true,
      'github.repos.updateFile called with the correct parameters'
    );

    t.end();
  });
});

test('update: promise rejects with error when file is not updated', function (t) {
  t.plan(1);

  var updateFileError = new Error();

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(updateFileError);
      })
    }
  };

  githubEventFile(githubMock).update().catch(function(error) {
    t.equal(error, updateFileError, 'error is returned');

    t.end();
  })
});

test('update: promise resolves with result when file is updated', function (t) {
  t.plan(1);

  var updateFileResult = 'foo';

  var githubMock = {
    repos: {
      updateFile: sinon.spy(function(query, cb) {
        cb(null, updateFileResult);
      })
    }
  };

  githubEventFile(githubMock).update().then(function(result) {
    t.equal(result, updateFileResult, 'result is returned');

    t.end();
  })
});
