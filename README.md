REST HTTP API for geoinfra backend
==================================

Proposal: create a separate file for each portion of the API, and then include them from apache vhost config. This way we can version and test all the different parts individually.

probably:

* refmap -- reference map
* wms   -- visualized datasets
* raw  -- raw wms/wfs
* features -- feature query api


TODO/unknown:
-------------

* how to block queries that involve certain tables/data sources?
