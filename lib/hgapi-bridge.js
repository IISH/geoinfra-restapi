//send and receive requests from the histograph api

var rsvp = require('rsvp');
var request = rsvp.denodeify(require('request'));

function reqOptParse(baseOpts, options) {
    var opts = {};
    opts.baseUrl = baseOpts.baseUrl;
    opts.uri = options.path;
    opts.method = options.method;
    return opts;
}

var foo = function(opts) {
    var i = {};	
    i.opts = opts;
    i.fetch = function(options) {
            var promise = new rsvp.Promise(function(resolve, reject) {
                var opts = reqOptParse(i.opts, options);
            request(opts).then(function(response) {
                    resolve(response)
                },function(error) {
                    console.log(error);
                reject('there was an error');
                })
            }) 
            return promise;
        }
    return i;
}
module.exports = foo;
