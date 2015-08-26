var express = require('express');
var fs = require('fs');
var nconf = require('nconf');
nconf.file({file: './config.json'});
var hg = require('./lib/hgapi-bridge')(nconf.get('hg'));
var pg = require('./lib/pgapi-bridge')(nconf.get('db'));
var queryParser = require('./lib/query-parser');
var bulkfetch = require('./lib/topojson.js');
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

function getIds(req, res) {
    pg.fetch('select case when source_id = 1 then \'cshapes/\'||id else \'geacron/\'||id end as id, name from geoinfra.entities')
    .then(function(data){
        res.send(data)
    })
    .catch(function(error){
        console.log('final error somewhere');
        console.log(error)
    });
}

//handler for /countries path. Sends topojson or geojson.
var getCountries = function(req, res) {
    console.log(req.params);
    var query = bulkfetch.buildQuery(req);
    pg.fetch(query)
    .then(function(data){
        res.setHeader('Content-Type', 'application/json');
        //build a GeoJSON feature and return it
        data[0].row_to_json.totalFeatures = data[0].row_to_json.features.length;
        if (req.query.format && req.query.format == 'topojson') {
            res.send(bulkfetch.makeTopo(data[0].row_to_json));
        } else {
            res.send(data[0].row_to_json);
        }
    })
    .then(null,function(error){
        console.log(error);
        return res.status(500).send('Internal server error. check your server logs for more details. This API is still under development, so it may just be a mismatch from your query parameters to the database records. Try a different time range and/or (set of) countries.');
    process.exit(1);
    });
}

function testRes(req, res) {
    console.log(req.query);
    res.send(req.processedQuery)
}
function testHg(req, res) {
    //for now very basic: just request concepts by name
    var query = {};
    query.name = req.query.name
    var options = {};
    options.method = 'GET';
    options.path = '/search?name='+req.query.name+'&geometry=false';
    hg.fetch(options)
    .then(function(response) {
        console.log(response);
        res.send(response)
    });

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
api.get('/ids', getIds);
api.get('/fetch', getCountries);
api.get('/testhg',testHg);
api.listen(8090, function() {
  console.log('Topojson API listening on port 8090');
});

