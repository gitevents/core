var config = require('../../common/config');
var debug = require('debug')('gitevents-events');
var githubEventFile = require('../github-event-file');

module.exports = function createUpdateEvent(event, github) {
  return new Promise(function(resolve, reject) {
    debug('createOrUpdateEvent()');

    var commit = {
      filename: config.paths.events + event.id + '.json',
      name: event.name
    };

    githubEventFile(github).get(commit.filename)
      .then(function(eventsFile) {
        var contents = new Buffer(eventsFile.content, eventsFile.encoding).toString('utf8');
        var previousEvent = JSON.parse(contents);

        //TODO: what needs updating?

        var file = new Buffer(JSON.stringify(event, null, 2)).toString('base64');
        var message = 'Updated event ' + previousEvent.id;

        githubEventFile(github).update(commit.filename, eventsFile.sha, file, message)
          .then(function() {
            resolve(event);
          })
          .catch(function(error) {
            debug(error);
            return reject(new Error(error));
          });
      })
      .catch(function(error) {
        if (error && error.code === 404) {
          debug('event not found. Creating event.');
          event.about = config.about;

          var file = new Buffer(JSON.stringify(event, null, 2)).toString('base64');
          var message = 'Created event ' + event.id;

          debug('GitHub:createFile()');
          githubEventFile(github).create(commit.filename, file, message)
            .then(function() {
              return resolve(event);
            })
            .catch(function(error) {
              return reject(new Error(error));
            });
        }
      });
  });
}
