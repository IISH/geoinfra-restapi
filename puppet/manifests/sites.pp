node 'hg.home' {

  package {
    [
      'python-software-properties',
    ]:
      ensure => present,
  }

  file {
    '/etc/environment':
      ensure  => file,
      content => '
      export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"
      export HISTOGRAPH_CONFIG=/opt/histograph/histograph.run.yml
      PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games"' ;
  }

  include elasticsearch
  create_resources(elasticsearch::instance, hiera('elasticsearch::instance', { }))

  include java
  include neo4j
  include nodejs
  create_resources(nodejs::npm, hiera('nodejs::npm', { }))
  class { 'postgresql::globals': }->class { 'postgresql::server': }
  create_resources(postgresql::server::db, hiera('postgresql::server::db', { }))
  create_resources(postgresql::server::pg_hba_rule, hiera('postgresql::server::pg_hba_rule', { }))
  include redis

  $user = 'histograph'
  group {
    $user:
      ensure => present ;
  }
  user {
    $user:
      groups     => $user,
      managehome => true ;
  }

  file {
    "/opt/${$user}":
      ensure => directory,
      owner  => $user,
      group  => $user ;
    "${neo4j::install_prefix}/${package_name}/plugins/histograph-plugin-0.5.0-SNAPSHOT.jar":
      ensure  => file,
      notify  => Service['neo4j'],
      source  => 'puppet:///modules/geoinfra/histograph-plugin-0.5.0-SNAPSHOT.jar';
     '/var/lib/neo4j':
       ensure => link,
       target => "${neo4j::install_prefix}/${package_name}";
  }

  # Declared in neo4j.... append properties
  $properties_file = "${neo4j::install_prefix}/${neo4j::package_name}/conf/neo4j-server.properties"
  concat {
    'neo4j-server.properties':
      path => $properties_file,
  }

  concat::fragment{ 'neo4j properties declare plugin':
    target  => $properties_file,
    content => "org.neo4j.server.thirdparty_jaxrs_classes=org.waag.histograph.plugins=/histograph",
    order   => 98,
  }

  concat::fragment{ 'neo4j properties disable authentication':
    target  => $properties_file,
    content => 'dbms.security.auth_enabled=false',
    order   => 99,
  }
}
