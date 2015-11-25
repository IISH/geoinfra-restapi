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
    '/opt/neo4j/neo4j-community-2.2.6/plugins/histograph-plugin-0.5.0-SNAPSHOT.jar':
      ensure  => file,
      notify  => Service['neo4j'],
      source  => 'puppet:///modules/geoinfra/histograph-plugin-0.5.0-SNAPSHOT.jar';
  }
}
