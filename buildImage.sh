#!/usr/bin/env bash

docker build -t flong_server:latest .
docker image prune -f