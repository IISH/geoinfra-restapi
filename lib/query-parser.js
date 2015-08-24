//parse queries. Validate against schema.


module.exports = function(req, res, next) {
    var processedQuery = {};
    processedQuery.compareField = req.path == '/testres/' ? 'test' :
        req.path == '/find/' ? 'entities' :
        req.path == '/fetch/' ? 'all' :
        'nopath';
    if (req.query.year) {
        processedQuery.timerange = " AND time && daterange('"+req.query.year+"-01-01','"+req.query.year+"-12-31')";
    } else if (req.query.after && req.query.before) {
        processedQuery.timerange = " AND time && daterange('"+req.query.after+"-01-01','"+req.query.before+"-12-31')";
    } else {
        processedQuery.timerange = ''
    }
    processedQuery.val = req.query.name;
    processedQuery.from = 'entities';
    console.log('the processedQuery is now')
    console.log(processedQuery);
    req.processedQuery = processedQuery;
    next();
}
