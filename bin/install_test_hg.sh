#!/bin/bash

set -e

#installs the Histograph stack on one node (with neo4j, redis, elasticsearch)

source ../configfile;
#####################################
# ADD PACKAGE REPOSITORIES AND UPDATE
####################################

apt-get update && apt-get install openjdk-7-jdk -y

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
apt-get install git build-essential python-software-properties neo4j elasticsearch git maven2 nodejs apache2 -y;
npm install -g pm2;

################
#CONFIGURE JAVA
################
echo 'export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"' >> /etc/environment
update-alternatives --set java /usr/lib/jvm/java-7-openjdk-amd64/jre/bin/java
source /etc/environment

######################
#ELASTICSEARCH CONFIG
######################
update-rc.d elasticsearch defaults 95 10
echo 'ES_HEAP_SIZE=4g/' >> /etc/default/elasticsearch
cat <<EOF >> etc/elasticsearch/elasticsearch.yml
index.analysis.analyzer.lowercase:
  filter: lowercase
  tokenizer: keyword
EOF
/etc/init.d/elasticsearch restart

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
echo 'export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"' >> ~/.bashrc
echo 'export HISTOGRAPH_CONFIG=/opt/histograph/histograph.run.yml' >> ~/.bashrc
source ~/.bashrc
EOF

####################################################
#BUILD NEO4J PLUGIN FOR HISTOGRAPH AND DISABLE AUTH (!!!!!)
####################################################
echo "org.neo4j.server.thirdparty_jaxrs_classes=org.waag.histograph.plugins=/histograph" >> /etc/neo4j/neo4j-server.properties
sed -i 's/dbms.security.auth_enabled=true/dbms.security.auth_enabled=false/' /etc/neo4j/neo4j-server.properties
cd /home/dev
git clone https://github.com/histograph/neo4j-plugin && cd neo4j-plugin
mvn package
service neo4j-service stop
cp target/*.jar /var/lib/neo4j/plugins/
service neo4j-service start
neo4j-shell -c "CREATE CONSTRAINT ON (n:_) ASSERT n.id IS UNIQUE;"
cd /home/dev && rm -rf neo4j-plugin

############################
#INSTALL HISTOGRAPH MODULES
############################
mkdir /opt/histograph && chown $USER:$USER /opt/histograph && cd /opt/histograph
su $USER <<'EOF'
for f in core api config import; do git clone https://github.com/histograph/$f; (cd $f; npm install);done
EOF

