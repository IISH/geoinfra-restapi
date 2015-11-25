class geoinfra::restapi (
  $home = $geoinfra::params::restapi_home,
  $user = $geoinfra::params::restapi_user,
) inherits geoinfra::params {

  package {
    'python-software-properties':
      ensure => present,
  }

  class { 'postgresql::globals':
    encoding => 'UTF-8',
    locale   => 'en_US.UTF-8',
  }->class { 'postgresql::server':
  }

  include redis

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
      group  => $user,
  }

}