var pg = require('pg').native;
var conn = 'tcp://smbrown:smbrown@db-edlab.cs.umass.edu:7391/';

/*
 * GET home page.
 */
exports.home = function(req, res) {
    // Set the header to not cache
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.user === undefined) {
	res.redirect('/login');
    }
    else {
	res.render('travelaide', {title: 'TravelAide', user: req.session.user});    
    }
};

// Create an account
exports.create = function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    // an attempt to create an account                                                                    
    createNewAccount(req.body.uname, req.body.upass, function(err, obj) {
        if (err) {
            console.log("Could not add user "+req.body.uname+": "+err);
            res.render('login', {title: 'TravelAide Login', message: 'Unable To Create Account'});
        }
        else {
            console.log("Successfully added "+req.body.uname);
	    req.session.user = req.body.uname;
	    res.redirect('/');
        }
    });
};

exports.login = function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    // A login attempt, call the verifyLogin helper function (further down)
    verifyLogin(req.body.uname, req.body.upass, function(err, result) {
	if (result.rows.length === 0) {
	    res.render('login',{title: "TravelAide Guest", message:"Login failed, try again"});
	}
	else {
	    // A valid login, set the user object
	    req.session.user = result.rows[0].name;
	    console.log("User "+req.session.user+" logged in");
	    res.redirect('/');
	}
    });
};

// User logged in, requesting to log out
exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('/login');
};

// Add a destination country for this user using the addCountry helper function
exports.add = function (req, res) {
    addCountry(req.session.user, req.body.country, function(err, result) {
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

// Remove a country for a user, it's very similar to adding a country
exports.removeCountry = function (req, res) {
    deleteCountry(req.session.user,req.body.country, function(err, result) {
	if (err) {
	    console.log("Error removing country: "+err);
	    res.contentType('application/json');
            res.send({'Error':'Sorry, could not remove '+req.body.country});
	}
	else {
	    console.log("Successfully removed country: "+req.body.country);
	    res.contentType('application/json');
            res.send({'Success':'Successfully removed '+req.body.country});
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

// List the countries a user wants to visit
exports.my_countries = function (req, res) {
    listMyCountries(req.session.user, function(err, result) {
        // Create the return array
        var ret = [];
        for(var i = 0; i < result.rows.length; i++) {
            ret.push(result.rows[i]);
        }
        res.contentType('application/json');
        res.send(ret);
    });
};

exports.remove_account = function (req, res) {
    removeAccount(req.session.user, function(err, result) {
	if (err) {
	    console.log("User "+req.session.user+" unsuccessfully deleted their account, do it for them");
	}
	else {
	    // ?
	}
	req.session.destroy();
	res.redirect("/login");
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
function addCountry(user,country, cb) {
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
function listMyCountries(user,cb) {
    pg.connect(conn, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT destination FROM dests WHERE name=$1 ORDER BY destination;', [user],
                     function (err, result) {
                         cb(err, result)
                     });
    });
};

// The helper function to delete a country for a user
function deleteCountry(user,country,cb) {
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

// The helper function for account deletion
function removeAccount(user, cb) {
    pg.connect(conn, function (err, client) {
	if (err) {
	    throw err;
	}
	client.query('DELETE FROM users WHERE name=$1;', [user]);
	client.query('DELETE FROM dests WHERE name=$1;', [user],
		     function (err, result) {
			 cb (err, result);
		     });
    });
};