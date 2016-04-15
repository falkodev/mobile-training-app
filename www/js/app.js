/******* Only mobile ********/
// phonegap/cordova event "deviceready" use for mobile
document.addEventListener("deviceready", onDeviceReady, false);

/**
 * [onDeviceReady]
 */
function onDeviceReady() {
}

/******* End only mobile ********/

(function () {

  /**
   * global variables
   */
  window.lang = 'fr';
  window.hash;
  window.referrer = '';

  slider = new PageSlider($('#tmplContent'));

  init();                 
  
  function init() {

    /**
     * [displayView : get the view corresponding to the asked element, in order to load the associated template with context added by the view ]
     */
    window.displayView = function(element) {    
      $.ajax({
        url: 'js/templates/' + element + '.html',
        method: 'get',
        dataType: 'html',
        async: false,
        success: function(data) {
          $('.view').remove(); // remove previous view
          var appendString = '<script class="view" src="js/views/' + element + '.js"></script>';// add new view in body
          $('body').append(appendString);
          loadTemplate(element, data);
        },
        error: function () {
          $('#tmplContent').html('Internet connection problem');
        }
      });
    }

    /**
     * [analyzeHash : analyze hash and determine what view or template to request]
     */
    window.analyzeHash = function() {
      hash = window.location.hash.substr(1);
      if(!hash) { 
        hash = 'home'; 
      }
      displayView(hash); //load view corresponding to the hash
    }

    analyzeHash();
    //every new request changes the hash
    $(window).on('hashchange', function(){
      analyzeHash();
    });

    // used for test : read props extracted from json
    function readNestedObj(obj){
      for(var prop in obj) {
        console.log('prop:' + prop + ' value:' + obj[prop]);
        if(obj[prop] instanceof Object) { 
          readNestedObj(obj[prop]);
        }
      }
    }

    /**
     * [loadTemplate       : get a template, compile it with handblebars.js and add his html content to the DOM]
     * @param  {element    : hash}
     * @param  {tmpl       : minified template to compile to display view}
     */
    function loadTemplate(element, tmpl) {
      // var context = buildContext(tmpl);
      // tmpl = replaceAll(tmpl, "[[", "{{");
      // tmpl = replaceAll(tmpl, "]]", "}}");
      
      var context = {};
      var view   = "new " + element + "()";
      var result = eval(view); 
      var html = compileTemplate(tmpl, context, result);

      slider.slidePage($('<div>').html(html));
    }

    // function replaceAll(string, omit, place, prevstring) {
    //   if (prevstring && string === prevstring)
    //     return string;
    //   prevstring = string.replace(omit, place);
    //   return replaceAll(prevstring, omit, place, string)
    // }

    /**
     * [buildContext    : create context that will be used for Handlebars compilation]
     * @param  {tmpl    : minified template to compile}
     * @return {context : object containing handlebars expression to transform during compilation}
     */
    // function buildContext(tmpl) {
    //   var context = {};
    //   var i = 0;

    //   // find Handlebars expressions in nude template (before compilation)
    //   var tab = tmpl.split("[[");
    //   $.each(tab, function(key, value){
    //     if(i > 0) {
    //       var cond = value.substr(0,4);
    //       var tab2 = value.split("]]");
    //       var expr = tab2[0];
    //       // build context for future Handlebars compilation
    //       context[expr] = eval(expr);
    //     }
    //     i++;
    //   });

    //   return context;
    // }

    /**
     * [compileTemplate : compile template with context through Handlebars.js]
     * @param  {tmpl    : minified template to compile}
     * @param  {context : object containing handlebars expression to transform during compilation}
     * @param  {result  : behavior attached to view}
     * @return {html    : compiled html to load into DOM}
     */
    function compileTemplate(tmpl, context, result) {
      if(result) {
        $.each(result, function(key, value){
          context[key] = value; // add additional parameters to context
        });
      }

      var template = Handlebars.compile(tmpl);
      var html     = template(context);
      html         = escapeLink(html);

      return html;
    }

    /**
     * [escapeLink : convert 'a href' links in readable content ]
     * @param  {[string]} str ['a' link to convert]
     * @return {[string]}     [link converted]
     */
    function escapeLink(str) {
      str = str.replace(new RegExp('&lt;', 'g'), '<');
      str = str.replace(new RegExp('&gt;', 'g'), '>');
      str = str.replace(new RegExp('&quot;', 'g'), '"');
      str = str.replace(new RegExp('&#x27;', 'g'), '\'');
      str = str.replace(new RegExp('{{{', 'g'), '');
      str = str.replace(new RegExp('}}}', 'g'), '');
      return str;
    }
  }
}());

