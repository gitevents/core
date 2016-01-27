'use strict';

var config = require('../config');

var getPlugin = function getPlugin(name) {
  return config.plugins.filter(function (plugin) {
    if (plugin.name === name && plugin.required === true) {
      return true;
    }
  })[0];
}

module.exports = function constructPlugin(name) {
  var plugin = getPlugin(name);
  if (plugin) return require(plugin.name)(plugin);
};
