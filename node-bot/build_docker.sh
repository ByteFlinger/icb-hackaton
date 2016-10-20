#!/bin/bash

docker build --build-arg HTTP_PROXY=http://172.17.0.1:3128 --build-arg http_proxy=http://172.17.0.1:3128 --build-arg HTTPS_PROXY=htt://172.17.0.1:3128 --build-arg https_proxy=http://172.17.0.1:3128 -t marvin .
