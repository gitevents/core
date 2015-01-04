var
  debug = require('debug')('talks'),
  express = require('express'),
  config = require('../common/config'),
  async = require('async'),
  parser = require('markdown-parse'),
  crypto = require('crypto'),
  moment = require('moment'),
  router = express.Router();

router.post('/delivery', function (req, res) {
  var
    hmac,
    calculatedSignature,
    payload = req.body;

  hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(JSON.stringify(payload));
  calculatedSignature = 'sha1=' + hmac.digest('hex');

  if (req.headers['x-hub-signature'] !== calculatedSignature) {
    res.status(403).send('Forbidden');
  } else {
    debug('delivery', payload.action);
    if (payload.action === 'labeled') {
      if (payload.label.name === 'talk proposal') {
        var doc = {
          'id': 'talk-' + payload.issue.id,
          'type': 'talk',
          'title': payload.issue.title,
          'speaker': {
            'github': payload.issue.user.login,
            'gravatar': payload.issue.user.gravatar_id,
            'portrait': payload.issue.user.avatar_url
          }
        };

        // YAML parser freaks out with @-handles
        if (payload.issue.body.indexOf('@') > -1) {
          payload.issue.body = payload.issue.body.replace('@', '');
        }

        parser(payload.issue.body, function (error, result) {
          if (error) {
            debug('parser', error);
          }

          doc.description = result.body;

          if (result.attributes.language) {
            doc.language = result.attributes.language;
          }

          if (result.attributes.level) {
            doc.level = result.attributes.level;
          }

          if (result.attributes.tags) {
            doc.tags = result.attributes.tags;
          }

          if (result.attributes.twitter) {
            doc.speaker.twitter = result.attributes.twitter;
          }

          if (payload.issue.milestone) {

          } else {

          }
        });
      } else {
        res.status(200).send('Thanks.');
      }
    } else if (payload.action === 'closed') {
      if (payload.issue.milestone) {

      } else {
        res.status(200).send('Thanks.');
      }
    } else {
      res.status(200).send();
    }
  }
});

module.exports = router;
