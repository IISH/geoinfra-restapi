package {
  'python-software-properties':
    ensure => present,
}


class { 'redis':
  manage_repo => true,
}

