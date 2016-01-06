'use strict';
var fs = require('fs');
var path = require('path');
var github = require('./github.credentials');

module.exports = {
  about: 'Barcelona.JS is a usergroup focused on JavaScript and related topics.',
  url: 'http://barcelonajs.org',
  labels: {
    job: 'jobs',
    talk: 'talk',
    proposal: 'proposal',
    event: 'event'
  },
  plugins: [{
    name: 'gitevents-tito',
    required: true,
    authToken: 'aNNaTBmpFqMtEA3TVYyy',
    account: 'nottsjs'
  }],
  date_format: 'DDMMYYYY',
  paths: {
    talks: 'src/talks/',
    events: 'src/events/'
  },
  github: github,
  debug: false,
  rollbar: '',
};
