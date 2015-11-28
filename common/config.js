var config = {};
var https = require('https');
var fs = require('fs');
var path = require('path');

config.load = function(fn) {
  if (process.env.NODE_ENV === 'production') {
    fs.access(path.join(__dirname, 'production.js'), fs.R_OK, function(error, exists) {
      if (exists) {
        config = require('./production');
      } else {
        var file = fs.createWriteStream(path.join(__dirname, 'production.js'));
        var url = process.env.CONFIG_URL;

        if (!url) {
          process.exit(-1);
        } else {
          https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              file.close(function() {
                return fn(require('./production'));
              });
            });
          });
        }
      }
    });
  } else if (process.env.NODE_ENV === 'test') {
    return fn(require('./test'));
  } else {
    return fn(require('./development'));
  }
};

module.exports = exports = config;
