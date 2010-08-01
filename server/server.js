var sys = require('sys');

// Add the vendored websocket server to the require path
require.paths.unshift("vendor/node-websocket-server/lib")

// Require whoopingkof
var whoopingkof = require('./lib/whoopingkof');

// Initialize a whoopingkof server
whoopingkof = whoopingkof.create();
whoopingkof.open(8080);

// Initialize express
// add the vendored express to the require path
require.paths.unshift("vendor/express/lib")

// require express and its plugins
require("express")
require("express/plugins")

//require the actual express app
require ("./lib/app")
