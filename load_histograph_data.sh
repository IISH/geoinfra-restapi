#!/bin/bash

set -e

###########################
#LOAD DATA INTO HISTOGRAPH
###########################
cd /opt/histograph/import
node index.js cshapes geacron cshapes-geacron oecd
