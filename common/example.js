module.exports = {
  debug: false,
  about: 'A line that is copied into every event.md file as content.',
  rollbar: '<if you have a rollbar account>',

  date_format: 'DD.MM.YYYY',
  mail: {},
  paths: {
    talks: 'src/talks/',
    events: 'src/events/'
  },
  url: 'http://barcelonajs.org',
  github: {
    user: '<the acting github username>',
    repos: {
      planning: '<target user>/<target planning repo>',
      speakers: '<target user>/<target speakers repo>',
      gitevent: '<target user>/<target gitevent repo>'
    },
    secret: '<a random secret that you copy into all webhook settings as secret>',
    token: '<personal access token from https://github.com/settings/tokens>'
  },
  labels: {
    job: 'job',
    talk: 'talk',
    proposal: 'proposal',
    event: 'event'
  },
  schema: {
    default_organizer: {
      'type': 'Organization',
      'address': {
        'type': 'PostalAddress',
        'addressLocality': '<city, country>',
        'postalCode': '<postcode>',
        'streetAddress': '<address>'
      },
      'email': '<organisation email>',
      'name': '<organisation  name>',
      'url': '<organisation url>'
    },
    default_talk_url: '/talk/',
    default_event_url: '/event/',
    default_start_time: '19:00',
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
          'addressLocality': '<city, country>',
          'postalCode': '<postcode>',
          'streetAddress': '<address>'
          'name': '<venue name>'
        },
        'url': 'http://barcelonajs.org',
        'duration': 'P2H'
      },
      doorTime: '18:45',
      inLanguage: {
        'type': 'Language',
        'name': 'English'
      }
    }
  }
};
