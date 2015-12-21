'use strict';
var fs = require('fs');
var path = require('path');

var meetup = {};
var github = require('./github.credentials');

try {
  fs.accessSync(__dirname + '/meetup.credentials.js');
  meetup = require('./meetup.credentials');
} catch (e) {
  console.log('Missing meetup credentials, running without');
}

module.exports = {
  debug: true,
  about: 'Barcelona.JS is a usergroup focused on JavaScript and related topics.',
  rollbar: '42a385da90554f4c9005121b8c1c5bac',
  date_format: 'DD.MM.YYYY',
  mail: {},
  paths: {
    talks: 'src/talks/',
    events: 'src/events/'
  },
  url: 'http://barcelonajs.org',
  github: github,
  meetup: meetup,
  labels: {
    job: 'jobs',
    talk: 'talk',
    proposal: 'proposal',
    event: 'event'
  },
  ticketing: {
    provider: 'ti.to',
    url: 'https://ti.to/barcelonajs/'
  },
  schema: {
    default_organizer: {
      'type': 'Organization',
      'address': {
        'type': 'PostalAddress',
        'addressLocality': 'Barcelona, Spain',
        'postalCode': '08003',
        'streetAddress': 'C/ Mare de Deu del Pilar 20'
      },
      'email': 'hola(at)barcelonajs.org',
      'name': 'BarcelonaJS',
      'url': 'http://barcelonajs.org'
    },
    default_talk_url: '/talk/',
    default_event_url: '/event/',
    default_start_time: '18:45',
    default_talk: {
      'context': 'http://schema.org',
      'type': 'Educational event',
      'duration': 'P30M'
    },
    default_event: {
      'context': 'http://schema.org',
      'type': 'Social event',
      'location': {
        'type': 'Place',
        'address': {
          'type': 'PostalAddress',
          'addressLocality': 'Barcelona, Spain',
          'postalCode': '08001',
          'streetAddress': 'C/ Fontanella 2',
          'name': 'Mobile World Centre'
        },
        'url': 'http://barcelonajs.org',
        'duration': 'P2H'
      },
      doorTime: '18:45',
      inLanguage: {
        'type': 'Language',
        'name': 'English'
      }
    },
    default_offers: {
      'type': 'Offer',
      'url': 'https://ti.to/barcelonajs',
      'price': '0',
      'priceCurrency': 'EUR',
      'availability': 'http://schema.org/InStock'
    }
  }
};
