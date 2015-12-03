/*
Promisified Postgres Database Connector.

*/

var rsvp = require('rsvp');
var pgLib = require('pg-promise');
var buildQuery = require('./query-sequel');
var pgp = pgLib();

function die(message) {
    console.error(message);
    process.exit(-1);
}
function warn(message, error) {
    console.error('WARN:');
    console.error(message);
    if (error) {
	console.error(error);
    };
}

var dbConnection = function(opts) {
    var i = {};
    i.db = {};
    try{
        i.db = pgp("postgres://"+opts.u+":"+opts.p+"@"+opts.h+":5432/"+opts.d);
    }catch(e) {
        warn('Error reading postgres connection parameters. Are they set correctly in config.json?\ncreating pg object WITHOUT database connection.', e)
    }
    /**
    / fetch stuff from the database. Takes a query string or query object (to use in squel.js)
    */
    i.fetch = function(query){
        var qu;
        if (typeof query === 'string' ) {
            qu = query;
        } else if (typeof query === 'object') {
            qu = buildQuery(query);
        }
        console.log('the query being sent to POSTGRES looks like this:');
        console.log(qu);
        var promise = new rsvp.Promise(function(resolve,reject) {
            i.db.query(qu)
            .then(function(data){
                console.log(data);
                resolve(data);
            })
            .catch(function(err) {
	        warn(err);
	        reject(err);
            });    
        });
        return promise;
    }
    return i;
}

module.exports = dbConnection;
