[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/GitEvents/core)
[![Stories in Ready](https://badge.waffle.io/GitEvents/core.svg?label=ready&title=Ready)](http://waffle.io/GitEvents/core)

# GitHub Issues + Your Event = GitEvents

You're organising a Developer user-group. You use GitHub Issues in your day job to manage your workflow.  You're having trouble managing your event.  Why not solve your problem with the tools you know.  

GitEvents uses a **GitHub Issues** to create, track and manage your **Events** as _Milestones_ and book **Talks** as _Issues_, which a progressed through a simple **Workflow** as _Labels_.

It uses GitEvents web-hooks to talk to a node.js service which listens to your GitHub Issues.  This propogates events out to Social Networks (Facebook, Twitter, Google+) and Event Management sites (Tito, Meetup, Facebook, Google+) and keeps people informed (Tweets, Status Updates, Email).

## How do I use it?

... see our tutorial (coming soon) ...

## What do I need?

1. A github _Account_. <https://github.com/join>
1. A _Repository_ per organisation. <https://github.com/new>
1. A _Personal Access Token_ able to edit your repository
1. A public web-server to host the software. <http://heroku.com>, <http://linode.com>, etc.

## How to I get it off the ground?

1. Clone the repository <https://github.com/GitEvents/core>
1. `npm run setup` (Underpants Gnomes ~ SECTION NEEDED)
1. Win!

---

### Implemented so far:
- GitEvents Core
- Meetup.com plugin to create and update meetups.

### Coming soon
- Twitter updates
- Mailchimp Newsletters


## Requirements

1. A GitHub Repository for your event or usergroup (example: [BarcelonaJS](https://github.com/BarcelonaJS/BarcelonaJS))
1. `Issues` enabled on that repository (you can activate `Issues` in the repository settings)
1. From the settings in `Webhooks & Services` create a webhook to your service ip (example: http://barcelonajs.org/github/delivery). `/github/delivery` is the required path.
1. A personal access token for the organisation or your profile, including repo write access (https://github.com/settings/tokens)

### Setup


##### Setup the software
1. Go to https://github.com/settings/tokens and create a token for your GitEvents application
1. Create `common/github.credentials.js` with the contents:
```
    module.exports = {
      user: '[repo username]',
      repo: '[the repo you want to write to]',
      secret: '[your token]'
    }
```
1. For meetup, create `common/meetup.credentials.js` with the contents:
```
module.exports = {
  token: '[your api token]',
  group: '[your group]',
  group_id: [your group id],
  duration: 7200000, // default duration: 2h
  default_venue: 12260922 // default venue: Mobile World Centre, Barcelona
};
```
1. Run the service on your trusted node.js platform

### How to run gitevents?

1) Start the development server: `npm run dev`
2) Start localtunnel (`npm i -g localtunnel`): `lt -p 3000`
3) Go to your test-repo webhook settings: `https://github.com/PatrickHeneise/gitup-testing/settings/hooks`
4) Add or modify the webhook with the localtunnel url
5) Create, label, and play with issues and milestones

Or:

Run the tests:

    npm run test


## Contribute

    git clone https://github.com/GitEvents/core.git
    npm install
    npm run test

## Backlog / Milestone
- Stabilise core functionality and github issue handling
- Test and fix meetup.com event creation and updates
- Tests for various use-cases: updating events, talks, proposals etc.


## Contact

You can always get in touch in our community chat on [Gitter](https://gitter.im/GitEvents/core).

### Want to help?

Talk to [PatrickHeneise](https://twitter.com/PatrickHeneise) from BarcelonaJS or [IanCrowther](htts://twitter.com/iancrowther) from LNUG if you need any help. We can set up pair programming sessions for node.js beginners or for specific solutions (f.e. tests).
