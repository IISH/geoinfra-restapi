define trigger::tar-gz (
  $command              = '',
  $instance             = $title,
  $location             = '/opt/',
  $url                  = 'localhost',
  $rsync_exclude        = '',
  $schedule_trigger     = false,
  $owner                = undef, # could be user:group
) {

  $path     = "/opt/${instance}.sh"

  file {
    $path:
      ensure  => present,
      mode    => 744,
      owner   => 'root',
      content => template('trigger/tar-gz.sh.erb') ;
    "/opt/manual-install-${instance}.sh":
      ensure  => present,
      mode    => 744,
      owner   => 'root',
      content => "#!/bin/bash\n\ncache=\$1\nif [[ -z \"\$cache\" ]] ; then cache=nocache ; fi\n${path} ${instance} ${url} ${location} \$cache";
  }

  if ( $schedule_trigger ) {
    $trigger = "trigger-${instance}"
    cron { $trigger:
      ensure  => present,
      command => "${path} ${instance} ${url} ${location}",
      user    => root,
      minute  => '*/3',
    }
  }

}