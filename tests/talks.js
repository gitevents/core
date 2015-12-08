var talks = require('../lib/talks');
var test = require('tape');
var nock = require('nock');

var issue = require('./github/labeled_talk_with_milestone');
var testevent = require('./data/event');
var testuser = require('./data/testuser');

// nock.recorder.rec();

test.skip('creates a new talk', function(t) {
  nock('https://api.github.com:443')
    .get('/users/testuser')
    .query({
      'access_token': 'helloworld'
    })
    .reply(200, testuser)
    .get('/repos/gitevents/playground/contents/src%2Fdata%2Ftalks20151208-your-awesome-talk.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(404, {
      'message': 'Not Found',
      'documentation_url': 'https://developer.github.com/v3'
    })
    .put('/repos/gitevents/playground/contents/src%2Fdata%2Ftalks20151208-your-awesome-talk.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(201, {
      'content': {
        'name': 'talks20151208-your-awesome-talk.md',
        'path': 'src/data/talks20151208-your-awesome-talk.md',
        'sha': '04f54f70a04953938428a3afe88b9fbbe126babc',
        'size': 643,
        'url': 'https://api.github.com/repos/gitevents/playground/contents/src/data/talks20151208-your-awesome-talk.md?ref=master',
        'html_url': 'https://github.com/gitevents/playground/blob/master/src/data/talks20151208-your-awesome-talk.md',
        'git_url': 'https://api.github.com/repos/gitevents/playground/git/blobs/04f54f70a04953938428a3afe88b9fbbe126babc',
        'download_url': 'https://raw.githubusercontent.com/gitevents/playground/master/src/data/talks20151208-your-awesome-talk.md',
        'type': 'file',
        '_links': {
          'self': 'https://api.github.com/repos/gitevents/playground/contents/src/data/talks20151208-your-awesome-talk.md?ref=master',
          'git': 'https://api.github.com/repos/gitevents/playground/git/blobs/04f54f70a04953938428a3afe88b9fbbe126babc',
          'html': 'https://github.com/gitevents/playground/blob/master/src/data/talks20151208-your-awesome-talk.md'
        }
      },
      'commit': {
        'sha': '38764a1923e72846d414c4e2804b33d3926cbe5b',
        'url': 'https://api.github.com/repos/gitevents/playground/git/commits/38764a1923e72846d414c4e2804b33d3926cbe5b',
        'html_url': 'https://github.com/gitevents/playground/commit/38764a1923e72846d414c4e2804b33d3926cbe5b',
        'author': {
          'name': 'Patrick Heneise',
          'email': 'patrick@fastmail.im',
          'date': '2015-12-08T14:46:32Z'
        },
        'committer': {
          'name': 'Patrick Heneise',
          'email': 'patrick@fastmail.im',
          'date': '2015-12-08T14:46:32Z'
        },
        'tree': {
          'sha': 'c45c1ffd744fcbcfd1237bfd5cdd829e7c6a762e',
          'url': 'https://api.github.com/repos/gitevents/playground/git/trees/c45c1ffd744fcbcfd1237bfd5cdd829e7c6a762e'
        },
        'message': 'Created src/data/talks20151208-your-awesome-talk.md',
        'parents': [{
          'sha': 'fcbd28c6d705b4a181af976d628a3ca3e9f4901d',
          'url': 'https://api.github.com/repos/gitevents/playground/git/commits/fcbd28c6d705b4a181af976d628a3ca3e9f4901d',
          'html_url': 'https://github.com/gitevents/playground/commit/fcbd28c6d705b4a181af976d628a3ca3e9f4901d'
        }]
      }
    });

  var talk = issue.issue;
  talks(talk, testevent).then(function() {
    t.end();
  }).catch(function(error) {
    t.error(error);
  });
});
