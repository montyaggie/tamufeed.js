# tamufeed.js

Welcome to this github open source repo; we're glad you're here.
Follow to receive news of changes or star to express your interest.

We support your participation in the source code and
your issues asking questions are welcomed.

* [synchronous demo](http://cllacdn.tamu.edu/calendar/sync.php)
* [asynchronous demo](http://cllacdn.tamu.edu/calendar/)
* [experimental kiosk demo](http://cllacdn.tamu.edu/calendar/kiosk.php)

## License

This code is licensed under a
[BSD 2-clause license](http://opensource.org/licenses/BSD-2-Clause);
please read LICENSE.md for the details.
This software is Copyright © 2012, Texas A&M University.

## Description

This browser-side software retrieves news feeds from Google, recognizing and
using [hCalendar](http://microformats.org/wiki/hcalendar) tagged elements
in any feed entry's content, if found: and then outputs the information into a stage element on the page.

## Dependencies

1. Google Feed API will continue w/o incompatible changes until 4/20 in 2015.
2. [jQuery](http://jquery.com/) or [zepto.js](http://zeptoJS.com/).

## Configuration

These parameters are set in the `tamufeed` object.

* `url` has the feed address(es)
* `selector.stage` locates the stage element
* `sort` sorts entries
    * `"forward"` sorts events ascending and non-events descending
    * `"reverse"` sorts events descending and non-events ascending time
* `async: true` puts the script in asynchronous mode for printing feeds
* `fetchEntries` number of entries to fetch from Google, for each feed
* `wantEntries` number of (non-historical events or) entries wanted to show
* `truncatedStringMaxLength` sets number of characters (default 300)
* `minutesBeforeHistorical` sets slack once dtstart has elapsed before event is labelled historical (default 30)
* `debugging` turns on the F12 console debug messages

## Developers

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/

## Integration

### Synchronously loading

To integrate this software onto a web page, you basically need to three things
in your HTML.

1. The configuration script block, which configures your element selector & feed.
2. The prerequisite jQuery & Google JS API script tags, and this script.
3. The text/html script elements which are the output templates.

Here is an example of #1:

    <script charset="utf-8">
        //Configuration
        tamufeed = {
            "selector": "#tamufeed"
            ,"fetchEntries": 10
            ,"wantEntries" :  8
            ,"url" : [
              "http://calendar.tamu.edu/anthropology/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/anthropologydeadlines/upcoming/?format=rss"
            ]
        }//tamufeed
    </script>

Here is an example of #2:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi"></script>
    <script src="/path/on/your/server/to/tamufeed.js" charset="utf-8"></script>

For #3, the templates can be copied verbatim out of the markup.html sample.

### Asynchronously loading

See file `amd.html` for a [require.js](http://requirejs.org/) way.

## Markup

The one thing you must add to your HTML is the element where you want tamufeed
to insert its content into, e.g. `<div id="tamufeed"></div>`.

## Styling

You'll want to write some CSS styles to govern the appearance of your
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
