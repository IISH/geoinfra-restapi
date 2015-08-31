var fs = require('fs');
var nconf = require('nconf');
nconf.file({file: './config.json'});
var rsvp = require('rsvp');
var pg = require('./pgapi-bridge')(nconf.get('pg'));

/**
* Asynchronously load the OECD supra regions into memory.
* they will be available as an array via the promise returned.
*/
module.exports = function() {
    var promise = new rsvp.Promise(function(resolve, reject) {
        pg.fetch('select id, name, concept_id from geoinfra.entities where source_id = 3 and type = \'oecd_supra\';')
        .then(function(data){
            resolve(data);
        },function(error){
            reject(error)
        });
    })
    return promise
}
