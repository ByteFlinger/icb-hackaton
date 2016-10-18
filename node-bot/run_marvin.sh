#!/bin/bash

docker stop marvin
docker rm marvin
docker run -d --restart on-failure -p 443:3978 -v /home/ubuntu/hackathon/cert:/cert:rw --name marvin marvin
