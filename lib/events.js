var debug = require('debug')('gitevents-events');
var yamlFront = require('yaml-front-matter');
var moment = require('moment');
var yaml = require('json2yaml');
var S = require('string');
var GitHubApi = require('github');
var config = require('../common/config');

var createOrUpdateEvent = function(payload, event, speaker, github) {
  return new Promise(function(resolve, reject) {
    var commit = {
      filename: config.paths.events + moment(event.startDate).format('YYYYMMDD') + '-' + event.id + '.md',
      name: event.id
    };

    github.repos.getContent({
      user: config.github.user,
      repo: config.github.repo,
      path: commit.filename
    }, function(error, eventsFile) {
      var markdown;
      var file;

      if (error && error.code === 404) {
        debug('creating new event.');

        event.performer = [{
          'type': 'Person',
          'image': speaker.avatar_url,
          'name': speaker.name,
          'id': S(payload.issue.title).slugify().s,
          'sameAs': speaker.url,
          'url': config.schema.default_talk_url + moment(event.startDate).format('YYYYMMDD') + '-' + S(payload.issue.title).slugify().s + '.html'
        }];

        markdown = yaml.stringify(event);
        markdown += '\n\n---\n';
        markdown += config.about;

        file = new Buffer(markdown).toString('base64');

        github.repos.createContent({
          user: config.github.user,
          repo: config.github.repo,
          path: commit.filename,
          content: file,
          message: 'Created event ' + event.id
        }, function(error) {
          if (error) {
            return reject(new Error(error));
          }
          return resolve(event);
        });
      } else {
        //TODO: figure out what needs changing
        var talks = [];

        var contents = new Buffer(eventsFile.content, eventsFile.encoding).toString('utf8');
        var previousEvent = yamlFront.loadFront(contents);

        previousEvent.performer.map(function(p) {
          talks.push(p.id);
        });

        if (talks.indexOf(S(payload.issue.title).slugify().s) > -1) {
          // talk exists, do nothing for now
          return resolve(previousEvent);
        } else {
          var performer = {
            'type': 'Person',
            'image': speaker.avatar_url,
            'name': speaker.name,
            'id': S(payload.issue.title).slugify().s,
            'sameAs': speaker.url,
            'url': config.schema.default_talk_url + moment(event.startDate).format('YYYYMMDD') + '-' + S(payload.issue.title).slugify().s + '.html'
          };

          previousEvent.performer.push(performer);

          markdown = yaml.stringify(previousEvent);
          markdown += '\n\n---\n';
          markdown += config.about;

          file = new Buffer(markdown).toString('base64');

          github.repos.updateFile({
            user: config.github.user,
            repo: config.github.repo,
            path: commit.filename,
            sha: eventsFile.sha,
            content: file,
            message: 'Updated event ' + previousEvent.id
          }, function(error) {
            if (error) {
              debug(error);
              return reject(new Error(error));
            }
            return resolve(previousEvent);
          });
        }
      }
    });
  });
};

function checkMilestone(milestone, github, args) {
  return new Promise(function(resolve, reject) {
    if (!milestone) {
      debug('Missing milestone');

      github.issues.createComment({
        user: args.user,
        repo: args.repo,
        number: args.number,
        body: args.body
      }, function() {
        reject('missing_milestone');
      });
    } else {
      return resolve();
    }
  });
}

module.exports = function events(payload) {
  return new Promise(function(resolve, reject) {
    debug('processing event');

    var github = new GitHubApi({
      version: '3.0.0',
      debug: config.debug,
      protocol: 'https',
      timeout: 5000,
      headers: {
        'user-agent': 'GitEvents'
      }
    });

    github.authenticate({
      type: 'oauth',
      token: config.github.token
    });

    var milestonePresent = Promise.resolve();

    milestonePresent = checkMilestone(payload.issue.milestone, github, {
      user: config.github.user,
      repo: config.github.repo,
      number: payload.issue.number,
      body: '@' + payload.sender.login +
        ' please assign a milestone (= Event) first, then label the issue as a talk.'
    });

    milestonePresent.catch(function(e) {
      reject(e);
    });

    milestonePresent.then(function() {
      var time;
      
      github.user.getFrom({
        user: payload.issue.user.login
      }, function(error, speaker) {
        var date = moment(payload.issue.milestone.due_on).toArray();
        var event = config.schema.default_event;
        event.id = S(payload.issue.milestone.title).slugify().s;
        event.organizer = config.schema.default_organizer;
        event.githubId = payload.issue.milestone.id;
        event.offers.url = config.ticketing.url + event.id;
        event.url = config.schema.default_event_url + event.id + '.html';
        event.name = payload.issue.milestone.title;

        if (payload.issue.milestone.description.length > 0) {
          time = payload.issue.milestone.description.split(';')[0].split(':');
          date[3] = parseInt(time[0], 10);
          date[4] = parseInt(time[1], 10);

          if (!date[4]) {
            date[4] = 0;
          }

          event.location = {
            'type': 'Place',
            'address': {
              'type': 'PostalAddress',
              'addressLocality': payload.issue.milestone.description.split(';')[4],
              'postalCode': payload.issue.milestone.description.split(';')[3],
              'streetAddress': payload.issue.milestone.description.split(';')[2]
            },
            'name': payload.issue.milestone.description.split(';')[1]
          };
          event.name = payload.issue.milestone.title;
          event.startDate = moment.utc(date).format('YYYY-MM-DDTHH:mm');
        } else {
          time = config.schema.default_start_time;
          date[3] = parseInt(time[0], 10);
          date[4] = parseInt(time[1], 10);

          if (!date[4]) {
            date[4] = 0;
          }

          event.startDate = moment.utc(date).format('YYYY-MM-DDTHH:mm');
        }

        createOrUpdateEvent(payload, event, speaker, github).then(function() {
          return resolve(event);
        }).catch(function(error) {
          return reject(error);
        });
      });
    });
  });
};
