var config;

if (process.env.NODE_ENV === 'production') {
  config = require('./production');
} else if (process.env.NODE_ENV === 'test') {
  config = require('./test');
} else {
  config = require('./development');
}

module.exports = exports = config;
