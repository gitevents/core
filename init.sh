#!/bin/sh

cd /src/common

curl -o production.json $CONFIG_URL

cd /src

echo 'Starting gitevents...'

node gitevents.js
