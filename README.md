# TAMU.feed.js

Please let me know how this software helps you? monty@tamu.edu

## License

See LICENSE.md for licensing information.
This software is Copyright (c) 2012, Texas A&M University.

## Description

This browser-side software retrieves news feeds from Google, recognizing and
using [hCalendar](http://microformats.org/wiki/hcalendar) tagged elements
in entry content (if found), and then prints the information into a stage 
element on the page.

## Dependencies

1. Google Feed API will continue w/o incompatible changes until 4/20/15.
2. jQuery 1.x (a recent version)

## Configuration

These parameters are set in the `TAMU.feed` object.

* `url` has the feed address(es)
* `selector.stage` locates the stage element
* `sort: "netspeed"` puts the script in turbo, asynchronous mode: it will print feeds in the order that they speed across the net.
* `fetchEntries:` number of entries to fetch from Google, for each feed
* `wantEntries:` number of (non-historical events or) entries wanted to show

## Developers

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/

## Bugs
- "All day" time of events are not handled correctly
- googfeed.setNumEntries() never fetches more than 10 entries per feed: why?

## Not yet implemented
- Categories as tags on entries
- Localize time for the user agent's TimeZone.
- Event dtstart & dtend strings are allowed to pass through presuming correct formatting, so timeTemplate is not utilized.

## Integration How To 

To integrate this software onto a web page, you basically need to three things
in your HTML.

1. The settings script block, which specifies your element selector & feed.
2. The prerequisite jQuery & Google JS API script tags, and this script.
3. The text/html script elements which are the output templates.

Here is an example of #1:

    <script charset="utf-8">
        //Settings
        if ("undefined"===typeof TAMU) TAMU = {};
        TAMU.feed = {
            "selector": "#tamufeeds"
            ,"fetchEntries": 10
            ,"wantEntries" :  6
            ,"url" : [
               "http://calendar.tamu.edu/liberalarts/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/philosophy/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/communication/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/anthropology/upcoming/?format=rss"
            ]
        }//TAMU.feed
    </script>

Here is an example of #2:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi"></script>
    <script src="/path/on/your/server/to/TAMU.feed.js" charset="utf-8"></script>

For #3, the templates can be copied verbatim out of the markup.html sample.

## Markup

The one change you must make to your HTML is to have an element where you want
the app to insert its content e.g.

    <div id="tamufeeds"></div>

## Styling

Now, you'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the styles.css, if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

## Web Server Administration

Ensure that your HTTP service is sending out the X-UA-Compatible: IE=edge 
HTTP header which tells Microsoft Internet Explorer to behave like its latest
version. Otherwise IE will most likely pretend it is an earlier version of 
itself--which will cause problems. Just putting the HTTP-EQUIV in the HTML is
not sufficient to guarantee edge status. Here is a 2-line index.php shim that
can be used until you configure your HTTP server response headers:

    <?php header('X-UA-Compatible: IE=edge,chrome=1');
    require('markup.html');

## TAMU Users Support

Information on the Texas A&M's calendar can be found online on its
[help page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster blog](http://webmaster.tamu.edu/category/calendar/),
through the [email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the Texas A&M Calendar Team [directly](calendar@tamu.edu).
