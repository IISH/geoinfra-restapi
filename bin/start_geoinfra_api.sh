#!/bin/bash

set -e

####################
#START GEOINFRA API
####################
cd /opt/geoinfra/geoinfra-api
pm2 start index.js --name geoinfra/api
pm2 save

