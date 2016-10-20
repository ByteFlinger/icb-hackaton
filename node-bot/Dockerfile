# DOCKER CONTAINER FOR PRODUCTION
FROM node:6
MAINTAINER Aurelien Hontabat <aurelien.hontabat@ericsson.com>

RUN mkdir -p /usr/src/dist
WORKDIR /usr/src/dist

# Install app dependencies
COPY package.json /usr/src/dist/
RUN npm install \
    && npm install -g typescript
COPY tsconfig.json /usr/src/dist/
COPY src /usr/src/dist/src
RUN tsc \
    && npm prune --production



EXPOSE 443
ENTRYPOINT ["/usr/local/bin/npm", "run", "prod"]
