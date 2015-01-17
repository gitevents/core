var debug = require('debug')('gitup:webhook');
var EventEmitter = require('events').EventEmitter;
var eventBus = new EventEmitter();

/**
 * use this for subscribing to events from github, supply express.js app, get a
 * var webhook = require('./integrations/gitup-webhook.js')(app);
 * webhook.on('issues', function(eventData){})
 */
module.exports = function(app) {
	app.post('/github/delivery', function (req, res) {
		var header = req.header('X-Github-Event');
		debug('webhook called with', header);
		eventBus.emit(header, req.body);
		res.sendStatus(200);
	});

	return eventBus;
};