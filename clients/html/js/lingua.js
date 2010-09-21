// Feature Requests/TODO
// 1 - Reset button if you decide to select away from English and to Dutch and then want to go back to English
// 2 - Force continuous replication for couchdb on startup for Android client.

var languages;
window.doc = '';
window.isGapped = false;
window.networkState = null;

$().ready(function ()
{

    $.capFirst = function (string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
    $.fn.selectRange = function(start, end) {
        return this.each(function() {
                if(this.setSelectionRange) {
                        this.focus();
                        this.setSelectionRange(start, end);
                } else if(this.createTextRange) {
                        var range = this.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', start);
                        range.select();
                }
        });
	};
    
    // vars...derp
    var currentLang = 'English',
        isGapped = false,
    	isTitanium = (typeof window.Titanium === 'object') ? true : false;

    // just for less typing; premature optimization...pfft, whatever...    
    var $messageFrom = $('#messageFrom'),
        $h1 = $('h1:first'),
        $run = $('#run'),
        $clear = $('#clear'),
        $output = $('#output'),
        $langInput = $('#langInput'),
        $langOutput = $('#langOutput');


    // Getter:  $.data(document.body, "config").langFrom
    // We may use some or add some propeties later to be used for someful, well, useful.
    $.data(document.body, "config", {
        langFrom: currentLang
    });

    $.data(document.body, "view", "home");

    $('#link-about').bind('click', function ()
    {

        var view = $.data(document.body, "view");
        var out = view === 'home' ? 'home' : 'about';
        var into = view === 'home' ? 'about' : 'home';

        $('#' + out).fadeOut(300, function ()
        {
            var $that = $(this);
            $('#' + into).fadeIn(300, function ()
            {

                $.data(document.body, "view", into);
                $('#link-about').text($.capFirst(out));
                // FFFFUUUUU inlne style FTL
                $that.attr('style', '').addClass('counter-hide');
                $(this).removeClass('counter-hide');

		        $messageFrom.focus();

            });
        });


        return false;
    });

    $messageFrom.bind('keypress', function (e)
    {
        if (e.charCode == 13)
        {
            $(document).trigger('##TRANSLATE_TEXT##');
            return false;
        }
    });

    // Treat the H1 like a proper anchor tag...
    $h1.bind('click', function ()
    {
        window.location.reload(); // yes we could just make this an anchor tag, but it's a prototype AND won't work in android/titanium.
    });


    // We could do the following, but causes usability issues so a no go.  Leave in here! It's a prototype.
    // $langInput.bind('change', translateUi);
    
    $run.click(function (e)
    {
        $(document).trigger('##TRANSLATE_TEXT##');
    });

    $clear.bind('click', function (e)
    {
        $('textarea').text('');
        return false;
    });


	// The translate method taken directly from translate.js example and reworked a bit.
    $(document).bind('##TRANSLATE_TEXT##', function (e)
    {

        // TODO: Sanitize this shit.
        // Set input values
        var input = $langInput.val(),
            output = $langOutput.val(),
            message = $messageFrom.val();

        // update the button's state
        $run.attr('disabled', 'disabled');
        $run.val('translating...');

        if (window.isGapped && (typeof window.networkState === 'undefined') )
        {
        	console.log('offline')

            // testing offline android client...if ur offline in ur browser, not supported for prototype...
            offlineLookup(input, output, message, function ()
            {
                $run.attr('disabled', '');
                $run.val('Translate');
            });

            return;
        }

        // otherwise, use the Google Translation API
        translate.text(
        {
            input: input,
            output: output
        }, message, function (result)
        {
            $run.attr('disabled', '');
            $run.val('Translate');

            var obj =
            {
                'message': message,
                'output': result,
                'from': input,
                'to': output
            }

            storeInCouch(obj);

            $output.val(result);
            $output.selectRange(0, $output.val().length);  // let's make it copy friendly.

        });
    });

	// Grab all languages and populate the options of the select elements.
	function populateLangs()
	{
	
		// capture the languages...
		languages = getLangs();
	
	    // populate...
	    for (var lang in languages)
	    {
	        $langInput.append('<option value = "' + lang + '">' + lang + '</option>');
	        $langOutput.append('<option value = "' + lang + '">' + lang + '</option>');
	    }

	}


	// Call store via XHR passing some ish for couchdb at couchone.
    function storeInCouch(obj)
    {
        $.get("/store", obj, function (data)
        {
            console.log(data + " is the new revision of the db.")
        });
    }

    function offlineLookup(from, to, message, cb)
    {

        // Yes this additional function is unnecessary, but I left it open incase there were other 
        // sync-based functions to call here.
        getOfflineCouch(from, to, message, function ()
        {
            // beep!
            navigator.notification.beep(2);
            navigator.notification.vibrate(250);
            cb && cb();
        });

    }

	// Check the couchdb on Android if we are offline.
    function getOfflineCouch(from, to, message, cb)
    {

        // TODO: Sanitize this...maybe.  I'm looking at you @slexaxton...
        var compoundKey = from.toLowerCase() + "_" + to.toLowerCase();
        var words = [];
        words = message.split(" ");
        var firstword = words[0].toLowerCase();

        console.log(firstword + " is the first word.")
        console.log(compoundKey + " is the compound key.")

        // Does compoundKey exist?
        if (typeof doc[compoundKey] === 'undefined')
        {
            offlineResult(false, 'The compound key was not found.');
            return;
        }
        else
        {
            // Does the firstword key exist?
            if (typeof doc[compoundKey][firstword] === 'undefined')
            {
                offlineResult(false, 'The first word was not found.');
            }
            else
            {
                // iterate over the array looking for the phrase and if it exists, just update the timestamp.
                var messageExists = false;
                var index = -1;

                doc[compoundKey][firstword].forEach(function (el, i, a)
                {
                    if (el.from === message)
                    {
                        messageExists = true;
                        matchedTranslatedPhrase = el.to;
                        index = i;
                    }
                });

                if (messageExists)
                {
                    offlineResult(true, 'The message was found.', matchedTranslatedPhrase);
                    cb && cb(); // could combine this two line to one line but easier to read for noobs.
                }
                else
                {
                    // add the new message, output and timestamp
                    offlineResult(false, 'The message was not found.');
                }
            }
        }


    }

    // It's kinda like error handling, in a cadillac...
    function offlineResult(flag, logMessage, translation)
    {
        if (flag)
        {
            $('#output').val(translation)
            console.log(logMessage)
        }
        else
        {
            console.log(logMessage)
        }
    }

    // translates the entire Ui in the language from drop down so the UI converts to that persons native languae.
    function translateUi()
    {
        // Let's automagically update the UI to show those phrases in the appropriate language.
        // Grab all text elements on the page
        var input = $.data(document.body, "config").langFrom;
        var output = $('#langInput option:selected').val();

        // Could definitely be optimized to not send so many requests, but fuck it for now.
        $('label, input[type=button], option, textarea, p, a').each(function (i, el)
        {
            translate.text(
            {
                input: input,
                output: output
            }, el[!el.innerHTML ? 'value' : 'innerHTML'], function (result)
            {
                try
                {
                    el[!el.innerHTML ? 'value' : 'innerHTML'] = result;
                }
                catch (e)
                {
                    //				console.log(e);
                }
            });
        });

        $.data(document.body, "config", {
            langFrom: output
        });

    }


	function init()
	{
		populateLangs();

	    $run.attr('disabled', '');

	    // TODO: Check local storage for prefs and if not there, populate with the following:
	    $langInput.val('English');
    	$langOutput.val('Dutch');

	}


    // Chromeless dragging in Titanium Desktop app
    (function ()
    {
        var dragging = false;

        document.onmousemove = function ()
        {
            if (!dragging || !isTitanium) return;

            Titanium.UI.currentWindow.setX(Titanium.UI.currentWindow.getX() + event.clientX - xstart);
            Titanium.UI.currentWindow.setY(Titanium.UI.currentWindow.getY() + event.clientY - ystart);

        }

        document.onmousedown = function (e)
        {
            // disallow textarea
            if (isTitanium && e.target.className !== 'box')
            {
                dragging = true;
                xstart = event.clientX;
                ystart = event.clientY;
            }
        }

        document.onmouseup = function ()
        {
            dragging = false;
        }
    })();



	// Go.
	init();

});

window.onload = function ()
{
	// Lose the URL bar for mobile version...
	/mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function ()
	{
		window.scrollTo(0, 1);
	}, 1000);

    document.addEventListener('deviceready', function ()
    {
        if ( !! (device.platform))
        {
            // So we are on the Android device.
            window.isGapped = true;

            // Let's load up the db from couch for quick access.
            $.ajax(
            {
                url: 'http://127.0.0.1:5984/lingua/lingua-couch',
                success: function (data)
                {
                    doc = JSON.parse(data);
                    data && console.log('Successfully snagged data from couchdb.');
                }
            });
            
            
            // http://docs.phonegap.com/phonegap_network_network.md.html#network.isReachable
            function reachableCallback(reachability) 
            {
		    	// There is no consistency on the format of reachability
		    	
    			var state = reachability.internetConnectionStatus || reachability.code || reachability;

    			var states = {};
    			states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
    			states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
    			states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';

    			console.log('Connection type: ' + states[state]);
    			
    			window.networkState = states[state];
			}
			
			navigator.network.isReachable('google.com', reachableCallback);
            
        }
    }, false);
}