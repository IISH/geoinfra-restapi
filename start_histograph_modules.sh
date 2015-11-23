#!/bin/bash

set -e

###############################
#START HISTOGRAPH CORE AND API
###############################
cd /opt
echo 'histograph config';
echo $HISTOGRAPH_CONFIG
for f in histograph/core histograph/api; do pm2 start $f/index.js --name $f; done
pm2 save

###########################
#LOAD DATA INTO HISTOGRAPH
###########################
cd /opt/histograph/import
node index.js cshapes geacron cshapes-geacron oecd
