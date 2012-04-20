var currencies = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHF","CLF","CLP","CNY","COP","CRC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","IEP","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","STD","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VEF","VND","VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMK","ZWL"]

var countries = []; // The list of countries
var frame = 'gov'; // Tells what the current frame is for 'frame'
var user = {};

$(document).ready(function() {
    listRates();

    $.ajax({
	type: "GET",
	url: "/xmls/countries.xml",
	dataType: "xml",
	success: parseXml
    });

    $.ajax({
	// One limitation is that geognos has a "quota", which can get filled quickly
	url: 'http://www.geognos.com/api/en/countries/info/all.jsonp',
	dataType: "jsonp",
	jsonpCallback: 'callback',
	success: function(data) {
	    countries = data;
	}
    });

    // Check to see if there's a user logged in for this session
    var logged_in = $.ajax({
	type: "POST",
	url: "/logged_in"
    });
    logged_in.done(function(data) {
	if (data.user === '') {
	    cover();
	}
	else {
	    user.name = data.user;
	    $.ajax({
		type: "GET",
                url: "/count",
                success: function(result) {
                    user.countries = result.count;
                }
            });
	}
    });
    
    // Make an ajax call to log the user out
    $("#logout").click(function() {
	$.ajax({
            type: "POST",
            url: "/logout",
	});
	user = {};
	cover();
    });

    // This is a lengthy function to search for a selected country and set the iframe
    // sources to show the Geognos listing for this country
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
		    // Country is found
		    link = 'http://www.geognos.com/api/en/countries/info/'+i+'.html';
		    $("#cframe").attr('src', link);
		    $("iframe#geo_frame").attr('src', 'http://www.geognos.com/geo/en/cc/'+i.toLowerCase()+'.html');
		    $("iframe#geo_frame").show();
		    // Have to manually resize sometimes because it do it on its own sometimes            
		    if ($("iframe#geo_frame").width() > $(window).width()-324) {
			$("iframe#geo_frame").css("width",$(window).width()-324);
		    }
		    $("iframe#gov_frame").hide();
		    // Add this to the custom "button"
		    $("a#dest").html($("#c_list").val()).show().append("<span>!</span>");
		    $("span#dest").show();
		    $("span#result").hide();
		    frame = 'geo';
		    found = true;
		    break;
		}
	    }
	}
    });

    // This is the functionality to add a country that you want to visit, if you have less than 10
    $("a#dest").click(function() {
	if (user.countries < 10) {
	    var result = $.ajax({
		url: '/add',
		type: 'POST',
		data: {"country":$("#c_list").val()}
	    });
	    result.done(function(res) {
		$("span#result").show();
		if (res.Error !== undefined) {
		    // There was an error, likely they already want to visit this country
		    $("span#result").html(res.Error);
		    $("span#result").css("background-color","crimson");
		}
		else {
		    $("span#result").html(res.Success);
		    $("span#result").css("background-color","springgreen");
		}
	    });
	}
	else {
	    alert("You are at 10 countries already,\nVisit (i.e. delete) a few first, then add more");
	}
	$("a#dest").hide();
	$("span#dest").hide();
    });

    // These are the "tabs" that will switch between iframes and statistics
    $("span#geo").click(function() {
	if (frame === 'geo') {
	    return;
	}
	else {
	    $("div#stats").hide();
	    $("iframe#gov_frame").hide();
	    $("iframe#geo_frame").show();
	    frame = 'geo';
	}
    });
    $("span#gov").click(function(){
	if (frame === 'gov') {
	    return;
	}
	else {
	    $("iframe#geo_frame").hide();
	    $("div#stats").hide();
	    $("iframe#gov_frame").show();
	    frame = 'gov';
	}
    });
    $("span#stats").click(function(){
	listPopular();
        if (frame === 'stats') {
            return;
        }
        else {
            $("iframe#geo_frame").hide();
            $("iframe#gov_frame").hide();
	    $("table#top10").css("margin-left",$("table#stats").width());
            $("div#stats").show();
	    listTop10();
            frame = 'stats';
        }
    });

    // Add the functionality for a user to click and remove a country of theirs
    $("table#top10 td").click(function(event) {
	var country = event.srcElement.innerHTML;
	removeCountry(country);
    });

    // A bunch of stuff needs to be hidden at the beginning to make things look nicer
    $("iframe#geo_frame").hide();
    $("#no_match").hide();
    $("a#dest").hide();
    $("span#dest").hide();
    $("span#result").hide();
    $("div#stats").hide();
    
    // Manually set the width of these frames
    $("iframe#gov_frame").css("width",$(window).width()-324);
    $("iframe#geo_frame").css("width",$(window).width()-324);
    
    // When the window's resized, make sure the divs remain in a relatively good position (to
    // make it look nice)
    $(window).resize(function () {
	$("iframe#gov_frame").css("width",$(window).width()-324);
	$("iframe#geo_frame").css("width",$(window).width()-324);
	$("table#top10").css("margin-left",$("table#stats").width());
    });

    // This is for password verification, so a new user knows when the first password does not
    // equal the second password
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
});

