#!/bin/bash

set -e

#installs Postgres and Geoinfra-API on a node.

source ../configfile;

######################################
# ADD PACKAGE REPOSITORIES AND UPDATE
#####################################

postgresql 9.4
echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" >> /etc/apt/sources.list
wget --quiet -O - https://www.postgresql.org/~/ACCC4CF8.asc | sudo apt-key add -
#node 0.12, npm
curl -sL https://deb.nodesource.com/setup_0.12 | bash - #this script happens to do an apt-get update for us

###################
# INSTALL PACKAGES
###################

#nodejs now comes from custom ppa
apt-get install git postgresql postgresql-contrib postgis postgresql-9.4-postgis-2.1 nodejs apache2 -y;
npm install -g pm2;

#################################
# CONFIGURE POSTGRES AND POSTGIS
#################################
echo "host all all $IISGHG_IP/24 md5" >> /etc/postgresql/9.4/main/pg_hba.conf
echo "listen_addresses='*'" >> /etc/postgresql/9.4/main/postgresql.conf
service postgresql restart

su postgres <<'EOF'
createdb geo
echo "create user $USER  with password $PGPW;grant all privileges on database 'geo' to $USER;" | psql template1
echo "create extension postgis;" | psql -d geo
EOF

########################
# POPULATE THE DATABASE
########################
sudo -u dev pg_restore -O -d geo $DATA_DIR/$DB_BACKUP_FILE;

#####################################
# INSTALL AND START THE GEOINFRA API
#####################################
mkdir /opt/geoinfra && chown -R $USER:$USER /opt/geoinfra && cd /opt/geoinfra;
su $USER <<'EOF'
git clone https://github.com/IISH/geoinfra-restapi && cd geoinfra-restapi;
npm install;
echo "export GEOINFRA_API_CONFIG=$GEOINFRA_API_CONFIG_LOCATION" >> ~/.profile;
source ~/.profile;
pm2 start index.js --name geoinfra_api;
pm2 save;
EOF

######################
# MAKE API PERSISTENT
######################
#output of `pm2 startup ubuntu`
sudo su -c "env PATH=$PATH:/usr/bin pm2 startup ubuntu -u $USER --hp /home/$USER"

###################
# CONFIGURE APACHE
###################

#NOTE! quick and dirty way of adding this, not very portable.
a2enmod headers proxy
sed -i '$i include /opt/geoinfra/geoinfra-restapi/features.conf' /etc/apache2/sites-available/default
service apache2 restart
