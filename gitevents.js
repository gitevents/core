var config = require('./common/config');
var constructPlugin = require('./lib/constructPlugin');
var debug = require('debug')('gitevents');
var talks = require('./lib/talks');
var events = require('./lib/events');
var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');
var jobs = require('gitevents-jobs');
var meetup = require('gitevents-meetup');
var crypto = require('crypto');

if (config.rollbar) {
  var rollbar = require('rollbar');
  rollbar.init(config.rollbar);
}

if (config.opbeat) {
  var opbeat = require('opbeat').start({
    organizationId: config.opbeat.organizationId,
    appId: config.opbeat.appId,
    secretToken: config.opbeat.secretToken
  });
}

jobs.init(config);
meetup.init(config);

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

if (!config || !config.github) {
  process.exit(-1);
}

var issueHandler = function issueHandler(event) {
  debug('New event: ' + event.event);

  if (event.payload) {
    var payload = event.payload;

    if (payload.action === 'labeled') {
      debug('label: ' + payload.label.name);

      var labels = [];

      if (payload.labels) {
        labels = payload.labels.map(function(label) {
          return label.name;
        });
      } else {
        labels = payload.label.name;
      }
      payload.labelMap = labels;

      if (labels.indexOf(config.labels.proposal) > -1) {
        debug('New talk proposal. Nothing to do yet');
      }

      // Chain for planning events
      if (labels.indexOf(config.labels.event) > -1) {
        debug('New event planning.');

        events(payload).then(function(event) {
          // !! add event-related plugins here, for example tito !!
          console.log(event);
          meetup.create(event).then(function(meetupId) {
            console.log(meetupId);
          });
        }).catch(function(error) {
          console.log('error');
          console.log(error);

          if (config.rollbar) {
            rollbar.handleError(error);
          }
          if (config.opbeat) {
            opbeat.captureError(error);
          }

        });
        if (tito) {
          console.log('tito ahoy');
          tito(config.plugins[tito], payload);
        }

      }

      // Chain for talks
      //TODO: 'talk proposal' contains 'talk', so this should be refactored. Going with 'proposal' for now.
      if (labels.indexOf(config.labels.talk) > -1) {
        debug('New talk: ' + payload.issue.title);

        events(payload).then(function(event) {
          talks(payload, event).then(function(talk) {
            console.log('talk processed.');
          });
        }).catch(function(error) {
          console.log('error');
          console.log(error);
          if (config.rollbar) {
            rollbar.handleError(error);
          }
          if (config.opbeat) {
            opbeat.captureError(error);
          }
        });
      }
    }
  } else {
    debug('no action recognised.', event);
  }
};

app.post('/github/delivery', function(req, res) {
  debug('delivery');

  var signature = req.headers['x-hub-signature'];
  var event = req.headers['x-github-event'];
  var id = req.headers['x-github-delivery'];

  var payload = '';
  try {
    payload = JSON.stringify(req.body);
  } catch (error) {
    rollbar.handleError(error);
  }

  var hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(payload);
  var calculatedSignature = 'sha1=' + hmac.digest('hex');

  if (!signature) {
    debug('No X-Hub-Signature found on request');
    res.status(400).send('No X-Hub-Signature found on request');
  } else if (!event) {
    debug('No X-Github-Event found on request');
    res.status(400).send('No X-Github-Event found on request');
  } else if (!id) {
    debug('No X-Github-Delivery found on request');
    res.status(400).send('No X-Github-Delivery found on request');
  } else if (signature !== calculatedSignature) {
    debug('X-Hub-Signature does not match blob signature');
    res.status(400).send('X-Hub-Signature does not match blob signature');
  } else {
    debug('processing payload');

    issueHandler({
      event: event,
      id: id,
      payload: req.body,
      protocol: req.protocol,
      host: req.headers.host,
      url: req.url
    });

    res.send({
      'ok': true
    });
  }
});

app.use(jobs);

var server = app.listen(app.get('port'), function() {
  console.log('gitevents server listening on port ' + server.address().port);
  // debug('gitevents server listening on port ' + server.address().port);
});
