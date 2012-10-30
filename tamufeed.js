/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
tamufeed: 
  { exports: "tamufeed", deps: ["google", "jquery" ,"underscore"] }

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

;var tamufeed = (function(win,config) {

  // Initial Setup
  // -------------
  "use strict";
  var VERSION = '0.1.2';

  // Configuration
  var debugging = config.debugging || false;
  var feed    	= config.feed || [];
  var entries 	= config.entries || [];
  var element 	= config.element || {};
  var async 		= config.async || false;
  var sortorder = config.sort || "";
  var fetchEntries = config.fetchEntries || 4;
  var wantEntries  = config.wantEntries  || 99;
  var truncatedStringMaxLength = config.truncatedStringMaxLength 
    || 300; //characters
  var millisecondsBeforeHistorical = config.minutesBeforeHistorical * 60000
    || 1800000; //=30 minutes slack after dtstart
  var selector = config.selector || {};
  if ("string"===typeof selector) selector = {"stage":selector};
  var feeduri = config.url;
  if ("string"===typeof feeduri) feeduri = [feeduri];


  // Polyfills backporting some ECMA262-5
  // ------------------------------------

  // Date.now
  win.Date.valueOf = win.Date.now = win.Date.now || function() { return +new Date; };
  // Array.forEach
  if (!('forEach' in Array.prototype)) Array.prototype.forEach =
    function(/* function */action, /* object */that) {
      for (var i=0, n=this.length; i<n; i++)
        if (i in this) action.call(that, this[i], i, this);
    }//function
  // console
  if ("undefined"===typeof console)
    console = (function(){ z = function(){}; return { 
      log:z ,trace:z ,count:z ,dir:z ,dirxml:z 
      ,debug:z, info:z ,warn:z ,error:z
      ,group:z ,groupCollapsed:z ,groupEnd:z
      ,profile:z ,profileEnd:z ,time:z ,timeEnd:z ,assert:z
  }})();

  // Debugging Functions
  var error = console.error || $.error;
  var debug = function(s){if (debugging) return console.debug(s);};

  // Prerequisite JS checkup //Enhance for AMD
  var good="", err="";
  if ("undefined"===typeof $)
        err += "jQuery was not loaded.\n";
  else good += "\nYou are running jQuery version: "+$.fn.jquery;
  if ("undefined"===typeof google || "undefined"===typeof google.loader)
        err += "Google JS API was not loaded.\n";
  else good += "\nYou are running Google JS API with key: "+google.loader.ApiKey;
  if (err) { alert (err+"PLEASE FIX THESE PROBLEMS.\n\n"+good); return;}

  // CSS Selectors
  selector.stage = selector.stage || "#tamufeed";
  selector.propertyTemplate    = selector.propertyTemplate || "#propertyTemplate";
  selector.entryTemplate       = selector.entryTemplate    || "#entryTemplate";
  selector.feedTemplate        = selector.feedTemplate     || "#feedTemplate";
  selector.timeTemplate        = selector.timeTemplate     || "#timeTemplate";
  selector.dateTemplate        = selector.dateTemplate     || "#dateTemplate";
  selector.encasedTemplate     = selector.encasedTemplate  || "#encasedTemplate";
  selector.calendardayTemplate = selector.calendardayTemplate || "#calendardayTemplate";

  // Bind element from selector
  var element = {};
  element.stage = $(selector.stage);
  if (!element.stage) return alert("Script configuration problem: tamufeed.js did not find the HTML element.");

  // Load Templates
  var dateTemplate    = $(selector.dateTemplate).html();
  var propertyTemplate= $(selector.propertyTemplate).html();
  var feedTemplate    = $(selector.feedTemplate).html();
  var entryTemplate   = $(selector.entryTemplate).html();
  var encasedTemplate = $(selector.encasedTemplate).html();
  var calendardayTemplate = $(selector.calendardayTemplate).html();

  // Fallback URL's
  if (!feeduri) feeduri = [
    "http://codemaroon.tamu.edu/feed.xml"
    ,"http://feeds.feedburner.com/TAMUTrafficConstruction?format=xml"
/**
    ,"http://liberalarts.tamu.edu/feeds/collegenews.rss"
    ,"http://academyarts.tamu.edu/feed/"
    ,"http://gdata.youtube.com/feeds/api/users/TAMUliberalarts/uploads"
    ,"http://picasaweb.google.com/data/feed/base/all?alt=rss&kind=photo&access=public&tag=landscape&filter=1&imgmax=4&hl=en_US"
    ,"http://cal.tamu.edu/perf/upcoming/?format=rss"
    ,"http://cal.tamu.edu/internationalstudies/upcoming/?format=rss"
    ,"http://calendar.tamu.edu/?calendar_id=73&upcoming&format=rss"  //Stark
    ,"http://calendar.tamu.edu/?calendar_id=103&upcoming&format=rss" //Forsyth
/**/
  ];

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
  var t = function(st,d) { // (string, dictionary)
  //Template function uses the dictionary to replace keys w/values in the string
    if ("string"!==typeof st) throw "t() 1st parameter must be a string; not "+typeof st;
    for (var key in d) st = st.replace(new RegExp('{{'+key+'}}', 'ig'), d[key]);
    return st.replace(/({{[^{]*}})/ig,'');
  }//t


  // Date/Time Function
  // ------------------
  var dt = function(d) {
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


  // XSS prevention function
  // -----------------------
  var xsshtml = function(str){
  //This crude+crass function removes dangerous XSS tags from a string.
    str = str.replace(/<\/?script/ig,'&lt;script');
    str = str.replace(/<\/?style/ig,'&lt;style');
    str = str.replace(/<\/?frameset/ig,'&lt;frameset');
    str = str.replace(/<\/?iframe/ig,'&lt;iframe');
    str = str.replace(/<\/?embed/ig,'&lt;embed');
    str = str.replace(/<\/?object/ig,'&lt;object');
    return str;
  }//function

  // Comparison functions
  // ---------------------

  var byPubDate = function(a,b) {
    a = "object"===typeof a.pubDate ? a.pubDate.getTime() : 0; //e.g. 1227886896000
    b = "object"===typeof b.pubDate ? b.pubDate.getTime() : 0;
    return  a > b;
  }//function

  var byReversePubDate = function(a,b) {
    a = "object"===typeof a.pubDate ? a.pubDate.getTime() : 0;
    b = "object"===typeof b.pubDate ? b.pubDate.getTime() : 0;
    return  a < b;
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
    var attributes = ["odd ","even"][index%2];
    if (entry.type)      attributes += " vevent";
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


  var viewFeed = function(f) {
  //This function builds the view for a feed.
    debug("» viewFeed #"+(f+1));
    var e=0, markup = '', novel = 0;
    var feedAttributes = ["odd ","even"][f%2];
    if (!feed[f]["quantity"]) markup = '<p class="noentry">Nothing to report.</p>';
    else for (e; e < feed[f]["quantity"]; e++) {
      var ve = viewEntry(e,entries[f][e],feed[f]["quantity"]);
      if ("undefined"===typeof ve.historical) novel++;
      if (novel>wantEntries) ve.attributes += " over";
      markup += t(entryTemplate,ve);
    }//else for
    return {  
      "feedIndex"   : "feed"+(f+1)
      ,"attributes" : feedAttributes
      ,"index"      : f+1
      ,"feedQuantity": feed.quantity
      ,"quantity"   : feed[f]["quantity"]
      ,"entries"    : markup
      ,"feedUrl"    : feed[f]["feedUrl"]
      ,"title"      : feed[f]["title"]
      ,"author"     : feed[f]["author"]
      ,"description": feed[f]["description"]
    };
  }//function viewFeed


  var view = function() {
  //This function builds the view for all feeds, synchronously.
    debug("» View");
    $.each(feeduri,function(f,feeduri){
        element.stage.append(t(feedTemplate,viewFeed(f)));
    });
  }//function view


  // Model Functions
  // ===============

  var modelEntry = function(index,entry) {
  //This function models one entry.
    var isoAttr;
    var r = {
      publishedDate: entry.publishedDate   || 0
      ,title : xsshtml(trunc(entry.title)) || ""
      ,link  : xsshtml(trunc(entry.link))  || ""
      ,author: xsshtml(trunc(entry.author))|| ""
    }//$.extend(entries[feedIndex][index],feed.entries[index]); 
    if (!entry.content) return r;
    //content: transform all REL → CLASS
    r.content = xsshtml(entry.content.replace(/\brel="/ig,' class="'));
    r.description = viewProperty("description",r.content);
    //--------------------------DATE/TIME--------------------------
    var dtstartEle  = $(r.description).find(".dtstart");
    if (dtstartEle) {
      r.dtstart = dtstartEle.text();
      if ("ABBR"===dtstartEle.prop('tagName')) isoAttr = "title";
      else isoAttr = "data-iso8601";
      r.dtstartISO8601 = dtstartEle.attr(isoAttr);
      r.start = new Date(r.publishedDate);
      //r.start = new Date(r.dtstartISO8601); //Mobile Webkit Prob
      var dtendEle = $(r.description).find(".dtend");
      if (dtendEle) {
        if ("ABBR"===dtendEle.prop('tagName')) isoAttr = "title";
        else isoAttr = "data-iso8601";
        r.dtend = dtendEle.text();
        r.dtendISO8601 = dtendEle.attr(isoAttr);
        //r.end = new Date(r.dtendISO8601); //Mobile Webkit Prob
        //if ("Invalid Date"===r.end.toLocaleDateString()) delete r.end;
      }//dtendEle
    }//if dtstartEle
    //--------------------------DATE/TIME--------------------------
    r.pubDate = new Date(r.publishedDate);
    r.location = xsshtml(trunc($(r.description).find(".location").text()));
    if (r.location) { // Event // Event // Event 
      r.type = "event";
      r.historical = (
        r.start.getTime() < +Date.now() + millisecondsBeforeHistorical
      );
      r.summary = trunc($(r.description).find(".summary").text())
    } else { // Non-Event // Non-Event // Non-Event
      r.type = ""; 
      r.summary = xsshtml(trunc(entry.content));
    }
    r.subtitle = xsshtml(trunc($(r.description).find(".subtitle").text()));
    r.description = viewProperty("description",r.content); //css hides
    return r;
  }//function modelEntry


  var modelFeed = function(f,feed){
  //This function builds the model for a feed.
    debug("» modelFeed #"+(f+1));
    debug("# entries = "+feed.entries.length);
    var type = ""; //initialize the feed's type
    var e=0;
    entries[f] = [];
    for (e; e < feed.entries.length; e++) {
      entries[f][e] = modelEntry(e,feed.entries[e]);    //model entry
      entries[f][e].type && (type = entries[f][e].type);//feed inherits type
    }//for entries
    if ("reverse"===sortorder) {
      if (type) entries[f].sort(byReversePubDate);
      else entries[f].sort(byPubDate)
    } else { //presumed: every other sortorder is default i.e. "forward"
      if (type) entries[f].sort(byPubDate);
      else entries[f].sort(byReversePubDate);
    }
    return {
      "feedUrl"     : xsshtml(trunc(feed.feedUrl))
      ,"title"      : xsshtml(trunc(feed.title))
      ,"author"     : xsshtml(trunc(feed.author))
      ,"description": xsshtml(trunc(feed.description))
      ,"type"       : type
      ,"quantity"   : entries[f].length
    };
  }//function modelFeed


  // Controller Functions
  // ====================

  var controllerFeed = function(result,f) {
  //This function is the asynchronously-invoked controller for a feed.
    debug("» controllerFeed #"+(f+1));
    if (result.error) return element.stage.append(
        t(feedTemplate,{
          "feedUrl" : "" 
          ,"entries": ""
          ,"feedIndex"  :  "error"+result.error.code
          ,"title"      : "Error "+result.error.code+": "+result.error.message
          ,"description": "Error "+result.error.code+": "+result.error.message
        })//t
    );//return error
    feed[f] = modelFeed(f,result.feed);
    if (async) {
      element.stage.append(t(feedTemplate,viewFeed(f)));
      delete entries[f]; //forget the feed's metadata
    } else if (!--feed.countdown) {
      view();
      entries = null; //forget all feeds metadata
    }//else if
  }//function controllerFeed


  var controller = function() {
  //This function is the asynchronously-invoked main controller.
    debug("» Controller");
    feed.quantity = feed.countdown = feeduri.length;
    debug("--How many feeds? "+feed.quantity);
    element.stage.attr("data-children",feed.quantity);
    element.stage.html(""); //Clear out static content from server.
    $.each(feeduri,function(f,feeduri){
      var googfeed = new google.feeds.Feed(feeduri);
      googfeed.includeHistoricalEntries();//TEST
      googfeed.setNumEntries(fetchEntries);
      debug("--Feed #"+(f+1)+"'s fetchEntires = "+fetchEntries);
      googfeed.load( //Asynchronously 
        function(googresult){ controllerFeed(googresult,f);}
      );
    });//each feed
  }//function controller

  return {
    VERSION: VERSION
    ,controller: controller
    ,element: element
  }

})(this,tamufeed || {}); // IIFE //

// -------------------------------------------------------------------------
/* Register as a named module with AMD. 
  if (typeof define === 'function' && define.amd)
    define(["google", "jquery", "Backbone"], function(){ return {}; });
/**/
// -------------------------------------------------------------------------

$(function() { /* OnDomReady /**/

  if (tamufeed.element.stage) 
    google.load("feeds","1",{"callback":tamufeed.controller,"nocss":true});

});
