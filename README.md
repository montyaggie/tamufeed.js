# tamufeed.js

This browser-side software is optimized for showing calendar.tamu.edu
feeds. It initializes service API connection when the DOM is ready, 
and immediately pulls, models & sorts feeds, putting its view into 
one element on the page.

Welcome to this github open source repo; we're glad you're here.
Follow to receive news of changes or star to express your interest?

We support your participation in the source code
and your issues (asking questions, reporting bugs, etc) are welcomed.

## Live Demo

* [synchronous demo](http://cllacdn.tamu.edu/calendar/sync.php)
* [asynchronous demo](http://cllacdn.tamu.edu/calendar/)
* [experimental kiosk demo](http://cllacdn.tamu.edu/calendar/kiosk.php)

## License

This code is licensed under a
[BSD 2-clause license](http://opensource.org/licenses/BSD-2-Clause);
please read LICENSE.md for the details.
This software is Copyright © 2012, Texas A&M University.

## Event Entry Modelling

We retrieve news feeds from Google, recognizing and using
[hCalendar](http://microformats.org/wiki/hcalendar) tagged elements
in any feed entry's content, if found.

## Dependencies

1. [Google Feed API](https://developers.google.com/feed/) will continue w/o incompatible changes until 4/20 in 2015.
2. [jQuery](http://jquery.com/) or [zepto.js](http://zeptoJS.com/).

## Configuration

These parameters are set in the `tamufeed` object.

* `url` feed address
* `selector` the CSS selector that locates your stage element uniquely
* `sort` sorts entries
    * `"forward"` sorts events ascending and non-events descending
    * `"reverse"` sorts events descending and non-events ascending time
* `fetchEntries` number of entries to fetch from the service provider for each feed. For calendar feeds, this should be high enough to still have enough events to display after the historical events are set to `display:none`.
* `wantEntries` number of entries you want to show. After this number of entries is exceeded (not counting any historical events), the CSS class `over` is put onto subsequent entries, enabling CSS to `display:none` them.
* `truncatedStringMaxLength` sets number of characters (default 300)
* `minutesBeforeHistorical` sets slack once dtstart has elapsed before event is labelled historical (default 30)
* `debugging` turns on the F12 console debug messages

## Developers

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/wiki/UNL_UCBCN_Frontend

## Integration

### Synchronously loading

To integrate this software onto a web page (the old fashioned, synchronous way), you basically need to three things in your HTML.

1. The configuration script block, which configures parameters like your feed's address. Put it in the &lt;HEAD&gt; of the document.
2. The prerequisite jQuery & Google JS API script tags, and this script. Put them in the same sequence near the closing &lt;/BODY&gt; tag at the bottom.
3. The text/html script elements, which are the output templates for this script. Put them anywhere *before* this script.

Here is an example of #1:

    <script charset="utf-8">
        //Configuration
        tamufeed = {
            "selector": "#tamufeed"
            ,"fetchEntries": 10
            ,"wantEntries" :  8
            ,"url": [
              "http://calendar.tamu.edu/anthropology/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/anthropologydeadlines/upcoming/?format=rss"
            ]
        }//tamufeed
    </script>

Here is an example of #2:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi"></script>
    <script src="/path/on/your/server/to/tamufeed.js" charset="utf-8"></script>

For #3, the templates can be copied verbatim out of the synchronous.html sample.

### Asynchronously loading

Async JS loading reduces page load time, because it lets scripts load simultaneously, instead of in blocking, queued way. This boosts web performance.
(Why care?
[@souders](http://twitter.com/souders),
[video](http://radar.oreilly.com/2012/04/velocity-podcast-series-p1.html),
[blog](http://www.stevesouders.com/blog/2010/05/07/wpo-web-performance-optimization/).)

See `async.html` for the demo using [require.js](http://requirejs.org/)
integration. [Here's](http://css-tricks.com/thinking-async/)
[why](http://requirejs.org/docs/why.html) async is best practice.

## Markup

One thing you must add to your HTML somewhere is the stage element where you
want tamufeed to insert its output into, e.g. `<div id="tamufeed"></div>`.

## Styling

You'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the styles.css, if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

### IMPORTANT

Please  remove all references to any resources hosted on our
[cllacdn](http://cllacdn.tamu.edu/html/home.html) server
before deploying your implementation.
Thanks for using *your own web server* for hosting your copy of social media 
icons, library JavaScript, et cetera.

## Web Server Administration

Ensure that your HTTP service is sending out the X-UA-Compatible: IE=edge 
HTTP header which tells Microsoft Internet Explorer to behave like its latest
version. Otherwise IE will most likely pretend it is an earlier version of 
itself--which could cause problems. Just putting the HTTP-EQUIV in the HTML is
not sufficient to guarantee edge status. Here is a 2-line index.php shim that
can be used until you configure your HTTP server response headers:

    <?php header('X-UA-Compatible: IE=edge,chrome=1');
    require('synchronous.html');

## TAMU Users Support

Information on the Texas A&M's calendar can be found online on its
[help page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster blog](http://webmaster.tamu.edu/category/calendar/),
through the [email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the Texas A&M Calendar Team [directly](calendar@tamu.edu).
