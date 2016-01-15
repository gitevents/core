module.exports = githubEventFile;

function githubEventFile(github, config) {
  return {
    /**
     * Retrieve an existing event file
     *
     * @param {string} filename
     * @returns {Promise}
     */
    get: function (filename) {
      return new Promise(function (resolve, reject) {
        github.repos.getContent({
          user: config.github.org,
          repo: config.github.repos.gitevent,
          path: filename
        }, function (error, eventFile) {
          if (error) {
            reject(error);
          }

          resolve(eventFile);
        });
      });
    },
    /**
     * Create a new event file
     *
     * @param {string} filename
     * @param {string} content
     * @param {string} message
     * @returns {Promise}
     */
    create: function (filename, content, message) {
      return new Promise(function (resolve, reject) {
        github.repos.createFile({
          user: config.github.org,
          repo: config.github.repos.gitevent,
          path: filename,
          content: content,
          message: message
        }, function (error, result) {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
      });
    },
    /**
     * Update an existing event file
     *
     * @param {string} filename
     * @param {string} sha
     * @param {string} content
     * @param {string} message
     * @returns {Promise}
     */
    update: function (filename, sha, content, message) {
      return new Promise(function (resolve, reject) {
        github.repos.updateFile({
          user: config.github.org,
          repo: config.github.repos.gitevent,
          path: filename,
          sha: sha,
          content: content,
          message: message
        }, function (error, result) {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
      });
    }
  };
};
