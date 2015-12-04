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
    }
}

var dbConnection = function(opts) {
    var i = {};
    i.db = {};
    try{
        i.db = pgp("postgres://"+opts.u+":"+opts.p+"@"+opts.h+":"+opts.P+"/"+opts.d);
    }catch(e) {
        console.log(e);
        warn('Error reading postgres connection parameters. Are they set correctly in config.json?\ncreating pg object WITHOUT database connection.')
    }
    i.test = function() {
		console.log('this will be replaced with the actual api');
        return 'foo';
    }
    /**
    / fetch stuff from the database
    */
    i.fetch = function(query){
        var qu;
        if (typeof query === 'string' ) {
            qu = query;
        } else if (typeof query === 'object') {
            qu = buildQuery(query);
        }
        console.log('the query being send to POSTGRES looks like this:');
        console.log(qu);
        var promise = new rsvp.Promise(function(resolve,reject) {
            i.db.query(qu)
            .then(function(data){
                resolve(data);
            })
            .catch(function(err) {
		warn('error in database query', err);
	        reject(err);
            });    
        });
        return promise;
    }
    return i;
}

module.exports = dbConnection;
