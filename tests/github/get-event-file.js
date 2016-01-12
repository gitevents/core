var test = require('tape');
var sinon = require('sinon');

var getEventFile = require('../../lib/github/get-event-file');

var configStub = {
  github: {
    org: 'foo',
    repos: {
      gitevent: 'bar'
    }
  }
}

test('correct params are used to get file', function (t) {
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

  getEventFile(githubMock, configStub, filepath).then(function() {
    t.equal(
      githubMock.repos.getContent.calledWith(query),
      true,
      'github.repos.getContent called with the correct query parameters'
    );

    t.end();
  });
});

test('promise rejects with error object when file is not found', function (t) {
  t.plan(1);

  var errorObj = { code: 404 };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(errorObj);
      })
    }
  };

  getEventFile(githubMock, configStub).catch(function(error) {
    t.deepEqual(error, errorObj, 'error object is returned');

    t.end();
  })
});

test('promise resolves with file object when file is found', function (t) {
  t.plan(1);

  var fileObj = { content: 'quz' };

  var githubMock = {
    repos: {
      getContent: sinon.spy(function(query, cb) {
        cb(null, fileObj);
      })
    }
  };

  getEventFile(githubMock, configStub).then(function(file) {
    t.deepEqual(file, fileObj, 'file object is returned');

    t.end();
  })
});
