#!/usr/bin/env bash
ssh-keygen -t rsa -b 4096 -m PEM -f ./settings/jwtRS256.key
# Don't add passphrase
#openssl rsa -in ./settings/jwtRS256.key -pubout -outform PEM -out ./settings/jwtRS256.key.pub
#cat jwtRS256.key
#cat jwtRS256.key.pub