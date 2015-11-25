# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box = 'puppetlabs/ubuntu-12.04-64-puppet'
  config.vm.hostname = 'localhost'
  config.vm.network 'private_network', type: 'dhcp'

  config.vm.provider 'virtualbox' do |v|
    v.customize ['modifyvm', :id, '--cpus', 2]
    v.customize ['modifyvm', :id, '--memory', '2048']
  end

  config.vm.provision 'shell', path: 'puppet/setup.sh', args: ['development']
  config.vm.synced_folder 'puppet', '/etc/puppet'

end
