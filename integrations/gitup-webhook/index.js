// this is a demo integration.

var webhook = function webhook(config) {

  var process = function process(req, callback) {
    // debugging config params
    console.log(config.github);

    return callback(null, {
      'date': '2014-02-12T23:00:00.000Z',
      'talks': [{
        'title': 'Using the API Blueprint to generate nodejs consumers',
        'speaker': {
          'twitter': 'bpedro',
          'name': 'Bruno Pedro',
          'portrait': 'https://pbs.twimg.com/profile_images/378800000473642830/2f20ecdcd1ec41452b174d04a69e87ee.jpeg'
        },
        'level': 'Intermediate',
        'language': 'en',
        'git': '',
        'slides': 'http://www.slideshare.net/bpedro/api-code-generation',
        'video': 'https://vimeo.com/87488883',
        'description': 'I\'ll show you how to generate a nodejs API consumer by using the API Blueprint (http://apiblueprint.org/) to generate code from a Postman (http://www.getpostman.com/) collection.'
      }]
    });
  }
}

exports = module.exports = webhook;
