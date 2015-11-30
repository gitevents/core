#!/bin/sh

cd /src/common

curl -o production.js $CONFIG_URL

cd /src

node gitevents.js
