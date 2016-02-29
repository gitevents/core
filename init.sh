#!/bin/sh

cd /src/config

curl -o production.json $CONFIG_URL

cd /src

echo 'Starting gitevents...'

npm start
