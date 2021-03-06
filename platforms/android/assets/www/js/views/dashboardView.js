var dashboardView = function () {
    var result = {};
 	var link = '';
    sessionUserData = JSON.parse(localStorage.getItem("sessionUserData")); // retrieve user data
    
    /**
     * [on click on a language in homeTemplate, remove previous language and add new language in the view]
     */
    $('body').off('click').on('click', '.linkLang', function(e){
        $('script[src="assets/lang/' + lang + '.js"]').remove(); //remove previous language file
        lang = $(this).text().toLowerCase();
        lang = $.trim(lang);
        localStorage.setItem("lang", lang);       
        displayLang(); //add the translation file corresponding to the language
        analyzeHash(); // refreshes view
    });

    /**
     * [create an html line of buttons to display languages in dashboard]
     */
    var i = 0;                    
    $.each(langList, function(key, value){
        value = $.trim(value);
        if(localStorage.getItem("lang") == value) { link += '<button class="btn btn-sm btn-default btn-orange">' + value.toUpperCase() + '</button>'; }        
        else { link += '<a class="linkLang"><button class="btn btn-sm btn-default">'+ value.toUpperCase() + '</button></a>'; }
        i++;
    });  

	//get daily text
	$.post("http://www.jwreading.com/ajax/getDailyText.php", 
	   { 'lang': sessionUserData.commentLang }, function(data) {}).complete(function(data) {
		result = data['responseText'].trim();
		$('#dailyText').html(result);
	});

	//get rss feed
    $.ajax({
        type: "GET",
        url: "http://www.jwreading.com/ajax/rss.php",
        dataType: 'html',
        data: {'lang' : localStorage.getItem("lang") },        
        success: function(html){            	
        	var newsLength = $('.news', html).length;	  
        	var x = 1;
        	var y = 0;
        	var slider1 = new PageSlider($('#feed-rotator1')); //slide for left feed-rotator
        	var slider2 = new PageSlider($('#feed-rotator2')); //slide for right feed-rotator

        	function rotateNews(newsNumber, feedRotatorNumber) {
				var display = $('#news' + newsNumber, html); //get specific news to display
				$.each(display, function(key, value){
		    		$.each(value, function(k, v){
		    			if(k == 'outerHTML') {
		    				var displayLink = $('a', display); //get href link from this news
    						var sliderView = "slider" + feedRotatorNumber + ".slidePageFrom($('<div>').html(displayLink), 'right')";
    						var result = eval(sliderView); 
		    				return false;
		    			}
		    		});
		    	}); 
			}   

			var interval = window.setInterval(function() {
				if(y==0) { //first time 
        			$('#waitDiv').hide(); //when loading is done, hide the loading animation
        			y = 2; //feeding right feed rotator
        			rotateNews(x, y); 
    			} 
			}, 1000); // load animation during 1 second (enough to load rss feed)		     
			
        	var interval = window.setInterval(function() {
        		if(y == 1 || y == 2) {
        			y = 1;
					rotateNews(x, y); //feeding left feed rotator

					if(x == newsLength) { x = 0; }
					x++;
					y = 2;
					rotateNews(x, y); //feeding right feed rotator
				}					
			}, 10000); // display every news during 5 seconds		
        }
    });
    
    // refresh daily text and data (useful for "rate app" state) twice a day
    var refreshData = window.setTimeout(function() {
        $.ajax({
            type: "POST",
            url: "http://www.jwreading.com/ajax/login.php",
            beforeSend: function() { 
                timer = setTimeout(function(){$('#waitDiv').show();},200); // if ajax request takes more than 200ms, display loading animation   
            },
            timeout: 5000, 
            data: "loginInput=" + sessionUserData.email + "&pwdInput=" + sessionUserData.password,
            success: function(msg) {                 
                if (msg[0] == '1') //correct credentials : login done
                {                
                    localStorage.removeItem("sessionUserData");
                    var data = JSON.parse(msg.substr(1));
                    localStorage.setItem("sessionUserData", JSON.stringify(data));
                    sessionUserData = JSON.parse(localStorage.getItem("sessionUserData"));
                    window.location.reload();              
                }
            },
            complete: function() {   
                clearTimeout(timer);
                $('#waitDiv').hide();  
            }
        }); 
    }, 43200000 ); // repeat every 12 hours(1000 milliseconds * 60 seconds * 60 minutes * 12 hours)

    result.lang_links = link; // will be added in the context for handlebars compilation
    return result;	
}