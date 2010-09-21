Lingua
====================

Description
---------------------
Lingua is a universal language translation application that operates on various devices and platforms including modern desktop browsers, Android Devices (e.g. Nexus One), modern mobile browsers and even as a desktop app for Windows 7, Mac OS X and Linux.

Installation
---------------------
Clone the repo, then:
<pre>
  git submodule init
  git submodule update
  cd Lingua/server
  node app.js
</pre>

or

<pre>
  node app.js 30
</pre>

This will call the YQL script for filling the CouchDB with some test data on an interval of 30 minutes.

Then navigate to http://localhost:3001/

Note:  The <code>phonegap.js</code> file is for an Android version and therefore not pulling in as a submodule.  
You need different versions of phonegap.js for iphone, blackberry, etc.

Authors
---------------------
- Joe McCann [http://github.com/joemccann](http://github.com/joemccann).