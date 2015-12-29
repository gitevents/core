var config = require('./common/config');
var debug = require('debug')('gitevents');
var talks = require('./lib/talks');
var events = require('./lib/events');
var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');
var rollbar = require('rollbar');
var jobs = require('gitevents-jobs');
var crypto = require('crypto');

rollbar.init(config.rollbar);
jobs.init(config);

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
        }).catch(function(error) {
          console.log('error');
          console.log(error);
          rollbar.handleError(error);
        });
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
          rollbar.handleError(error);
        });
      }
    }
  } else {
    debug('no action recognised.', event);
  }
};

app.post('/github/delivery', function(req, res) {
  var signature = req.headers['x-hub-signature'];
  var event = req.headers['x-github-event'];
  var id = req.headers['x-github-delivery'];

  if (!signature) {
    res.status(400).send('No X-Hub-Signature found on request');
  }

  if (!event) {
    res.status(400).send('No X-Github-Event found on request');
  }

  if (!id) {
    res.status(400).send('No X-Github-Delivery found on request');
  }

  var payload = '';
  try {
    payload = JSON.stringify(req.body);
  } catch (e) {
    res.send(500);
  }

  var hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(payload);
  var calculatedSignature = 'sha1=' + hmac.digest('hex');
  if (signature !== calculatedSignature) {
    res.status(400).send('X-Hub-Signature does not match blob signature');
  }

  issueHandler({
    event: event,
    id: id,
    payload: payload,
    protocol: req.protocol,
    host: req.headers.host,
    url: req.url
  });

  res.status(200).send({
    'ok': true
  });
});

app.use(jobs);

var server = app.listen(app.get('port'), function() {
  console.log('gitevents server listening on port ' + server.address().port);
  // debug('gitevents server listening on port ' + server.address().port);
});
