#!/bin/bash
clear
ditto ./vendor/lawnchair/src/Lawnchair.js ./public/js/lawnchair/Lawnchair.js
echo Lawnchair.js copied.
echo -----
ditto ./vendor/lawnchair/src/adaptors/WebkitSQLiteAdaptor.js ./public/js/lawnchair/adaptors/WebkitSQLiteAdaptor.js
echo WebWebkitSQLiteAdaptor.js copied.
echo -----
ditto ./vendor/lawnchair/src/adaptors/DOMStorageAdaptor.js ./public/js/lawnchair/adaptors/DOMStorageAdaptor.js
echo DOMStorageAdaptor.js copied.
echo -----
ditto ./vendor/lawnchair/src/adaptors/LawnchairAdaptorHelpers.js ./public/js/lawnchair/adaptors/LawnchairAdaptorHelpers.js
echo LawnchairAdaptorHelpers.js copied.
echo -----
ditto ./vendor/translate.js/lib/translate.js ./public/js/translatejs/translate.js
echo translate.js copied.
echo -----
ditto ./vendor/translate.js/lib/languages.js ./public/js/translatejs/languages.js
echo languages.js copied.
echo -----