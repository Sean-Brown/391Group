var pg = require('pg').native;
var conn = 'tcp://smbrown:smbrown@db-edlab.cs.umass.edu:7391/';
var user = '';

/*
 * GET home page.
 */
exports.ta = function(req, res) {
    if (user !== '') {
	// There is a user
	req.session.user = user;
    }
    res.render('travelaide', {title: 'TravelAide', message: 'Welcome'});    
};

// Create an account
exports.create = function(req, res) {
    // an attempt to create an account                                                                    
    createNewAccount(req.body.uname, req.body.upass, function(err, obj) {
        if (err) {
            console.log("Could not add user "+req.body.uname+": "+err);
            res.render('travelaide', {title: 'Travel Aide Guest', message: 'Unable To Create Account'});
        }
        else {
            console.log("Successfully added "+req.body.uname);
	    res.redirect('/ta');
        }
    });
};

exports.login = function(req, res) {
    // A login attempt, call the verifyLogin helper function (further down)
    verifyLogin(req.body.uname, req.body.upass, function(err, result) {
	if (result.rows.length === 0) {
	    res.render('travelaide', {title: 'Travel Aide Guest', message: 'Welcome, Please Log In'});
	}
	else {
	    // A valid login, set the user object
	    user = result.rows[0].name;
	    console.log("User "+user+" logged in");
	    req.session.user = user;
	    res.redirect('/ta');
	}
    });
};

// User logged in, requesting to log out
exports.logout = function(req, res) {
    user = '';
    req.session.destroy();
    res.redirect('/ta');
};

// Add a destination country for this user using the addCountry helper function
exports.add = function (req, res) {
    addCountry(user, req.body.country, function(err, result) {
	if (err) {
	    console.log("Error adding country: "+err);
	    res.contentType('application/json');
            res.send({'Error':'Could not add '+req.body.country+', it\'s likely already on your list.'});
	}
	else {
	    console.log("Successfully added country: "+req.body.country);
	    res.contentType('application/json');
            res.send({'Success':'Successfully added '+req.body.country});
	}
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
        res.send(ret);
    });
};

// A simple function to count the number of countries a user wants to visit
exports.count = function (req, res) {
    getCount(function(err, result) {
        res.contentType('application/json');
        res.send(result.rows[0]);
    });
};

// Tells if there's a user
exports.logged_in = function (req, res) {
    res.contentType('application/json');
    res.send({'user':user});
};

exports.removeCountry = function (req, res) {
    deleteCountry(req.body.country,function(err, result) {
	if (err) {
	    console.log("Error removing country "+req.country+" for user "+user);
	    res.contentType('application/json');
	    res.send({'Error':'Error removing '+req.body.country+', try again later'});
	}
	else {
	    res.contentType('application/json');
	    res.send({'Success':'Successfully removed '+req.body.country});
	}
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
        client.query('SELECT name FROM users WHERE name=$1 AND pass=$2', [uname,upass],
                     function (err, result) {
			 cb(err, result);
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
        client.query('SELECT destination,COUNT(*) FROM dests GROUP BY destination ORDER BY COUNT(*) ASC;',
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
        client.query('SELECT destination FROM dests WHERE name=$1;', [user],
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
        client.query('SELECT count(*) FROM dests WHERE name=$1;', [user],
                     function (err, result) {
                         cb(err, result)
                     });
    });
};

// The helper function to delete a country for a user
function deleteCountry(country, cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('DELETE FROM dests WHERE destination=$1 AND name=$2;', [country,user],
                     function (err, result) {
                         cb(err, result)
                     });
    });
};