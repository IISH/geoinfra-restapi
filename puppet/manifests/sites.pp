node 'hg' {

  # Add histograph software
  include histograph


  # Elastic search
  include elasticsearch
  create_resources(elasticsearch::instance, hiera('elasticsearch::instance', { }))
  user {
    $elasticsearch::params::elasticsearch_user:
      ensure     => present,
      managehome => true,
  }


  # Java
  include java


  # Neo4j
  include neo4j
  $properties_file = "${neo4j::install_prefix}/${neo4j::package_name}/conf/neo4j-server.properties"
  file {
    '/var/lib/neo4j':
      ensure => link,
      group  => 'neo4j',
      owner  => 'neo4j',
      target => "${neo4j::install_prefix}/${neo4j::package_name}";
    '/etc/init.d/neo4j-service':
      ensure => link,
      target => "${neo4j::install_prefix}/${neo4j::package_name}/bin/neo4j" ;
  }
  file_line {
    'neo4j properties declare plugin':
      line => 'org.neo4j.server.thirdparty_jaxrs_classes=org.waag.histograph.plugins=/histograph',
      path => $properties_file ;
    'neo4j properties disable authentication':
      line  => 'dbms.security.auth_enabled=false',
      match => 'dbms.security.auth_enabled=true',
      path  => $properties_file ;
  }
  wget::fetch { 'https://bamboo.socialhistoryservices.org/browse/HISTOGRAPH-PRODUCTION/latestSuccessful/artifact/JOB1/histograph-plugin/histograph-plugin-0.5.0-SNAPSHOT.jar':
    cache_dir   => '/tmp',
    destination => "${neo4j::install_prefix}/${neo4j::package_name}/plugins/histograph-plugin-0.5.0-SNAPSHOT.jar",
    nocheckcertificate  => true,
  }




# class { 'postgresql::globals': }->class { 'postgresql::server': }
# create_resources(postgresql::server::db, hiera('postgresql::server::db', { }))
# create_resources(postgresql::server::pg_hba_rule, hiera('postgresql::server::pg_hba_rule', { }))



  include redis


}