#!/bin/bash

docker stop marvin 2>/dev/null
docker rm marvin 2>/dev/null
#docker run -d --restart on-failure -p 443:3978 -v /home/ubuntu/hackathon/cert:/cert:rw -v /home/ubuntu/hackathon/marvin/.env:/marvin/.env:ro --name marvin marvin:latest
docker run -d --restart on-failure -p 443:3978 -v /home/ubuntu/hackathon/cert:/cert:rw --env-file /home/ubuntu/hackathon/marvin/.env --name marvin marvin:latest
