var http = require('http');
var debug = require('debug')('gitevents');

var handler = require('./lib/handler');

var server = http.createServer(handler)
server.listen(3000)

