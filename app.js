var
  express = require('express'),
  debug = require('debug')('gitup'),
  config = require('./common/config'),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));



app.post('/hook',function(req, resp) {
  console.log('HOOKED', req);
});



app.get('/hook',function(req, resp) {
  console.log('HOOKED GET', req);
});




// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
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






app.listen(app.get('port'), function () {
});
