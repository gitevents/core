'use strict';

var debug = require('debug')('gitevents-milestone');
var config = require('../common/config');

var createMilestone = function createMilestone(payload, event, repo, github) {
  return new Promise(function(resolve, reject) {
    github.issues.createMilestone({
      user: config.github.org,
      repo: repo,
      title: event.name,
      due_on: event.startDate,
      description: event.id
    }, function(error, milestone) {
      if (error) { return reject(new Error(error)); }
      debug('GitHub:createdMilestone - ' + repo);
      return resolve({ 'milestone': milestone, 'repo': repo });
    });
  });
};

var getMilestones = function getMilestones(repo, eventId, github) {
  return new Promise(function(resolve, reject) {
    github.issues.getAllMilestones({
      user: config.github.org,
      repo: repo,
      state: 'open'
    }, function (error, milestones) {
      if (error) { return reject(new Error(error)); }

      if (milestones.length > 0) {
        milestones.forEach(function(milestone) {
          if (milestone.description === eventId) {
            return resolve({ 'milestone': milestone, 'repo': repo });
          }
        });
        return resolve({ 'milestone': false, 'repo': repo });
      } else {
        resolve({ 'milestone': false, 'repo': repo });
      }
    })
  });
}

var addMilestone = function addMilestone(issue, repo, milestone, github) {
  return new Promise(function(resolve, reject) {
    debug('GitHub:addMilestone');
    console.log(issue, repo, milestone, github);

    github.issues.edit({
      user: config.github.org,
      repo: repo,
      title: issue.title,
      body: issue.body,
      assignee: issue.assignee,
      state: issue.state,
      milestone: milestone.number,
      labels: issue.labels
    }, function (error, issue) {
      if (error) { return reject(new Error(error)); }
      debug('Milestone added to issue');
      return resolve({ 'issue': issue });
    });
    
  });
};

module.exports = function milestone(payload, event, github) {
  return new Promise(function(resolve, reject) {
    debug('Setup Milestones');

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
                    console.log(args)
                    console.log('adding milestone to resources')
                    addMilestone(issue, args.repo, args.milestone, github);
                  });
              } else {
                if (args.repo !== config.github.repos.gitevent) {
                  createMilestone(payload, event, args.repo, github)
                    .then(function(args) {
                      console.log(args)
                      console.log('adding milestone to everything else')
                      addMilestone(issue, args.repo, args.milestone, github);
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
