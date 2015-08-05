var debug = require('debug')('gitevents-handler');
var config = require('../common/config');

var CreateHandler = require('github-webhook-handler');
var handler = CreateHandler({
  path: '/github/delivery',
  secret: config.github.secret
})

// integrations
var webhook = require('gitevents-webhook')(config);
var meetup = require('gitevents-meetup')(config);
// twitter = require('./integrations/gitup-twitter')(config);

function noop(res){
  res.statusCode(204);
  res.end('noop');
}

module.exports = function(req, res) {
  if (req.method === 'POST') {
    handler(req, res, function (err) {
      if(err) noop(res)
    })
  } else noop(res)
};

handler.on('error', function(err) {
  console.log(err);
})

handler.on('event', function(event) {
  console.log(event.payload);
  //work payload
  webhook.process(event.payload, function (err, res) {
    if(err) console.log(err);
    else meetup.process(res)
  })
})
