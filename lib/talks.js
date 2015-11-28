var debug = require('debug')('gitevents-talks');
var config = require('../common/config');

module.exports = function process(payload) {
  return new Promise(
    function(resolve, reject) {
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
        path: 'events-' + new Date(payload.issue.created_at).getFullYear() + '.json'
      }, function(error, proposals) {
        if (error && error.code === 404) {
          talk.updated_at = new Date().toJSON();
          talk.created_at = new Date().toJSON();
          proposals = [proposal];

          file = new Buffer(JSON.stringify(proposals, null, 2)).toString('base64');

          github.repos.createContent({
            user: config.github.user,
            repo: config.github.repo,
            path: 'proposals.json',
            content: file,
            message: 'Created proposals'
          }, function(error) {
            if (error) {
              reject(new Error(error));
            }
            resolve(proposal);
          });
        } else if (error) {
          reject(new Error(error));
        } else {
          // get proposals and update
          var updatedProposals;
          var message;

          try {
            updatedProposals = JSON.parse(new Buffer(proposals.content, 'base64').toString('ascii'));
          } catch (error) {
            reject(new Error(error));
          }

          var id = updatedProposals.findById(talk.id);
          if (id !== -1) {
            debug('Proposal exists. Update.');

            // update the proposal; don't change the speaker
            talk.updated_at = new Date().toJSON();
            talk.created_at = updatedProposals[id].created_at;
            talk.speaker = updatedProposals[id].speaker;
            updatedProposals[id] = proposal;
            message = 'Updated proposal by ' + talk.speaker.github;
          } else {
            debug('Push new talk.');

            talk.created_at = new Date().toJSON();
            updatedProposals.push(proposal);
            message = 'New proposal by ' + talk.speaker.github;
          }

          file = new Buffer(JSON.stringify(updatedProposals, null, 2)).toString('base64');

          github.repos.updateFile({
            user: config.github.user,
            repo: config.github.repo,
            path: 'proposals.json',
            sha: proposals.sha,
            content: file,
            message: message
          }, function(error) {
            if (error) {
              debug(error);
              reject(new Error(error));
            }
            debug('All done. Returning.');
            resolve(proposal);
          });
        }
      });
    }
  );
};
