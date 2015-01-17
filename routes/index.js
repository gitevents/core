var express = require('express');
var router = express.Router();
var debug = require('debug')('gitup:router');
var webhookProcessor = require('../core/webhook').webhook;

/* GET home page. */
router.post('/delivery', function(req, res) {
  var header = req.header('X-Github-Event');
  debug('webhook called with', header);
  webhookProcessor(header, req.body);
  res.sendStatus(200);
});

module.exports = router;
