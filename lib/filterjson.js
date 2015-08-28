//it would actually be nicer to write this as a kind of 'stream'.
//it would abstract away all those nested bracket notations ...
//var filterFeatures = function(value){
//    var item = {};
//    item.id = value.id; item.name=value.name;
//    if ( value.relations && value.relations["hg:liesIn"]) {
//        item.liesIn = value.relations["hg:liesIn"];
//    }
//    if (value.relations && value.relations['hg:sameHgConcept']) {
//        item.oecdCode = value.relations['hg:sameHgConcept'][0]['@id'];
//    }
//};

//testing out a method to just append all the features together.
//kind of like JSONStream can do for us.
var filterPitsOut = function(value) {
    return value.properties.pits;
}

var filterPitsOnTime = function(value) {
    if (value._exp.req.query.after && value._exp.req.query.before) {
    return( value.validSince > value._exp.req.query.after && value.validUntil <= value._exp.req.query.before);
    }
    return value;
};

var attachRelations = function(value) {
    var allFeatures = value._myself();
    var item = {};
    item.id = value.id; item.name=value.name;
    if ( value.relations && value.relations["hg:liesIn"]) {
        item.liesIn = value.relations["hg:liesIn"];
    }
    if (value.relations && value.relations['hg:sameHgConcept']) {
        item.oecdCode = value.relations['hg:sameHgConcept'][0]['@id'].split('/')[1];
    }
    item.validUntil = value.validUntil;
    item.validSince = value.validSince;
    return item;

}

module.exports = {
    filterPitsOut: filterPitsOut,
    filterPitsOnTime: filterPitsOnTime,
    attachRelations: attachRelations
}
