var events = require('../lib/events');
var test = require('tape');
var nock = require('nock');

test.skip('issue: opened does nothing.', function(t) {
  // issue_opened.json
  // live tested
});

test.skip('issue: labeled proposal does nothing.', function(t) {
  // labeled_proposal.json
  // live tested
});

test.skip('issue: labeled talk - throw error when a milestone is missing', function(t) {
  // labeled_talk_without_milestone.json
  // live tested
});

test.skip('issue: labeled talk  - creates a new event file at first run with valid data', function(t) {
  nock('https://api.github.com:443')
    .get('/users/testuser')
    .query({
      'access_token': 'helloworld'
    })
    .reply(200, require('./data/testuser'))
    .get('/repos/gitevents/playground/contents/src%2Fdata%2Fevents%2F20341231-some-nodejs-event-in-the-future.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(404, {
      'message': 'Not Found',
      'documentation_url': 'https://developer.github.com/v3'
    })
    .put('/repos/gitevents/playground/contents/src%2Fdata%2Fevents%2F20341231-some-nodejs-event-in-the-future.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(201, {
      'content': {
        'name': '20341231-some-nodejs-event-in-the-future.md',
        'path': 'src/data/events/20341231-some-nodejs-event-in-the-future.md',
        'sha': 'dd9a299e4fb8e48db7930c081b0f29b1baac54e9',
        'size': 1236,
        'url': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/events/some-nodejs-event-in-the-future.md?ref=master',
        'html_url': 'https://github.com/GitEvents/playground/blob/master/src/data/events/some-nodejs-event-in-the-future.md',
        'git_url': 'https://api.github.com/repos/GitEvents/playground/git/blobs/dd9a299e4fb8e48db7930c081b0f29b1baac54e9',
        'download_url': 'https://raw.githubusercontent.com/GitEvents/playground/master/src/data/events/some-nodejs-event-in-the-future.md',
        'type': 'file',
        '_links': {
          'self': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/events/some-nodejs-event-in-the-future.md?ref=master',
          'git': 'https://api.github.com/repos/GitEvents/playground/git/blobs/dd9a299e4fb8e48db7930c081b0f29b1baac54e9',
          'html': 'https://github.com/GitEvents/playground/blob/master/src/data/events/some-nodejs-event-in-the-future.md'
        }
      },
      'commit': {
        'sha': '3f3ccab812b40772a840b2a1f33e5c7a30c72ecc',
        'url': 'https://api.github.com/repos/GitEvents/playground/git/commits/3f3ccab812b40772a840b2a1f33e5c7a30c72ecc',
        'html_url': 'https://github.com/GitEvents/playground/commit/3f3ccab812b40772a840b2a1f33e5c7a30c72ecc',
        'author': {
          'name': 'Patrick Heneise',
          'email': 'patrick@fastmail.im',
          'date': '2015-12-08T16:54:06Z'
        },
        'committer': {
          'name': 'Patrick Heneise',
          'email': 'patrick@fastmail.im',
          'date': '2015-12-08T16:54:06Z'
        },
        'tree': {
          'sha': '5e7def14593264ad9971499d6281d216ac6864f2',
          'url': 'https://api.github.com/repos/GitEvents/playground/git/trees/5e7def14593264ad9971499d6281d216ac6864f2'
        },
        'message': 'Created event some-nodejs-event-in-the-future',
        'parents': [{
          'sha': 'b638ab6cff2bea5c8916653c5243024316dfed84',
          'url': 'https://api.github.com/repos/GitEvents/playground/git/commits/b638ab6cff2bea5c8916653c5243024316dfed84',
          'html_url': 'https://github.com/GitEvents/playground/commit/b638ab6cff2bea5c8916653c5243024316dfed84'
        }]
      }
    });

  var issue = require('./github/labeled_talk_with_milestone');

  events(issue).then(function(resolved) {
    t.end();
  }).catch(function(error) {
    console.log(error);
    t.error(error);
  });
});

