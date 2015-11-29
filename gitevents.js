var http = require('http');
var config = require('./common/config');
var debug = require('debug')('gitevents');
var talks = require('./lib/talks');
var gitWebhook = require('github-webhook-handler');
var GitHubApi = require('github');

if (!config || !config.github) {
  process.exit(-1);
}

var hookHandler = gitWebhook({
  path: '/github/delivery',
  secret: config.github.secret
});

hookHandler.on('error', function(err) {
  console.log(err);
});

hookHandler.on('issues', function(event) {
  debug('New event: ' + event.event);

  if (event.payload) {
    var payload = event.payload;

    if (payload.action === 'opened') {
      // nothing to do yet
    }

    if (payload.action === 'labeled') {
      var github = new GitHubApi({
        version: '3.0.0',
        debug: config.debug,
        protocol: 'https',
        timeout: 5000,
        headers: {
          'user-agent': 'GitEvents'
        }
      });
      var labels;

      github.authenticate({
        type: 'oauth',
        token: config.github.token
      });

      debug('label: ' + payload.label.name);

      if (payload.labels) {
        labels = payload.labels.map(function(label) {
          return label.name;
        });
      } else {
        labels = payload.label.name;
      }

      github.user.getFrom({
        user: payload.sender.login
      }, function(error, user) {
        if (error) {
          console.log('Something went terribly wrong and we don\'t have error reporting set up!');
          console.log(error);
          //TODO: add raygun.io / sentry / firebase error reporting here.
        } else {
          payload.gitHubUser = user;

          if (labels.indexOf(config.labels.proposal) > -1) {
            debug('New talk proposal. Nothing to do yet');
          }

          //TODO: "talk proposal" contains "talk", so this should be refactored. Going with "proposal" for now.
          if (labels.indexOf(config.labels.talk) > -1) {
            debug('New talk: ' + payload.issue.title);

            talks(payload, github, function(onFulfilled, onRejected) {
              console.log('talk processed.');
            });
          }
        }
      });
    }
  } else {
    debug('no action recognised.', event);
  }
});

http.createServer(function(req, res) {
  hookHandler(req, res, function(err) {
    res.statusCode = 404;
    res.end();
  });
}).listen(3000);
