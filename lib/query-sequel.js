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
/ @param query object
/ @returns string
*/
var buildQuery = function(query) {
    return 'select 15;'
}

module.exports = buildQuery;
