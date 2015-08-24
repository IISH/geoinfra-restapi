var express = require('express');
var fs = require('fs');
var nconf = require('nconf');
nconf.file({file: './config.json'});
var hg = require('./lib/hgapi-bridge')(nconf.get('hg'));
var pg = require('./lib/pgapi-bridge')(nconf.get('db'));
var queryParser = require('./lib/query-parser');
//var auth = require('wmapi-auth');

var fooYa = function(req, res, next) {
    console.log('this handler is  being called: fooYa');
    console.log(req);
    next()

}

var api = express();

api.use(queryParser);


var transformPost = function(req, res, next) {
    console.log(req);
    next();


}

/**
/ @api {get} /countries fetch countries based on name or id, with time filtering
/ @apiParam {string} name name of country to search for
*/
function findCountries(req, res) {
    pg.fetch(req.processedQuery)
    .then(function(data){
        res.send(data)
    })
    .catch(function(error){
        console.log('final error somewhere');
        console.log(error)
    });


};
function getCountries(req, res) {res.send('hello')};
function testRes(req, res) {
    console.log(req.query);
    res.send(req.processedQuery)
}


api.get('/testres', testRes);
api.get('/', function(req, res) {
  res.send({
    name: 'Demo',
    version: '0.0.1',
    message: 'Returning geojson and topojson'
  });
});
api.get('/find', findCountries);
api.get('/fetch', getCountries);
api.listen(8090, function() {
  console.log('Topojson API listening on port 8090');
});

