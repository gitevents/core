'use strict';

var debug = require('debug')('gitevents-milestone');
var config = require('../common/config');

var createMilestone = function(payload, event, repo, github) {
  return new Promise(function(resolve, reject) {
    debug('GitHub:creatingMilestone - ' + repo);

    github.issues.createMilestone({
      user: config.github.org,
      repo: repo,
      title: event.name,
      due_on: event.startDate,
      description: event.id
    }, function(error) {
      if (error) { return reject(new Error(error)); }
      debug('GitHub:createdMilestone - ' + repo);
      return resolve();
    });
  });
};

var updateMilestone = function(payload, event, repo, github) {
  return new Promise(function(resolve, reject) {
    debug('GitHub:updatingMilestone');
    return resolve();
  });
}

var getMilestones = function getMilestones(repo, eventId, github) {
  return new Promise(function(resolve, reject) {
    debug('getMilestones - ' + repo);
    github.issues.getAllMilestones({
      user: config.github.org,
      repo: repo,
      state: 'open'
    }, function (error, milestones) {
      if (error) { return reject(new Error(error)); }

      if (milestones.length > 0) {
        console.log(repo);
        console.log('+++')
        milestones.forEach(function(milestone) {
          console.log('???' + repo)
          if (milestone.description === eventId) {
            return resolve(milestone.number, repo);
          }
        });
        console.log('---')
        return resolve(false, repo);
      } else {
        console.log(repo);
        return resolve(false, repo);
      }
    })
  });
}

module.exports = function milestone(payload, event, github) {
  return new Promise(function(resolve, reject) {
    debug('Milestone');

    for (var repo in config.github.repos) {
      if (config.github.repos.hasOwnProperty(repo)) {
        getMilestones(repo, event.id, github).then(function gotMilestones(milestoneNumber, repo2) {
          console.log(milestoneNumber, repo2);
          // if (milestone.length > 0) {
          //   var repo = milestone[0].url.split('/')[5];
          //   if (repo === config.github.repos.gitevent) {
          //     updateMilestone(payload, event, repo, github);
          //   } else {
          //      if (repo !== config.github.repos.gitevent) {
          //        updateMilestone(payload, event, repo, github);
          //      }
          //   }
          // } else {
          //   if (repo === config.github.repos.gitevent) {
          //     createMilestone(payload, event, repo, github);
          //   } else {
          //      if (repo !== config.github.repos.gitevent) {
          //        createMilestone(payload, event, repo, github);
          //      }
          //   }
          // }
        });
      }
    }
  });
};
