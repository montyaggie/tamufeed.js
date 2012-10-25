/******************************************************************************/
define(['revealjs'], function(Reveal){

  var revealconfig = {
    // Full list of configuration options available here:
    // https://github.com/hakimel/reveal.js#configuration
    loop:     true,
    autoSlide:9999,
    overview: false,
    controls: true,
    progress: true,
    history:  false,
    keyboard: true,
    rollingLinks: false,
    theme: Reveal.getQueryHash().theme || 'beige', // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || 'concave', // default/cube/page/concave/linear(2d)
  }//^revealconfig

  Reveal.initialize(revealconfig);

});
/******************************************************************************/

