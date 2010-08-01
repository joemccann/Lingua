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
      $('#run').val('translating...');     
      var input = $('#langInput').val(), output = $('#langOutput').val();

      translate.text({input:input,output:output}, $('#theCode').val(), function(result){
        $('#run').attr('disabled','');
        $('#run').val('Translate');
  		  $('#output').val( result );
      });
    });

  /**** END NAMED EVENTS ****/

  /**** BIND UI EVENTS ****/

    // select box change
    $('#langSelector').change(function(){
      $(document).trigger('##CHANGE_LANGUAGE##', {"fontName":$(this).val()})
    });
  
    /*
    // you would think jQuery.change() would cover the keypress event on select boxes? 
    $("#langSelector").keypress(function (){
      // we could setup some blocking / keypress intent here for live-like updates
      $(document).trigger('##CHANGE_LANGUAGE##', {"fontName":$(this).val()})
    });

    // keyup on textarea
    $('#theCode').keyup(function(e){
      // we could setup some blocking / keypress intent here for live-like updates
      $(document).trigger('##TRANSLATE_TEXT##');
    });
    */      
    $('#run').click(function(e){
      $(document).trigger('##TRANSLATE_TEXT##');
    });

  /**** END UI BIND EVENTS ****/

  // little bit of a onReady hack. i'll fix the API a bit so this can be done better
  //$(document).trigger('##CHANGE_LANGUAGE##', {"fontName":'Doh'});
  $('#run').attr('disabled','');
  $('#langInput').val('English');
  $('#langOutput').val('German');

});