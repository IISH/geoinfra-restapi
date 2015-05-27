#!/usr/bin/perl
$| = 1;
while (<STDIN>) {
    chomp;
    print "$_\n";
#    my $match = $_ =~ m/(\d{4})/;
#   if ($match < 1945){
#        print "$match\n";
##        print "erp\n";
#    } else {
#        print "hi$_\n";
#    }
}
