// Feature Requests

// 1 - Reset button if you decide to select away from English and to Dutch and then want to go back to English
// 2 - 


var languages; 
window.doc = '';
window.isGapped = false;

$().ready(function () {

    $.capFirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var currentLang = 'English',
        isGapped = false;

        var $messageFrom = $('#messageFrom');
        
   		$messageFrom.focus(function(){
   			$(this).css('outline', '10')
   		});
   		
   		$messageFrom.bind('keypress', function(e)
   		{
   			if (e.charCode == 13) 
 			{
 				$(document).trigger('##TRANSLATE_TEXT##');
            	return false;
        	}
   		});


	$({
		'div': {
			'id': 'foo'
		}
	}
	).appendTo( $(document.body).children())



	
	// Treat the H1 like a proper anchor tag...
	var $h1 = $('h1:first');
	
	$h1.bind('mouseover focus', function(){
		$h1.css(
		{	'cursor': 'pointer',
			'width':'3em',
			'margin' : '10px 0',
			'-webkit-transition': 'font-color 2s linear'
		});
	})
		.bind('mouseout blur', function(){
		$h1.css({	
			'cursor': 'pointer',
			'background' : 'transparent',
			'-webkit-transition': 'background-color 0.2s linear'		});
		});

	
	$h1.bind('click', function(){
		window.location.href = '/';
	});


    // Getter:  $.data(document.body, "config").langFrom
	// We may use some or add some propeties later to be used for someful, well, useful.
    $.data(document.body, "config", {
        langFrom: currentLang
    });

    $.data(document.body, "view", "home");

    $('#link-about').bind('click', function () {

        var view = $.data(document.body, "view");
        var out = view === 'home' ? 'home' : 'about';
        var into = view === 'home' ? 'about' : 'home';

        $('#' + out).fadeOut(300, function () {
            var $that = $(this);
            $('#' + into).fadeIn(300, function () {

                $.data(document.body, "view", into);
                $('#link-about').text($.capFirst(out));
                // FFFFUUUUU inlne style FTL
                $that.attr('style', '').addClass('counter-hide');
                $(this).removeClass('counter-hide');

            });
        });
        
        
        $('#langInput').focus();
        
        return false;
    });

    languages = getLangs();

    // populate the select box
    for (var lang in languages) {
        $('#langInput').append('<option value = "' + lang + '">' + lang + '</option>');
        $('#langOutput').append('<option value = "' + lang + '">' + lang + '</option>');
    }

    /***** NAMED EVENTS *****/

    $(document).bind('##TRANSLATE_TEXT##', function (e) {

        // TODO: Sanitize this shit.
        // Set input values
        var input = $('#langInput').val(),
            output = $('#langOutput').val(),
            message = $('#messageFrom').val();

		// update the button's state
        $('#run').attr('disabled', 'disabled');
        $('#run').val('translating...');

        if (window.isGapped) {
        
            // testing offline android client...if ur offline in ur browser, not supported for prototype...
            offlineLookup(input, output, message, function(){
                    $('#run').attr('disabled', '');
            });
            
            //TODO:  UPDATE STATE OF $('#run').val()
            return;
        }

        // otherwise, use the Google Translation API
        translate.text({
            input: input,
            output: output
        }, message, function (result) {
            $('#run').attr('disabled', '');
            $('#run').val('Translate');

            var obj = {
                'message': message,
                'output': result,
                'from': input,
                'to': output
            }

            storeInCouch(obj);

            $('#output').val(result);

        });
    });


    function storeInCouch(obj) {
        $.get("/store", obj, function (data) {
            console.log(data)
        });
    }

    function offlineLookup(from, to, message, cb) {

			// Yes this additional function is unnecessary, but I left it open incase there were other 
			// sync-based functions to call here.
			
            getOfflineCouch(from, to, message, function(){
	                // beep!
	        	navigator.notification.beep(2);
	            navigator.notification.vibrate(250);
	            cb && cb();
            });
           
    }

    function getOfflineCouch(from, to, message, cb) {

        // TODO: Sanitize this...maybe.  I'm looking at you @slexaxton...
        var compoundKey = from.toLowerCase() + "_" + to.toLowerCase();
	    var words = [];
        words = message.split(" ");
        var firstword = words[0].toLowerCase();

        console.log(firstword + " is the first word.")
       	console.log(compoundKey + " is the compound key.")

        // Does compoundKey exist?
        if (typeof doc[compoundKey] === 'undefined') {
            offlineResult(false, 'The compound key was not found.');
            return;
        }
        else {
            // Does the firstword key exist?
            if (typeof doc[compoundKey][firstword] === 'undefined') {
                offlineResult(false, 'The first word was not found.');
            }
            else {
                // iterate over the array looking for the phrase and if it exists, just update the timestamp.
                var messageExists = false;
                var index = -1;

                doc[compoundKey][firstword].forEach(function (el, i, a) {
                    if (el.from === message) {
                        messageExists = true;
                        matchedTranslatedPhrase = el.to;
                        index = i;
                    }
                });

                if (messageExists) {
                    offlineResult(true, 'The message was found.', matchedTranslatedPhrase);
                    cb && cb();  // could combine this two line to one line but easier to read for noobs.
                }
                else {
                    // add the new message, output and timestamp
                    offlineResult(false, 'The message was not found.');
                }
            }
        }
        
        
   }

		// It's kinda like error handling, in a cadillac...
        function offlineResult(flag, logMessage, translation) {
            if (flag) {
                $('#output').val(translation)
				console.log(logMessage)
            }
            else {
                console.log(logMessage)
				console.log(logMessage)
            }
        }

		// translates the entire Ui in the language from drop down so the UI converts to that persons native languae.
        function translateUi() {
            // Let's automagically update the UI to show those phrases in the appropriate language.
            // Grab all text elements on the page
            var input = $.data(document.body, "config").langFrom;
            var output = $('#langInput option:selected').val();

            // Could definitely be optimized to not send so many requests, but fuck it for now.
            $('label, input[type=button], option, textarea, p, a').each(function (i, el) {
                translate.text({
                    input: input,
                    output: output
                }, el[!el.innerHTML ? 'value' : 'innerHTML'], function (result) {
                    try {
                        el[!el.innerHTML ? 'value' : 'innerHTML'] = result;
                    }
                    catch (e) {
                        //				console.log(e);
                    }
                });
            });

            $.data(document.body, "config", {
                langFrom: output
            });

        }


		// We could do the following, but causes usability issues so a no go.  Leave in here! It's a prototype.
		//   $('#langInput').bind('change', translateUi);

        $('#run').click(function (e) {
            $(document).trigger('##TRANSLATE_TEXT##');
        });

        $('#clear').bind('click', function (e) {
            $('textarea').text('');
            return false;
        });

        $('#run').attr('disabled', '');

        // Check local storage for prefs and if not there, populate with the following:
        $('#langInput').val('English');
        $('#langOutput').val('Dutch');

        // Lose the URL bar for mobile version...
        /mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function () {
            window.scrollTo(0, 1);
        }, 1000);

        // Is the user online?
        var online = navigator.onLine;

        // Are we in a Titanium Desktop app?
        var isTitanium = typeof window.Titanium === 'object' ? true : false;

        // Chromeless dragging in Titanium Desktop app
        (function () {
            var dragging = false;

            document.onmousemove = function () {
                if (!dragging || !isTitanium) return;

                Titanium.UI.currentWindow.setX(Titanium.UI.currentWindow.getX() + event.clientX - xstart);
                Titanium.UI.currentWindow.setY(Titanium.UI.currentWindow.getY() + event.clientY - ystart);

            }

            document.onmousedown = function (e) {
                // disallow textarea
                if (isTitanium && e.target.className !== 'box') {
                    dragging = true;
                    xstart = event.clientX;
                    ystart = event.clientY;
                }
            }

            document.onmouseup = function () {
                dragging = false;
            }
        })();

    });

// TODO: if this window.Phonegap exists.
window.onload = function () {
    document.addEventListener('deviceready', function () {
    console.log(!!device.platform)
    if( !!(device.platform) )
    {
    	// So we are on the Android device.
        window.isGapped = true;

		// Let's load up the db from couch for quick access.
	        $.ajax({
	            url: 'http://127.0.0.1:5984/lingua/lingua-couch',
	            success: function (data) {
	                doc = JSON.parse(data);
	                data && console.log('Successfully snagged data from couchdb.');
	            }
	        });
    }
    else
    {
    }
    
    

    }, false);
}