var test = require('tape');
var app = require('../index.js');
var hg = require('../lib/hgapi-bridge.js')();
//var pg = require('../lib/pgapi-bridge.js')();
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
//test('backend APIs', function(t) {
//    t.plan(1);
//
//    var pgres = pg.test();
//    var hgres = hg.test();
//    //##TEST
//    t.equal(pgres, hgres, 'pg and hg return the same value');
//});
//
//
//test('pg connection works', function(t) {
//    var fs = require('fs');
//    var nconf = require('nconf');
//    nconf.file({file: './config.json'});
//    //console.log(nconf.get('db'));
//    //connect to db with 'db' from config
//    var pg = require('../lib/pgapi-bridge.js')(nconf.get('db'));
//    t.plan(2);
//    pg.db.connect()
//    .then(function(sco){
//        //console.log('connected to database')
//        return sco.query('select 12 + 5 as result;');
//    })
//    .then(function(data){
//        //console.log(data);
//    //##TEST
//        t.equal(17,data[0].result, 'selecting 12 + 5 from database gives 17');
//    }).catch(function(error){
//        //console.log(error)
//    })
//    pg.fetch('select 12 +5 as result;')
//    .then(function(data) {
//    //##TEST
//        t.equal(17,data[0].result, 'selecting 12 + 5 from database gives 17');
//    }).catch(function(error){
//        //console.log(error)
//    })
//})
//
//
//test('pg connector handles string and object queries', function(t) {
//    var fs = require('fs');
//    var nconf = require('nconf');
//    nconf.file({file: './config.json'});
//    t.plan(1);
//    console.log(nconf.get('db'));
//    var pg = require('../lib/pgapi-bridge.js')(nconf.get('db'));
//    pg.fetch('select 12;')
//    .then(function(data){
//        console.log(data)
//        t.ok(data, 'get a response with a valid string query');
//    }).catch(function(error){
//        console.log(error)
//    });
//    //pg.fetch({name:'foo'})
//    //.then(function(data){
//    //    console.log(data)
//    //    t.ok(data, 'get a response with a valid object query');
//    //}).catch(function(error){
//    //    console.log(error)
//    //});
//
//
//})
//
//
//test('query-sequel makes proper SQL strings from query objects', function(t) {
//    var q2s = require('../lib/query-sequel.js');
//    var testStrings = [
//        "SELECT id, name, lower(time) AS \"validSince\", upper(time) AS \"validUntil\" FROM geoinfra.entities WHERE (to_tsquery('Germany') @@ to_tsvector(name))",
//        "SELECT id, name, lower(time) AS \"validSince\", upper(time) AS \"validUntil\" FROM geoinfra.entities WHERE (to_tsquery('Germany') @@ to_tsvector(name) AND time && daterange('2012-01-01','2012-12-31'))",
//    ];
//    var testQueries = [
//        {val: 'Germany', alias: 'foo', from: 'entities', compareField:'name'},
//        {val: 'Germany', alias: 'foo', from: 'entities', compareField: 'name', timerange: "AND time && daterange('2012-01-01','2012-12-31')"}
//    ];
//    //t.plan(testQueries.length);
//    //for (var i=0; i<testQueries.length; i++){
//    //    t.equal(q2s(testQueries[i]),testStrings[i], 'query '+(i+1)+' of '+testQueries.length);
//    //}
//    //console.log(q2s(testQueries[0]))
//})
