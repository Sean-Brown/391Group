/**
 * Module dependencies.
 */
var express = require('express')
, routes = require('./routes')
, app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade');
    } else {
        next(err);
    }
});

// Routes
app.get('/ta', routes.ta);
app.post('/ta', routes.lilo);
app.post('/add', routes.add);
app.get('/list', routes.list);
app.get('/10', routes.top10);
app.get('/count', routes.count);

app.listen(5069);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
