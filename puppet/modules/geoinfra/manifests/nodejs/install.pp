class geoinfra::nodejs::install {


# run npm commands
  create_resources(nodejs::npm, hiera('nodejs::npm', { user => $geoinfra::user }))

  geoinfra::nodejs::pm2 {
    'restapi':
      require => Nodejs::Npm['restapi', 'pm2'],
      user    => $geoinfra::user;
  }

}