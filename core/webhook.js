var debug = require('debug')('gitup:webhook');
var EventEmitter = require('events').EventEmitter;
var eventBus = new EventEmitter();

module.exports = {
	/**
	 * use this for subscribing to events from github
	 * var webhook = require('webhook').bus;
	 * webhook.on('issues', function(eventData){})
	 */
	bus: eventBus,
	/**
	 * @param {String} event
	 * @param {Object} eventData
	 */
	webhook: function webhook(event, eventData) {
		debug('event emitted: ', event, eventData);
		eventBus.emit(event, eventData);
	}
};
