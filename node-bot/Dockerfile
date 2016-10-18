# DOCKER CONTAINER FOR PRODUCTION
FROM node:6
MAINTAINER Aurelien Hontabat <aurelien.hontabat@ericsson.com>

RUN mkdir -p /usr/src/dist
WORKDIR /usr/src/dist

# Install app dependencies
COPY package.json /usr/src/dist/
RUN npm install --production
COPY app.js /usr/src/dist/
COPY certificate.pem /usr/src/dist/
COPY certificate-key.pem /usr/src/dist/
COPY intents /usr/src/dist/intents
COPY *.js /usr/src/dist/
#COPY .env /usr/src/dist/


EXPOSE 443
ENTRYPOINT ["/usr/local/bin/npm", "run", "prod"]
