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
    var valSince = new Date(value.validSince[0]), valTil = new Date(value.validUntil[0]);//TODO error handling
    if (value._exp.req.query.after && value._exp.req.query.before) {
        var a = value._exp.req.query.after, b = value._exp.req.query.before;
        var start = new Date(a+'-01-01'), end = new Date(b+'-12-31');
        return((valSince <= end) && (valTil >= start));
    } else if (value._exp.req.query.after && !value._exp.req.query.before) {
        var start = new Date(value._exp.req.query.after+'-01-01'), end = Date.now();
        return((valSince <= end) && (valTil >= start));
    } else if (!value._exp.req.query.after && value._exp.req.query.before) {
        var end = new Date(value._exp.req.query.before+'-12-31');
        return(valTil <= end);
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

var filterActualOecdChildren = function(value) {
    //
    if (value._exp.req.query.supra) {
        if ( value.relations && value.relations["hg:liesIn"]) {
            if (value.relations["hg:liesIn"].length >= 1 ) {
                var liesIn = false;
                for (var i=0;i<value.relations['hg:liesIn'].length;i++) {
                    relItem = value.relations['hg:liesIn'][i]['@id'].split('/');
                    if (relItem[0] == 'oecd') {
                        liesIn = true;
                        break;
                    }
                }
                console.log('FOUND OUNEEEEEEEE');
                console.log(value.name);
                console.log(liesIn);
                return liesIn;
            }
        } else {
            return false
        }
    } else {
        return true;
    }
}

var attachRelations = function(value) {
    var allFeatures = value._myself();
    var item = {};
    item.id = value.id.split('/')[1]; item.name=value.name;
    //attach OECD Supra region
    if ( value.relations && value.relations["hg:liesIn"]) {
        console.log('yoooooo!');
        console.log(value.relations["hg:liesIn"].length);
        for (var r=0; r<value.relations["hg:liesIn"].length; r++ ) {
            console.log(r);
            console.log('RELAAAAAS');
            var rel = value.relations["hg:liesIn"][r]["@id"].split('/');
            console.log('RELATIONSHIPS');
            console.log(rel);
            if (rel[0] == 'oecd') {
                item.liesIn = rel[1];
            } else if (rel[0] == 'cshapes' || rel[0] == 'geacron') {
                if (value.hairs) {
                        for (var i=0;i<value.hairs.length;i++) {
                            console.log('hohoho');
                            console.log(value.hairs[i]);
                            if (value.hairs[i].id == rel[1] ) {
                                item.parentCountryName = value.hairs[i].name;
                            }
                        }
                }
                item.parentCountryId = rel[1];
            }
        }
    }
    //attach OECD country identifier (ISO3) if exists.
    if (value.relations && value.relations['hg:sameHgConcept']) {
        for (var i=0;i<value.relations['hg:sameHgConcept'].length;i++) {
            relItem = value.relations['hg:sameHgConcept'][i]['@id'].split('/');
            if (relItem[0] == 'oecd') {
                item.oecdCode = relItem[1];
                break;
            }
        }
    }
    item.validUntil = value.validUntil[0];
    item.validSince = value.validSince[0];
    return item;

}

var attachLabel = function(value) {
    value.label = value.name+(value.parentCountryName?', '+value.parentCountryName:' ')+' ('+value.validSince+' — '+value.validUntil+')';
    value.year = value.name+(value.parentCountryName?', '+value.parentCountryName:' ')+' ('+value.validSince.split('-')[0]+' — '+value.validUntil.split('-')[0]+')'
    return value;
}

module.exports = {
    filterPitsOut: filterPitsOut,
    filterPitsOnTime: filterPitsOnTime,
    attachRelations: attachRelations,
    filterCshapesGeacronPits: filterCshapesGeacronPits,
    attachLabel: attachLabel,
    filterActualOecdChildren: filterActualOecdChildren 
}
