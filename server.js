var
  debug = require('debug')('gitup'),
  config = require('./common/config'),
  http = require('http');

// integrations
webhook = require('./integrations/gitup-webhook')(config);
// twitter = require('./integrations/gitup-twitter')(config);



/* delivery, example:
{
'action': 'labeled',
'issue': {
'url': 'https://api.github.com/repos/octocat/Hello-World/issues/1347',
'number': 1347,
...
},
'repository' : {
'id': 1296269,
'full_name': 'octocat/Hello-World',
'owner': {
'login': 'octocat',
'id': 1,
...
},
...
},
'sender': {
'login': 'octocat',
'id': 1,
...
}
}
*/

http.createServer(function (request, response) {
    console.log('incoming');
    console.log(request);

    response.writeHeader(200, {
      'Content-Type': 'text/plain'
    });
    response.write('Hello World');
    response.end();
  })
  .listen(3000);

console.log('GitUp listening on 3000');
