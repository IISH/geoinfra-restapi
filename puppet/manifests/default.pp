package {
  'python-software-properties':
    ensure => present,
}


include postgresql
include redis
