var debug = require('debug')('gitevents-talks');
var parser = require('markdown-parse');
var moment = require('moment');
var yaml = require('json2yaml');
var S = require('string');
var GitHubApi = require('github');
var config = require('../common/config');

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

var createTalk = function createTalk(commit, markdown, github) {
  return new Promise(function(resolve, reject) {
    debug('creating new talk md');

    var file = new Buffer(markdown)
      .toString('base64');

    github.repos.createContent({
      user: config.github.user,
      repo: config.github.repo,
      path: commit.filename,
      content: file,
      message: 'Created ' + commit.name + ' by @' + commit.user
    }, function(error) {
      if (error) {
        reject(new Error(error));
      }
      resolve();
    });
  });
};

var updateTalk = function updateTalk(commit, markdown, github, sha) {
  return new Promise(function(resolve, reject) {
    debug('updating talk md');

    file = new Buffer(markdown)
      .toString('base64');

    github.repos.updateFile({
      user: config.github.user,
      repo: config.github.repo,
      path: commit.filename,
      sha: sha,
      content: file,
      message: 'Updated ' + commit.name + ' by @' + commit.user
    }, function(error) {
      if (error) {
        debug(error);
        reject(new Error(error));
      }
      debug('All done. Returning.');
      resolve();
    });
  });
};

module.exports = function talk(issue, superEvent) {
  return new Promise(function(resolve, reject) {
    debug('processing talk');

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

    github.user.getFrom({
      user: issue.user.login
    }, function(error, speaker) {
      debug('speaker found: ' + speaker.login);

      if (error) {
        debug(error);
        return reject(error);
      }

      var milestonePresent = Promise.resolve();

      milestonePresent = checkMilestone(issue.milestone, github, {
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
        parser(issue.body, function(error, body) {
          if (error) {
            debug(error);
            reject(new Error('invalid markdown or markdown error'));
          }

          var talk = config.schema.default_talk;

          talk.githubId = issue.id;
          talk.id = moment(superEvent.startDate)
            .format('YYYYMMDD') + '-' + S(issue.title)
            .slugify()
            .s;
          talk.performer = {
            'context': 'http://schema.org',
            'type': 'Person',
            githubId: speaker.id,
            id: S(speaker.name)
              .slugify()
              .s,
            name: speaker.name,
            location: speaker.location,
            github: speaker.login,
            gravatar: speaker.gravatar_id,
            url: speaker.url,
            image: speaker.avatar_url
          };
          talk.superEvent = {
            'context': 'http://schema.org',
            'type': 'Social event',
            url: superEvent.url,
            id: superEvent.id,
            name: superEvent.name
          };
          talk.name = issue.title;
          talk.startDate = superEvent.startDate;
          talk.url = config.schema.default_talk_url + talk.id + '.html';

          if (body.attributes.twitter) {
            talk.performer.twitter = body.attributes.twitter;
          }

          if (body.attributes.language) {
            talk.inLanguage = body.attributes.language;
          }

          if (body.attributes.level) {
            talk.level = body.attributes.level;
          }

          if (body.attributes.tags) {
            talk.tags = body.attributes.tags;
          }

          var markdown = yaml.stringify(talk);
          markdown += '\n\n---\n';
          markdown += body.body;

          var commit = {
            filename: config.paths.talks + talk.id + '.md',
            user: issue.user.login,
            name: talk.id
          };

          github.repos.getContent({
            user: config.github.user,
            repo: config.github.repo,
            path: commit.filename
          }, function(error, talkFile) {
            if (error && error.code === 404) {
              createTalk(commit, markdown, github)
                .then(function() {
                  resolve();
                })
                .catch(function(error) {
                  reject(error);
                });
            } else {
              updateTalk(commit, markdown, github, talkFile.sha)
                .then(function() {
                  resolve();
                })
                .catch(function(error) {
                  reject(error);
                });
            }
          });
        });
      });
    });
  });
};
