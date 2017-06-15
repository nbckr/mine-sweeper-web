#!/usr/bin/env bash

activator universal:packageZipTarball
docker build -t "playservice:1.0" .