// Instead of taking the time to edit the XML file so that everything would parse nicely, I decided to use
// regex instead to make it an acceptable form
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

// This function parses the XML list of countries and makes it an "option"
function parseXml(xml) {
    $("#c_list").append("<option></option><br>"); // add a blank option
    $(xml).find("List").each(function() {
	$(this).find("Entry").each( function() {
	    var c = capitalise($(this).find("Name").text().toLowerCase());
	    if (c !== null) {
		$("#c_list").append("<option>"+c+"</option><br>");
	    }
	});
    });
}

// This function lists the possible currencies as "options"
function listRates() {
    var cur1 = $("#currFrom");
    var cur2 = $("#currTo");
    for (var i = 0; i < currencies.length; i++) {
        cur1.append("<option>"+currencies[i]+"</option><br>");
	cur2.append("<option>"+currencies[i]+"</option><br>");
    }
}

// This function covers the app with the login/create account screen
function cover() {
    $("#cover").css("display","block");
    // Have to adjust the height this way because it is screwy if it's 
    // set to 100% in the CSS
    $("#cover").height($(document).height());
}

// This function lists the most popular countries that users want to visit
function listPopular() {
    var req = $.ajax({
        type: "GET",
        url: "/list",
    });
    req.done(function(data) {
	// I tried $("table#stats tbody tr") but it doesn't work (the tbody element is iffy on most browsers)
	$("table#stats tr").remove();
	// Put the header back in
	$("table#stats thead").append("<tr colspan='2'><th class=\"theader\" colspan=2>Most Popular Countries</th></tr><tr><th>Country</th><th>Count</th></tr>");
        var table = $("table#stats tbody:last");
        for(var i = 0; i < data.countries.length; i++) {
            table.after('<tr><td>'+data.countries[i].country+'</td><td>'+data.countries[i].count+'</td></tr>');
        }
    });
}

// A very similar function that lists the countries a user wants to visit (at most 10)
function listTop10() {
    var req = $.ajax({
        type: "GET",
        url: "/10",
    });
    req.done(function(data) {
	$("table#top10 tr").remove(); 
        $("table#top10 thead").append("<tr><th class=\"theader\">Your Countries</th></tr><tr><th>Country</th></tr>");
        var table = $("table#top10 tbody:last"); 
	var ten = data.length;
	if (ten > 10) {
	    // This should never happen
	    ten = 10;
	}
        for(var i = 0; i < ten; i++) {
            table.after('<tr><td>'+data[i].destination+'</td>></tr>');
        }
    });
}

function removeCountry(country) {
    var req = $.ajax({
        type: "POST",
        url: "/remove",
	data: {"country":country}
    });
    req.done(function(response) {
	if (response.Error !== undefined) {
	    // There was some kind of error
	    $("span#result").html(response.Error);
	    $("span#result").show();
	}
	else {
	    $("span#result").html(response.Success);
            $("span#result").show();
	}
    });
};