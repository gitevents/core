'use strict';

const env = process.env.NODE_ENV || 'development';
const bunyan = require('bunyan');

let log = {};

if ('development' === env) {
  log = new bunyan.createLogger({
    name: 'api',
    streams: [{
      stream: process.stdout,
      level: 'debug'
    }],
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });
} else if ('production' === env) {
  log = new bunyan.createLogger({
    name: 'api',
    streams: [{
      stream: process.stdout,
      level: 'info'
    }],
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });
} else {
  log = new bunyan.createLogger({
    name: 'api',
    streams: [{
      stream: process.stdout,
      level: 'fatal'
    }]
  });
}

module.exports = exports = log;
