FROM phusion/baseimage
MAINTAINER Patrick Heneise <patrick@blended.io>

CMD         ["/sbin/my_init"]

RUN         curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN         apt-get update
RUN         apt-get install -y python-software-properties python g++ make nodejs git
RUN         apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Bundle app source
ADD         . /src
RUN         cd /src; npm install; npm update

ENV         NODE_ENV production

ENTRYPOINT  ["/bin/sh", "/src/download_config.sh"]
CMD         ["/usr/bin/node", "/src/gitevents.js"]
