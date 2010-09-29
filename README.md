Lingua
====================

Description
---------------------
Lingua is a prototype for a universal language translation application that operates on various devices and platforms including modern desktop browsers, Android Devices (e.g. Nexus One), modern mobile browsers and even as a desktop app for Windows 7, Mac OS X and Linux.

Lingua was created for demos at [JSConf EU](http://jsconf.eu) and is not production ready (by design).

Installation
---------------------
Clone the repo, then:
<pre>
  sh node-deps  // Requires [npm](http://npmjs.org)
  cd Lingua/server
  node app.js
</pre>

or

<pre>
  node app.js 30
</pre>

This will call the YQL script for filling the CouchDB with some test data on a 30 minute interval.

Then navigate to [http://localhost:3001/](http://jsconf.eu)

*Note*:  Currently, the CouchDB data store is hardcoded to my CouchDB on [CouchOne.com](http://couchone.com).  Change the values in <code>app.js</code> to your CouchDB.

*Note*:  The <code>phonegap.js</code> file is for an Android version and therefore not pulling in as a submodule. You need different versions of the phonegap.js file for the various platforms.

*Note*:  To build the Appcelerator Titanium desktop app, you will need to have Titanium Developer installed.  Again, not pulled in as a submodule.

*Note*:  To build the Android app, you will need Ant installed.  Then, connect your Android device (or create/use your emulator) and execute the following commands:

<pre>
  cd clients/android/lingua-phonegap
  ant debug install
</pre>

For <code>console.log()</code> output, open up another terminal and execute:

<pre>
  adb logcat PhoneGapLog:V *:S 
</pre>
 
Authors
---------------------
- Joe McCann [http://github.com/joemccann](http://github.com/joemccann)