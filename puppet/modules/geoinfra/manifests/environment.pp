class geoinfra::environment(
  $file = '/etc/environment',
  $variables = {},
) {

  file {
    $file:
      ensure => file,
      content => template('geoinfra/environment.sh'),
  }

}