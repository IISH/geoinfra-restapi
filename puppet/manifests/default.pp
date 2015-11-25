host 'histograph'

include geoinfra::restapi

package {
  'python-software-properties':
    ensure => present,
}

class { 'postgresql::globals':}->class { 'postgresql::server': }

include redis
