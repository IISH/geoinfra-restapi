var express = require('express');
var fs = require('fs');
var nconf = require('nconf');
try {
    nconf.file({file: process.env.GEOINFRA_API_CONFIG});
} catch (e) {
   console.log(e);
   console.log('error reading main configuration file. Is the environment variable GEOINFRA_API_CONFIG set?');
   process.exit(1)
}
var hg = require('./lib/hgapi-bridge')(nconf.get('hg'));
var pg = require('./lib/pgapi-bridge')(nconf.get('pg'));
var queryParser = require('./lib/query-parser');
var bulkfetch = require('./lib/topojson.js');
var findFromHg = require('./lib/find-from-hg.js');
var oecdSupras = require('./lib/load-oecd-supras.js')();
//var auth = require('wmapi-auth');

var api = express();
api.use('/apidocs', express.static('doc'));
express.static.mime.define({'application/javascript': ['topojson']});
api.use('/static', express.static('static'));
api.use(queryParser);


var transformPost = function(req, res, next) {
    console.log(req);
    next();
}

function getIds(req, res) {
    pg.fetch('select id, name, name || \' (\'|| extract(year from start_date) || \' -- \' || extract(year from end_date) as year from geoinfra.entities')
    .then(function(data){
        res.send(data)
    })
    .catch(function(error){
        console.log('final error somewhere');
        console.log(error)
    });
}

//handler for /fetch path. Sends topojson or geojson.
var getCountries = function(req, res) {
    console.log(req.params);
    //TODO: replace this with query-builder.buildQuery.
    var query = bulkfetch.buildQuery(req);
    pg.fetch(query)
    .then(function(data){
        res.setHeader('Content-Type', 'application/json');
        //build a GeoJSON feature and return it
        console.log(data);
        //data[0].row_to_json.totalFeatures = data[0].row_to_json.features.length;
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

//generic one-level array lookup
var lookUp = function(el, ar) {
    for (var i=0;i<ar.length;i++) {
        if (ar[i].id == el) {
            return ar[i].name;
        }
    }
}

//look things up in a specific array
function attachOecdSupras(req, res) {
    //attach the OECD supra regions. oecdSupras is a pg fetch promise.
    oecdSupras.then(function(data){
        req.response.forEach(function(item){
            if (item.liesIn) {
                var liesIn = lookUp(item.liesIn, data);
                if (liesIn) {
                    item.liesIn = liesIn
                }
            }
        });
        res.send(req.response);
    },function(error){
        console.log('rejected with the error: '+error)
        res.send(error);
    });

}

api.get('/', function(req, res) {
  res.send({
    name: 'Demo',
    version: '0.0.1',
    message: 'Returning geojson and topojson'
  });
});

/**
* @api {get} /find search for countries by name, id or parent
* @apiVersion 0.1.0
* @apiName find
* @apiGroup geocoder
*
* @apiDescription search for countries by name, id or parent. Name, id and parent are mutually exclusive.
*
* @apiParam {String}    name      a name on which to search.
* @apiParam {String}    supra     a supra region (parent) ID by which to search (returns children of this region). E.g. 'oecd/WEUR'
* @apiParam {String}    id        id of country to search for. Composed of dataset + / + id: 'cshapes/1220'
* @apiParam {String}    [before]  latest date the result may be valid: '2015-01-01'
* @apiParam {String}    [after]   earliest date the result may be valid: '1870-12-31'
*
* @apiSuccess   {Object[]}  countries   list of results (Array of Objects)
*/
api.get('/find', findFromHg, attachOecdSupras);

/**
* @api {get} /ids return all historical countries in database with name and id
* @apiversion 0.1.0
* @apiName ids
* @apiGroup misc
*
* @apiDescription get a list of all historical country entities in the database, with id and name.
*
* @apiSuccess {String}	id	entity id (dataset + number)
* @apiSuccess {String}	name	entity name
*/
api.get('/ids', getIds);

/**
* @api {get} /fetch fetch countries by id
* @apiVersion 0.1.0
* @apiName fetch
* @apiGroup bulk
*
* @apiDescription when you know ids, you can request the full country records with geometry by id, name, or supra/parent. These three parameters are mutually exclusive. Note for all three of these parameters you can specify a comma-separated list of multiple identifiers.
*
* @apiParam {String}    name    the name(s) of the feature(s) to request (one of name, id, supra)
* @apiParam {String}    id      the id(s) of the feature(s) to request (one of name, id, supra)
* @apiParam {String}    supra   the id(s) of the parent(s) whose children you want to request (one of name, id, supra)
* @apiParam {String}    before  latest date the result may be valid: '2015-01-01'
* @apiParam {String}    after   earliest date the result may be valid: '1870-12-31'
*
* @apiSuccess   {Object[]}  countries   list of results (Array of Objects)
*
*/
api.get('/fetch', getCountries);
api.listen(8090, function() {
  console.log('Topojson API listening on port 8090');
});

