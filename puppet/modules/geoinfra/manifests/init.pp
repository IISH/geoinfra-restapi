class geoinfra (
  $instance_conf = $geoinfra::params::instance_conf,
  $histograph_endpoint = $geoinfra::params::histograph_endpoint,
  $home_dir = $geoinfra::params::home_dir,
  $user = $geoinfra::params::user,
) inherits geoinfra::params {

  include geoinfra::environment

  group {
    $user:
      ensure => present,
  }
  user {
    $user:
      ensure => present,
      groups =>  $user,
      managehome => true,
  }

  file {
    $home_dir :
      ensure => directory,
      owner  => $user,
      group  => $user ;
    "${home_dir}/config.json":
      ensure  => file,
      group   => $user,
      owner   => $user,
      content => template('geoinfra/config.json.erb') ;
  }

# nodejs
  if defined('nodejs') {
    class {
      'geoinfra::nodejs':
        require => File["${home_dir}/config.json"],
    }
  }

#postgresql
  if defined('postgresql::globals') {
    class {
      'geoinfra::postgresql':
    }
  }

}