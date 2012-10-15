# TAMU.feed.js

Please email bug reports and enhancement requests, related to this client-side
JavaScript software, to monty@tamu.edu
Let me know how this software is helping you serve your customers.

## LICENSE

Read LICENSE.md for licensing information.
This software is Copyright (c) 2012, Texas A&M University.

## Description

This client-side software retrieves news feeds from Google, pulling out event
specific data from calendar.tamu.edu, and prints the information onto a stage.
The feed URL(s) are given in TAMU.feed.url, and the stage is the element
selected by the TAMU.feed.selector.stage string.

## Dependencies

1. Google Feed API will continue w/o incompatible changes until 4/20/15.
2. jQuery 1.x (a recent version)

## Options (in TAMU.feed object):

* "sort": "netspeed" puts the script in turbo, asynchronous mode: it will print feeds in the order that they speed across the net.
* "fetchEntries": number of entries to fetch from Google, for each feed
* "wantEntries" : number of non-historical entries wanted to show

## Developers

* Google Feeds API's result object structure is documented at this web page https://developers.google.com/feed/v1/jsondevguide#resultJson
* The Texas A&M University server-side calendar software is
[UNL Event Publisher](http://events.unl.edu/)
created by the University of Nebraska at Lincoln,
documented at
[Google Code](http://code.google.com/p/unl-event-publisher/).

## Bugs
- "All day" time of events are not handled correctly
- googfeed.setNumEntries() never fetches more than 10 entries per feed: why?

## Not yet implemented
- Categories as tags
- Localize time for the user agent's TZ
- timeTemplate is not yet utilized. Lets the dtstart & dtend strings pass right through presuming the server formatted them correctly.

## INTEGRATION

To integrate this software onto your web page, you'll need to include three
things in your markup--in addition to this script, of course.

1. The settings script block, which specifies your element selector & feed,
2. The prerequisite jQuery & Google JS API script tags,
3. The text/html script elements which are the output templates.

Here is an example of #1:

    <script charset="utf-8">
        //Settings
        if ("undefined"===typeof TAMU) TAMU = {};
        TAMU.feed = {
            "selector": "#tamufeeds"
            ,"url" : [
               "http://calendar.tamu.edu/liberalarts/upcoming/?format=rss&limit=4"
              ,"http://calendar.tamu.edu/philosophy/upcoming/?format=rss&limit=4"
              ,"http://calendar.tamu.edu/communication/upcoming/?format=rss&limit=4"
              ,"http://calendar.tamu.edu/anthropology/upcoming/?format=rss&limit=4"
              ,"http://calendar.tamu.edu/internationalstudies/upcoming/?format=rss&limit=4"
              ,"http://calendar.tamu.edu/tamu/upcoming/?format=rss&limit=4"
            ]
        }//TAMU.feed
    </script>

Here is an example of #2:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi"></script>

And for #3, the templates can be copied verbatim out of the markup.html sample.

## MARKUP

The one change you must make to your HTML is to have an element where you want
the app to insert its content e.g. <div id="tamufeeds"></div>

## STYLING

Now, you'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the styles.css, if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

## SERVER ADMINISTRATION

Ensure that your HTTP service is sending out the X-UA-Compatible: IE=edge 
HTTP header which tells Microsoft Internet Explorer to behave like its latest
version. Otherwise IE will most likely pretend it is an earlier version of 
itself--which will cause problems. Just putting the HTTP-EQUIV in the HTML is
not sufficient to guarantee edge status. Here is the 2-line index.php source 
code used by the sample:

    <?php header('X-UA-Compatible: IE=edge,chrome=1');
    require('markup.html');

## TAMU USERS SUPPORT

Texas A&M Calendar information can be found online on the
[Texas A&M Calendar Help Page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster's Blog](http://webmaster.tamu.edu/category/calendar/),
through the [Texas A&M Calendar Announcement email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the [Texas A&M Calendar Team](calendar@tamu.edu).
