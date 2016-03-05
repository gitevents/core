[![npm](https://img.shields.io/npm/v/gitevents.svg)](https://www.npmjs.com/package/gitevents)[![build status](https://travis-ci.org/gitevents/core.svg)](https://travis-ci.org/gitevents/core)[![docker](https://quay.io/repository/gitevents/gitevents/status "Docker Repository on Quay")](https://quay.io/repository/gitevents/gitevents)[![gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gitevents/core)[![code climate](https://codeclimate.com/github/gitevents/core/badges/gpa.svg)](https://codeclimate.com/github/gitevents/core)[![test coverage](https://codeclimate.com/github/gitevents/core/badges/coverage.svg)](https://codeclimate.com/github/gitevents/core/coverage)[![issue count](https://codeclimate.com/github/gitevents/core/badges/issue_count.svg)](https://codeclimate.com/github/gitevents/core)[![package quality](http://npm.packagequality.com/shield/gitevents.svg)](http://packagequality.com/#?package=gitevents)

# GitHub Issues + Your Event = gitevents
`gitevents` is a [Node.js](https://nodejs.org/en/) server application that can be configured to automatically **setup** and **maintain** one or many events on Event-Management websites through Github.

Right now `gitevents` has [Tito](https://github.com/gitevents/gitevents-tito) and [Meetup](https://github.com/gitevents/gitevents-meetup) support.

`gitevents` uses the webhooks of a **GitHub repository** to manage events. Every _Milestone_ is treated as **Event** and every _Issue_ represents a **Talk**. Additional workflow is managed by convention through _Labels_. It also supports promotion through social channels (such as Email, Facebook, Twitter, Google+).

# Who needs this?
Developers that are comfortable using Github but have trouble managing an event.

## How do I use it?
### What do I need?

1. A [github _Account_](https://github.com/join)
1. A [_Repository_ per organisation](https://github.com/new)
1. A [_Personal Access Token_](https://github.com/settings/tokens/new) able to edit your repository
  1. ![access token](https://raw.githubusercontent.com/gitevents/core/master/docs/screenshots/access_token.png)
1. A public web-server to host the software
1. A GitHub Repository for your event or usergroup (example: [BarcelonaJS](https://github.com/BarcelonaJS/BarcelonaJS))
1. `Issues` enabled on that repository (you can activate `Issues` in the repository settings)
1. From the settings in `Webhooks & Services` create a webhook to your service ip (example: http://barcelonajs.org/github/delivery). `/github/delivery` is the required path.
1. A personal access token for the organisation or your profile, including repo write access (https://github.com/settings/tokens)


### Almost-just-one-click-ready-to-launch version:

1. Create a secret [gist](https://gist.github.com) with your production config. Name it `gitevents.js` (needs to contain at least github api token and repository info)
  1. Go to https://github.com/settings/tokens and create a token for your gitevents application
  1. Copy `common/yourevent.js` and adjust the values
  ```
  module.exports = {
    debug: false,
    about: 'A line that is copied into every event.md file as content.',
    rollbar: '<if you have a rollbar account, otherwise remove>',
    date_format: 'DD.MM.YYYY',
    mail: {},
    paths: {
      talks: 'src/talks/',
      events: 'src/events/'
    },
    url: 'http://barcelonajs.org',
    github: {
      user: '<the acting github username>',
      repos: {
        planning: '<target user>/<target planning repo>',
        speakers: '<target user>/<target speakers repo>',
        gitevent: '<target user>/<target gitevent repo>'
      },
      secret: '<a random secret that you copy into all webhook settings as secret>',
      token: '<personal access token from https://github.com/settings/tokens>'
    },
    labels: {
      job: 'job',
      talk: 'talk',
      proposal: 'proposal',
      event: 'event'
    },
    schema: {
      default_organizer: {
        'type': 'Organization',
        'address': {
          'type': 'PostalAddress',
          'addressLocality': '<city, country>',
          'postalCode': '<postcode>',
          'streetAddress': '<address>'
        },
        'email': '<organisation email>',
        'name': '<organisation  name>',
        'url': '<organisation url>'
      },
      default_talk_url: '/talk/',
      default_event_url: '/event/',
      default_start_time: '19:00',
      default_talk: {
        'context': 'http://schema.org',
        'type': 'Educational event',
        'duration': 'P30M'
      },
      default_event: {
        'context': 'http://schema.org',
        'type': 'Social event',
        'location': {
          'type': 'Place',
          'address': {
            'type': 'PostalAddress',
            'addressLocality': '<city, country>',
            'postalCode': '<postcode>',
            'streetAddress': '<address>'
            'name': '<venue name>'
          },
          'url': 'http://barcelonajs.org',
          'duration': 'P2H'
        },
        doorTime: '18:45',
        inLanguage: {
          'type': 'Language',
          'name': 'English'
        }
      }
    }
  };
  ```

1. Log in to [Digital Ocean](https://www.digitalocean.com) and [create a Droplet](https://cloud.digitalocean.com/droplets/new)
1. Name your droplet `gitevents`
1. Choose $5/month size
1. Choose Frankfurt 1 as datacenter (or whatever you want)
1. Choose `CoreOS` as image (`stable` or `beta`)
1. Select 'User Data' and copy `cloud-config.yml` into the field
1. Change `<token>` with an etcd token from [https://discovery.etcd.io/new?size=1](https://discovery.etcd.io/new?size=1)
1. Change `<production.js>` with the RAW link of your secret(!!!) gist
1. Add your SSH keys (normally you wound't neet to log in, but just in case)
1. Click `Create`


### How to run gitevents locally / as a developer

1. Start the development server: `npm run dev`
2. Start localtunnel (`npm i -g localtunnel`): `lt -p 3000`
3. Go to your test-repo webhook settings: `https://github.com/gitevents/playground/settings/hooks`
4. Add or modify the webhook with the localtunnel url
5. Create, label, and play with issues and milestones

Or:

Run the tests:

    npm run test

### Implemented so far:
- gitevents Core
- Meetup.com plugin to create and update meetups.

### Coming soon
- Twitter updates
- Mailchimp Newsletters



## Contribute

    https://github.com/blog/1943-how-to-write-the-perfect-pull-request


    git clone https://github.com/gitevents/core.git
    npm install
    npm run test

## Backlog / Milestone
- Stabilise core functionality and github issue handling
- Test and fix meetup.com event creation and updates
- Tests for various use-cases: updating events, talks, proposals etc.


## Contact

You can always get in touch in our community chat on [Gitter](https://gitter.im/gitevents/core).

### Want to help?

Talk to [PatrickHeneise](https://twitter.com/PatrickHeneise) from BarcelonaJS or [IanCrowther](htts://twitter.com/iancrowther) from LNUG if you need any help. We can set up pair programming sessions for node.js beginners or for specific solutions (f.e. tests).
