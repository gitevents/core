'use strict';

const log = require('./log');
const config = require('../config');

let createMilestone = (payload, event, repo, github) => {
  return new Promise(function (resolve, reject) {
    log.debug('createdMilestone()');
    github.issues.createMilestone({
      user: config.github.org,
      repo: repo,
      title: event.name,
      due_on: event.startDate,
      description: event.id
    }, function (error, milestone) {
      log.debug('GitHub:createdMilestone - ' + repo);
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

let getMilestones = (repo, eventId, github) => {
  return new Promise(function (resolve, reject) {
    log.debug('getMilestone()');
    github.issues.getAllMilestones({
      user: config.github.org,
      repo: repo,
      state: 'open'
    }, function (error, milestones) {
      log.debug('GitHub:getAllMilestones');
      if (error) {
        return reject(new Error(error));
      }

      if (milestones.length > 0) {
        milestones.forEach(function (milestone) {
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
    });
  });
};

let addMilestone = (issueNumber, repo, milestoneNumber, github) => {
  return new Promise(function (resolve, reject) {
    log.debug('addMilestone()');
    github.issues.edit({
      user: config.github.org,
      repo: repo,
      number: issueNumber,
      milestone: milestoneNumber
    }, function (error, issue) {
      log.debug('GitHub:issues.edit()');
      if (error) {
        return reject(new Error(error));
      }
      return resolve({
        'issue': issue
      });
    });
  });
};

module.exports = (payload, event, github) => {
  return new Promise(function () {
    log.debug('milestones');
    for (let repo in config.github.repos) {
      if (config.github.repos.hasOwnProperty(repo)) {
        getMilestones(config.github.repos[repo], event.id, github)
          .then((args) => {
            let milestone = args.milestone;

            if (milestone === false) {
              createMilestone(payload, event, args.repo, github)
                .then(function (result) {
                  if (args.repo === config.github.repos.planning) {
                    addMilestone(payload.issue.number, args.repo,
                      result.milestone.number, github);
                  }
                });
            } else {
              log.debug(milestone.id + ' already exists for ' + args.repo);
            }
          });
      }
    }
  });
};
