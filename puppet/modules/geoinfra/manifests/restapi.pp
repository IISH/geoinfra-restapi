class geoinfra::restapi (
  $home = $geoinfra::params::restapi_home,
  $user = $geoinfra::params::restapi_user,
  $database_name = $geoinfra::params::restapi_database_name,
  $database_host = $geoinfra::params::restapi_database_host,
  $database_password = $geoinfra::params::restapi_database_password,
  $database_username = $geoinfra::params::restapi_database_username,
  $histograph_endpoint = $geoinfra::params::restapi_histograph_endpoint,
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

}