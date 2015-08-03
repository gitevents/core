github = require('./github.config');

module.exports = {
	debug: true,
	mail: {},
	github: github,
	meetup: {
		apikey: ''
	},
	labels: {
		job: 'jobs',
		talk: 'talk',
		proposal: 'talk proposal'
	},
	twitter:{
		consumer_key: '',
	    consumer_secret: '',
	    token: '',
	    token_secret: ''
	}
};
