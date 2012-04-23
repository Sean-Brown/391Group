/* money.js 0.1.3, MIT license, josscrowcroft.github.com/money.js */
(function(g,j){var b=function(a){return new i(a)};b.version="0.1.3";var c=g.fxSetup||{rates:{},base:""};b.rates=c.rates;b.base=c.base;b.settings={from:c.from||b.base,to:c.to||b.base};var h=b.convert=function(a,e){if("object"===typeof a&&a.length){for(var d=0;d<a.length;d++)a[d]=h(a[d],e);return a}e=e||{};if(!e.from)e.from=b.settings.from;if(!e.to)e.to=b.settings.to;var d=e.to,c=e.from,f=b.rates;f[b.base]=1;if(!f[d]||!f[c])throw"fx error";d=c===b.base?f[d]:d===b.base?1/f[c]:f[d]*(1/f[c]);return a*d},i=function(a){"string"===typeof a?(this._v=parseFloat(a.replace(/[^0-9-.]/g,"")),this._fx=a.replace(/([^A-Za-z])/g,"")):this._v=a},c=b.prototype=i.prototype;c.convert=function(){var a=Array.prototype.slice.call(arguments);a.unshift(this._v);return h.apply(b,a)};c.from=function(a){a=b(h(this._v,{from:a,to:b.base}));a._fx=b.base;return a};c.to=function(a){return h(this._v,{from:this._fx?this._fx:b.settings.from,to:a})};if("undefined"!==typeof exports){if("undefined"!==typeof module&&module.exports)exports=module.exports=b;exports.fx=fx}else"function"===typeof define&&define.amd?define([],function(){return b}):(b.noConflict=function(a){return function(){g.fx=a;b.noConflict=j;return b}}(g.fx),g.fx=b)})(this);

/**
 * The initialization work is done in this function
 */
$(document).ready(function() {
    // A call to get the current exchange rates
    $.getJSON('http://openexchangerates.org/latest.json', function(data) {
	// Check money.js has finished loading:                                                             
        if (typeof fx !== "undefined" && fx.rates) {
            fx.rates = data.rates;
            fx.base = data.base;
	}
        else {
	    // If not, apply to fxSetup global:                                                              
            var fxSetup = {
		rates: data.rates,
		base: data.base
            }
	}
    });

    // The binding of these 3 elements to changes, which will trigger a calculation the conversion
    $('#amount').bind('change', function (event) {
	convert();
    });
    $('#currFrom').bind('change', function (event) {
        convert();
    });
    $('#currTo').bind('change', function (event) {
        convert();
    });
});

/**
 * A function to convert from one currency to another
 */
function convert() {
    var amount = $("#amount").val();
    var from = $("#currFrom").val();
    var to = $("#currTo").val();
    var conv = fx.convert(amount, {from: from, to: to});
    // Don't want to display "NaN" to the user
    if (isNaN(conv)) {
	return;
    }
    else {
	// Round the result to 3 decimal places
	$("#convResult").html(Math.round(conv*1000)/1000);
    }
}