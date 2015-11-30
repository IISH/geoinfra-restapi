class geoinfra (
  $histograph_endpoint = $geoinfra::params::histograph_endpoint,
  $home_dir = $geoinfra::params::home_dir,
  $user = $geoinfra::params::user,
) inherits geoinfra::params {

  group {
    $user:
      ensure => present,
  }
  user {
    $user:
      ensure => present,
      groups =>  $user,
  }

  file {
    $home :
      ensure => directory,
      owner  => $user,
      group  => $user ;
    "${home}/config.json":
      ensure  => file,
      content => template('geoinfra/config.json') ;
  }

# nodejs
  if defined('nodejs') {
    class {
      'geoinfra::nodejs':
        require => File["${home_dir}/config.yml"],
    }
  }

#postgresql
  if defined('postgresql::globals') {
    class {
      'geoinfra::postgresql':
    }
  }

}