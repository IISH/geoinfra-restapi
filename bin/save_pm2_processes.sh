#/bin/bash
#run this as root after running pm2 save as normal user

source ../configfile
#output of pm2 startup ubuntu
env PATH=$PATH:/usr/bin pm2 startup ubuntu -u $USER --hp /home/$USER
