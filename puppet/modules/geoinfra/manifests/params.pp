class geoinfra::params {
  $restapi_home = '/opt/geoinfra'
  $restapi_user = 'geoinfra'
  $restapi_database_name = $restapi_user
  $restapi_database_host = "${::ipaddress}"
  $restapi_database_password = $restapi_user
  $restapi_database_username = $restapi_user
  $restapi_histograph_endpoint = "%{::ipaddress}:3001"
}