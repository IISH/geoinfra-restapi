var topojson = require('topojson');


var makeTopo = function(data){
    var tj = topojson.topology({countries:data},
	{"property-transform": function(feature){
            return feature.properties
	}
    	}
    );
    for (var i=0;i<tj.objects.countries.geometries.length;i++) {
        var c = tj.objects.countries.geometries[i];
        c.arcs = c.arcs.filter(function(element, index, array) { 
            return element.length > 0;
        })
    }
    return tj;   
}

//helper: SQL for single or multi query
var singleOrMulti = function(param, string) {
    var eqorin, sel;
    if (param.split(',').length > 1) {
        eqorin = ' IN ';
        if (string) {
            sel = "('"+param.split(',').join("','")+"')";
        } else {
            sel = "("+param.split(',').join(",")+")";
        }
    } else {
        eqorin = ' = ';
        sel = string ? "'"+param+"'" : param;
    }
    return {q:eqorin+sel,eqorin:eqorin};
};

//build the query string based on query parameters
var buildQuery = function(req) {
    //TODO: watch out for source_id query. Now temporary solution for appending more filters.
    //var geojsonquery = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geometry, 6, 0)::json As geometry, row_to_json((SELECT l FROM (SELECT CASE when source_id = 1 then 'cshapes/'||id  when source_id = 2 then 'geacron/'||id end as id, name, lower(time) as validSince, upper(time) as validUntil) As l )) As properties FROM geoinfra.entities As lg where source_id in (1, 2)";
    //don't send the database name
    var geojsonquery = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geometry, 6, 0)::json As geometry, row_to_json((SELECT l FROM (SELECT id, name, lower(time) as validSince, upper(time) as validUntil) As l )) As properties FROM geoinfra.entities As lg where source_id in (1, 2)";
    var querytail = ") As f) As fc;";
    var query, ident, timerange;
    if  (req.query.name && req.query.id) {
        throw "cannot specify both name and id parameters at once";
    }
    
    //build the query filters to identify by name, id, supra.
    if (req.query.name || req.query.id) {
        //set name string or id string
        if (req.query.name) {
            var q = singleOrMulti(req.query.name, 'string');
            ident = " and name "+q.q;

        } else if (req.query.id) {
            var q = singleOrMulti(req.query.id);
            ident = " and id "+q.q;

        }           
    } else if (req.query.supra) {
        var q = singleOrMulti(req.query.supra, 'string');
        ident = " and id in (select fid from geoinfra.relations where tid "+q.eqorin+" (select id from geoinfra.entities where concept_id "+q.q+"))";
    
    }else {
       ident = '';
    }
    
    //build query filters for timerange
    if (req.query.year) {
        timerange = " and time && daterange('"+req.query.year+"-01-01','"+req.query.year+"-12-31')";
    } else if (req.query.after && req.query.before) {
        timerange = " and time && daterange('"+req.query.after+"-01-01','"+req.query.before+"-12-31')";

    } else {
        timerange = " and time && daterange('2012-01-01','2012-12-31')";
    }

    //return complete built-up query
    query = geojsonquery+ident+timerange+querytail;
    return query;
}

module.exports = {
    makeTopo: makeTopo,
    buildQuery: buildQuery
}


