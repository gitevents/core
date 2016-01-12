module.exports = function getEventFile(github, config, filename) {
  return new Promise(function(resolve, reject) {
    github.repos.getContent({
      user: config.github.org,
      repo: config.github.repos.gitevent,
      path: filename
    }, function(error, eventFile) {
      if (error) {
        reject(error);
      }

      resolve(eventFile);
    });
  });
}
