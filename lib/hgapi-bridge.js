//send and receive requests from the histograph api

var rsvp = require('rsvp');
var req = require('./req.js');

var foo = function(opts) {
    var i = {};	
    i.fetch = req; 
    i.test = function() {
		console.log('this will be replaced with the actual api');
        return 'foo';
        }
    return i;
}
module.exports = foo;
