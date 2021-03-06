//PubSubJS ©2013 Morgan Roderick http://mrgnrdrck.mit-license.org
(function(a,c,b){var d=typeof module=="object"&&typeof require=="function";if(d){module.exports=b(a,c)}else{if(typeof define==="function"&&typeof define.amd==="object"){define(b)}else{c[a]=b(a,c)}}}("PubSub",(typeof window!=="undefined"&&window)||this,function definition(a,b){var l={name:"PubSubJS",version:"1.3.2"},g={},j=-1;function k(n){return function m(){throw n}}function d(n,o,p){try{n(o,p)}catch(m){setTimeout(k(m),0)}}function h(m,n,o){m(n,o)}function f(n,q,r,t){var s=g[q],m=t?h:d,p,o;if(!g.hasOwnProperty(q)){return}for(p=0,o=s.length;p<o;p++){m(s[p].func,n,r)}}function e(m,n,p){return function o(){var r=String(m),q=r.lastIndexOf(".");f(m,m,n,p);while(q!==-1){r=r.substr(0,q);q=r.lastIndexOf(".");f(m,r,n)}}}function i(o){var n=String(o),p=g.hasOwnProperty(n),m=n.lastIndexOf(".");while(!p&&m!==-1){n=n.substr(0,m);m=n.lastIndexOf(".");p=g.hasOwnProperty(n)}return p}function c(o,p,n,r){var q=e(o,p,r),m=i(o);if(!m){return false}if(n===true){q()}else{setTimeout(q,0)}return true}l.publish=function(m,n){return c(m,n,false,l.immediateExceptions)};l.publishSync=function(m,n){return c(m,n,true,l.immediateExceptions)};l.subscribe=function(o,n){if(!g.hasOwnProperty(o)){g[o]=[]}var m=String(++j);g[o].push({token:m,func:n});return m};l.unsubscribe=function(u){var s=typeof u==="string",r=s?"token":"func",t=s?u:true,o=false,n,q,p;for(n in g){if(g.hasOwnProperty(n)){for(q=g[n].length-1;q>=0;q--){if(g[n][q][r]===u){g[n].splice(q,1);o=t;if(s){return o}}}}}return o};return l}));

//
//  tamufeed.js
//

