class geoinfra::nodejs inherits geoinfra::params {

  anchor {
    'geoinfra::nodejs::begin':
  }->class {
    'geoinfra::nodejs::repo':
  }->class {
    'geoinfra::nodejs::packages':
  }->class {
    'geoinfra::nodejs::install':
  }->anchor {
    'geoinfra::nodejs::end':
  }

}