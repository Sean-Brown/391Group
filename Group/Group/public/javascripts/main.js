var currencies = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHF","CLF","CLP","CNY","COP","CRC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","IEP","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","STD","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VEF","VND","VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMK","ZWL"]

var countries = []; // The list of countries
var frame = 'gov'; // Tells what the current frame is for 'frame'
var users = []; // The logged in users

$(document).ready(function() {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
	// the browser is Chrome and will do screwy things to the iframes
	$("iframe#gov_frame").css("sandbox","allow-same-origin");
	console.log("Browser is Chrome");
    }
    listRates();
    $.ajax({
	type: "GET",
	url: "/xmls/countries.xml",
	dataType: "xml",
	success: parseXml
    });

    $.ajax({
	url: 'http://www.geognos.com/api/en/countries/info/all.jsonp',
	dataType: "jsonp",
	jsonpCallback: 'callback',
	success: function(data) {
	    countries = data;
	}
    });

    $("#country").bind('change', function() {
	var code = $("#c_list").val();
	if (code === '') {
	    return;
	}
	var link = '';
	var found = false;
	for (var i in countries.Results) {
	    if (found == true) {
		break;
	    }
	    for (var j in countries.Results[i]) {
		if (j === 'Name' && countries.Results[i][j] === code) {
		    link = 'http://www.geognos.com/api/en/countries/info/'+i+'.html';
		    $("#cframe").attr('src', link);
		    $("iframe#geo_frame").attr('src', 'http://www.geognos.com/geo/en/cc/'+i.toLowerCase()+'.html');
		    $("iframe#geo_frame").show();
		    // Have to manually resize sometimes because it won't show up right                
		    if ($("iframe#geo_frame").width() > $(window).width()-324) {
			console.log("Resizing Geognos frame");
			$("iframe#geo_frame").css("width",$(window).width()-324);
		    }
		    $("iframe#gov_frame").hide();
		    frame = 'geo';
		    found = true;
		    break;
		}
	    }
	}
    });

    $("#geo").click(function(){
	if (frame === 'geo') {
	    return;
	}
	else {
	    $("iframe#gov_frame").hide();
	    $("iframe#geo_frame").show();
	    frame = 'geo';
	}
    });
    
    $("#gov").click(function(){
	if (frame === 'gov') {
	    return;
	}
	else {
	    $("iframe#geo_frame").hide();
	    $("iframe#gov_frame").show();
	    frame = 'gov';
	}
    });

    $("iframe#geo_frame").hide();
    $("#no_match").hide();
    
    $("iframe#gov_frame").css("width",$(window).width()-324);
    $("iframe#geo_frame").css("width",$(window).width()-324);
    
    $(window).resize(function () {
	$("iframe#gov_frame").css("width",$(window).width()-324);
	$("iframe#geo_frame").css("width",$(window).width()-324);
    });

    var title =$("title").html();
    if (title === "Travel Aide Guest") {
	cover();
    }
    else {
	logged_in = true;
    }
    
    $(".upass2").change(function() {
	var p1 = $(".upass2").eq(0).val();
	var p2 = $(".upass2").eq(1).val();
	if (p1 !== p2) {
	    $(".upass2").eq(1).css("background-color:red");
	    $("no_match").show();
	}
	else {
	    $(".upass2").eq(1).css("background-color:white");
	    $("#no_match").hide();
	}
    });

    $("#logout").click(function() {
	$.ajax({
            type: "POST",
            url: "/ta",
	});
	window.location.reload();
    });
});

function capitalise(string) {
     var ret = string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    if(ret.match(/^Brunei.*$/)) {
	ret = 'Brunei';
    }
    else if(ret.match(/^.*Bissau$/)) {
        ret = 'Guinea-Bissau';
    }
    else if(ret.match(/^Heard.*$/)) {
        ret = 'Heard Island and McDonald Islands';
    }
    else if(ret.match(/^Isle Of Man$/)) {
        ret = 'Isle of Man';
    }
    else if(ret.match(/^Saint Helena.*$/)) {
        ret = 'Saint Helena Ascension and Tristan da Cunha';
    }
    else if(ret.match(/And/i)) {
	ret = ret.replace(/\sAnd\s/gi," and ");
	return (ret.replace(/\sThe\s/gi," the "));
    }
    else if(ret.match(/^Timor.*$/)) {
        ret = 'Timor-Leste';
    }
    return ret;
}

function parseXml(xml) {
    //find every tip and print it
    $("#c_list").append("<option></option><br>"); // add a blank
    $(xml).find("List").each(function() {
	    $(this).find("Entry").each( function() {
		var c = capitalise($(this).find("Name").text().toLowerCase());
		if (c !== null) {
		    $("#c_list").append("<option>"+c+"</option><br>");
		}
	    });
	});
}

function listRates() {
    var cur1 = $("#currFrom");
    var cur2 = $("#currTo");
    for (var i = 0; i < currencies.length; i++) {
        cur1.append("<option>"+currencies[i]+"</option><br>");
	cur2.append("<option>"+currencies[i]+"</option><br>");
    }
}

function showMap(jpg) {
    $("#map").css("background-image", xml);
}

function cover() {
    $("#cover").css("display","block");
    // Have to adjust the height this way because it is screwy
    // if it's set to 100% in the CSS
    $("#cover").height($(document).height());
}