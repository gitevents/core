var config = require('../../config');
var nock = require('nock');
var sinon = require('sinon');
var test = require('tape');

var talks = require('../../lib/talks');

// do not allow real http requests
nock.disableNetConnect();

test('talks: error is returned if failed to get user details for the issue author user', function (t) {
  nock.cleanAll();

  var payload = {
    issue: {
      user: {
        login: 'foo'
      }
    }
  };

  var userNotFoundErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(404, { message: userNotFoundErrorMessage });

  talks(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, userNotFoundErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('talks: error is returned if a milestone is not included in the payload and a comment is left on the issue', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      number: 1,
      user: {
        login: 'bar'
      }
    }
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .post(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.speakers + '/issues/' + payload.issue.number + '/comments'), {
      body: new RegExp('@' + payload.sender.login)
    })
    .reply(201);

  talks(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.equal(error, 'missing_milestone', 'correct error message is returned');

    t.end();
  });
});

test('talks: error is returned when the issue body can not be parsed', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: 12345, // incorrect type will cause markdown parsing to fail
      milestone: {},
      number: 1,
      user: {
        login: 'bar'
      }
    }
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login });

  talks(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      t.equal(error.message, 'invalid markdown or markdown error', 'correct error message is returned');
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('talks: error is returned if failed to create new talk', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var talkNotCreatedErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Created (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(500, { message: talkNotCreatedErrorMessage });

  talks(payload, superEvent).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, talkNotCreatedErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('talks: error is returned if failed to update existing talk', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var talkNotUpdatedErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(200, {
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Updated (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(500, { message: talkNotUpdatedErrorMessage });

  talks(payload, superEvent).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, talkNotUpdatedErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('talks: talk is created if it does not exist', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Created (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(201);

  talks(payload, superEvent).then(function() {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.end();
  });
});

test('talks: talk is updated if it exists', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(200, {
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Updated (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(200);

  talks(payload, superEvent).then(function() {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.end();
  });
});

test('talks: talk has correct data', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Created (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(201);

  talks(payload, superEvent).then(function(talk) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    // @todo check it uses config.schema.default_talk

    t.equal(talk.github, payload.issue.url, 'talk has correct github url');
    t.equal(talk.id, '20991231-example-title', 'talk has correct github id');
    t.equal(talk.name, payload.issue.title, 'talk has correct title');
    t.equal(talk.startDate, superEvent.startDate, 'talk has correct start date');
    t.equal(talk.url, config.schema.default_talk_url + talk.id + '.html', 'talk has correct URL');

    var expectedSuperEvent = {
      type: 'Social event',
      url: superEvent.url,
      id: superEvent.id,
      name: superEvent.name
    };

    t.deepEqual(talk.superEvent, expectedSuperEvent, 'talk has correct super event');

    var expectedPerformer = {
      type: 'Person',
      githubId: speaker.id,
      id: 'example-speaker',
      name: speaker.name,
      location: speaker.location,
      github: speaker.login,
      gravatar: speaker.gravatar_id,
      url: speaker.url,
      image: speaker.avatar_url
    };

    t.deepEqual(talk.performer, expectedPerformer, 'talk has correct speaker');

    t.end();
  });
});

test('talks: talk has correct data: additional body attributes are added to talk', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      body: '---\r\ntwitter: foo\r\nlanguage: en\r\nlevel: beginner\r\ntags: foo, bar\r\n\r\n---',
      milestone: {},
      number: 1,
      title: 'Example Title',
      url: 'http://www.example.com/issue/1',
      user: {
        login: 'bar'
      }
    }
  };

  var superEvent = {
    startDate: '2099-12-31T19:00:00Z',
    url: 'http://www.example.com/event/1',
    id: 1,
    name: 'Example Event'
  };

  var speaker = {
    login: payload.issue.user.login,
    id: 1,
    name: 'Example Speaker',
    location: {},
    gravatar_id: 'example-speaker-gravatar',
    url: 'http://www.example.com/speaker/example-speaker',
    avatar_url: 'http://www.example.com/speaker/example-speaker.jpg'
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, speaker)
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).md'), {
      message: new RegExp('Created (.*) by @' + payload.issue.user.login),
      content: /.*/
    })
    .reply(201);

  talks(payload, superEvent).then(function(talk) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (talk.performer.twitter) {
      t.pass('talk speaker has twitter handle');

      t.equal(talk.performer.twitter, 'foo', 'talk speaker has correct twitter handle');
    }

    if (talk.performer.language) {
      t.pass('talk has a language');

      t.equal(talk.language, 'en', 'talk has correct language');
    }

    if (talk.performer.level) {
      t.pass('talk has a level');

      t.equal(talk.level, 'beginner', 'talk has correct level');
    }

    if (talk.performer.tags) {
      t.pass('talk has a tags');

      t.equal(talk.tags, 'foo, bar', 'talk has correct tags');
    }

    t.end();
  });
});
