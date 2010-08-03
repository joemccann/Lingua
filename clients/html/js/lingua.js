var languages;

$(document).ready(function(){
  
  languages = getLangs();

  // populate the select box
  for(var lang in languages){
    $('#langInput').append('<option value = "'+lang+'">' + lang + '</option>');
  }
  
  for(var lang in languages){
    $('#langOutput').append('<option value = "'+lang+'">' + lang + '</option>');
  }
  
  /***** NAMED EVENTS *****/

    $(document).bind('##TRANSLATE_TEXT##', function(e){

      $('#run').attr('disabled','disabled');
			// Todo:  Update this to reflect langFrom.
      $('#run').val('translating...');     
      var input = $('#langInput').val(), output = $('#langOutput').val();

      translate.text({input:input,output:output}, $('#theCode').val(), function(result){
        $('#run').attr('disabled','');
        $('#run').val('Translate');
  		  $('#output').val( result );
      });
    });


		function translateUi(){
			// Let's automagically update the UI to show those phrases in the appropriate language.
			
			// Grab all text elements on the page
			var input = $.data(document.body, "config").langFrom; 
			var output = $('#langInput option:selected').val();

			$('label, input[type=button], option').each(function(i, el){
	      translate.text({input:input,output:output}, el[!el.innerHTML ? 'value' : 'innerHTML'], function(result){
				  el[!el.innerHTML ? 'value' : 'innerHTML'] = result;
	      });
			});
			
			$.data(document.body, "config", {langFrom: output});
			
		}

  /**** END NAMED EVENTS ****/

  /**** BIND UI EVENTS ****/
		
		$('#langInput').bind('change', translateUi);
      
    $('#run').click(function(e){
      $(document).trigger('##TRANSLATE_TEXT##');
    });

		$('#clear').bind('click', function(e){
			$('textarea').text('');
			return false;
		});

  /**** END UI BIND EVENTS ****/

  $('#run').attr('disabled','');

	// Check local storage for prefs and if not there, populate with the following:
  $('#langInput').val('English');
  $('#langOutput').val('German');

	var currentLang = 'English';

	// Getter:  $.data(document.body, "config").langFrom
	$.data(document.body, "config", { langFrom: currentLang });	
	


});