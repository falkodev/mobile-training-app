var newsView = function () {
    var result = {};
    var link = '';
    result.languages = languages;

    // at loading, call rss with the language used to display daily text
    callRss(sessionUserData.commentLang);

    /**
     * [on click on a language in newsTemplate, call rss feed with language clicked]
     */
    $('body').off('click').on('click', '.linkLang', function(e){
        var clickedLang = $(this).text().toLowerCase();
        callRss(clickedLang);
        $('.linkLang').find('button').removeClass('btn-orange');
        $(this).find('button').addClass('btn-orange');  
    });

    /**
     * [create an html line of buttons to display languages in news screen]
     */
    $.each(languages, function(key, value){
        value = $.trim(value['lang']);
        if(sessionUserData.commentLang == value) { link += '<a class="linkLang"><button class="btn btn-sm btn-default btn-orange">' + value.toUpperCase() + '</button></a>'; }        
        else { link += '<a class="linkLang"><button class="btn btn-sm btn-default">'+ value.toUpperCase() + '</button></a>'; }
    });  

    function callRss(lang){
        $.ajax({
            type: "GET",
            url: "http://www.jwreading.com/ajax/rss.php",
            dataType: 'html',
            data: {'lang' : lang, 'full' : 'false' },       
            success: function(html){
                var newsLength = $('.news', html).length;
                $('#feed').html(html);
            }
        });
    }

    result.lang_links = link; // will be added in the context for handlebars compilation
    return result;
}
