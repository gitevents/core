[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/GitEvents/gitevents?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![codeship](https://codeship.com/projects/3cb2d880-809c-0132-071e-4e80f7268ba4/status?branch=master)](https://codeship.com/projects/57517)
[![Stories in Ready](https://badge.waffle.io/GitEvents/gitevents.png?label=ready&title=Ready)](https://waffle.io/GitEvents/gitevents)

gitup
=====

A node.js micro service that listens to GitHub web hooks to:

1. verify event and speaker issues (bot)
2. send emails in the run up to the event
3. update meetup.com

This service will **not** generate a website for you, but an example is coming soon...


## Setup

1. Go to https://github.com/settings/tokens and create a token for your GitEvents application
2. Create `common/github.config.js` with the contents:
```
    module.exports = {
      user: '[repo username]',
      repo: '[the repo you want to write to]',
      token: '[your token]'
    }
```
3. Build the docker container

## To Do

1. Get tokens and secrets from a private Gist instead of re-building the container for full flexibility
