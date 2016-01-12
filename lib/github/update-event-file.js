module.exports = function updateEventFile(github, config, filename, sha, content, message) {
  return new Promise(function(resolve, reject) {
    github.repos.updateFile({
      user: config.github.org,
      repo: config.github.repos.gitevent,
      path: filename,
      sha: sha,
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
