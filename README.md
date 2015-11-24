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


#Hardware requirements

The `hg` test machine especially needs a bit of RAM. The development server ran successfully with 6-8GB.

#Installation

Scripts for installing the components of the stack are in `bin`. These are aimed at 'test' installations. These scripts use a simple config file for some variables. If you are using automated provisioning, you may want to set these variables in a different way.

For testing purposes, the stack is broken down into two parts. They can be installed on two servers: 'hg' is Histograph plus dependencies, 'pr' is the geoinfra-api plus postgres.

##Histograph
You will need `~/configfile` referred to by the install script. Also, copy histograph input data to `/opt/histograph/mydata` and histograph configuration file to `/opt/histograph/histograph.run.yml` (note: you can change the location of the `mydata` folder, if you change the `import` option in `histograph.run.yml` to point to that location). An example of histograph.run.yml can be found [here](config/histograph.run.yml.sample). 

Then AS ROOT run:

	bin/install_test_hg.sh

This installs java, nodejs, redis, elasticsearch, neo4j, histograph core/api/import, configures these.

After installation you can run (as normal user):

	bin/start_histograph_modules.sh #start histograph core and api
	bin/load_histograph_data.sh #run histograph import tool to load data in /opt/histograph/mydata/

And to save the pm2 processes for restart on reboot, run as root:

	bin/save_pm2_processes.sh


##Geoinfra API and Postgres
You will need `~/configfile` referred to by the install script. You also need the JSON config file for the geoinfra API. An example of this file can be found [here](config/config.json.sample).

Then, as Root, run:

	bin/install_test_pgpr.sh

This installs node, geoinfra-restapi (code contained in this repository) and postgres/postgis configures these and apache.

NOTE this also expects a backup file for populating the Postgres database.

You can then run (as normal user):

	bin/start_geoinfra_api.sh #start geoinfra API

And to save the pm2 processes for restart on reboot, run as root:

	bin/save_pm2_processes.sh