var tamufeed = (function (window, $, google) {
/*****************************************************************************/

  // Initial Setup
  // -------------
  "use strict";
  var VERSION = '0.1.7'

  var service           //saves the link to google.feeds
    ,payload = []       //saves the payloads returned from google.feeds
    ,element = {}       //saves the jQuery element of the stage
    ,name = "tamufeed"; //each instantiation should have a unique name

  // Configuration
  var config = tamufeed; //from global namespace
  var debugging   = config.debugging    || false;
  var feed        = config.feed         || [];
  var entries     = config.entries      || [];
  var lang        = config.language     || "en";
  var sortorder   = config.sort         || "";
  var fetchEntries= config.fetchEntries || 4;
  var wantEntries = config.wantEntries  || 99;
  var overWantedClass = config.overWantedClass = "over";
  var truncatedStringMaxLength = config.truncatedStringMaxLength 
    || 300; //characters
  var millisecondsBeforeHistorical = config.minutesBeforeHistorical * 60000
    || 1800000; //=30 minutes slack after dtstart
  var selector = config.selector || {};
  if ("string"===typeof selector) selector = {"stage":selector};
  var feeduri = config.url;
  if ("string"===typeof feeduri) feeduri = [feeduri];


  // Localized langauge strings
  // --------------------------
    var ordinals=[], weekdays=[], weekdays3=[], months=[], months3=[];
    ordinals['en']  = ["th","st","nd","rd","th","th","th","th","th","th"];
    ordinals['es']  = ["","","","","","","","","",""];
    weekdays3['en'] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays3['es'] = [ "Do",  "Lu",  "Ma",  "Mi",  "Ju",  "Vi",  "Sa"];
    weekdays['en']  = [
      "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
    ];
    weekdays['es']  = [
      "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
    ];
    months3['en']   = [
      "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    months3['es']   = [ 
      "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"
    ];
    months['en']    = [
      "January", "February", "March" ,"April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    months['es']    = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio", 
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];


  // Polyfills / shims
  // ------------------------------------

  // Date.now
  Date.valueOf = Date.now = Date.now || function() { return +new Date; };
  //developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
  if ( !Array.prototype.forEach ) {
    Array.prototype.forEach = function(fn, scope) {
      for(var i = 0, len = this.length; i < len; ++i)
        fn.call(scope, this[i], i, this);
    }//function
  }//if

  var logger = {
    debug: (
        "undefined"===typeof console || "undefined"===typeof console.log
        ? function(){} // IE
        : function(msg){if (debugging) return console.log(msg);} 
      )
  }//logger

  // CSS Selectors
  selector.stage = selector.stage || "#tamufeed";
  selector.propertyTemplate    = selector.propertyTemplate || "#propertyTemplate";
  selector.entryTemplate       = selector.entryTemplate    || "#entryTemplate";
  selector.feedTemplate        = selector.feedTemplate     || "#feedTemplate";
  selector.dateTemplate        = selector.dateTemplate     || "#dateTemplate";
  selector.encasedTemplate     = selector.encasedTemplate  || "#encasedTemplate";
  selector.dateBlockTemplate   = selector.dateBlockTemplate|| "#dateBlockTemplate";

  // Load Templates
  var dateTemplate    = $(selector.dateTemplate).html();
  var propertyTemplate= $(selector.propertyTemplate).html();
  var feedTemplate    = $(selector.feedTemplate).html();
  var entryTemplate   = $(selector.entryTemplate).html();
  var encasedTemplate = $(selector.encasedTemplate).html() || 
    '<table class="{{key}}"><tbody><tr><td class="{{key}}" {{dataAttr}}>{{value}}</td></tr></tbody></table>';
  var dateBlockTemplate = $(selector.dateBlockTemplate).html();

  // Fallback URL's
  if (!feeduri) feeduri = [
    "http://codemaroon.tamu.edu/feed.xml"
  ];


  // Template Function
  // -----------------
  var t = function(st,d) { // (string, dictionary)
  //Template function uses the dictionary to replace keys w/values in the string
    if ("string"!==typeof st) throw "t() 1st parameter must be a string; not "+typeof st;
    for (var key in d) st = st.replace(new RegExp('{{'+key+'}}', 'g'), d[key]);
    return st.replace(/({{[^{]*}})/ig,'');
  }//t


  // Date/Time Function
  // ------------------
  var dt = function(d) {
  //Returns an object that break down date parts, ala sprintf date format.
    if (!d.getMinutes) error("Invalid dt(parameter) was "+typeof d);
    var minutes = d.getMinutes();
    var hours = d.getHours();
    var ampm  = "a.m.";
    if (hours>=12) {hours-=12; ampm="p.m."; if (!hours) hours=12;}
    var jday= d.getDate();
    var ordin = ordinals[lang][jday%10];
    if (minutes<10) {minutes="0"+minutes;}
    var dday= (jday<10) ? "0"+jday : jday;
    var weekday = d.getDay();
    var Dday= weekdays3[lang][weekday];
    var lday= weekdays[lang][weekday];
    var month = d.getMonth();
    var Mmonth= months3[lang][month];
    var Fmonth= months[lang][month];
    month++;
    var mmonth = (month<=9) ? "0"+(month) : month;
    return {
       "w": weekday         //day of the week (0-6 for Sun-Sat)
      ,"S": ordin           //ordinal suffix for day, en=["st","nd","rd","th"]
      ,"j": jday            //day of the month (1-31)
      ,"d": dday            //day of the month (01-31) with leading zeros
      ,"D": Dday            //day of the month e.g. Mon or Tue
      ,"l": lday            //day of the month e.g. Monday or Tuesday
      ,"n": month           //month (1-12)
      ,"m": mmonth          //month (01-12)
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

  var escapeHTML = function (/* String */str) {
  //This function escapes special characters of meaning in an HTML string.
    if ("string"!==typeof str || !str) return '';
    var escapedHtmlChars = {
      '<': 'lt',
      '>': 'gt',
      '"': 'quot',
      "'": 'apos',
      '&': 'amp'
    }//escapedHtmlChars
    return str.replace(
      /[&<>"']/g, 
      function(ch) { return '&'+escapedHtmlChars[ch]+';'; }
    );
  }//function

  var xsshtml = function(str){
  //This function removes only dangerous XSS tags from an HTML string.
    if ("string"!==typeof str || !str) return '';
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

  var shuffle = function(a,b) {
    return !!(0.5 - Math.random());
  }//function

  var byPubDate = function(a,b) {
    a = "object"===typeof a.pubDate ? a.pubDate.getTime() : 0;
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
    //logger.logger.debug("» Property View: key="+key);
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


  var viewEntry = function(e,entry,quantity){
  //This function builds the view for an entry.
  /* Parameters: 
   *  e is the index # of this entry\
   *  entry is the object containing all modelled entry properties
   *  quantity is the feed's quantity of entries?
  /**/
    var day,timespan,dtstart,dtend,dateBlock;
    var attributes = ["odd ","even"][e%2];
    if (entry.type.indexOf("event")>=0) attributes += " vevent";
    else if (entry.type.indexOf("person")>=0) attributes += " vcard";
    if (entry.historical) attributes += " historical";

    //just too chatty?
    logger.debug("» viewEntry #"+(e+1)+" ("+entry.type+"), #images="+entry.images.length);

    //- images -----------------------------------
    $.each( entry.images, function( i, img ) {
      logger.debug("  img src="+img.src);
    });//each

    if (entry.dtstart) { //---------------------
      timespan = dtstart = viewProperty("dtstart",entry.dtstart,{"iso8601":entry.dtstartISO8601});
      if ("Invalid Date"===entry.start.toLocaleDateString()) 
        day = entry.publishedDate || entry.dstartISO8601;
      else 
        day = t(dateTemplate,dt(entry.start));
      dateBlock = t(dateBlockTemplate,dt(entry.start));
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
      ,"index"      : e+1
      ,"quantity"   : quantity
      ,"attributes" : attributes
      ,"dtstart"    : dtstart
      ,"dtend"      : dtend
      ,"date"       : day
      ,"dateBlock"  : viewProperty("dateBlock",dateBlock)
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
    logger.debug("» viewFeed #"+(f+1));
    var e=0, markup = '', novel=0;
    var feedAttributes = ["odd ","even"][f%2];
    feedAttributes += " "+feed[f]["type"];
    var quantity = feed[f]["quantity"];
    if (!quantity) {
      markup = '<p class="noentry">Nothing to report.</p>';
      feedAttributes += " empty";
    } else for (e; e < feed[f]["quantity"]; e++) {
      var ve = viewEntry(e,entries[f][e],feed[f]["quantity"]);
      if (ve.attributes.indexOf("historical")<1) novel++;
      if (novel>wantEntries) ve.attributes += " "+overWantedClass;
      markup += t(entryTemplate,ve);
    }//else for
    return {  
      "feedIndex"   : "feed"+(f+1)
      ,"attributes" : feedAttributes
      ,"index"      : f+1
      ,"feedQuantity": feed.quantity
      ,"quantity"   : quantity
      ,"entries"    : markup
      ,"feedUrl"    : feed[f]["feedUrl"]
      ,"title"      : feed[f]["title"]
      ,"author"     : feed[f]["author"]
      ,"description": feed[f]["description"]
    };
  }//function viewFeed


  var view = function() {
  //This function builds the view for all feeds, synchronously.
  //Pubsub: subscribes feed/html, publishes callername/html
    logger.debug("» View response");
    $(function() {      //document.ready
      $.each(feeduri, function(f,feeduri) { 
        putDOM(element.stage,t(feedTemplate,viewFeed(f)));
        element.stage.attr("data-tamufeed",VERSION);               //leave a mark
      });//each
    });//document.ready 
  }//function view


  var putDOM = function(/* Object */element, /* String */html, /* Boolean */overwrite) {
  //This function puts HTML into the DOM presuming document.ready
    logger.debug("» putDOM "+(!!overwrite ? "overwrite" : "append"));
    if (overwrite) element.html(html); //Clear the stage.
    else element.append(html);
  }//function view


  // Model Functions
  // ===============

  var modelEntry = function(f,e) {
  //This function models one entry.
    logger.debug("» modelEntry feed #"+(f+1)+" entry #"+(e+1));
    var entry = payload[f].feed.entries[e];
    var isoAttr;
    var r = {
      publishedDate: entry.publishedDate || 0
      ,title : escapeHTML(trunc(entry.title ))
      ,link  : escapeHTML(trunc(entry.link  ))
      ,author: escapeHTML(trunc(entry.author))
    }//$.extend(entries[feedIndex][e],feed.entries[e]); 
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
    //---------------IMAGES---------------
    r.images = [];
    $(r.description).find("img").each( function(i,img) {
      var invalid, ele=$(img);
      img = {};
      img.src   = encodeURI( ele.attr("src"   ) || "");
      if (img.src.indexOf("gravatar.com/avatar")>0) ele.addClass("photo gravatar");
      img.clas  = escapeHTML(ele.attr("class" )); //why = microformats
      img.style = escapeHTML(ele.attr("style" )); //escapeCSS, BUG! FIX TODO
      img.title = escapeHTML(ele.attr("title" ));
      img.alt   = escapeHTML(ele.attr("alt"   )) || img.title || img.clas || img.src;
      img.width = escapeHTML(ele.attr("width" ));
      img.height= escapeHTML(ele.attr("height"));
      //logger.debug('<img alt="'+img.alt+'" src="'+img.src+'"/>');
      invalid = img.src.indexOf("feedburner.com/~") > 0;
      if (invalid) logger.debug("[invalid] "+img.src); 
      else ;//r.images.push(img);
    });//each
    //^^^^^^^^^^^^^^^IMAGES^^^^^^^^^^^^^^^
    r.location = escapeHTML(trunc($(r.description).find(".location").text()));
    r.fn  = escapeHTML(trunc($(r.description).find(".fn").text()));
    r.type = "";
    if (r.location) {                             // ----- type Event -----
      //--- http://microformats.org/wiki/hcalendar
      r.type += "event ";
      r.historical = 
        r.start.getTime() < +Date.now() + millisecondsBeforeHistorical;
      r.summary = trunc($(r.description).find(".summary").text())
    } else if (r.fn) {                            // ----- type Person -----
      //--- http://microformats.org/wiki/hcard
      r.type += "person ";
      r.bday= escapeHTML(trunc($(r.description).find(".bday").text()));
      r.n   = xsshtml(trunc($(r.description).find(".n").text()));
      r.adr = xsshtml(trunc($(r.description).find(".adr").text()));
      r.note= escapeHTML(trunc($(r.description).find(".note").text()));
    } else {                                      // ----- type Story -----
      r.type += "story ";
      r.summary = xsshtml(trunc(entry.content));
    }//if type
    r.url = escapeHTML(trunc($(r.description).find(".url").text()));//person,event
    r.org = escapeHTML(trunc($(r.description).find(".org").text()));//person,event
    r.tel = escapeHTML(trunc($(r.description).find(".tel").text()));//person,event
    r.subtitle = escapeHTML(trunc($(r.description).find(".subtitle").text()));
    r.description = viewProperty("description",r.content); //css hides
    return r;
  }//function modelEntry


  var modelFeed = function(f){
  //This function builds the model for a feed.
    var quantity = payload[f].feed.entries.length;
    logger.debug("» modelFeed #"+(f+1)+" has "+quantity+" entries");
    var type=""; //initialize the feed's type
    var e=0;
    entries[f] = [];

    for (e; e < quantity; e++) {
      entries[f][e] = modelEntry(f,e);    //model entry
      type = entries[f][e].type;  //feed type is last entry's type
    }//for entries

    if ("shuffle"===sortorder) {        //---Shuffle Sort---
      entries[f].sort(shuffle);
      //////////
    } else if ("reverse"===sortorder) { //---Reverse Sort---
      if (type.indexOf("event")>=0)  entries[f].sort(byReversePubDate);
      else                          entries[f].sort(byPubDate);
      //////////
    } else {                            //---Forward Sort---
      if (type.indexOf("event")>=0)  entries[f].sort(byPubDate);
      else                          entries[f].sort(byReversePubDate);
      //////////
    }//if sort
    return {
      "feedUrl"     : escapeHTML(trunc(payload[f].feed.feedUrl))
      ,"title"      : escapeHTML(trunc(payload[f].feed.title))
      ,"author"     : escapeHTML(trunc(payload[f].feed.author))
      ,"description": escapeHTML(trunc(payload[f].feed.description))
      ,"type"       : type
      ,"quantity"   : quantity
    };
  }//function modelFeed


  // Controller Functions
  // ====================

  var controllerFeed = function(f) {
  //This function controls model of one feed; it is called by putFeed.
  //Pubsub: subscribe to "/feed/raw"
  //This function controls view of all feeds; it calls view.
  //Pubsub: subscribe to "/feed/json" publish "/feed/html"
    logger.debug("» controllerFeed #"+(f+1));
    if (payload[f].error) {
      logger.debug("- result.error "+payload[f].error.code+": "+payload[f].error.message);
      return putDOM(element.stage,
        t(feedTemplate,{
          "feedUrl" : "" 
          ,"entries": ""
          ,"feedIndex"  :  "error"+payload[f].error.code
          ,"title"      : "Error "+payload[f].error.code+": "+payload[f].error.message
          ,"description": "Error "+payload[f].error.code+": "+payload[f].error.message+" in feed #"+f
        })//t
      );//return error
    }//if result.error
    feed[f] = modelFeed(f);

    //Control view
    if (!--feed.countdown) {  //When the countdown hits zero,
      view();                 //pubsub publish "/feed/html"
      destroy();
    }//else if
  }//function controllerFeed


  var controller = function() {
  //This function controls tamufeed. Multifeed controller called by putAPI.
  //Pubsub: subscribe to "/request"
    if (feed.quantity) feed.countdown = feed.quantity;    //if deja vu, reset countdown
    else feed.quantity = feed.countdown = feeduri.length; //else init everything
    logger.debug("» controller of request - for "+feed.quantity+" feeds");
    //element.stage.attr("data-children",feed.quantity); //no no.
    putDOM(element.stage,"","overwrite");//clear the stage
    $.each(feeduri,function(f,feeduri){
      if ("undefined"!==typeof payload[f] && "undefined"!==typeof payload[f].error) 
        controllerFeed(f);  //if deja vu, skip
      else {                                            //else, load.
        var servfeed = new service.Feed(feeduri); //new google.feeds.Feed(feeduri);
        //servfeed.includeHistoricalEntries();//TEST
        servfeed.setNumEntries(fetchEntries);
        servfeed.load( //Call with Asynchronous Callback
          function(servresult){ putFeed(servresult,f);}
        );
      }//else
    });//each feed
  }//function controller


  // Network Service Handling Functions
  // ==================================

  var init = function(msg,data) {
  //This function initializes everything. 
  //Tightly coupled: calls the service loader.
    logger.debug("» init");
    if ("undefined"===typeof google) throw "FAIL! google.com/jsapi failed to load before tamufeed.js";
    // Bind element from selector
    element.stage = $(selector.stage);
    if ("undefined"!==typeof google.feeds)  //if already initialized,
      putAPI();                             //then call putAPI now.
    if (element.stage) 
      google.load("feeds","1",{"callback":putAPI,"nocss":true});
    else logger.debug("INFO: tamufeed.element.stage not found.");
  }//function init

  var destroy = function() {
  //This function is the opposite of init; it tears down everything built.
    logger.debug("» destroy");
    payload = [];
    element.stage = {};   //This is small
    //service = undefined;  //This is small
  }//function putAPI

  var putAPI = function() {
  //Callback of the service provider.
  //This function puts the service API object. Then calls controller.
    logger.debug("» putAPI");
    if ("undefined"===typeof google.feeds) {
      logger.debug("CRIT: google.feeds failed to initialize.");
      throw "google.feeds API failure";
    }//if undefined google.feeds
    service = google.feeds;
    //Pubsub: publish name+"/request" here:
    controller(); //instead of tightly coupled to controller.
  }//function putAPI

  var putFeed = function(servresult,f) {
  //Callback of the service feeds API.
  //This function puts the service result. Then calls the feed controller.
    logger.debug("» putFeed #"+(f+1));
    if ("undefined"===typeof servresult) {
      logger.debug("CRIT: google.feeds.load failed to return payload.");
      throw "google.feeds.load service failure.";
    }
    payload[f] = servresult;
    //Pubsub: publish name+"/feed/raw"
    controllerFeed(f); //instead of tightly coupled to controllerFeed.
  }//function putFeed


  //PubSub.subscribe('go', init);

  return {
    VERSION: VERSION
    ,init  : init
  }

/*****************************************************************************/
})(window,$,google); //IIFE


// Expose tamufeed as an AMD module. 
// A named AMD is safest & most robust way to register. 
// Do this after creating the global.
if ( typeof define === "function" && define.amd) {
  define( "tamufeed", ['jquery','google'], function ($, google) { return tamufeed; } );
};
