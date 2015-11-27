class histograph (
  $user = $histograph::params::user,
) inherits histograph::params {

  package {
    [
      'python-software-properties',
    ]:
      ensure => present,
  }

  file {
    '/etc/environment':
      content => '
     export JAVA_HOME="/usr/lib/jvm/java-7-openjdk-amd64"
     export HISTOGRAPH_CONFIG=/opt/histograph/histograph.run.yml
     PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games"',
      ensure  => file;
  }

  include nodejs
  create_resources(nodejs::npm, hiera('nodejs::npm', { }))

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
      group  => $user,
      owner  => $user ;
  }

  trigger::tar-gz {
    'histograph':
      location => '/opt/histograph',
      url      => 'https://bamboo.socialhistoryservices.org/browse/HISTOGRAPH-PRODUCTION/latestSuccessful/artifact/JOB1/histograph-nodejs/histograph-0.5.0.tar.gz',
  }

}
