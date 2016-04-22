var gLocalHost     = "http://localhost:8080/CommunityOutreachService/SlideService";  //For Local Development Purposes 
var gProductionURL = "http://fuzzdisplay-env.us-west-2.elasticbeanstalk.com/SlideService";
var gBaseURL = gProductionURL;

/**
* Convenience method in the event that logging does more that print to the console
*/
function log(text){
    console.log(text)
}

/**
* Http Get Request 
*/
function Get(url, successCallback, errorCallback){
    var xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.onload = function(){
        successCallback(JSON.parse(xmlHttpRequest.response))
    }
    xmlHttpRequest.onerror = function(){
        errorCallback(xmlHttpRequest.statusText)
    }
    xmlHttpRequest.open('GET', url);
    xmlHttpRequest.send();  
}


/**
* Uses the Fuzz SlideService to retrieve a JSON representation of the slides
* in the android@fuzzproductions.com Public folder on Google Drives and adds
* it to the DOM
*/
function loadSlidesFromGoogleDrive(onLoadComplete){
     Get( gBaseURL, function(response){
        for( var i = 0; i < response.length; i++ ){
            var category = response[i]
            if( category.items.length > 0 ){
                addCategory(category)   
            }
        }
         onLoadComplete()
     }, function(responseText){
        log(responseText)    
     })   
}

/**
* Helper function for the front-end sorting of sections which should be displayed in reverse order
* This is only a v1 work around, v2 should have parameter based sorting via the Web Services
*/
function reserveOrderForSection(category){
    var handled;
    var name = category.name;
    if( name.includes("Meetings") || name.includes("Special") ){
        handled = true
        addMenItem(category.name)
        var sectionId = createCategorySection(category)
        for( var j = category.items.length-1; j >= 0; j-- ){
            addThumbnailForSlide(sectionId, category.items[j])    
        }     
    } else {
        handled = false
    }
    return handled
}
/**
* Adds a single category ( essentially a folder from Google Drive ) to the DOM
*/
function addCategory(category){
    if( reserveOrderForSection(category) == false ){
        addMenItem(category.name)
        var sectionId = createCategorySection(category)
        for( var j = 0; j < category.items.length; j++ ){
            addThumbnailForSlide(sectionId, category.items[j])    
        }
    }
}

/**
* Converts a category's name to a string that can be used as an Element's Id
*/
function getIdFromName(name){
    return name.toLowerCase().replace(' ', '_')
}

/**
* Creates a Section for a category and adds the category name as the header
*/
function createCategorySection(category){
    var id = getIdFromName(category.name)
    $("#page-top").append( $('<section>').attr('id', id).attr('class', 'swimlane card bg-light-gray')
                          .append($('<div>').attr('class', 'container')
                                  .append( $('<div>').attr('class', 'row')
                                         .append( $('<div>').attr('class', 'col-lg-12')
                                                .append($('<h2>').append(category.name))))                                  
                         .append( $('<div>').attr('id','row-'+id).attr('class', 'row')
                                        ))
                         )
    return 'row-'+id;
}

/**
* Adds the name of a category as a menu item in the navigation bar for faster navigation
*/
function addMenItem(name){
    $('#main_nav_ul').append(
        $('<li>').append(
        $('<a>').attr('class','page-scroll')
                .attr('href','#'+ getIdFromName(name))
                .append(name)
        )
    ); 
}

/**
* Adds the thumbnail of the slide into the appropriate section of the DOM
*/
function addThumbnailForSlide(rowId, item){
    $('#'+rowId)
        .append(
            $('<div>').attr('class','col-md-4 col-sm-6 portfolio-item')
                .append( $('<a>').attr('href', item.embedlink).attr('class', 'portfolio-link')
        .append( $('<div>').attr('class', 'portfolio-hover')
        .append( $('<div>').attr('class', 'portfolio-hover-content')
        .append( $('<i>').attr('class', 'fa fa-plus fa-3x'))))
        .append( $('<img>').attr('src', item.thumbnail).attr('width','400px').attr('class', 'img-responsive')))
        .append( $('<div>').attr('class', 'portfolio-caption')
        .append( $('<h4>').append(item.name)
        ))); 
}

$(function() {
    loadSlidesFromGoogleDrive(function(){
        $('#load-spinner').hide()
    })
});
