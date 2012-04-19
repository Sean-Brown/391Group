var pg = require('pg').native;
var conn = 'tcp://smbrown:smbrown@db-edlab.cs.umass.edu:7391/';
var user = {}

/*
 * GET home page.
 */
exports.ta = function(req, res) {
    if (user.name === undefined) {
	console.log("No user");
	res.render('travelaide', {title: 'Travel Aide Guest', message: 'Welcome'});
    }
    else {
	console.log("User = "+user.name);
	res.render('travelaide', {title: 'Travel Aide', message: 'Welcome'});
    }
};

// lilo = login logout
exports.lilo = function(req, res) {
    console.log("login/logout request");
    if (user.name !== undefined) {
	// User logged in, requesting to log out
	console.log("User "+user.name+" logging out");
	user = {};
	res.render('travelaide', {title: 'TravelAide Guest', message: 'Welcome'});
    }
    else if (req.body.upass2 !== undefined) {
	// an attempt to create an account
	console.log("Create account request");
	createNewAccount(req.body.uname, req.body.upass, function(err, obj) {
	    if (err) {
		console.log("Could not add user "+req.body.uname+": "+err);
		res.render('travelaide', {title: 'Travel Aide Guest', message: 'Unable To Create Account'});
	    }
	    else {
		console.log("Successfully added "+req.body.uname);
		res.render('travelaide', {title: 'Travel Aide Guest', message: 'Account Created Successfully'});
	    }
	});
    }
    else {
	// a login attempt
	console.log("Login attempt");
	verifyLogin(req.body.uname, req.body.upass, function(err, result) {
	    if (result === undefined) {
		console.log(err);
		res.render('travelaide', {title: 'Travel Aide Guest', message: 'Login Failed'});
	    }
	    else {
		user = {"name": req.body.uname};
		console.log("User "+user.name+" logged in");
		res.render('travelaide', {title: 'Travel Aide', message: 'Welcome'});
	    }
	});
    }
};

function createNewAccount(uname, upass, cb) {
    pg.connect(conn, function (err, client) {
        var sql = 'INSERT INTO users (name,pass) VALUES ($1,$2)';
        client.query(sql, [uname,upass],
                     function (err, result) {
                         cb(err, uname, upass)
                     });
    });
};

function verifyLogin(uname, upass, cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
	    throw err;
        }
        var query = client.query('SELECT name FROM users WHERE name=$1 AND pass=$2;', [uname,upass],
                                 function (err, result) {
				     cb(err, result)
                                 });
    });
};