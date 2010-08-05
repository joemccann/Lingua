var languages;

$().ready(function () {

    var currentLang = 'English';

    // Getter:  $.data(document.body, "config").langFrom
    $.data(document.body, "config", {
        langFrom: currentLang
    });

	var config = $.extend( $.data(document.body, "config"), {foo: 'bar'})

	$.data(document.body, "view", "home");

	$('#link-about').bind('click', function(){
		
		var view = $.data(document.body, "view");
        var out = view === 'home' ? 'home' : 'about';
        var into = view === 'home' ? 'about' : 'home';
		
		$('#'+out).fadeOut(300, function(){
			var $that = $(this);
			$('#'+into).fadeIn(300, function(){
				
				$.data(document.body, "view", into);		       
				$('#link-about').text( $.capFirst(out) ); 
				// FFFFUUUUU inlne style FTL
				$that.attr('style','').addClass('counter-hide');
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

        $('#run').attr('disabled', 'disabled');
        // Todo:  Update this to reflect langFrom.
        $('#run').val('translating...');
        var input = $('#langInput').val(),
            output = $('#langOutput').val();

        translate.text({
            input: input,
            output: output
        }, $('#theCode').val(), function (result) {
            $('#run').attr('disabled', '');
            $('#run').val('Translate');
            $('#output').val(result);
        });
    });


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
			try
			{
				el[!el.innerHTML ? 'value' : 'innerHTML'] = result;               
			}
			catch(e)
			{
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
    $('#langOutput').val('German');
	
	// Lose the URL bar...
	/mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function () {
	  window.scrollTo(0, 1);
	}, 1000);​


});