FROM gliderlabs/alpine
MAINTAINER Patrick Heneise <patrick@blended.io>

RUN         apk add --update make gcc g++ python curl
RUN         apk add --no-cache nodejs

# Bundle app source
ADD         . /src
RUN         cd /src; npm install; npm update

ENV         NODE_ENV production
CMD         ["/bin/sh", "/src/init.sh"]
EXPOSE      3000
