module.exports = function createEventFile(github, config, filename, content, message) {
  return new Promise(function(resolve, reject) {
    github.repos.createFile({
      user: config.github.org,
      repo: config.github.repos.gitevent,
      path: filename,
      content: content,
      message: message
    }, function(error, result) {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}
