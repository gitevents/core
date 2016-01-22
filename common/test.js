'use strict';

module.exports = {
  github: {
    org: 'test-org',
    repos: {
      gitevent: 'test-gitevent-repo',
      speakers: 'test-speakers-repo'
    },
    token: 'test-token'
  },
  labels: {
    talk: 'talk',
    event: 'event',
  },
  date_format: 'DDMMYYYY',
  paths: {
    talks: 'src/talks/',
    events: 'src/events/'
  },
  schema: {
    default_organizer: {
      'type': 'Organization',
      'address': {
        'type': 'PostalAddress',
        'addressLocality': 'Organizer City, Organizer Country',
        'postalCode': 'Organizer Postal Code',
        'streetAddress': 'Organizer Street Address'
      },
      'email': 'organizer(at)example.com',
      'name': 'Organizer',
      'url': 'http://www.example.com/organizer'
    },
    default_talk_url: '/talk/',
    default_event_url: '/event/',
    default_start_time: '19:00',
    default_talk: {
      type: 'Educational event',
      duration: 'PT30M'
    },
    default_event: {
      context: 'http://schema.org',
      type: 'Social event',
      location: {
        type: 'Place',
        address: {
          type: 'PostalAddress',
          addressLocality: 'Location City, Location Country',
          postalCode: 'Location Postal Code',
          streetAddress: 'Location Street Address',
          name: 'Location Name'
        },
        url: 'http://www.example.com/location'
      },
      url: 'http://www.example.com/event',
      duration: 'PT2H',
      doorTime: '18:45',
      inLanguage: {
        type: 'Language',
        name: 'English'
      }
    }
  }
};
