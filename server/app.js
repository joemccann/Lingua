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
    db = client.db('lingua-couch'),
    translate = require('./public/js/translate.js/lib/translate.js'),
    languages = require('./public/js/translate.js/lib/languages.js');


var app = express.createServer();

// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use(connect.staticProvider(__dirname + '/public'));
    //	app.use(express.logger());
});

app.configure('development', function () {
    app.use(connect.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function () {
    app.use(connect.errorHandler());
});


app.get('/store', function (req, res) {

    storeInCouch(req);

    res.send('Something useful here.')
});


function buildUri(host, db, id) {
    return host + db + id;
}

// http://subprint.couchone.com/lingua-couch/f49081f0bc5dc49e1719e92bb700065b
var dbId = 'f49081f0bc5dc49e1719e92bb700065b';
var db = 'lingua-couch/';
var couchone = 'http://subprint.couchone.com/'
var doc = '';
var rev = '';

var uri = buildUri(couchone, db, dbId);

// Initialize vars relative to couchdb instance.
request({
    uri: uri
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        sys.puts(sys.inspect(body))
        doc = JSON.parse(body);
        rev = doc._rev;
        initYql();
    }
    else {
        assert.equal(response.statusCode, 200);
    }
});


function updateDoc(obj) {
    request(obj, function (error, response, body) {
        if (error) {
            throw new Error(error)
        };
        assert.equal(response.statusCode, 201);
        var d = JSON.parse(body);
        rev = d.rev;
    })
}

function storeInCouch(req) {

    // TODO: Sanitize this
    var compoundKey = req.query.from.toLowerCase() + "_" + req.query.to.toLowerCase();

    var words = [];
    words = req.query.message.split(" ");
    var firstword = words[0].toLowerCase();

    // Does compoundKey exist?
    if (typeof doc[compoundKey] === 'undefined') {
        // Create a new entry
        console.log('Adding a new compoundkey: ' + compoundKey);
        doc[compoundKey] = {};
        doc[compoundKey][firstword] = [];
        doc[compoundKey][firstword][0] = {
            "from": req.query.message,
            "to": req.query.output,
            "timestamp": new Date()
        };
    }
    else {
        // Does the firstword key exist?
        if (typeof doc[compoundKey][firstword] === 'undefined') {
            console.log('The firstword is not there so we are adding a new one.')
            // TODO: create new firstword key.
            doc[compoundKey][firstword] = [];
            doc[compoundKey][firstword][0] = {
                "from": req.query.message,
                "to": req.query.output,
                "timestamp": new Date()
            };
        }
        else {
            // iterate over the array looking for the phrase and if it exists, just update the timestamp.
            var messageExists = false;
            var index = -1;

            doc[compoundKey][firstword].forEach(function (el, i, a) {
                if (el.from === req.query.message) {
                    messageExists = true;
                    index = i;
                }
            });

            if (messageExists) {
                console.log("Updating the timestamp since the message, " + req.query.message + ", exists.")
                doc[compoundKey][firstword][index].timestamp = new Date();
            }
            else {
                // add the new message, output and timestamp
                console.log("Adding a new message.")
                doc[compoundKey][firstword].push({
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

}

var allLangs = Object.keys(languages.getLangs());
var yql = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Ffeeds.nytimes.com%2Fnyt%2Frss%2FHomePage%22&format=json';

var langFrom = 'English';
var langTo = grabRandomLanguage();

var couchStack = [];

var iterator = 0;
var yqlNodeLen = 0;

function grabRandomLanguage() {
    return allLangs[Math.floor(Math.random() * allLangs.length)];
}

function translateYql(el)
{
	translate.text({
                    input: langFrom,
                    output: langTo
                }, el.title, function (resp) {
                    sys.puts('\n' + el.title);
                    sys.puts("--Translated in " + langTo + " --");
                    sys.puts(resp + '\n');
                    // Populate couchdb instance here.
                    var hash = {
                    'query':{
                				'from': langFrom, 'to': langTo, 'message': el.title, 'output': resp
                			}

                    }
                    couchStack.push(hash);
                    iterator++;
                    console.log(iterator)
                    console.log(yqlNodeLen+ '\n')                   
                    if(iterator === yqlNodeLen)
                    // TODO: WRONG!
                    {
                    	console.log('yea')
                    	if(couchStack.length)
                    	{
                    		setInterval(function(){
                    			storeInCouch(couchStack.pop());
                    		}, 5000);
                    	}
                    }
                });
}


function yqlNyTimes() {

    request({
        uri: yql
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            doc = JSON.parse(body);
            var items = doc.query.results.item;
            yqlNodeLen = items.length;
            items.forEach(translateYql);
        }
        else {
            assert.equal(response.statusCode, 200);
        }
    })
}

function initYql(){
	//yqlNyTimes();
	//setInterval(yqlNyTimes, 10000);
}


app.listen(3001);

console.log('Express server started on port %s', app.address().port);