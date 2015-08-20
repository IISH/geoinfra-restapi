//parse queries. Validate against schema.


module.exports = function(req, res, next) {
   var processedQuery = {};




   req.processedQuery = processedQuery;
   next();
}
