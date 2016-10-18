#!/bin/bash

docker stop marvin
docker rm marvin
docker run -d --restart on-failure -p 443:3978 -v /home/ubuntu/hackathon/cert:/cert:rw -v /home/ubuntu/hackathon/marvin/.env:/marvin/.env:ro --name marvin marvin
