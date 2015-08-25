var R = require('rsvp');
var topojson = require('topojson');


var makeTopo = function(data){
    var tj = topojson.topology({countries:data},{"property-transform": function(feature){return feature.properties}});
    return tj;   
}

//helper: SQL for single or multi query
var singleOrMulti = function(param) {
    var eqorin, sel;
    if (param.split(',').length > 1) {
        eqorin = ' IN ';
        sel = "('"+param.split(',').join("','")+"')";
    } else {
        eqorin = ' = ';
        sel = "'"+param+"'";
    }
    return eqorin+sel;
};

//build the query string based on query parameters
var buildQuery = function(req) {
    //TODO: watch out for source_id query. Now temporary solution for appending more filters.
    var geojsonquery = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geometry, 6, 0)::json As geometry, row_to_json((SELECT l FROM (SELECT (concept_id||extract(year from lower(time))::text) as id, name, lower(time) as begin, upper(time) as end) As l )) As properties FROM geoinfra.entities As lg where source_id in (1, 2)";
    var querytail = ") As f) As fc;";
    var query, ident, timerange;;
    if  (req.query.name && req.query.id) {
        throw "cannot specify both name and id parameters at once";
    }
    
    //build the query filters to identify by name, id, supra.
    if (req.query.name || req.query.id) {
        //set name string or id string
        if (req.query.name) {
            var q = singleOrMulti(req.query.name);
            ident = " and name "+q;

        } else if (req.query.id) {
            var q = singleOrMulti(req.query.id);
            ident = " and concept_id "+q;

        }           
    } else if (req.query.supra) {
        var q = singleOrMulti(req.query.supra);
        ident = " and id in (select fid from geoinfra.relations where tid = (select id from geoinfra.entities where concept_id = '"+req.query.supra+"'))";
    
    }else {
       ident = '';
    }
    
    //build query filters for timerange
    if (req.query.year) {
        timerange = "and time && daterange('"+req.query.year+"-01-01','"+req.query.year+"-12-31')";
    } else if (req.query.start_year && req.query.end_year) {
        timerange = "and time && daterange('"+req.query.start_year+"-01-01','"+req.query.end_year+"-12-31')";

    } else {
        timerange = " and time && daterange('2012-01-01','2012-12-31')";
    }

    //return complete built-up query
    console.log(ident+timerange);
    query = geojsonquery+ident+timerange+querytail;
    return query;
}

//fetch GeoJSON from database
var getGeoJson = function(qu) {
    var promise = new R.Promise(function(resolve,reject) {
        db.connect()
        .then(function(obj){
            sco = obj;

            return sco.query(qu);
        })
        .then(function(data){
            resolve(data);
        })
        .then(null,function(error){
            console.log(error);
            return res.status(500).send('Internal server error.');
        process.exit(1);
        });    
    });
    return promise;
    
}



module.exports = {
    makeTopo: makeTopo,
    buildQuery: buildQuery
}


