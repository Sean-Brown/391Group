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
  app.use(express.cookieParser());
  app.use(express.session({secret: 'travelaide'}));
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
app.get('/list', routes.list);
app.get('/my_countries', routes.my_countries);
app.get('/login', routes.login);
app.get('/json', function(req,res) {
    res.contentType('json');
    res.sendfile('public/json/currencies.json', function(err) {
	if(err) {
//	    console.log("Error sending currencies.json");
	}
	else {
//	    console.log("Successfully sent currencies.json");
	}
    });
});
app.post('/create', routes.create);
app.post('/login', routes.login);
app.post('/logout', routes.logout);
app.post('/add', routes.add);
app.post('/remove', routes.remove);
app.post('/ta', routes.login);
app.post('/remove', routes.removeCountry);
app.post('/remove_account', routes.remove_account);
// Custom 404 page
app.get('*', function(req,res) {
    res.render('404', {title:"Error"});
});

app.listen(5069);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
