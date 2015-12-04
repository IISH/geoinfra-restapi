var _ = require('highland');
var nconf = require('nconf');
try {
    nconf.file({file: process.env.GEOINFRA_API_CONFIG});
} catch (e) {
   console.log(e);
   console.log('error reading main configuration file. Is the environment variable GEOINFRA_API_CONFIG set?');
   process.exit(1)
}
var hg = require('./hgapi-bridge.js')(nconf.get('hg'));
var filter = require('./filterjson.js');

module.exports = function(req, res, next) {
    //what is the api of hg again?
    //for now, not using query-parser for HG because query-parser is only for SQL atm.
    var hgSource;
    var ident = req.query.id ? 'id': req.query.name ? 'name' : req.query.supra ? 'id' : 'id';
    if (req.query.supra) {
        hgSource = _(hg.fetch({path:'/search?related=hg:liesIn&related.'+ident+'='+req.processedQuery.val+'&geometry=false',method:'GET'}));
    } else {
        hgSource = _(hg.fetch({path:'/search?'+ident+'='+req.processedQuery.val+'&geometry=false', method: 'GET'}));
    }
    hgSource.map(function(x) {
        var features = JSON.parse(x.body).features;//roundabout!!! rather start the stream on body.features to begin with.
        //ok, here comes a dirty trick. If you closure eyes I poke you with a closure!
        var foo = features.map(function(val) {
            val.properties.pits = val.properties.pits.map(function(pit) {
                var obj = pit;
                obj._myself = function(){return features};
                obj._exp = {req:req,res:res};
                return obj
            })
            return val;
        });
        return _(foo);
    }).flatten()
    .map(filter.filterPitsOut).flatten()//should get all pits into one stream
    .filter(filter.filterActualOecdChildren) //filter the pits that are actually OECD children (not children-of-children)
    .filter(filter.filterPitsOnTime)  //filter the pits that match time range
    .filter(filter.filterCshapesGeacronPits) //we only want cshapes and geacron pits. NOTE: to be replaced by hg api function?
    .map(filter.attachRelations) //check for desired relations and add them
    .map(filter.attachLabel) //add a label property
    .stopOnError(function(err){
        console.log('something broke: '+err);
        res.send('error!');
    })
    .errors(function(err, push){
	push(err);
    }).toArray(function(x){
        res.header('Content-Type','application/json');
        req.response = x;
        next();
    })
}
