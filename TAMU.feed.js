/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
TAMU.feed.js

New:
  + Truncate entry summary to 300 characters
  + Styled, templated calendarday element added to entry view & template
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

(function(){ 

  // Initial Setup
  // -------------
  "use strict";
  if ("undefined"===typeof TAMU) this.TAMU = {};
  if ("undefined"===typeof TAMU.feed) TAMU.feed = {};
  if ("undefined"===typeof TAMU.feedapp) TAMU.feedapp = {};
  if ("undefined"===typeof TAMU.feedapp.element) TAMU.feedapp.element = {};

  TAMU.feedapp.VERSION = '0.1.0';   //
  var debugging = false;            //

  // Constants
  var truncatedStringMaxLength = 300;
  var millisecondsBeforeHistorical   = 1800000; // 30min slack after dtstart
  //var millisecondsBeforeHistorical = 3600000; // 60min slack after dtstart

  // Configuration
  if (!TAMU.feed.sort) TAMU.feed.sort = false;
  if (!TAMU.feed.fetchEntries) TAMU.feed.fetchEntries = 4;
  if (!TAMU.feed.wantEntries ) TAMU.feed.wantEntries  = 99;

  // Shims
  Date.valueOf = Date.now = Date.now || function() { return +new Date; };
  if ("undefined"===typeof console)
    console = (function(){ z = function(){}; return { 
      log:z ,trace:z ,count:z ,dir:z ,dirxml:z 
      ,debug:z, info:z ,warn:z ,error:z
      ,group:z ,groupCollapsed:z ,groupEnd:z
      ,profile:z ,profileEnd:z ,time:z ,timeEnd:z ,assert:z
  }})();

  // Debugging Functions
  var debug,info,warn,error;
  error = console.error || $.error;
  debug = function(s){if (debugging) return console.debug(s);};

  // Prerequisite JS checkup //Enhance for AMD
  var good="", err="";
  if ("undefined"===typeof $)
        err += "jQuery was not loaded.\n";
  else good += "\nYou are running jQuery version: "+$.fn.jquery;
  if ("undefined"===typeof google || "undefined"===typeof google.loader)
        err += "Google JS API was not loaded.\n";
  else good += "\nYou are running Google JS API with key: "+google.loader.ApiKey;
  if (err) { alert (err+"PLEASE FIX THESE PROBLEMS.\n\n"+good); return;}

  // Url's
  if ("undefined"===typeof TAMU.feed.url || !TAMU.feed.url) TAMU.feed.url = [
     "http://cal.tamu.edu/liberalarts/upcoming/?format=rss"
    ,"http://liberalarts.tamu.edu/feeds/collegenews.rss"
    ,"http://gdata.youtube.com/feeds/api/users/TAMUliberalarts/uploads"
    ,"http://picasaweb.google.com/data/feed/base/all?alt=rss&kind=photo&access=public&tag=landscape&filter=1&imgmax=4&hl=en_US"
    ,"http://cal.tamu.edu/philosophy/upcoming/?format=rss"
    ,"http://cal.tamu.edu/perf/upcoming/?format=rss"
    ,"http://cal.tamu.edu/internationalstudies/upcoming/?format=rss"
    ,"http://academyarts.tamu.edu/feed/"
  ]

  // CSS Selectors
  if ("undefined"===typeof TAMU.feed.selector) 
    TAMU.feed.selector = {}
  else if ("string"===typeof TAMU.feed.selector) 
    TAMU.feed.selector = {"stage":TAMU.feed.selector};
  if ("undefined"===typeof TAMU.feed.selector.stage) 
    TAMU.feed.selector.stage            = "#tamufeeds";
  if ("undefined"===typeof TAMU.feed.selector.propertyTemplate) 
    TAMU.feed.selector.propertyTemplate = "#propertyTemplate";
  if ("undefined"===typeof TAMU.feed.selector.entryTemplate) 
    TAMU.feed.selector.entryTemplate    = "#entryTemplate";
  if ("undefined"===typeof TAMU.feed.selector.feedTemplate) 
    TAMU.feed.selector.feedTemplate     = "#feedTemplate";
  if ("undefined"===typeof TAMU.feed.selector.timeTemplate) 
    TAMU.feed.selector.timeTemplate     = "#timeTemplate";
  if ("undefined"===typeof TAMU.feed.selector.dateTemplate) 
    TAMU.feed.selector.dateTemplate     = "#dateTemplate";
  if ("undefined"===typeof TAMU.feed.selector.calendardayTemplate) 
    TAMU.feed.selector.calendardayTemplate = "#calendardayTemplate";
  if ("undefined"===typeof TAMU.feed.selector.encasedTemplate) 
    TAMU.feed.selector.encasedTemplate = "#encasedTemplate";

  // Bind element from selector
  TAMU.feedapp.element.stage = $(TAMU.feed.selector.stage);

  // Load Templates
  var dateTemplate    = $(TAMU.feed.selector.dateTemplate).html();
  var propertyTemplate= $(TAMU.feed.selector.propertyTemplate).html();
  var feedTemplate    = $(TAMU.feed.selector.feedTemplate).html();
  var entryTemplate   = $(TAMU.feed.selector.entryTemplate).html();
  var encasedTemplate = $(TAMU.feed.selector.encasedTemplate).html();
  var calendardayTemplate = $(TAMU.feed.selector.calendardayTemplate).html();

  // Fallback Templates
  var timeTemplate = timeTemplate || '{{g}}:{{i}}{{a}}';
  var dateTemplate = dateTemplate || '{{l}}, {{F}} {{j}}<sup>{{S}}</sup>, {{Y}}';
  var propertyTemplate= propertyTemplate ||
    '<{{element}} class="{{key}}" title="{{title}}">{{value}}</{{element}}>';
  var feedTemplate  = feedTemplate ||
    "<div class='feed channel {{feedKey}} {{attributes}}' data-source='{{feedUrl}}' data-index='{{index}}' data-entries='{{quantity}}'> \n<h2 class='feed-title'>{{title}}</h2> \n<div class='feed-description'>{{description}}</div> \n{{entries}}\n</div>\n";
  var entryTemplate = entryTemplate ||
    "<div class='item entry {{tags}} {{attributes}}' data-categories='{{tags}}' data-index='{{index}}' data-entries='{{quantity}}'> \n<h3><a href='{{link}}' class='entry-title'>{{title}}</a></h3> \n{{subtitle}} \n{{summary}} \n{{author}} \n{{location}} \n{{pubDate}} \n{{time}} \n<div class='share'> \n<span class='facebook social unshine'> \n <a href='http://www.facebook.com/sharer.php?u={{linkencoded}}' title='Share on this Facebook »'>Share this on Facebook » </a> \n</span><span class='twitter social unshine'> \n<a href='http://twitter.com/home?status={{linkencoded}}' title='Tweet this »'>Share this on Twitter » </a> \n</span><span class='linkedin social unshine'> \n<a href='http://www.linkedin.com/shareArticle?url={{linkencoded}}' title='Share on this LinkedIn »'>Share this on LinkedIn » </a> \n</span> \n</div> \n{{categories}} \n{{bookmark}} \n{{description}} \n</div>";
  var calendardayTemplate = calendardayTemplate || 
    '<span class="dayOfMonth">{{j}}</span><span class="month">{{M}}</span>';
  var encasedTemplate = encasedTemplate || 
    '<table class="{{key}}"><tbody><tr><td class="{{key}}" {{dataAttr}}>{{value}}</td></tr></tbody></table>';


  // Template Function
  // -----------------
  var t = TAMU.t = function(st,d) { // (string, dictionary)
  //Template function uses the dictionary to replace keys w/values in the string
    for (var key in d) st = st.replace(new RegExp('{{'+key+'}}', 'ig'), d[key]);
    return st.replace(/({{[^{]*}})/ig,'');
  }//t


  // Date/Time Function
  // ------------------
  var dt = TAMU.dt = function(d) {
  //Returns an object that break down date parts, ala sprintf date format.
    if (!d.getMinutes) error("Invalid dt(parameter) was "+typeof d);
    var minutes = d.getMinutes();
    var hours = d.getHours();
    var ampm  = "am";
    if (hours>=12) {hours-=12; ampm="pm"; if (!hours) hours=12;}
    var jday= d.getDate();
    var ordinal = "th";
    if (1===jday) ordinal = "st";
    if (2===jday) ordinal = "nd";
    if (3===jday) ordinal = "rd";
    if (minutes<10) {minutes="0"+minutes;}
    var dday= (jday<10) ? "0"+jday : jday;
    var weekday = d.getDay();
    var Dday= ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][weekday];
    var lday= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][weekday];
    var month = d.getMonth();
    var Mmonth= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month]
    var Fmonth= ["January","Febuary","March","April","May","June","July","August","September","October","November","December"][month]
    return {
       "w": weekday         //day of the week (0-6 for Sun-Sat)
      ,"S": ordinal         //English ordinal suffix for day ["st","nd","rd","th"]
      ,"j": jday            //day of the month (1-31)
      ,"d": dday            //day of the month (01-31) with leading zeros
      ,"D": Dday            //day of the month e.g. Mon or Tue
      ,"l": lday            //day of the month e.g. Monday or Tuesday
      ,"n": month+1         //month (1-12)
      ,"M": Mmonth          //month, short textual representation, three letters
      ,"F": Fmonth          //month, full textual representation e.g. January
      ,"Y": d.getFullYear() //year (4 digits for 4-digit years) 
      ,"i": minutes         //minutes (00-59) with leading zeros
      ,"g": hours           //hour (0-12)
      ,"a": ampm            //am or pm
      ,"U": d.getTime()     //Seconds since the Unix Epoch (January 1 1970)
    }//return
  }//function dt


  // Trunc String function
  // ---------------------
  var trunc = function(str,n,useWordBoundary){
  //http://stackoverflow.com/questions/1199352/smart-way-to-shorten-long-strings-with-javascript
    var tooLong, s_;
    if ("undefined"===typeof n) n=truncatedStringMaxLength;
    tooLong = str.length>n;
    if (!str || !tooLong) return str;
    if ("undefined"===typeof useWordBoundary) useWordBoundary=true;
    s_ = str.substr(0,n-1);
    s_ = useWordBoundary ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
    return  s_ + '…';
  }//function


  // View Functions
  // ==============

  var viewProperty = function(key,val,data,template){
  //This function builds the view for a property.
    //debug("» Property View: key="+key);
    if (!template) template = propertyTemplate;
    var dataAttr = "";
    if ("undefined"!==typeof data) 
      $.each(data, function(key,val){ dataAttr += ' data-'+key+'="'+val+'"' });
    return !val ? "" : t(template,{
         "key"      : key
        ,"value"    : val
        ,"dataAttr" : dataAttr
     });
  }//function viewProperty


  var viewEntry = function(index,entry,quantity){
  //This function builds the view for an entry.
    var day,timespan,dtstart,dtend,calendarday;
    var attributes = ["even","odd "][index%2];
    if (entry.event)      attributes += " vevent";
    if (entry.historical) attributes += " historical";
    if (entry.dtstart) { //---------------------
      timespan = dtstart = viewProperty("dtstart",entry.dtstart,{"iso8601":entry.dtstartISO8601});
      if ("Invalid Date"===entry.start.toLocaleDateString()) 
        day = entry.publishedDate || entry.dstartISO8601;
      else 
        day = t(dateTemplate,dt(entry.start));
      calendarday = t(calendardayTemplate,dt(entry.start));
      if (entry.dtend) {
        dtend = viewProperty("dtend",entry.dtend,{"iso8601":entry.dtendISO8601});
        timespan = timespan + "&ndash;" + dtend;
      }//if dtend
      day = viewProperty("date",day);
      timespan = day + timespan;
    }//if dtstart ---------------------
    else timespan = viewProperty("date",
      t(dateTemplate,dt(new Date(entry.publishedDate)))
    );
    return {
       "title"      : entry.title
      ,"link"       : entry.link
      ,"linkencoded": encodeURIComponent(entry.link)
      ,"tags"       : ""
      ,"categories" : ""
      ,"description": entry.description
      ,"index"      : index+1
      ,"quantity"   : quantity
      ,"attributes" : attributes
      ,"dtstart"    : dtstart
      ,"dtend"      : dtend
      ,"date"       : day
      ,"calendarday": viewProperty("calendarday",calendarday)
      ,"time"       : viewProperty("time"       ,timespan)
      ,"bookmark"   : viewProperty("bookmark"   ,entry.link)
      ,"subtitle"   : viewProperty("subtitle"   ,entry.subtitle)
      ,"summary"    : viewProperty("summary"    ,entry.summary,{},encasedTemplate)
      ,"location"   : viewProperty("location"   ,entry.location)
      ,"pubDate"    : viewProperty("pubDate"    ,entry.publishedDate)
      ,"author"     : viewProperty("author"     ,entry.author)
    };
  }//function viewEntry


  var viewFeed = function(feedIndex){
  //This function builds the view for a feed.
    debug("» Feed View");
    var entries = '';
    var novel = 0;
    var feedAttributes = ["even","odd "][feedIndex%2];
    var quantity = TAMU.feed.metadata[feedIndex]["entries"].length;
    if (quantity) {
      $.each(TAMU.feed.metadata[feedIndex]["entries"],
        function(index,entry){
          var ve = viewEntry(index,entry,quantity);
          if ("undefined"===typeof ve.historical) novel++;
          if (novel>TAMU.feed.wantEntries) ve.attributes += " over";
          entries += t(entryTemplate,ve);
        }//function
      );
    } else entries = '<p class="noentry">Nothing to report.</p>';
    return {  
      "feedIndex"   : "feed"+(feedIndex+1)
      ,"attributes" : feedAttributes
      ,"index"      : feedIndex+1
      ,"feedQuantity": TAMU.feed.quantity
      ,"quantity"   : quantity
      ,"entries"    : entries
      ,"feedUrl"    : TAMU.feed.metadata[feedIndex]["feedUrl"]
      ,"title"      : TAMU.feed.metadata[feedIndex]["title"]
      ,"author"     : TAMU.feed.metadata[feedIndex]["author"]
      ,"description": TAMU.feed.metadata[feedIndex]["description"]
    };
  }//function viewFeed


  var view = function(){
  //This function builds the view for all feeds, synchronously.
    debug("» View");
    $.each(TAMU.feed.url,function(feedIndex,feedUrl){
      TAMU.feedapp.element.stage.append(t(feedTemplate,viewFeed(feedIndex)));
    });
  }//function view


  // Model Functions
  // ===============

  var modelEntry = function(index,entry) {
  //This function models one entry. Presumes entry.content.
    var isoAttr;
    //content: transform all REL → CLASS
    entry.content = entry.content.replace(/\brel="/ig,' class="');
    entry.description = viewProperty("description",entry.content);
    //--------------------------DATE/TIME--------------------------
    var dtstartEle  = $(entry.description).find(".dtstart");
    if (dtstartEle) {
      entry.dtstart = dtstartEle.text();
      if ("ABBR"===dtstartEle.prop('tagName')) isoAttr = "title";
      else isoAttr = "data-iso8601";
      entry.dtstartISO8601 = dtstartEle.attr(isoAttr);
      entry.start = new Date(entry.publishedDate);
      //entry.start = new Date(entry.dtstartISO8601); //Mobile Webkit Prob
      var dtendEle = $(entry.description).find(".dtend");
      if (dtendEle) {
        if ("ABBR"===dtendEle.prop('tagName')) isoAttr = "title";
        else isoAttr = "data-iso8601";
        entry.dtend = dtendEle.text();
        entry.dtendISO8601 = dtendEle.attr(isoAttr);
        //entry.end = new Date(entry.dtendISO8601); //Mobile Webkit Prob
        //if ("Invalid Date"===entry.end.toLocaleDateString()) delete entry.end;
      }//dtendEle
    }//if dtstartEle
    //--------------------------DATE/TIME--------------------------
    //entry.pubDate = new Date(entry.publishedDate);
    entry.location = $(entry.description).find(".location").text();
    if (entry.location) { // Event // Event // Event 
      entry.event = true;
      entry.historical = (
        entry.start.getTime() < +Date.now() + millisecondsBeforeHistorical
      );//historical
      entry.summary  = trunc($(entry.description).find(".summary").text())
    } else { // Non-Event // Non-Event // Non-Event
      entry.summary  = trunc(entry.content);
    }
    entry.subtitle = $(entry.description).find(".subtitle").text();
    entry.description = viewProperty("description",entry.content); //hidden
  }//function modelEntry


  var modelFeed = function(feedIndex,feed){
  //This function builds the model for a feed.
    debug("» Model");
    $.extend(TAMU.feed.metadata[feedIndex],feed);
    //Enhance: Is it necessary to deep clone the google result.feed???
    //TAMU.feed.metadata[feedIndex]["quantity"] = TAMU.feed.metadata[feedIndex]["entries"].length;
    debug("Feed "+(feedIndex+1)+"'s quantity of entries fetched is "+
        TAMU.feed.metadata[feedIndex]["entries"].length
    );
    $.each(TAMU.feed.metadata[feedIndex]["entries"],
        function(index,entry){
          if (entry.content) modelEntry(index,entry);
        }//function
    );//each entry
  }//function modelFeed


  // Controller Functions
  // ====================

  var controllerFeed = function(result,feedIndex) {
  //This function is the asynchronously-invoked controller for a feed.
    debug("» Feed Controller");
    if ("undefined"===typeof TAMU.feed.metadata) TAMU.feed.metadata = {};
    TAMU.feed.metadata[feedIndex] = {};
    if (result.error) return TAMU.feedapp.element.stage.append(
        t(feedTemplate,{
          "feedUrl" : "" 
          ,"entries": ""
          ,"feedIndex"  : "error"+result.error.code
          ,"title"      : "Error "+result.error.code+": "+result.error.message
          ,"description": "Error "+result.error.code+": "+result.error.message
        })//t
    );//return error
    modelFeed(feedIndex,result.feed);
    if ("netspeed"===TAMU.feed.sort) {
      TAMU.feedapp.element.stage.append(t(feedTemplate,viewFeed(feedIndex)));
      delete TAMU.feed.metadata[feedIndex]; //forget the feed's metadata
    } else if (!--TAMU.feedapp.countdown) {
      view();
      delete TAMU.feed.metadata; //forget all feeds metadata
    }//else if
  }//function controllerFeed


  var controller = TAMU.feedapp.controller = function() {
  //This function is the asynchronously-invoked main controller.
    debug("» Controller");
    if ("object"!==typeof TAMU.feed.url) TAMU.feed.url = [TAMU.feed.url];
    TAMU.feed.quantity = TAMU.feedapp.countdown = TAMU.feed.url.length;
    debug("--How many feeds? "+TAMU.feed.quantity);
    TAMU.feedapp.element.stage.attr("data-feeds",TAMU.feed.quantity);
    TAMU.feedapp.element.stage.html(""); //Clear out static content from server.
    $.each(TAMU.feed.url,function(feedIndex,feedUrl){
      var googfeed = new google.feeds.Feed(feedUrl);
      googfeed.includeHistoricalEntries();//TEST
      googfeed.setNumEntries(TAMU.feed.fetchEntries);
      debug("--Feed #"+(feedIndex+1)+"'s fetchEntires = "+TAMU.feed.fetchEntries);
      googfeed.load( //Asynchronously 
        function(result){ controllerFeed(result,feedIndex);}
      );
    });//each feed
  }//function controller


}).call(this); // IIFE //

// -------------------------------------------------------------------------

$(function() { /* OnDomReady /**/

  if (TAMU.feedapp.element.stage) 
    google.load("feeds","1",{"callback":TAMU.feedapp.controller});

});
