var _ = require('highland');
var hg = require('./hgapi-bridge.js')();
var filter = require('./filterjson.js');


//so test 1 is to get stuff from histograph as a stream.
//hg.fetch is a function that returns a promise.
//so I should be able to wrap it as an asynchronous stream source ...


module.exports = function(req, res) {
    var hgSource = _(hg.fetch({path:'/search?name='+req.query.name+'&geometry=false', method: 'GET'}));
    console.log('HELLOOOOOOOO!');

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
    }).flatten().map(filter.filterPitsOut).flatten()//should get all pits into one stream
    .filter(filter.filterPitsOnTime)  //filter the pits that match time range
    .map(filter.attachRelations) //check for desired relations and add them
    .stopOnError(function(err){
        console.log('something broke: '+err);
        res.send('error!');
    })
    .errors(function(err, push){
    }).toArray(function(x){
        res.header('Content-Type','application/json');
        res.send(x);
    })
}


//ok, that works. Now I need to wire up my filter function to create the right pits and things.
