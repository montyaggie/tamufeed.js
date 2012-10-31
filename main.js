//// Fallback if an AMD asynchronous module definition loader not in use ////
  if (typeof define !== 'function' || !define.amd)
    var define = function (id,args,func) { 
      this[id] = func; this[id].apply(this,args); 
  }//define

define('main', ['jquery','tamufeed'], function($,tamufeed) {
/******************************************************************************/

$(function() { tamufeed.init(); });

/******************************************************************************/
});
