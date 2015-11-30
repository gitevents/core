[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/GitEvents/core)
[![Stories in Ready](https://badge.waffle.io/GitEvents/core.svg?label=ready&title=Ready)](http://waffle.io/GitEvents/core)

GitEvents
=========

You're organising (or starting to organise) a user-group (be it JavaScript or anything else). Having trouble managing your time with all the tools and event apps out there?

GitEvents is a node.js service which listens to your GitHub issues and triggers various events when new issues are labeled. You can create events on meetup.com, lanyrd.com, whatever.com; announce events via email newsletters, twitter; show upcoming events and talks on your user group website and much more, completely automated and all from one place: GitHub Issues.

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

1. Go to https://github.com/settings/tokens and create a token for your GitEvents application
1. Create `common/github.credentials.js` with the contents:
```
    module.exports = {
      user: '[repo username]',
      repo: '[the repo you want to write to]',
      token: '[your token]'
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
