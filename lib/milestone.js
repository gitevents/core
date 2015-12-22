'use strict';

var debug = require('debug')('gitevents-milestone');
var config = require('../common/config');

var createMilestone = function createMilestone(payload, event, repo, github) {
  return new Promise(function(resolve, reject) {
    debug('createdMilestone()');
    github.issues.createMilestone({
      user: config.github.org,
      repo: repo,
      title: event.name,
      due_on: event.startDate,
      description: event.id
    }, function(error, milestone) {
      debug('GitHub:createdMilestone - ' + repo);
      if (error) {
        return reject(new Error(error));
      }
      return resolve({
        'milestone': milestone,
        'repo': repo
      });
    });
  });
};

var getMilestones = function getMilestones(repo, eventId, github) {
  return new Promise(function(resolve, reject) {
    debug('getMilestone()');
    github.issues.getAllMilestones({
      user: config.github.org,
      repo: repo,
      state: 'open'
    }, function(error, milestones) {
      debug('GitHub:getAllMilestones');
      if (error) {
        return reject(new Error(error));
      }

      if (milestones.length > 0) {
        milestones.forEach(function(milestone) {
          if (milestone.description === eventId) {
            return resolve({
              'milestone': milestone,
              'repo': repo
            });
          }
        });
        return resolve({
          'milestone': false,
          'repo': repo
        });
      } else {
        resolve({
          'milestone': false,
          'repo': repo
        });
      }
    })
  });
};

var addMilestone = function addMilestone(issue, repo, milestone, github) {
  return new Promise(function(resolve, reject) {
    debug('addMilestone()');
    github.issues.edit({
      user: config.github.org,
      repo: repo,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      assignee: issue.assignee,
      state: issue.state,
      milestone: milestone.number,
      labels: issue.labels
    }, function(error, issue) {
      debug('GitHub:issues.edit');
      if (error) {
        return reject(new Error(error));
      }
      return resolve({
        'issue': issue
      });
    });
  });
};

module.exports = function milestone(payload, event, github) {
  return new Promise(function(resolve, reject) {
    debug('milestones');
    for (var repo in config.github.repos) {
      if (config.github.repos.hasOwnProperty(repo)) {
        getMilestones(config.github.repos[repo], event.id, github)
          .then(function gotMilestones(args) {
            var milestone = args.milestone;
            var repo = args.repo;

            if (milestone === false) {
              if (args.repo === config.github.repos.gitevent) {
                createMilestone(payload, event, args.repo, github)
                  .then(function(args) {
                    addMilestone(payload.issue, args.repo, args.milestone, github);
                  });
              } else {
                if (args.repo !== config.github.repos.gitevent) {
                  createMilestone(payload, event, args.repo, github)
                    .then(function(args) {
                      addMilestone(payload.issue, args.repo, args.milestone, github);
                    });
                }
              }
            } else {
              debug(milestone.id + ' already exists for ' + args.repo);
            }
          }, function(error) {
            return new Error(error);
          });
      }
    }
  });
};
