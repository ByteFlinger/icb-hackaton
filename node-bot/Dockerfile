# DOCKER CONTAINER FOR PRODUCTION

FROM node:6

MAINTAINER Aurelien Hontabat <aurelien.hontabat@ericsson.com>

RUN mkdir -p /usr/src/dist
WORKDIR /usr/src/dist

# Install app dependencies
COPY package.json /usr/src/dist/
RUN npm install --production

# Bundle app source
COPY app.js /usr/src/dist/
COPY .env /usr/src/dist/
COPY bin /usr/src/dist/bin
COPY src /usr/src/dist/src

EXPOSE 8080 4433
ENTRYPOINT ["/usr/local/bin/npm", "run", "prod"]
