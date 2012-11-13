# tamufeed.js

This browser-side software is for showing feeds from `calendar.tamu.edu` et. al.

## Getting Started

For your first use, click on [tags](/montyaggie/tamufeed.js/tags)
and download the latest version e.g.
[0.1.2](/montyaggie/tamufeed.js/archive/0.1.3.zip).
For your first run, we recommend turning on debugging and watching the
F12 console in your browser.

## Live Demo

* [demo](http://cllacdn.tamu.edu/calendar/)

## License

This software is Copyright © 2012, Texas A&M University.
Licensed under a
[BSD 2-clause](http://opensource.org/licenses/BSD-2-Clause) license:
see LICENSE.txt for the details.

## Files

These are the included files that you must have to get started:

* `tamufeed.js` is the program's code
* `synchronous.html` or `async.html` is HTML
    * and `main.js` if you're going async
* `styles.css` is the CSS

## Dependencies

### Hard Dependencies

1. [Google Feed API](https://developers.google.com/feed/) will continue w/o incompatible changes until 4/20 in 2015
2. [jQuery](http://jquery.com/) or [zepto.js](http://zeptoJS.com/)

### Optional Dependencies

* [Normalize.css](http://necolas.github.com/normalize.css/) is the new reset.css
* [Require.js](http://requirejs.org/) if you want asynchronous JavaScript loading
* [Underscore.js](http://underscorejs.org/) utility-belt library

If you want to retrieve more than ten entries per feed, 
[obtain a Google API key](https://developers.google.com/maps/documentation/javascript/tutorial#api_key)
and pass it as the `key=` URL parameter when you load the `www.google.com/jsapi` script.

## How it works

tamufeed.js works by initializing service connection,
when the document object model is ready.
Then it pulls feeds, models data, sorts entries &
puts a view into the stage element on the page.

## Feed Types

We retrieve news feeds from Google, recognizing
[microformats](http://microformats.org/)
in a feed entry's `content` if found.

## Configuration

These parameters are set in the `tamufeed` object.

* `url` feed address
* `selector` the CSS selector that locates your stage element uniquely
* `sort` sorts entries
    * `"forward"` sorts entries descending, but events ascending
    * `"reverse"` sorts entries ascending time, but events descending
    * `"shuffle"` sorts entries randomly
* `fetchEntries` number of entries to fetch from the service provider for each feed. For calendar feeds, this should be high enough to still have enough events to display after the historical events are set to `display:none`.
* `wantEntries` number of entries you want to show. After this number of entries is exceeded (not counting any historical events), the CSS class `over` is put onto subsequent entries, enabling CSS to `display:none` them.
* `truncatedStringMaxLength` sets number of characters (default 300)
* `minutesBeforeHistorical` sets slack once dtstart has elapsed before event is labelled historical (default 30)
* `debugging` turns on the F12 console debug messages

## Synchronous Integration

To integrate this software onto a web page (the old synchronous way), 
you basically need to add four things in your HTML.
Let the demo `synchronous.html` be your guide!

1. The configuration script block, which configures parameters like your feed's address. Put it in the &lt;HEAD&gt; of the document.
2. The prerequisite jQuery & Google JS API script tags, and this script. Put them in the same sequence near the closing &lt;/BODY&gt; tag at the bottom.
3. The text/html script elements, which are the output templates for this script. Put them anywhere *before* this script.
4. And finally, copy the bottom-most inline script block in the demo's HTML
to the bottom of your HTML.

Here is an example of #1:

    <script charset="utf-8">
        //Configuration
        tamufeed = {
            "selector": "#tamufeed"
            ,"fetchEntries": 10
            ,"url": [
              "http://calendar.tamu.edu/anthropology/upcoming/?format=rss"
              ,"http://calendar.tamu.edu/anthropologydeadlines/upcoming/?format=rss"
            ]
        }//tamufeed
    </script>

Here is an example of #2:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi?key=YOUR_GOOGLE_API_KEY_HERE"></script>
    <script src="/path/on/your/server/to/tamufeed.js" charset="utf-8"></script>

For #3, the templates can be copied verbatim out of the synchronous.html sample.

When you've got things at full function, 
remove your reliance on the scripts, styles or graphics hosted on *our* demo
[server](http://cllacdn.tamu.edu/html/home.html). Do not use our bandwidth;
thanks for using **your own web server** for hosting your copy of social media 
icons, JavaScript, etc.

For #4, make sure that you copy the bottom most `<script>` block to the bottom
of your own HTML. You'll see conditionals there that test that you got the 
dependencies and script loaded; you can leave those in without any material
performance hit. Or you can remove them after your successful integration.

## Asynchronous script option

Async JS loading reduces page load time, because it lets scripts load 
in parallel (instead of serially); this boosts web performance.
[Here's](http://css-tricks.com/thinking-async/)
[why](http://requirejs.org/docs/why.html) async *is* best practice
(c.f.
[@souders](http://twitter.com/souders),
[video](http://radar.oreilly.com/2012/04/velocity-podcast-series-p1.html),
[blog](http://www.stevesouders.com/blog/2010/05/07/wpo-web-performance-optimization/)).
If you're unfamiliar with asynchronous loaders, you should 
read the basics of
[using require.js](http://requirejs.org/).

The `async.html` example is intuitive, and easy to follow: once you understand
using an asynchronous script loader.

## Markup

One thing you must add to your HTML somewhere is the stage element where you
want tamufeed to insert its output into, e.g. `<div id="tamufeed"></div>`.

## Templates

We the integrator to customize the HTML output via templates, that you
host in your markup. Their variables, where the script injects its content,
are always delimited by mustache/handlebar characters like this: 
`{{LookMaImaVariable}}`.
The meaning of the variables should be fairly intuitive, 
from how they are used by the demo.

* `feedTemplate` governs what feeds will be marked up with
* `entryTemplate` controls the display of entries (of all types)
* `dateTemplate` formats how the date part of `{{time}}` should look
* `propertyTemplate` is how individual properties will be marked up
* `encasedTemplate` is used to encase any HTML value that could possibly be malformed
* `dateBlockTemplate` decides how `{{dateBlock}}` comes out

### Template Date Variables

The single-letter variables used with dates is an incomplete subset of
[function.date.php](http://www.php.net/manual/en/function.date.php).
If you encounter one that you would like to use that isn't yet implemented,
[just create an issue](/montyaggie/tamufeed.js/issues/new) and we'll add it.

## Style

You'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the styles.css, if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

## Schema & Microformats

### For Designers

When assigning class names on markup elements, we conform to these.

* Events, [hCalendar](http://microformats.org/wiki/hcalendar
* Persons, [hCard](http://microformats.org/wiki/hcard
* Stories, [Atom syndication format RFC4287](http://tools.ietf.org/html/rfc4287

### For Programmers

Recommended naming conventions for types of entries

* Events
   * [hCalendar](http://microformats.org/wiki/hcalendar
   * http://schema.org/Event
* Persons
    * [hCard](http://microformats.org/wiki/hcard
    * http://schema.org/Person
* Stories
    * [Atom syndication format RFC4287](http://tools.ietf.org/html/rfc4287
    * http://schema.org/Article
* Books
    * http://schema.org/Book
* Apps
    * http://schema.org/SoftwareApplication
* Schools
    * http://schema.org/EducationalOrganization

## Developer Links

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/wiki/UNL_UCBCN_Frontend

## TAMU Support

Information on the Texas A&M's calendar can be found online on its
[help page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster blog](http://webmaster.tamu.edu/category/calendar/),
through the [email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the Texas A&M Calendar Team [directly](calendar@tamu.edu).
