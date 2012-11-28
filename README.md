# tamufeed.js

The versatile 
[JavaScript](https://developer.mozilla.org/en-US/docs/JavaScript)
[library](http://en.wikipedia.org/wiki/JavaScript_library)
for printing
[feeds](http://en.wikipedia.org/wiki/Web_feed)
on your web page

## What's it good for?

This is the easiest JavaScript app for adding any RSS or Atom news feed
to your web page. 
And it can be used for displaying event feeds like Texas A&M calendars.
It's flexible enough to customize its design as you like it, so
the form and appearance are your purview.

## Getting Started

To download, click on [tags](/montyaggie/tamufeed.js/tags)
and grab the latest zip e.g.
[0.1.5](/montyaggie/tamufeed.js/archive/0.1.5.zip).
For your first run, we recommend turning on debugging and watching the
F12 console in your browser. (You can turn it off again when you're 
ready to deploy your work.)

## Check it out

* [Live demo](http://cllacdn.tamu.edu/calendar/)

## License

Copyright © 2012, Texas A&M University.

This is [open source](http://www.opensource.org/docs/osd) 
and [free software](http://www.gnu.org/philosophy/free-sw.html),
which means that it is not only available for download free of charge, 
but you have access to the source code and may modify and redistribute 
our software subject to certain restrictions;
for details, read the `LICENSE.txt`.

## Files

These are the files included in this distribution
that you must have to get started:

* `tamufeed.js` is the actual JS library
* `synchronous.html` or `async.html` is demo's HTML
    * and `main.js` if you're going async
* `styles.css` is the demo's CSS

## Dependencies

### Hard Dependencies

1. [Google Feed API](https://developers.google.com/feed/) will continue w/o incompatible changes until 4/20 of 2015
2. [jQuery](http://jquery.com/) or [zepto.js](http://zeptoJS.com/)
3. [pubsub.js](https://github.com/mroderick/PubSubJS/blob/master/src/pubsub.js) by Morgan Roderick

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
Then it pulls feeds, models data, sorts entries, and
prints a view into the stage element on the page.

## Feed types

We retrieve news feeds from Google, recognizing
[microformats](http://microformats.org/), such as calendar items,
in every entry's `content`.

## How to use

There are two ways to integrate tamufeed.js into your web page or CMS theme.

1. Easy (synchronous)
2. High Performance (asynchronous)

If you're integrating it into a very simple or static web page, the easy 
option is great for you.  And, if your CMS does does not yet have
support for asynchronous script loading (like Drupal), or does not really take
advantage of the high performance of an asynchronous loader (like WordPress),
take the easy road.  But, if your web applications use some
client-side logic, you'll benefit from the high performance path.

### Easy Integration

To integrate this JS library onto a web page (the old synchronous way), 
you basically need to add four things in your HTML.
Let the demo `synchronous.html` be your guide.

1. The configuration script block, which configures parameters like your feed's address. Put it in the `<HEAD>` of the document.
2. The text/html script elements, which are the output templates for this script. You can put them almost anywhere.
3. The prerequisite jQuery & Google.com/jsapi script tags and then tamufeed.js. Put them in the same sequence near the closing &lt;/BODY&gt; tag at the bottom (but above #4).
4. And finally, copy the bottom-most inline script block in the demo's HTML
to the bottom of your HTML (immediately following the tags from #3).

Following is an example of #1. Note: if you set `"debugging": true` while you're
integrating, that's ok just be sure to turn it off before you go live.

    <script>
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

For #2, the templates can be copied verbatim out of the `synchronous.html` sample.
Make sure they're above the things in the next two steps.

Here is an example of #3:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="https://www.google.com/jsapi?key=YOUR_GOOGLE_API_KEY_HERE"></script>
    <script src="/path/on/your/server/to/pubsub.js" charset="utf-8"></script>
    <script src="/path/on/your/server/to/tamufeed.js" charset="utf-8"></script>

For #4, make sure that you copy the bottom-most `<script>` block to the bottom
of your own HTML's body. It has four lines. Three lines test that global exports
of scripts which should be loaded exist, and the last line tells tamufeed to
initialize when [document.ready](http://api.jquery.com/ready/) happens.
It looks like this:

    <script>
    if ("undefined"===typeof $) alert("jQuery was not loaded.");
    if ("undefined"===typeof google) alert("Google JS API was not loaded.");
    if ("undefined"===typeof tamufeed) alert("tamufeed.js was not loaded.");
    else tamufeed.init();
    </script>

When you've got things running, remove your reliance on the files, styles &
graphics hosted on *our* demo [server](http://cllacdn.tamu.edu/html/home.html).
**Do not use our bandwidth.** Thanks for using your own web server for hosting 
your copy of social media icons, JavaScripts, et cetera.

### High Performance integration

Loading JavaScript libraries asynchronously speeds your page load performance
because it lets scripts load in parallel (instead of serially).
Is async the best practice for high performance?

* Per css-tricks: [blog](http://css-tricks.com/thinking-async/)
* Per [@souders](http://twitter.com/souders): [video](http://radar.oreilly.com/2012/04/velocity-podcast-series-p1.html), [blog](http://www.stevesouders.com/blog/2010/05/07/wpo-web-performance-optimization/)

If you're unfamiliar with asynchronous loaders, you should definitely educate
yourself first. Read the basics of [require.js](http://requirejs.org/),
et. al. Then learn by example: we provide a straight forward, working demo
for you to kick the tires and learn from.  Our `async.html` demo is intuitive,
and easy to follow once you understand at little about
[AMD](http://requirejs.org/docs/why.html).

## Markup

One thing you must add to your HTML somewhere is the stage element where you
want tamufeed to insert its output into, e.g. `<div id="tamufeed"></div>`.

## Configuration

These parameters are set in the `tamufeed` object
in the `<HEAD>` of the HTML document
(use [JSON](http://www.json.org/) format).

* `url` feed address; this can be one string for your RSS. Or an array of strings, for several.
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

## Templates

The software allows the integrator to customize the HTML output via templates
that you host in your HTML. You need to provide these templates (as demonstrated
in the example):

* `feedTemplate` governs what feeds will be marked up with
* `entryTemplate` controls the display of entries (of all types)
* `dateTemplate` formats how the date part of `{{time}}` should look
* `propertyTemplate` is how individual properties will be marked up
* `encasedTemplate` is used to encase any HTML value that could possibly be malformed
* `dateBlockTemplate` decides how `{{dateBlock}}` comes out

### Template Variables

Their variables, where the script injects its content,
are always delimited by mustache/handlebar characters like this: 
`{{LookMaImaVariable}}`. Note that they are case sensitive
(capitalization does matter, and must always match precisely).
The meaning of the variables should be fairly intuitive when you see
how they're used in demo.

### feedTemplate variables

    {{feedIndex}}    is the feed# in the count for use in class attribute
    {{attributes}}   is the attributes of the feed, such as its type and even/odd
    {{index}}        is the number of this feed in the count
    {{feedQuantity}} is the sum of feeds counted
    {{quantity}}     is the count of entries this feed contains
    {{entries}}      is the entryTemplate filled in
    {{feedUrl}}      is the URL of this feed
    {{title}}        is the feed's title
    {{author}}       is the author of the feed i.e. its curator's name, if any
    {{description}}  is the description of the feed

### entryTemplate variables

    {{title}}       is the title of the story or event
    {{link}}        is the hyperlink URL for the full story/details
    {{linkencoded}} is the same hyperlink but encoded for use as a URL parameter
    {{description}} is the entry description
    {{index}}       is the sequential number of the entry in the count
    {{quantity}}    is the sum of entries counted
    {{attributes}}  is attributes of the entry for use in an HTML class attribute, e.g. even or odd
    {{pubDate}}     is the published date of the entry
    {{author}}      is the author of the story
    {{dtstart}}     is the starting time of the event (all events have one)
    {{dtend}}       is the ending time of the event (may be blank)
    {{date}}        is the day of the event
    {{dateBlock}}   is the dateBlock template, filled in
    {{time}}        is the whole time (date, dtstart, dtend) of the event
    {{subtitle}}    is the subtitle of the story or event
    {{summary}}     is the summary of the story or event
    {{location}}    is the location of the event

### dateTemplate Variables

The single-letter variables used with dates is an incomplete subset of
[function.date.php](http://www.php.net/manual/en/function.date.php).
If you encounter one that you would like to use that isn't yet implemented,
[just create an issue](/montyaggie/tamufeed.js/issues/new) and we'll add it.
These work should be working fine:

    {{w}} is day of the week (0-6 for Sun-Sat)
    {{S}} is English ordinal suffix for day ["st","nd","rd","th"]
    {{j}} is day of the month (1-31)
    {{d}} is day of the month (01-31) with leading zeros
    {{D}} is day of the month e.g. Mon or Tue
    {{l}} is day of the month e.g. Monday or Tuesday
    {{n}} is month (1-12)
    {{m}} is month (01-12)
    {{M}} is month, short textual representation, three letters
    {{F}} is month, full textual representation e.g. January
    {{Y}} is year (4 digits for 4-digit years) 
    {{i}} is minutes (00-59) with leading zeros
    {{g}} is hour (0-12)
    {{a}} is am or pm
    {{U}} is seconds since the Unix Epoch (1970 January 1st)

## Style

You'll want to write some CSS styles to govern the appearance of your
feed on your page. Feel free to copy liberally from the `styles.css` if they
help you.  Firebug or Safari or Chrome's F12 developer tools are quite helpful,
for introspecting the HTML and trying out styles that you can then put into
your own CSS.

## Naming things

When assigning class names on markup elements, 
we conform to these standards.

* For Events, [hCalendar](http://microformats.org/wiki/hcalendar).
* For Persons, [hCard](http://microformats.org/wiki/hcard).
* For Stories, [hAtom](http://microformats.org/wiki/hatom) or [RSS](http://cyber.law.harvard.edu/rss/rss.html).

## For Programmers

* [Google Feeds API's result object structure](https://developers.google.com/feed/v1/jsondevguide#resultJson)
* The Texas A&M University's calendar software on the server side is
[UNL Event Publisher](http://events.unl.edu/) documented at
http://code.google.com/p/unl-event-publisher/wiki/UNL_UCBCN_Frontend
* Recommended naming conventions for
    * [Events](http://schema.org/Event): [hCalendar](http://microformats.org/wiki/hcalendar)
    * [Persons](http://schema.org/Person): [hCard](http://microformats.org/wiki/hcard)
    * [Stories](http://schema.org/Article): [Atom syndication format = RFC4287](http://tools.ietf.org/html/rfc4287)
    * [Books](http://schema.org/Book)
    * [Apps](http://schema.org/SoftwareApplication)
    * [Schools](http://schema.org/EducationalOrganization)

## About Texas A&M University

[Texas A&M University](http://www.tamu.edu/about/)
is dedicated to the discovery, development, communication,
and application of knowledge in a wide range of academic and professional
fields. Its mission of providing the highest quality undergraduate
and graduate programs is inseparable from its mission of developing new
understandings through research and creativity. It prepares students
to assume roles in leadership, responsibility, and service to society.
Texas A&M assumes as its historic trust the maintenance of freedom of inquiry
and an intellectual environment nurturing the human mind and spirit.
It welcomes and seeks to serve persons of all racial, ethnic, and
geographic groups, women and men alike, as it addresses the needs of an
increasingly diverse population and a global economy. In the twenty-first
century, Texas A&M University seeks to assume a place of preeminence among
public universities while respecting its history and traditions.

Information on the Texas A&M's [calendar](http://calendar.tamu.edu/)
can be found online on its
[help page](http://marcomm.tamu.edu/web/calendar/help.html),
on the [Texas A&M Webmaster blog](http://webmaster.tamu.edu/category/calendar/),
through the [email list](http://marcomm.tamu.edu/web/calendar/documentation.html#listserv),
or by contacting the Texas A&M Calendar Team [directly](calendar@tamu.edu).
