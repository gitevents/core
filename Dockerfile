FROM centos:centos7
MAINTAINER BarcelonaJS

# Enable EPEL for Node.js
RUN rpm -Uvh http://mirror.uv.es/mirror/fedora-epel/7/x86_64/e/epel-release-7-5.noarch.rpm
RUN     yum update -y
RUN     yum --enablerepo=centosplus install nodejs npm git -y

# Bundle app source
ADD     . /src

# Install app dependencies
RUN     cd /src; npm install; npm update

ENV NODE_ENV production
ENV DEBUG *

CMD ["/usr/bin/node", "/src/server.js"]

EXPOSE  3000
