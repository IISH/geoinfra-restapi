#!/bin/bash

set -e

###############################
#START HISTOGRAPH CORE AND API
###############################
cd /opt
for f in histograph/core histograph/api; do pm2 start $f/index.js --name $f; done
pm2 save

