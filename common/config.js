var config;

if (process.env.NODE_ENV === 'testing') {
  config = require('./testing');
} else {
  config = require('./development');
}

module.exports = exports = config;
