'use strict';

const config = require('./config');
const talks = require('./lib/talks');
const events = require('./lib/events');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const log = require('./lib/log');

// current plugins
let jobs = require('gitevents-jobs');
let meetup = require('gitevents-meetup');

let rollbar = {};
let opbeat = {};

if (config.rollbar) {
  let rollbar = require('rollbar');
  rollbar.init(config.rollbar);
}

jobs.init(config);
meetup.init(config);

let app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
// app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'application/json'
}));

if (!config || !config.github) {
  process.exit(-1);
}

let issueHandler = (event) => {
  log.debug('New event: ' + event.event);

  if (event.payload) {
    let payload = event.payload;

    if (payload.action === 'labeled') {
      log.debug('label: ' + payload.label.name);

      let labels = [];

      if (payload.labels) {
        labels = payload.labels.map(function (label) {
          return label.name;
        });
      } else {
        labels = payload.label.name;
      }
      payload.labelMap = labels;

      if (labels.indexOf(config.labels.proposal) > -1) {
        log.debug('New talk proposal. Nothing to do yet');
      }

      // Chain for planning events
      if (labels.indexOf(config.labels.event) > -1) {
        log.debug('New event planning.');

        events(payload)
          .then(function (event) {
            // !! add event-related plugins here, for example tito !!
            meetup.create(event)
              .then(function (meetupId) {
                log.debug(meetupId);
              });
          })
          .catch(function (error) {
            log.error(error);

            if (config.rollbar) {
              rollbar.handleError(error);
            }
            if (config.opbeat) {
              opbeat.captureError(error);
            }

          });
      }

      // Chain for talks
      //TODO: 'talk proposal' contains 'talk', so this should be refactored. Going with 'proposal' for now.
      if (labels.indexOf(config.labels.talk) > -1) {
        log.debug('New talk: ' + payload.issue.title);

        events(payload)
          .then(function (event) {
            talks(payload, event)
              .then(function (talk) {
                log.debug('talk processed.');
                log.debug(talk);
              });
          })
          .catch(function (error) {
            log.error(error);
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
    log.debug('no action recognised.', event);
  }
};

app.post('/github/delivery', function (req, res) {
  log.debug('delivery');

  let signature = req.headers['x-hub-signature'];
  let event = req.headers['x-github-event'];
  let id = req.headers['x-github-delivery'];

  let rawPayload = req.body.toString('utf8');
  let hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(rawPayload);

  let calculatedSignature = 'sha1=' + hmac.digest('hex');

  if (!signature) {
    log.debug('No X-Hub-Signature found on request');
    res.status(400)
      .send('No X-Hub-Signature found on request');
  } else if (!event) {
    log.debug('No X-Github-Event found on request');
    res.status(400)
      .send('No X-Github-Event found on request');
  } else if (!id) {
    log.debug('No X-Github-Delivery found on request');
    res.status(400)
      .send('No X-Github-Delivery found on request');
  } else if (signature !== calculatedSignature) {
    log.debug('X-Hub-Signature does not match blob signature');
    res.status(400)
      .send('X-Hub-Signature does not match blob signature');
  } else {
    log.debug('processing payload');

    let payload = {};

    try {
      payload = JSON.parse(rawPayload);
    } catch (e) {
      log.error(e);
    }

    issueHandler({
      event: event,
      id: id,
      payload: payload,
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

let server = app.listen(app.get('port'), function () {
  log.info('gitevents server listening on port ' + server.address()
    .port);
});
