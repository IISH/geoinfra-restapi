var express = require('express');
var fs = require('fs');
var nconf = require('nconf');
nconf.file({file: './config.json'});
var squel = require('squel');

//In the config file we will get the query pattern to use.
var conf = nconf.get('qb');

/**
/ create a SQL string from a conventional object of query parameters.
/ domain specific.
/ @param query object (express `req.query` or `req.body.params`?)
/ @returns string
*/
var buildQuery = function(query) {
    console.log('before we send to POSTGRES we have to do some processing');
    var foo = squel.select()
            .from('geoinfra.entities') //assumes query has had a fromtable added ...
            .field('id')
            .field('name')
            .field('lower(time)', 'validSince')
            .field('upper(time)', 'validUntil')
            .where("to_tsquery(?) @@ to_tsvector(name)", query.val)
            .toString();
    if (query.timerange) {
        foo = foo+query.timerange
    }
    return foo;
}


//we need to create a sql query out of parameters.
//I imagine that we'll get the query object from the express req,
//then we need to do something with that. So that's where to start.
// query looks like:
// query {
//    name:
// ,-----------,
//    year:
// OR
//    before:
//    after:
// '-----------'
//  }



//somewhere we need to have a function that is specific to our model.


module.exports = buildQuery;
