#!/bin/bash

set -e

#installs the Histograph stack on one node (with neo4j, redis, elasticsearch)

source ../configfile;
######################################
# ADD PACKAGE REPOSITORIES AND UPDATE
#####################################

#elasticsearch
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
#neo4j
wget -qO - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
#node 0.12, npm
curl -sL https://deb.nodesource.com/setup_0.12 | bash - #this script happens to do an apt-get update for us

###################
# INSTALL PACKAGES
###################

#nodejs now comes from custom ppa
apt-get install git build-essential python-software-properties openjdk-7-jdk neo4j elasticsearch git maven2 nodejs apache2 -y;
npm install -g pm2;

################
#CONFIGURE JAVA
################
echo 'export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"' >> /etc/environment
source /etc/environment

#########################
#BUILD REDIS FROM SOURCE
#########################
wget http://download.redis.io/releases/redis-3.0.5.tar.gz
tar xzf redis-3.0.5.tar.gz
cd redis-3.0.5
make
make install
echo -n | utils/install_server.sh #echo to bypass user prompts
cd ../ && rm -rf redis-3.0.5

#################################################
#SET EXTRA ENVIRONMENT VARIABLES FOR NORMAL USER
#################################################
su dev <<'EOF'
echo 'export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"' >> ~/.profile
echo 'export HISTOGRAPH_CONFIG="$HISTOGRAPH_CONFIG_LOCATION"' >> ~/.profile
source ~/.profile
EOF

###################################
#BUILD NEO4J PLUGIN FOR HISTOGRAPH
###################################
cd /home/dev
git clone https://github.com/histograph/neo4j-plugin && cd neo4j-plugin
mvn package
service neo4j-service stop
cp target/*.jar /var/lib/neo4j/plugins/
service neo4j-service start
cd /home/dev && rm -rf neo4j-plugin

######################################
#INSTALL AND START HISTOGRAPH MODULES
######################################
mkdir /opt/histograph && chown $USER:$USER /opt/histograph && cd /opt/histograph
su $USER <<'EOF'
for f in core api config import; do git clone https://github.com/histograph/$f; (cd $f; npm install);done
EOF

###############################
#START HISTOGRAPH CORE AND API
###############################
su $USER <<'EOF'
cd /opt
for f in histograph/core histograph/api; do pm2 start $f/index.jsi --name $f; done
pm2 save
EOF
#output of pm2 startup ubuntu
env PATH=$PATH:/usr/bin pm2 startup ubuntu -u $USER --hp /home/$USER

###########################
#LOAD DATA INTO HISTOGRAPH
###########################
su $USER <<'EOF'
cd /opt/histograph/import
node index.js cshapes geacron cshapes-geacron oecd
EOF
