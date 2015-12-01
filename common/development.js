'use strict';

var github = require('./github.credentials');
var meetup = require('./meetup.credentials');
var auth = require('./auth.credentials');

module.exports = {
  debug: true,
  mail: {},
  url: 'http://barcelonajs.org',
  github: github,
  auth: auth,
  meetup: meetup,
  labels: {
    job: 'jobs',
    talk: 'talk',
    proposal: 'proposal'
  }
};
