#!/bin/bash

source ../configfile;

######################
#UTILITY INSTALLATION
######################

apt-get install build-essential python-software-properties git maven2 -y;


######################
#PACKAGE INSTALLATION
######################

#for oracle java installer
add-apt-repository ppa:webupd8team/java
#elasticsearch
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
#neo4j
wget -qO - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
#update all new repositories
apt-get update
