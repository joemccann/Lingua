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
    languages = require('./public/js/translate.js/lib/languages.js'),
    app = express.createServer();

// Configuration
app.configure(function () 
{
    app.set('views', __dirname + '/views');
    app.use('/', connect.bodyDecoder());
    app.use('/', connect.methodOverride());
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function () 
{
    app.use(connect.errorHandler({
        dumpExceptions: false,
        showStack: true
    }));
});

app.configure('production', function () 
{
    app.use(connect.errorHandler());
});


app.get('/store', function (req, res) 
{

    storeInCouch(req, function (revision) 
    {
        res.send(revision);
    });

});

var dbId = 'lingua-couch', // eventually pass command line variables and set default, but hardcode nao for prototype.
    db = 'lingua-couch/',
    couchone = 'http://subprint.couchone.com/',
    doc = '',
    rev = '',
    uri = buildUri(couchone, db, dbId),
    allLangs = Object.keys(languages.getLangs()),
    yql = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Ffeeds.nytimes.com%2Fnyt%2Frss%2FHomePage%22&format=json',
    langFrom = 'English',
    langTo = 'Dutch'; //grabRandomLanguage(),
	couchStack = [], yqlNodeLen = 0;
	yqlInterval = (parseInt(process.ARGV[2], 10) * 100000) || null;  // every n number of minutes or none at all.   


// Initialize vars relative to couchdb instance.
request(
{
    uri: uri
}, function (error, response, body) 
{
    if (!error && response.statusCode == 200) 
    {
        //sys.puts(sys.inspect(body)) // If you need to see it...
        console.log('\nInitial call to couchone successful.\n')
        doc = JSON.parse(body);
        rev = doc._rev;

        // Now kick off some YQL action to build up our database.
        //yqlNyTimes();

		// If we passed in an interval from the command line then, call it on that interval.
        yqlInterval && setInterval(yqlNyTimes, yqlInterval);
    }
    else 
    {
        assert.equal(response.statusCode, 200);
    }
});

// Helper method for building couchone uri.
function buildUri(host, db, id) { return host + db + id; }


// Update the document with the new data object.
// Fire callback if it exits.
function updateDoc(obj, cb) 
{
    request(obj, function (error, response, body) 
    {
        if (error) 
        {
        	// Throw an error if you want.
            //throw new Error(error);
            cb(response.statusCode);
            sys.puts(response.statusCode + " instead of an error.\n");

        };
        //assert.equal(response.statusCode, 201);
        var d = JSON.parse(body);
        rev = d.rev;
        cb && cb(rev);
    })
}

// Runs various checks to properly format the data for storage in couchone.
function storeInCouch(req, cb) 
{

    // TODO: Sanitize this
    var compoundKey = req.query.from.toLowerCase() + "_" + req.query.to.toLowerCase();

    var words = [];
    words = req.query.message.split(" ");
    var firstword = words[0].toLowerCase();
    
    
    // TODO: use the words and create random phrases to further beef up db of words and phrases.

    // Does compoundKey exist?
    if (typeof doc[compoundKey] === 'undefined') 
    {
        // Create a new entry
        console.log('Adding a new compoundkey: ' + compoundKey);
        doc[compoundKey] = {};

        doc[compoundKey][firstword] = [];
        doc[compoundKey][firstword][0] = 
        {
            "from": req.query.message,
            "to": req.query.output,
            "timestamp": new Date()
        };
    }
    else 
    {
        // Does the firstword key exist?
        if (typeof doc[compoundKey][firstword] === 'undefined') 
        {
            console.log('The firstword is not there so we are adding a new one.')
            // TODO: create new firstword key.
            doc[compoundKey][firstword] = [];
            doc[compoundKey][firstword][0] = 
            {
                "from": req.query.message,
                "to": req.query.output,
                "timestamp": new Date()
            };
        }
        else {
            // iterate over the array looking for the phrase and if it exists, just update the timestamp.
            var messageExists = false;
            var index = -1;

            doc[compoundKey][firstword].forEach(function (el, i, a) 
          	{
                if (el.from === req.query.message) 
                {
                    messageExists = true;
                    index = i;
                }
            });

            if (messageExists) 
            {
                console.log("Updating the timestamp since the message, " + req.query.message + ", exists.")
                doc[compoundKey][firstword][index].timestamp = new Date();
            }
            else 
            {
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

	// Build data object (record).
    var updateHash = 
    {
        uri: uri,
        method: 'PUT',
        body: JSON.stringify(doc)
    }

	// Shove into couch.
    updateDoc(updateHash, cb);

}

// Iterate through each item in the couchStack array async style.
function processCouchStack() 
{
    // Pop item from stack
    var cur = couchStack.length === 0 ? null : couchStack.pop();

	// Are we done?
    if (!cur) 
    {
        console.log('We are finished adding to couchone.');
        return;
    }

    // Pass to storeInCouch
    storeInCouch(cur, function () { processCouchStack() });      // mmmm, async....

}


// Helper method for grabbing a random language from array of langs.
function grabRandomLanguage() { return allLangs[Math.floor(Math.random() * allLangs.length)]; }

// Translate a Title from the YQL response.
function translateYql(el, i) 
{

    translate.text({
        input: langFrom,
        output: langTo
    }, el.title, function (resp) {
    
        sys.puts('\n' + el.title);
        sys.puts("--Translated in " + langTo + " --");
        sys.puts(resp + '\n');

        // Create formatted hash for couchdb as it is expecting something similar to a http request.
        var hash = 
        {
            'query': 
            {
                'from': langFrom,
                'to': langTo,
                'message': el.title,
                'output': resp
            }
        }
        
        // Add to stack (state machine if you will).
        couchStack.push(hash);

        // If were at the end of the line, process the stack.
        if (i === yqlNodeLen - 1) processCouchStack();

    });
}


// Pull the headlines from the NY Times RSS feed with YQL.
function yqlNyTimes() 
{

    request(
    {
        uri: yql
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var doc = JSON.parse(body);
            var items = doc.query.results.item;
            // Capture the length as we need this later.
            yqlNodeLen = items.length;

            items.forEach(translateYql);
        }
        else {
            assert.equal(response.statusCode, 200);
        }
    });
}


app.listen(3001);

console.log('\nExpress server started on port %s', app.address().port);