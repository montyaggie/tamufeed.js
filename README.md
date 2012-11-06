This browser-side software is for showing feeds from calendar.tamu.edu.

It initializes service connection when the document object model
is ready and pulls, models, sorts, and shows feeds in 1 element.

# Event Type Feeds 

We retrieve news feeds from Google, recognizing and using
[hCalendar](http://microformats.org/wiki/hcalendar) tagged elements
in a feed entry's `content` if found.

# Live Demo

* [asynchronous demo](http://cllacdn.tamu.edu/calendar/)
* [experimental kiosk demo](http://cllacdn.tamu.edu/calendar/kiosk.php)

# License

This code is licensed under a
[BSD 2-clause license](http://opensource.org/licenses/BSD-2-Clause);
please read LICENSE.txt for the details.
This software is Copyright © 2012, Texas A&M University.

# Dependencies

1. [Require.js](http://requirejs.org/) asynchronous JavaScript loader
2. [Google Feed API](https://developers.google.com/feed/) will continue w/o incompatible changes until 4/20 in 2015
3. [jQuery](http://jquery.com/) or [zepto.js](http://zeptoJS.com/)
4. Optional: [Normalize.css](http://necolas.github.com/normalize.css/) is the new reset.css
5. Optional: [Underscore.js](http://underscorejs.org/) utility-belt library

If you want to retrieve more than ten entries per feed, 
[obtain a Google API key](https://developers.google.com/maps/documentation/javascript/tutorial#api_key)
and pass it as the `key=` URL parameter when you load the `www.google.com/jsapi` script.

# Configuration

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

# Integration (the asynchronous way)

Async JS loading reduces page load time, because it lets scripts load 
simultaneously, instead of in blocking, queued way. This boosts web performance.
[Here's](http://css-tricks.com/thinking-async/)
[why](http://requirejs.org/docs/why.html) async is best practice
(c.f.
[@souders](http://twitter.com/souders),
[video](http://radar.oreilly.com/2012/04/velocity-podcast-series-p1.html),
[blog](http://www.stevesouders.com/blog/2010/05/07/wpo-web-performance-optimization/)).

View `async.html` source for the demo
using [require.js](http://requirejs.org/) integration.

# Markup

One thing you must add to your HTML somewhere is the stage element where you
want tamufeed to insert its output into, e.g. `<div id="tamufeed"></div>`.

# Style

You'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the styles.css, if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

# Develop

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/wiki/UNL_UCBCN_Frontend

# Aggies

Information on the Texas A&M's calendar can be found online on its
[help page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster blog](http://webmaster.tamu.edu/category/calendar/),
through the [email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the Texas A&M Calendar Team [directly](calendar@tamu.edu).

Gig 'em.
