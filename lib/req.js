var rsvp = require('rsvp');
var request = rsvp.denodeify(require('request'));

function reqOptParse(options) {
    var baseUrl = 'http://192.168.101.226:3001';
    var opts = {};
    opts.baseUrl = baseUrl;
    opts.uri = options.path;
    opts.method = options.method;
    return opts;
}

//reuseable http requester
var req = function(options) {
    var promise = new rsvp.Promise(function(resolve, reject) {
        var opts = reqOptParse(options);
        console.log(opts);
	request(opts).then(function(response) {
            resolve(response)
        },function(error) {
            console.log(error);
	    reject('there was an error');
        })
    }) 
    return promise;
}

module.exports = req;
