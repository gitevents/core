var config = require('../../common/config');
var debug = require('debug')('gitevents-events');
var githubHelper = require('../github-helper');

module.exports = function createUpdateEvent(event, github) {
  return new Promise(function(resolve, reject) {
    debug('createOrUpdateEvent()');

    var commit = {
      filename: config.paths.events + event.id + '.json',
      name: event.name
    };

    githubHelper(github).getEventFile(commit.filename)
      .then(function(eventsFile) {
        var contents = new Buffer(eventsFile.content, eventsFile.encoding).toString('utf8');
        var previousEvent = JSON.parse(contents);

        //TODO: what needs updating?

        var file = new Buffer(JSON.stringify(event, null, 2)).toString('base64');
        var message = 'Updated event ' + previousEvent.id;

        githubHelper(github).updateEventFile(commit.filename, eventsFile.sha, file, message)
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
          githubHelper(github).createEventFile(commit.filename, file, message)
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
