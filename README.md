Geo-Infrastructure Service
==========================

Historical geocoder and historical country boundaries.

This repository contains the code for the RESTful API (NodeJS) as well as [installation instructions](README.md/#Installation) and [configurations](config/) for the associated backends (Histograph and PostgreSQL).

#About




#Dependencies

We run on Ubuntu 12.04 LTS. Installation should be possible on any (recent) GNU/Linux. The required packages are:

* NodeJS 0.12
* Java JDK 7 (we used Oracle)
* PostgreSQL 9.4
* Redis 3.0.4
* Elasticsearch 1.7.2
* Apache 2.4 (or any HTTP server -- used as proxy)

#Installation

NOTE: many commands will need to be run as root! You can prepend `sudo ` to each command: `sudo apt-get install package-x`.

##Prerequisite infrastructure

    apt-get install build-essential python-software-properties git maven2 -y

##add apt repositories and update in one go
    #for oracle java installer
    add-apt-repository ppa:webupd8team/java
    #postgresql 9.4
    echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" >> /etc/apt/sources.list
    wget --quiet -O - https://www.postgresql.org/~/ACCC4CF8.asc | sudo apt-key add -
    #elasticsearch
    wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add -
    echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
    #neo4j
    wget -qO - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
    echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
    #update all new repositories
    apt-get update

##Java

    apt-get install oracle-java7-installer -y
    #set JAVA_HOME for further installation process
    echo 'export JAVA_HOME="/usr/lib/jvm/java-7-oracle"' >> /etc/environment
    source /etc/environment

##Postgres and Postgis, Neo4j, Elasticsearch

    apt-get install postgresql postgresql-contrib postgis postgresql-9.4-postgis-2.1 neo4j elasticsearch -y

##Redis built from source

    wget http://download.redis.io/releases/redis-3.0.5.tar.gz
    tar xzf redis-3.0.5.tar.gz
    cd redis-3.0.5
    make
    make install
    echo -n | utils/install_server.sh #echo to bypass user prompts
    #cd ../ && rm -rf redis-3.0.5

##non-root configuration steps
Run these as your normal user

    #set JAVA HOME
    echo 'export JAVA_HOME="/usr/lib/jvm/java-7-oracle"' >> ~/.profile
    #set HISTOGRAPH_CONFIG
    echo 'export HISTOGRAPH_CONFIG="~/histograph/config/histograph.run.yml"' >> ~/.profile
    #make both settings available immediately
    source ~/.profile

##neo4j-plugin for histograph
    
    git clone https://github.com/histograph/neo4j-plugin && cd neo4j-plugin
    mvn package
    service neo4j-service stop
    cp target/*.jar /var/lib/neo4j/plugins/
    service neo4j-service start



    

##Histograph Core, API, Config, Import modules
    
    mkdir /opt/histograph && chown $USER:$USER /opt/histograph && cd /opt/histograph
    chown -R $USER:$USER ./*
    su $USER <<'EOF';\
    for f in core api config import; do git clone https://github.com/histograph/$f; (cd $f; npm install);done;\
    EOF

##Nodejs, NPM and PM2

    curl -sL https://deb.nodesource.com/setup_0.12 | bash -
    apt-get install nodejs -y
    npm install -g pm2

##install geoinfra api

    cd /opt
    su $USER <<'EOF'\
    git clone https://github.com/IISH/geoinfra-restapi;\
    cd geoinfra-restapi;\
    npm install;\
    EOF


#Running Histograph and geoinfra services
Redis, Neo4j and Elasticsearch can be run via init.d service scripts. Histograph Core and API need to be run via NodeJS. We can use `pm2` to manage these processes.

    #as $USER
    cd /opt
    for f in geoinfra/geoinfra-restapi histograph/core histograph/api; do pm2 start $f/index.js; done

    pm2 save
    #output of pm2 startup ubuntu
    sudo su -c "env PATH=$PATH:/usr/bin pm2 startup ubuntu -u $USER --hp /home/$USER"

#Configuration

##Postgres

###Configure Postgres to allow connections from other local IPs

    echo 'host all all xxx.xxx.xxx.xxx/24 md5' >> /etc/postgresql/9.4/main/pg_hba.conf
    echo "listen_addresses='*'" >> /etc/postgresql/9.4/main/postgresql.conf
    service postgresql restart

##create database and user;
    su postgres;
    createdb geo;
    psql template1;
    create user $USER  with password 'xxxxxxx';
    grant all privileges on database 'geo' to $USER;
    \d geo;
    create extension postgis;
    \q

##Populate database
    pg_restore -O -d geo dump_of_geoinfra_frozen_ids_2015-10-06.dmp


##Apache

Add to virtualhost:

    include /opt/geoinfra/geoinfra-restapi/features.conf

Then run:

    service apache2 restart

