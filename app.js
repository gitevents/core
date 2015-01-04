var
  express = require('express'),
  debug = require('debug')('node.barcelonajs.org'),
  util = require('util'),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.json());

app.use('/github', require('./routes/github'));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
});
