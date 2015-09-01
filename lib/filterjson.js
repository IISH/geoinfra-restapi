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
    //heehee: http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    //(StartA <= EndB)  and  (EndA >= StartB)
    var valSince = new Date(value.validSince), valTil = new Date(value.validUntil);
    if (value._exp.req.query.after && value._exp.req.query.before) {
        var a = value._exp.req.query.after, b = value._exp.req.query.before;
        var start = new Date(a+'-01-01'), end = new Date(b+'-12-31');
        return((valSince <= end) && (valTil >= start));
    } else if (value._exp.req.query.after && !value._exp.req.query.before) {
        var start = new Date(value._exp.req.query.after+'-01-01'), end = Date.now();
        return((valSince <= end) && (valTil >= start));
    } else if (!value._exp.req.query.after && value._exp.req.query.before) {
        var end = new Date(value._exp.req.query.before+'-12-31');
        return(valUntil <= end);
    } else if (value._exp.req.query.year) {
        var y = value._exp.req.query.year;
        var start = new Date(y+'-01-01'), end = new Date(y+'-12-31');
        return ((valSince <= end) && (valTil >= start));
    }
    return value;
};

var filterCshapesGeacronPits = function(value) {
    if (value.dataset == 'cshapes' || value.dataset == 'geacron') {
        return value;
    }
}

var attachRelations = function(value) {
    var allFeatures = value._myself();
    var item = {};
    item.id = value.id; item.name=value.name;
    //attach OECD Supra region
    if ( value.relations && value.relations["hg:liesIn"]) {
        if (value.relations["hg:liesIn"].length == 1 ) {
            item.liesIn = value.relations["hg:liesIn"][0]['@id'].split('/')[1];
        }
    }
    //attach OECD country identifier (ISO3) if exists.
    if (value.relations && value.relations['hg:sameHgConcept']) {
        relItem = value.relations['hg:sameHgConcept'][0]['@id'].split('/');
        if (relItem[0] == 'oecd') {
            item.oecdCode = relItem[1];
        }
    }
    item.validUntil = value.validUntil;
    item.validSince = value.validSince;
    return item;

}

module.exports = {
    filterPitsOut: filterPitsOut,
    filterPitsOnTime: filterPitsOnTime,
    attachRelations: attachRelations,
    filterCshapesGeacronPits: filterCshapesGeacronPits
}
