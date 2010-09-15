var languages;
window.isGapped = false;

$().ready(function () {

    $.capFirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    var currentLang = 'English', 
    	isGapped = (typeof Droidgap === 'undefined') ? false : true;
    	
    // Getter:  $.data(document.body, "config").langFrom
    $.data(document.body, "config", {
        langFrom: currentLang
    });

    $.data(document.body, "view", "home");

	function offlineLookup()
	{
		if(window.isGapped)
	    {
	    	// Let's check couchDB if available.
	    	
	    	
	    	// Grab to value and search for that key in couchdb.  If there, return array and search array for result.
			/*
			    $.ajax({
			        url: 'http://127.0.0.1:5984/lingua_droid/f49081f0bc5dc49e1719e92bb700065b',
			        success: function (data) {
			            $('body').children().remove().end().append(data)
			            console.log(data)
			        }
			    });
			*/
	   	}
	}

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

		if(!navigator.onLine)
		{
			// testing offline android client...if ur offline in ur browser, not supported for prototype...
			offlineLookup();
			return;
		}

        $('#run').attr('disabled', 'disabled');
        // Todo:  Update this to reflect langFrom.
        $('#run').val('translating...');
        // TODO: Sanitize this shit.
        var input = $('#langInput').val(),
            output = $('#langOutput').val(),
            message = $('#messageFrom').val();

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

          
            if (window.isGapped) {
                // beep!
                navigator.notification.beep(2);
                navigator.notification.vibrate(250);
            }

        });
    });


    function storeInCouch(obj) {
        $.get("/store", obj, function (data) {
            console.log(data)
        });
    }

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

    /**** END NAMED EVENTS ****/

    /**** BIND UI EVENTS ****/

    $('#langInput').bind('change', translateUi);

    $('#run').click(function (e) {
        $(document).trigger('##TRANSLATE_TEXT##');
    });

    $('#clear').bind('click', function (e) {
        $('textarea').text('');
        return false;
    });

    /**** END UI BIND EVENTS ****/

    $('#run').attr('disabled', '');

    // Check local storage for prefs and if not there, populate with the following:
    $('#langInput').val('English');
    $('#langOutput').val('French');

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

        document.onmouseup = function () {
            dragging = false;
        }
    })();

});

// TODO: if this window.Phonegap exists.

window.onload = function()
{
	document.addEventListener('deviceready',function() {
		window.isGapped = true;
	},false);
}