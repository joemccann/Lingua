/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
	sys = require('sys'),
	assert = require('assert'),
	couchdb = require('couchdb'),
  	client = couchdb.createClient(80, 'subprint.couchone.com'),
	request = require('request'),
  	db = client.db('lingua-couch');

	Object.keys = Object.keys || function(o) {
	    var result = [];
	    for(var name in o) {
	        if (o.hasOwnProperty(name))
	          result.push(name);
	    }
	    return result;
	};

var app = express.createServer();

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use(connect.staticProvider(__dirname + '/public'));
//	app.use(express.logger());
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(connect.errorHandler()); 
});

function buildUri(host,db,id)
{
	return host+db+id;
}

// http://subprint.couchone.com/lingua-couch/f49081f0bc5dc49e1719e92bb700065b
var dbId = 'f49081f0bc5dc49e1719e92bb700065b';
var db = 'lingua-couch/';
var couchone = 'http://subprint.couchone.com/'
var doc = '';
var rev = '';

var uri = buildUri(couchone,db,dbId);

function updateDoc(obj)
{
	request(obj, function (error, response, body) {
		if (error) {throw new Error(error)};
		//assert.equal(response.statusCode, 201);
		var d = JSON.parse(body);
		rev = d.rev;
		
	})
}

request({uri:uri}, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	//	sys.puts(sys.inspect(body))
		doc = JSON.parse(body);
		rev = doc._rev;
	}
	else
	{
		assert.equal(response.statusCode, 200);
	}
})


app.get('/store', function(req, res){
	// TODO: Sanitize this
	var compoundKey = req.query.from.toLowerCase() + "_" + req.query.to.toLowerCase();
	
	var words = []; 
	words = req.query.message.split(" "); 
	var firstword = words[0].toLowerCase();

	// Does compoundKey exist?
	if(typeof doc[compoundKey] === 'undefined')
	{
		// Create a new entry
		console.log('Adding a new compoundkey: ' + compoundKey);
		doc[ compoundKey ] = {};
		doc[ compoundKey ][ firstword ] = [];
		doc[ compoundKey ][ firstword ][0] = {
			"from": req.query.message, 
			"to": req.query.output, 
			"timestamp": new Date()	
		};
	}
	else
	{
		// Does the firstword key exist?
		if(typeof doc[ compoundKey ][ firstword ]  === 'undefined')
		{
			console.log('The firstword is not there so we are adding a new one.')
			// TODO: create new firstword key.
			doc[ compoundKey ][ firstword ] = [];
			doc[ compoundKey ][ firstword ][0] = {
					"from": req.query.message,
					"to": req.query.output,
					"timestamp": new Date()
				};
		}
		else
		{
			// iterate over the array looking for the phrase and if it exists, just update the timestamp.
			var messageExists = false;
			var index = -1;
			
			doc[ compoundKey ][ firstword ].forEach(function(el, i, a){
				if(el.from === req.query.message) {
					messageExists = true;
					index = i;
				}
			});
			
			if(messageExists)
			{
				console.log("Updating the timestamp since the message, "+ req.query.message +", exists.")
				doc[ compoundKey ][ firstword ][ index ].timestamp = new Date();
			}
			else
			{
				// add the new message, output and timestamp
				console.log("Adding a new message.")
				doc[ compoundKey ][ firstword ].push({
					"from": req.query.message,
					"to": req.query.output,
					"timestamp": new Date()
				});
			}
		}
	}

	// Set the proper revision number.
	doc._rev = rev;
	
	var updateHash = {
		uri: uri,
		method: 'PUT',
		body: JSON.stringify(doc)
	}
	
	updateDoc(updateHash);

	res.send('Something useful here.')
});

app.listen(3001);

console.log('Express server started on port %s', app.address().port);