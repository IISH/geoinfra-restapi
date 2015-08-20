var test = require('tape');
var app = require('../index.js');
var hg = require('../lib/hgapi-bridge.js')();
var pg = require('../lib/pgapi-bridge.js')();
var pretty = require('prettyjson');


//hg.req({path: '/search?name=Netherlands', method: 'GET'})
//.then(function(response) {
//    console.log(pretty.render(response.body));
//    app.pg.test();
//    return (response);
//},function(error){
//   console.log(pretty.render(error))
//})
//.then(function(response){
//    console.log('RESPONSE'+response);
//    hg.req({path: '/search?name=Netherlands&geometry=false',method: 'GET'})
//	.then(function(response) {
//	   console.log(pretty.render(response.body))
//	},function(error){
//	    console.log('error:');
//	   console.log(pretty.render(error))
//	})
//
//
//})
//.catch(function(error){
//  console.log('THIS IS THE FINAL CALL');
//  console.log(error);
//});

//backend API integration
test('backend APIs', function(t) {
    t.plan(1);

    var pgres = pg.test();
    var hgres = hg.test();
    //##TEST
    t.equal(pgres, hgres, 'pg and hg return the same value');
});


test('pg connection works', function(t) {
    var fs = require('fs');
    var nconf = require('nconf');
    nconf.file({file: './config.json'});
    console.log(nconf.get('db'));
    //connect to db with 'db' from config
    var pg = require('../lib/pgapi-bridge.js')(nconf.get('db'));
    t.plan(2);
    pg.db.connect()
    .then(function(sco){
        console.log('connected to database')
        return sco.query('select 12 + 5 as result;');
    })
    .then(function(data){
        console.log(data);
    //##TEST
        t.equal(17,data[0].result, 'selecting 12 + 5 from database gives 17');
    }).catch(function(error){
        console.log(error)
    })
    pg.fetch('select 12 +5 as result;')
    .then(function(data) {
    //##TEST
        t.equal(17,data[0].result, 'selecting 12 + 5 from database gives 17');
    }).catch(function(error){
        console.log(error)
    })
})


test('pg connector handles string and object queries', function(t) {
    var fs = require('fs');
    var nconf = require('nconf');
    nconf.file({file: './config.json'});
    t.plan(2);
    var pg = require('../lib/pgapi-bridge.js')(nconf.get('db'));
    pg.fetch('select 12;')
    .then(function(data){
        console.log(data)
        t.ok(data, 'get a response with a valid string query');
    }).catch(function(error){
        console.log(error)
    });
    pg.fetch({name:'foo'})
    .then(function(data){
        console.log(data)
        t.ok(data, 'get a response with a valid object query');
    }).catch(function(error){
        console.log(error)
    });


})


test('query-sequel makes proper SQL strings from query objects', function(t) {
    var q2s = require('../lib/query-sequel.js');
    var testStrings = [
        'select 12 as foo;',
        ''
    ];
    var testQueries = [
        {val: 12, alias: 'foo'}, //use an alias
        {} //empty query
    ]
    t.plan(testQueries.length);
    for (var i=0; i<testQueries.length; i++) {
        t.equal(testStrings[i], q2s(testQueries[i]));

    }






})
