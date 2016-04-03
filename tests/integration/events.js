var config = require('../../config');
var nock = require('nock');
var rewire = require('rewire');
var sinon = require('sinon');
var test = require('tape');

var events = rewire('../../lib/events');

// do not allow real http requests
nock.disableNetConnect();

test('events: error is returned if failed to get user details for the repo user', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    }
  };

  var userNotFoundErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(404, { message: userNotFoundErrorMessage });

  events(payload).catch(function(error) {
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

test('events: error is returned if failed to get user details for the issue author user', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      }
    }
  };

  var userNotFoundErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(404, { message: userNotFoundErrorMessage });

  events(payload).catch(function(error) {
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

test('events: error is returned when the issue body can not be parsed', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: 12345 // incorrect type will cause markdown parsing to fail
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login });

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');
    t.equal(error instanceof Error, true, 'error returned');

    t.end();
  });
});

test('events: error is returned when the parsed issue body does not have a date', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: ''
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login });

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      t.equal(error.message, 'invalid event. Date missing.', 'correct error message is returned');
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('events: error is returned if failed to create new event', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var eventNotCreatedErrorMessage = 'foo bar baz';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(500, { message: eventNotCreatedErrorMessage });

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, eventNotCreatedErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('events: error is returned if failed to update existing event', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var eventNotUpdatedErrorMessage = 'foo bar baz';
  var previousEventId = 1;
  var existingFileContents = '{"id":' +previousEventId + '}';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + previousEventId,
      content: /.*/
    })
    .reply(500, { message: eventNotUpdatedErrorMessage });

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, eventNotUpdatedErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('events: event is created if it does not exist', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function() {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');
    t.end();
  });
});

test('events: event is updated if it exists', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var previousEventId = 1;
  var existingFileContents = '{"id":' +previousEventId + '}';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + previousEventId,
      content: /.*/
    })
    .reply(200);

  events(payload).then(function() {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.end();
  });
});

test('events: event has correct data', function (t) {
  nock.cleanAll();

  var payloadIssueUrl = 'http://www.example.com/foo';

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      url: payloadIssueUrl,
      body: "---\r\nname: Example Name\r\ndate: 31.12.2099\r\n\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function(result) {
    if (!githubRequests.isDone()) {
      t.fail('expected http requests were not made to github');
    }

    // @todo check it uses config.schema.default_event

    t.equal(result.startDate, '2099-12-31T19:00:00Z', 'event has correct start date');
    t.equal(result.id, '20991231-example-name', 'event has correct ID');
    t.deepEqual(result.organizer, config.schema.default_organizer, 'event has correct organizer');
    t.equal(result.github, payloadIssueUrl, 'event has correct github issue URL');
    t.equal(result.url, config.schema.default_event_url + '20991231-example-name.html', 'event has correct URL');
    t.equal(result.name, 'Example Name', 'event has correct name');
    t.equal(result.about, config.about, 'event has correct about information');
    t.deepEqual(result.location, config.schema.default_event.location, 'event has correct location');

    t.end();
  });
});

test('events: event has correct data: supplied start time is used', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\ntime: '19:45'\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function(result) {
    if (!githubRequests.isDone()) {
      t.fail('expected http requests were not made to github');
    }

    t.equal(result.startDate, '2099-12-31T19:45:00Z', 'event has correct start time');

    t.end();
  });
});

test('events: event has correct data: supplied start time is formatted', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\ntime: '.19,45'\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function(result) {
    if (!githubRequests.isDone()) {
      t.fail('expected http requests were not made to github');
    }

    t.equal(result.startDate, '2099-12-31T.19:45:00Z', 'event has correct start time');

    t.end();
  });
});

test('events: event has correct data: address is formatted', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\naddress: Example Street Address, Example Postal Code, Example Address Locality\r\n\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function(result) {
    if (!githubRequests.isDone()) {
      t.fail('expected http requests were not made to github');
    }

    var expectedLocation = {
      address: {
        type: 'PostalAddress',
        addressLocality: ' Example Address Locality',
        postalCode: ' Example Postal Code',
        streetAddress: 'Example Street Address'
      },
      type: config.schema.default_event.location.type,
      url: config.schema.default_event.location.url
    };

    t.deepEqual(result.location, expectedLocation, 'event has correct location');

    t.end();
  });
});

test('events: event has correct data: address has venue', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      user: {
        login: 'bar'
      },
      body: "---\r\ndate: 31.12.2099\r\nvenue: Example Venue\r\naddress: Example Street Address, Example Postal Code, Example Address Locality\r\n\r\n---"
    },
    labelMap: [config.labels.event]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404)
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: /Created event/,
      content: /.*/
    })
    .reply(201);

  events(payload).then(function(result) {
    if (!githubRequests.isDone()) {
      t.fail('expected http requests were not made to github');
    }


    t.deepEqual(result.location.address.name, 'Example Venue', 'event has correct venue');

    t.end();
  });
});