test('issue: labeled talk - checks existing data and does not overwrite', function(t) {
  nock('https://api.github.com:443')
    .filteringRequestBody(function(body) {
      return '*';
    })
    .get('/users/testuser')
    .query({
      'access_token': 'helloworld'
    })
    .reply(200, require('./data/testuser'))
    .get('/repos/gitevents/playground/contents/src%2Fdata%2Fevents%2F20341231-some-nodejs-event-in-the-future.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(200, {
      'name': '20341231-some-nodejs-event-in-the-future.md',
      'path': 'src/data/events/20341231-some-nodejs-event-in-the-future.md',
      'sha': '24d3a8bcff2621aff360f1ddf184e1912d72468f',
      'size': 1377,
      'url': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/events/20341231-some-nodejs-event-in-the-future.md?ref=master',
      'html_url': 'https://github.com/GitEvents/playground/blob/master/src/data/events/20341231-some-nodejs-event-in-the-future.md',
      'git_url': 'https://api.github.com/repos/GitEvents/playground/git/blobs/24d3a8bcff2621aff360f1ddf184e1912d72468f',
      'download_url': 'https://raw.githubusercontent.com/GitEvents/playground/master/src/data/events/20341231-some-nodejs-event-in-the-future.md',
      'type': 'file',
      'content': 'LS0tCiAgY29udGV4dDogImh0dHA6Ly9zY2hlbWEub3JnIgogIHR5cGU6ICJT\nb2NpYWwgZXZlbnQiCiAgbG9jYXRpb246IAogICAgdHlwZTogIlBsYWNlIgog\nICAgYWRkcmVzczogCiAgICAgIHR5cGU6ICJQb3N0YWxBZGRyZXNzIgogICAg\nICBhZGRyZXNzTG9jYWxpdHk6ICJCYXJjZWxvbmEgU3BhaW4iCiAgICAgIHBv\nc3RhbENvZGU6ICIwODAwMyIKICAgICAgc3RyZWV0QWRkcmVzczogIkMvIEZv\nbnRhbmVsbGEgMiIKICAgIG5hbWU6ICJNb2JpbGUgV29ybGQgQ2VudHJlIgog\nIG9mZmVyczogCiAgICB0eXBlOiAiT2ZmZXIiCiAgICB1cmw6ICJodHRwczov\nL3RpLnRvL2JhcmNlbG9uYWpzL3NvbWUtbm9kZWpzLWV2ZW50LWluLXRoZS1m\ndXR1cmUiCiAgICBwcmljZTogIjAiCiAgICBwcmljZUN1cnJlbmN5OiAiRVVS\nIgogICAgYXZhaWxhYmlsaXR5OiAiaHR0cDovL3NjaGVtYS5vcmcvSW5TdG9j\nayIKICBkb29yVGltZTogIjE4OjQ1IgogIGluTGFuZ3VhZ2U6IAogICAgdHlw\nZTogIkxhbmd1YWdlIgogICAgbmFtZTogIkVuZ2xpc2giCiAgaWQ6ICJzb21l\nLW5vZGVqcy1ldmVudC1pbi10aGUtZnV0dXJlIgogIG9yZ2FuaXplcjogCiAg\nICBjb250ZXh0OiAiaHR0cDovL3NjaGVtYS5vcmciCiAgICB0eXBlOiAiT3Jn\nYW5pemF0aW9uIgogICAgYWRkcmVzczogCiAgICAgIHR5cGU6ICJQb3N0YWxB\nZGRyZXNzIgogICAgICBhZGRyZXNzTG9jYWxpdHk6ICJCYXJjZWxvbmEsIFNw\nYWluIgogICAgICBwb3N0YWxDb2RlOiAiMDgwMDMiCiAgICAgIHN0cmVldEFk\nZHJlc3M6ICJDLyBNYXJlIGRlIERldSBkZWwgUGlsYXIgMjAiCiAgICBlbWFp\nbDogImhvbGEoYXQpYmFyY2Vsb25hanMub3JnIgogICAgbmFtZTogIkJhcmNl\nbG9uYUpTIgogICAgdXJsOiAiaHR0cDovL2JhcmNlbG9uYWpzLm9yZyIKICBn\naXRodWJJZDogOTM5ODgxCiAgdXJsOiAiL2V2ZW50L3NvbWUtbm9kZWpzLWV2\nZW50LWluLXRoZS1mdXR1cmUuaHRtbCIKICBuYW1lOiAiU29tZSBOb2RlSlMg\nRXZlbnQgaW4gdGhlIEZ1dHVyZSIKICBzdGFydERhdGU6ICIyMDM0LTEyLTMx\nVDE5OjAwIgogIHBlcmZvcm1lcjogCiAgICAtIAogICAgICB0eXBlOiAiUGVy\nc29uIgogICAgICBpbWFnZTogImh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2Vy\nY29udGVudC5jb20vdS8xOTQ4MD92PTMiCiAgICAgIG5hbWU6IG51bGwKICAg\nICAgaWQ6ICJ5b3VyLWF3ZXNvbWUtdGFsayIKICAgICAgc2FtZUFzOiAiaHR0\ncHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy90ZXN0dXNlciIKICAgICAgdXJs\nOiAiL3RhbGsvMjAzNDEyMzEteW91ci1hd2Vzb21lLXRhbGsuaHRtbCIKCgot\nLS0KQmFyY2Vsb25hLkpTIGlzIGEgdXNlcmdyb3VwIGZvY3VzZWQgb24gSmF2\nYVNjcmlwdCBhbmQgcmVsYXRlZCB0b3BpY3Mu\n',
      'encoding': 'base64',
      '_links': {
        'self': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/events/20341231-some-nodejs-event-in-the-future.md?ref=master',
        'git': 'https://api.github.com/repos/GitEvents/playground/git/blobs/24d3a8bcff2621aff360f1ddf184e1912d72468f',
        'html': 'https://github.com/GitEvents/playground/blob/master/src/data/events/20341231-some-nodejs-event-in-the-future.md'
      }
    })
    .get('/repos/gitevents/playground/contents/src%2Fdata%2Ftalks%2F20341231-your-awesome-talk.md')
    .query({
      'access_token': 'helloworld'
    })
    .reply(200, {
      'name': '20341231-your-awesome-talk.md',
      'path': 'src/data/talks/20341231-your-awesome-talk.md',
      'sha': 'ac42f7c056dfcb8e8fe9af865083eddfd1483e08',
      'size': 853,
      'url': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/talks/20341231-your-awesome-talk.md?ref=master',
      'html_url': 'https://github.com/GitEvents/playground/blob/master/src/data/talks/20341231-your-awesome-talk.md',
      'git_url': 'https://api.github.com/repos/GitEvents/playground/git/blobs/ac42f7c056dfcb8e8fe9af865083eddfd1483e08',
      'download_url': 'https://raw.githubusercontent.com/GitEvents/playground/master/src/data/talks/20341231-your-awesome-talk.md',
      'type': 'file',
      'content': 'LS0tCiAgY29udGV4dDogImh0dHA6Ly9zY2hlbWEub3JnIgogIHR5cGU6ICJF\nZHVjYXRpb25hbCBldmVudCIKICBkdXJhdGlvbjogIlAzME0iCiAgZ2l0aHVi\nSWQ6IDExOTM2NzYwNgogIGlkOiAiMjAzNDEyMzEteW91ci1hd2Vzb21lLXRh\nbGsiCiAgcGVyZm9ybWVyOiAKICAgIGNvbnRleHQ6ICJodHRwOi8vc2NoZW1h\nLm9yZyIKICAgIHR5cGU6ICJQZXJzb24iCiAgICBnaXRodWJJZDogMTk0ODAK\nICAgIGlkOiAibnVsbCIKICAgIG5hbWU6IG51bGwKICAgIGxvY2F0aW9uOiBu\ndWxsCiAgICBnaXRodWI6ICJ0ZXN0dXNlciIKICAgIGdyYXZhdGFyOiAiIgog\nICAgdXJsOiAiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy90ZXN0dXNl\nciIKICAgIGltYWdlOiAiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250\nZW50LmNvbS91LzE5NDgwP3Y9MyIKICAgIHR3aXR0ZXI6ICJQYXRyaWNrSGVu\nZWlzZSIKICBzdXBlckV2ZW50OiAKICAgIGNvbnRleHQ6ICJodHRwOi8vc2No\nZW1hLm9yZyIKICAgIHR5cGU6ICJTb2NpYWwgZXZlbnQiCiAgICB1cmw6ICIv\nZXZlbnQvc29tZS1ub2RlanMtZXZlbnQtaW4tdGhlLWZ1dHVyZS5odG1sIgog\nICAgaWQ6ICJzb21lLW5vZGVqcy1ldmVudC1pbi10aGUtZnV0dXJlIgogICAg\nbmFtZTogIlNvbWUgTm9kZUpTIEV2ZW50IGluIHRoZSBGdXR1cmUiCiAgbmFt\nZTogIllvdXIgQXdlc29tZSBUYWxrIgogIHN0YXJ0RGF0ZTogIjIwMzQtMTIt\nMzFUMTk6MDAiCiAgdXJsOiAiL3RhbGsvMjAzNDEyMzEteW91ci1hd2Vzb21l\nLXRhbGsuaHRtbCIKICBpbkxhbmd1YWdlOiAiZW4iCiAgbGV2ZWw6ICJiZWdp\nbm5lciIKCgotLS0KDQpZb3VyIGF3ZXNvbWUgdGFsayBkZXNjcmlwdGlvbg==\n',
      'encoding': 'base64',
      '_links': {
        'self': 'https://api.github.com/repos/GitEvents/playground/contents/src/data/talks/20341231-your-awesome-talk.md?ref=master',
        'git': 'https://api.github.com/repos/GitEvents/playground/git/blobs/ac42f7c056dfcb8e8fe9af865083eddfd1483e08',
        'html': 'https://github.com/GitEvents/playground/blob/master/src/data/talks/20341231-your-awesome-talk.md'
      }
    })
    .put('/repos/gitevents/playground/contents/src%2Fdata%2Ftalks%2F20341231-your-awesome-talk.md', '*')
    .query({
      'access_token': 'helloworld'
    })
    .reply(201, {
      'content': {
        'name': '20151208-your-awesome-talk.md',
        'path': 'src/data/talks20151208-your-awesome-talk.md',
        'sha': 'ac42f7c056dfcb8e8fe9af865083eddfd1483e08',
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
        'message': 'Updated src/data/talks20151208-your-awesome-talk.md',
        'parents': [{
          'sha': 'fcbd28c6d705b4a181af976d628a3ca3e9f4901d',
          'url': 'https://api.github.com/repos/gitevents/playground/git/commits/fcbd28c6d705b4a181af976d628a3ca3e9f4901d',
          'html_url': 'https://github.com/gitevents/playground/commit/fcbd28c6d705b4a181af976d628a3ca3e9f4901d'
        }]
      }
    });

  var issue = require('./github/labeled_talk_with_milestone');
  // nock.recorder.rec();
  events(issue).then(function(resolved) {
    t.end();
  }).catch(function(error) {
    console.log(error);
    t.error(error);
  });
});

test.skip('issue: labeled talk  - udates talk information in an event',
  function(t) {
    // comment_created.json
    // each comment from the issue owner should trigger an update on the talk
    // a comment from the repo owner should also trigger an update, just in case
  });

test.skip('issue: labeled talk  - verify important data isn\'t overwritten with an update',
  function(t) {
    // labeled_talk_with_milestone.json
    // check that talk.speaker, created_at etc. are the same as before and everything else is updated
  });

test.skip('issue: unlabeled talk should remove a talk from the event',
  function(t) {
    // unlabeled_talk_with_milestone.json
    //TODO: remove talk not implemented yet
  });

test.skip('issue: closed should move a talk to `history.json`', function(t) {
  // closed_talk.json
  //TODO: archive talk not implemented yet
});
