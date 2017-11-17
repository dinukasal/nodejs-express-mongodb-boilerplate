// get all required items
var express = require('express');
var engines = require('consolidate');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');
var logger = require('morgan');
var path = require('path');
var favicon = require('serve-favicon');
var port = process.env.PORT || 8080;
var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/piu';

var app = express();
var jsonexport = require('jsonexport');
console.log(require('dotenv').config())

// configure our server
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// pug configuration
const pug = require('pug');
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


// make sure we can connect to database before starting server
MongoClient.connect(mongoUri, function (err, db) {

    assert.equal(null, err);
    console.log('Successfully connected to mongodb');

    app.get('/', function (req, res) {
        //db.collection('movies').find({}).toArray(function (err, docs) {
            //res.render('index', { 'movies': docs });
            res.render("home");
        // });
    });

    app.get('/f', function (req, res) {
        res.render('final',{id:req.query.id});
    });

    app.get('/0', function (req, res) {
        res.render('home',{show:false});
    });

    app.get('/1', function (req, res) {
        res.render('home',{show:true});
    });

    app.get('/lines', function (req, res) {
        res.render('lines',{show:req.query.show});
    });

    app.get('/967', function (req, res) {   //clear data
        db.collection("data").remove({},function(err,removed){
            res.send(removed);
        });
    });

    app.get('/add', function (req, res) {
        res.render('add');
    });

    app.get('/thank', function (req, res) {
        res.render('thank');
    });

    // app.get('/feedback', function (req, res) {
    //     res.render('final',{data:req.query});
    // });

    app.get('/viewcsv', function (req, res) {
        db.collection("data").find({},{"_id":0,"name":1,"value":1}).toArray(function(err,docs){
            jsonexport(docs,function(err,csv){

                res.send(csv);
            })
        })
    });

    app.get('/view', function (req, res) {
        db.collection("data").find({}).toArray(function(err,docs){
            res.send(docs);
        })
    });

    app.post('/save', function (req, res) {
        //res.send(req.body);
        db.collection("data").insert(req.body).then(function(err,docs){
            res.send("data saved!");
        })
    });

    app.post('/', function (req, res) {
        var title = req.body.movieTitle;
        var year = req.body.movieYear;
        var imdb = req.body.movieIMDB;

        db.collection('movies').insertOne({
            title: title,
            year: year,
            imdb: imdb
        }, function (err, doc) {
            assert.equal(null, err);
            res.render('newmovie', { movie: req.body });
        }
        );

    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });



    app.listen(port, function () {
        console.log('Server listening on port 8080');
    });

});