test('events: error is returned if a milestone is not included on a talk proposal and a comment is left on the issue', function (t) {
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
    },
    labelMap: [config.labels.talk]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .post(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.speakers + '/issues/' + payload.issue.number + '/comments'), {
      body:  new RegExp('@' + payload.sender.login)
    })
    .reply(201);

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      t.equal(error.message, 'missing_milestone', 'correct error message is returned');
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('events: error is returned if a talk cannot be added to an event due to event not existing', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz'
      },
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(404);

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.equal(error, 'event not found.', 'correct error message is returned');

    t.end();
  });
});

test('events: error is returned if failed to add talk to an event', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz'
      },
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var eventNotUpdatedErrorMessage = 'foo bar baz';
  var eventId = 1;
  var existingFileContents = '{"id":' + eventId + '}';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + eventId,
      content: /.*/
    })
    .reply(500, { message: eventNotUpdatedErrorMessage });

  events(payload).catch(function(error) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (error instanceof Error) {
      t.pass('error returned');

      try {
        var errorJson = JSON.parse(error.message);
      } catch (e) {
        t.fail('failed to parse error message')
      }

      if (errorJson.message) {
        t.equal(errorJson.message, eventNotUpdatedErrorMessage, 'correct error message is returned');
      } else {
        t.fail('error does not contain a message')
      }
    } else {
      t.fail('invalid error returned');
    }

    t.end();
  });
});

test('events: talk is added to event', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz'
      },
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var eventId = 1;
  var existingFileContents = '{"id":' + eventId + '}';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + eventId,
      content: /.*/
    })
    .reply(200);

  events(payload).then(function() {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    t.end();
  });
});

test('events: talk is not added to event if it already exists', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz',
        due_on: '2099-12-31T19:45:00Z'
      },
      title: 'Example title',
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var existingEvent = {
    id: 1,
    performer: [
      {
        id: "20991231-example-title"
      }
    ]
  };

  var existingFileContents = JSON.stringify(existingEvent);

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    });

  events(payload).then(function(event) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');
    t.deepEqual(event, existingEvent, 'event is returned');

    t.end();
  });
});

test('events: talk has correct data', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz',
        due_on: '2099-12-31T19:45:00Z'
      },
      title: 'Example title',
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var eventId = 1;
  var existingFileContents = '{"id":' + eventId + '}';
  var speakerAvatarUrl = 'http://www.example.com/avatar/bar';
  var speakerName = 'bar';
  var speakerUrl = 'http://www.example.com/bar';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, {
      login: payload.issue.user.login,
      avatar_url:speakerAvatarUrl,
      name: speakerName,
      url: speakerUrl
    })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + eventId,
      content: /.*/
    })
    .reply(200);

  events(payload).then(function(event) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');

    if (event.performer && event.performer.length == 1) {
      t.pass('event has correct number of speakers');

      var speaker = event.performer[0];

      t.equal(speaker.image, speakerAvatarUrl, 'speaker has correct avatar url');
      t.equal(speaker.name, speakerName, 'speaker has correct name');
      t.equal(speaker.id, '20991231-example-title', 'speaker has correct id');
      t.equal(speaker.sameAs, speakerUrl, 'speaker has correct URL');
      t.equal(speaker.url, config.schema.default_talk_url + '20991231-example-title.html', 'talk has correct URL');
    } else {
      t.fail('event does not have correct number of performers');
    }

    t.end();
  });
});

test('events: talk: speaker is added to existing speakers', function (t) {
  nock.cleanAll();

  var payload = {
    sender: {
      login: 'foo'
    },
    issue: {
      milestone: {
        description: 'foo-bar-baz',
        due_on: '2099-12-31T19:45:00Z'
      },
      title: 'Example title',
      number: 1,
      user: {
        login: 'bar'
      }
    },
    labelMap: [config.labels.talk]
  };

  var eventId = 1;
  var existingFileContents = '{"id":' + eventId + ',"performer":[{}]}';

  var githubRequests = nock(/api\.github\.com:443/)
    .get(new RegExp('/users/' + payload.sender.login))
    .reply(200, { login: payload.sender.login })
    .get(new RegExp('/users/' + payload.issue.user.login))
    .reply(200, { login: payload.issue.user.login })
    .get(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'))
    .reply(200, {
      content: existingFileContents,
      encoding: 'utf8',
      sha: 'abc12345'
    })
    .put(new RegExp('/repos/' + config.github.org + '/' + config.github.repos.gitevent + '/contents/(.+).json'), {
      message: 'Updated event ' + eventId,
      content: /.*/
    })
    .reply(200);

  events(payload).then(function(event) {
    t.equal(githubRequests.isDone(), true, 'expected http requests made to github');
    t.equal(event.performer.length, 2, 'event has correct number of speakers');

    t.end();
  });
});
