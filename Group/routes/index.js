var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' })
};

exports.ta = function(req, res) {
    res.render('travelaide', {title: 'Travel Aide'});
};