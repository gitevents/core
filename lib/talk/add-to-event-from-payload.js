var config = require('../../common/config');
var debug = require('debug')('gitevents-events');
var githubEventFile = require('../github-event-file');
var moment = require('moment');
var S = require('string');

module.exports = function addTalkToEventFromPayload(payload, speaker, github) {
  return new Promise(function(resolve, reject) {
    debug('addTalk()');

    var eventId = payload.issue.milestone.description;

    var commit = {
      filename: config.paths.events + eventId + '.json'
    };

    githubEventFile(github).get(commit.filename)
      .then(function(eventsFile){
        var talks = [];
        var contents = new Buffer(eventsFile.content, eventsFile.encoding).toString('utf8');
        var event = JSON.parse(contents);

        var talkId = moment(payload.issue.milestone.due_on, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMMDD') + '-' + S(payload.issue.title).slugify().s;

        var performer = {
          'type': 'Person',
          'image': speaker.avatar_url,
          'name': speaker.name,
          'id': talkId,
          'sameAs': speaker.url,
          'url': config.schema.default_talk_url + talkId + '.html'
        };

        if (event.performer) {
          event.performer.map(function(p) {
            talks.push(p.id);
          });

          if (talks.indexOf(talkId) > -1) {
            // talk exists, do nothing for now
            return resolve(event);
          } else {
            event.performer.push(performer);
          }
        } else {
          event.performer = [(performer)];
        }

        var file = new Buffer(JSON.stringify(event, null, 2)).toString('base64');
        var message = 'Updated event ' + event.id;

        githubEventFile(github).update(commit.filename, eventsFile.sha, file, message)
          .then(function() {
            return resolve(event);
          })
          .catch(function(error) {
            debug(error);
            return reject(new Error(error));
          });
      })
      .catch(function() {
        return reject('event not found.');
      });
  });
};
