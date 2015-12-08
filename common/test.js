'use strict';

module.exports = {
  debug: false,
  mail: {},
  about: 'Barcelona.JS is a usergroup focused on JavaScript and related topics.',
  url: 'http://gitevents.org',
  paths: {
    talks: 'src/data/talks/',
    events: 'src/data/events/'
  },
  github: {
    user: 'gitevents',
    repo: 'playground',
    secret: 'helloworld',
    token: 'helloworld'
  },
  ticketing: {
    provider: 'ti.to',
    url: 'https://ti.to/gitevents/'
  },
  meetup: {
    token: 'abc',
    group: 'Meetup-API-Testing',
    duration: 7200000,
    default_venue_id: 12260922,
    group_id: 1556336
  },
  labels: {
    job: 'jobs',
    talk: 'talk',
    proposal: 'proposal'
  },
  schema: {
    default_organizer: {
      'context': 'http://schema.org',
      'type': 'Organization',
      'address': {
        'type': 'PostalAddress',
        'addressLocality': 'Barcelona, London',
        'postalCode': '12345',
        'streetAddress': 'Git Corp'
      },
      'email': 'hola(at)gitevents.org',
      'name': 'gitevents',
      'url': 'http://gitevents.org'
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
          'postalCode': '12345',
          'streetAddress': 'GitStreet',
          'name': 'Git Event Centre'
        },
        'url': 'http://gitevents.org',
        'duration': 'P2H'
      },
      'offers': {
        'type': 'Offer',
        'url': 'https://ti.to/gitevents',
        'price': '0',
        'priceCurrency': 'EUR',
        'availability': 'http://schema.org/InStock'
      },
      doorTime: '18:45',
      inLanguage: {
        'type': 'Language',
        'name': 'English'
      }
    }
  }
};
