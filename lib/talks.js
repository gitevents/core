var debug = require('debug')('gitevents-talks');
var parser = require('markdown-parse');
var moment = require('moment');
var config = require('../common/config');

var updateEvents = function(payload, talk, github) {
  return new Promise(function(resolve, reject) {
    debug('Found existing events. Parsing.');

    var readableEvents;

    try {
      readableEvents = JSON.parse(new Buffer(events.content, 'base64').toString('ascii'));
    } catch (error) {
      debug('JSON parse error', error);
      reject(new Error(error));
    }

    var githubEventId = payload.issue.milestone.id;
    var foundEventId = readableEvents.findById(githubEventId);
    var message;

    if (foundEventId !== -1) {
      debug('Found event.');

      var talkId = readableEvents[foundEventId].talks.findById(payload.issue.id);

      if (talkId !== -1) {
        debug('Updating existing talk.');
        talk = readableEvents[foundEventId].talks[talkId];

        talk.updated_at = new Date().toJSON();
        talk.created_at = readableEvents[foundEventId].talks[talkId].created_at;
        talk.speaker = readableEvents[foundEventId].talks[talkId].speaker;
        readableEvents[foundEventId].talks[talkId] = talk;
        message = 'Updated talk by ' + talk.speaker.github;
      } else {
        debug('Adding new talk.');

        talk.accepted_at = new Date().toJSON();
        talk.type = 'talk';
        readableEvents[foundEventId].talks.push(talk);
        message = 'Added talk by ' + talk.speaker.github;
      }
    } else {
      debug('No event found. Creating and adding talk.');

      event.talks = [];
      talk.accepted_at = new Date().toJSON();
      talk.type = 'talk';
      event.talks.push(talk);
      readableEvents.push(event);
      message = 'Created new event and added talk by ' + talk.speaker.github;
    }

    debug('Writing file.');
    file = new Buffer(JSON.stringify(readableEvents, null, 2)).toString('base64');

    github.repos.updateFile({
      user: config.github.user,
      repo: config.github.repo,
      path: 'events-' + new Date(payload.issue.created_at).getFullYear() + '.json',
      sha: events.sha,
      content: file,
      message: message
    }, function(error) {
      if (error) {
        debug(error);
        reject(new Error(error));
      }
      debug('All done. Returning.');
      resolve(event);
    });
  });
};

var createEvents = function(payload, talk, github) {
  return new Promise(function(resolve, reject) {
    debug('events file doesn\'t exist. Creating a new one.');

    var date = moment(payload.issue.milestone.due_on).toArray();
    var time = payload.issue.milestone.description.split(';')[0].split(':');
    date[3] = parseInt(time[0], 10);
    date[4] = parseInt(time[1], 10);

    if (!date[4]) {
      date[4] = 0;
    }

    var event = {
      id: payload.issue.milestone.id,
      type: 'event',
      location: {
        name: payload.issue.milestone.description.split(';')[1],
        address: payload.issue.milestone.description.split(';')[2]
      },
      date: moment.utc(date).toJSON(),
      name: payload.issue.milestone.title
    };

    event.talks = [];
    talk.accepted_at = new Date().toJSON();
    talk.type = 'talk';
    event.talks.push(talk);
    events = [event];

    file = new Buffer(JSON.stringify(events, null, 2)).toString('base64');

    github.repos.createContent({
      user: config.github.user,
      repo: config.github.repo,
      path: 'events-' + new Date(payload.issue.updated_at).getFullYear() + '.json',
      content: file,
      message: 'Created events'
    }, function(error) {
      if (error) {
        reject(new Error(error));
      }
      resolve(event);
    });
  });
};

module.exports = function process(payload, github) {
  return new Promise(
    function(resolve, reject) {
      Object.prototype.findById = function(id) {
        for (var i = 0; i < this.length; i++) {
          if (this[i].id === id) {
            return i;
          }
        }
        return -1;
      };

      debug('processing talk');

      if (!payload.issue.milestone) {
        debug('Missing milestone');
        github.issues.createComment({
          user: config.github.user,
          repo: config.github.repo,
          number: payload.issue.number,
          body: '@' + payload.sender.login +
            ' please assign a milestone (= Event) first, then label the issue as a talk.'
        }, function(error, success) {
          console.log(error, success);
          reject(new Error('No Milestone (=Event) defined.'));
        });
      } else {
        var user = payload.gitHubUser;

        parser(payload.issue.body, function(error, body) {
          if (error) {
            reject(new Error('invalid markdown or markdown error'));
          }

          var talk = {
            id: payload.issue.id,
            type: 'talk',
            speaker: {
              id: user.id,
              name: user.name,
              location: user.location,
              github: user.login,
              gravatar: user.gravatar_id,
              avatar: user.avatar_url
            },
            title: payload.issue.title,
            description: body.html
          };

          if (body.attributes.twitter) {
            talk.speaker.twitter = body.attributes.twitter;
          }

          if (body.attributes.language) {
            talk.language = body.attributes.language;
          }

          if (body.attributes.level) {
            talk.level = body.attributes.level;
          }

          if (body.attributes.month) {
            talk.month = body.attributes.month;
          }

          if (body.attributes.tags) {
            talk.tags = body.attributes.tags;
          }

          github.repos.getContent({
            user: config.github.user,
            repo: config.github.repo,
            path: 'events-' + new Date(payload.issue.updated_at).getFullYear() + '.json'
          }, function(error, eventsFile) {
            if (error && error.code === 404) {
              createEvents(payload, talk, github).then(function(onRejected, onFulfilled) {
                console.log(onRejected, onFulfilled);
              });
            } else {
              updateEvents(payload, talk, github, eventsFile).then(function(onRejected, onFulfilled) {
                console.log(onRejected, onFulfilled);
              });
            }
          });
        });
      }
    }
  );
};
