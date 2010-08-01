/**
 * Module dependencies.
 */
/*
var express = require('express'),
    connect = require('connect');

// Create and export Express app

var app = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
 //   app.use('/', connect.compiler({ src: __dirname + '/public', enable: ['sass'] }));
    app.use('/', connect.staticProvider(__dirname + '/public')); // Will fallback to static html files if no rendering engine is provided in the URI route.
});

app.configure('development', function(){
    app.set('reload views', 1000);
    app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use('/', connect.errorHandler()); 
});

// Routes
*/
/*
app.get('/', function(req, res){

    res.render('index.jade', {
        locals: {
            title: 'Express'
        }
    });
});
*/
/*
app.listen(3001);

*/



/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect');

var app = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());

  //  app.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
   // app.use(app.router);
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(connect.errorHandler()); 
});

// Routes
/*

app.get('/', function(req, res){
    res.render('index.jade', {
        locals: {
            title: 'Express'
        }
    });
});
*/

app.listen(3001);


