var pg = require('pg').native;
var conn = 'tcp://smbrown:smbrown@db-edlab.cs.umass.edu:7391/';
var user = {}

/*
 * GET home page.
 */
exports.ta = function(req, res) {
    // The home page using lazy verification (verify the user based on the title of the page)
    if (user.name === undefined) {
	// No user
	res.render('travelaide', {title: 'Travel Aide Guest', message: 'Welcome'});
    }
    else {
	// There is a user
	res.render('travelaide', {title: 'Travel Aide', message: 'Welcome'});
    }
};

// lilo = login logout
exports.lilo = function(req, res) {
    if (user.name !== undefined) {
	// User logged in, requesting to log out
	user = {};
	res.render('travelaide', {title: 'TravelAide Guest', message: 'Welcome'});
    }
    else if (req.body.upass2 !== undefined) {
	// an attempt to create an account
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
	// A login attempt, call the verifyLogin helper function (further down)
	verifyLogin(req.body.uname, req.body.upass, function(err, result) {
	    if (result === undefined) {
		console.log(err);
		res.render('travelaide', {title: 'Travel Aide Guest', message: 'Login Failed'});
	    }
	    else {
		// A valid login, set the user object
		user = {"name": req.body.uname};
		console.log("User "+user.name+" logged in");
		// Yay lazy verification!
		res.render('travelaide', {title: 'Travel Aide', message: 'Welcome'});
	    }
	});
    }
};

// Add a destination country for this user using the addCountry helper function
exports.add = function (req, res) {
    addCountry(user.name, req.body.country, function(err, result) {
	if (err) {
	    console.log("Error adding country: "+err);
	}
	else {
	    console.log("Successfully added country: "+req.body.country);
	}
	res.render('travelaide', {title: 'Travel Aide', message: 'Country Added'});
    });
};

// List the countries that users want to visit, ordered by popularity
exports.list = function (req, res) {
    listCountries(function(err, result) {
	// Create the return array
	var ret = [];
	for(var i = 0; i < result.rows.length; i++) {
	    // Push an object into this array
	    ret.push({'country':result.rows[i].destination,'count':result.rows[i].count});
	}
	res.contentType('application/json');
	res.send({'countries':ret});
    });
};

// List the countries a user wants to visit (maximum of 10)
exports.top10 = function (req, res) {
    list10(function(err, result) {
        // Create the return array
        var ret = [];
        for(var i = 0; i < result.rows.length; i++) {
            ret.push(result.rows[i]);
        }
        res.contentType('application/json');
        res.send({'top10':ret});
    });
};

// A simple function to count the number of countries a user wants to visit
exports.count = function (req, res) {
    getCount(function(err, result) {
        res.contentType('application/json');
        res.send({'count':result.rows[0]});
    });
};

// The helper function for creating a new account
function createNewAccount(uname, upass, cb) {
    pg.connect(conn, function (err, client) {
        var sql = 'INSERT INTO users (name,pass) VALUES ($1,$2)';
        client.query(sql, [uname,upass],
                     function (err, result) {
                         cb(err, uname, upass)
                     });
    });
};

// The helper function for logging in
function verifyLogin(uname, upass, cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
	    throw err;
        }
        client.query('SELECT name FROM users WHERE name=$1 AND pass=$2;', [uname,upass],
                                 function (err, result) {
				     cb(err, result)
                                 });
    });
};

// The helper function for adding a country to the user's destinations
function addCountry(user, country, cb) {
    pg.connect(conn, function (err, client) {
        var sql = 'INSERT INTO dests (name,destination) VALUES ($1,$2)';
        client.query(sql, [user,country],
                     function (err, result) {
			 cb(err, result)
                     });
    });
};

// The helper function for listing countries that all users want to visit, ordered by popularity
function listCountries(cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT destination,COUNT(*) FROM dests GROUP BY destination ORDER BY COUNT(*) DESC;',
                                 function (err, result) {
                                     cb(err, result)
                                 });
    });
};

// The helper function for listing the countries a specific user wants to visit
function list10(cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT destination FROM dests WHERE name=$1;', [user.name],
                     function (err, result) {
                         cb(err, result)
                     });
    });
};

// The helper function for getting a count of countries a user wants to visit
function getCount(cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT count(*) FROM dests WHERE name=$1;', [user.name],
                     function (err, result) {
                         cb(err, result)
                     });
    });
};