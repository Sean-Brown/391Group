var countries = []; // The list of countries, useful for loading Geognos links
var frame = 'gov'; // Tells what the current frame is for 'frame'
var user = ''; // The user name
var currencies = []; // The array of currency "objects"

/**
 * This does the bulk of the initialization when the document is "ready"
 */
$(document).ready(function() {
    // First check if there's a user logged in
    if ($("input#cover").val() === "cov") {
	// There's no user logged in, so cover it
	cover();
	$("div#welcome").hide();
	// Disabling these divs will prevent the non-logged in person from
	// seeing these parts of the app
	$("table#stats").hide().prop("disabled", true);
	$("table#my_countries").hide().prop("disabled", true);
	$("div#currency").hide().prop("disabled", true);
	$("div#country").hide().prop("disabled", true);
	$("div#frame").hide().prop("disabled", true);
	$("div#stats").hide().prop("disabled", true);
	$(window).mousemove(function() {
	    if ($("div#cover").attr("display") !== "block") {
		$("div#cover").css("display","block");
	    }
	});
    }
    else {
	user = $("div#welcome").attr("class");
	$("div#welcome").html("Welcome "+user);
	$("div#welcome").show();
	if ($(window).width() < 1270) {
	    $("label#cresult").before("<br id=\"special\">");
	}
	// A bunch of stuff needs to be hidden at the beginning to make things look nicer
	$("iframe#geo_frame").hide();
	$("#no_match").hide();
	$("a#dest").hide();
	$("span#dest").hide();
	$("span#result").hide();
	$("div#stats").hide();
	$("iframe#cframe").hide();

	// Travel.gov will be the first thing active, so set its background color to the 
	// "active" color (i.e. royalblue)
	$("span#gov").css("background","royalblue");
	
	// Manually set the width of these frames
	$("iframe#gov_frame").css("width",$(window).width()-324);
	$("iframe#geo_frame").css("width",$(window).width()-324);
    }
    
    // Get the countries and parse them
    $.ajax({
	type: "GET",
	url: "/xmls/countries.xml",
	dataType: "xml",
	success: parseXml
    });

    // Get the Geognos data
    $.ajax({
	// One limitation is that geognos has a "quota", which can get filled quickly
	url: 'http://www.geognos.com/api/en/countries/info/all.jsonp',
	dataType: "jsonp",
	jsonpCallback: 'callback',
	success: function(data) {
	    countries = data;
	}
    });
    
    // Get that giant json file and basically re-create it in a variable
    $.getJSON('json', function(data) {
	$.each(data, function(key,value) {
	    // Push each currency and its associated country(ies)
	    currencies.push("{\"abv\":\""+value.abv+"\",\"name\":\""+value.name+"\",\"countries\":[\""+value.countries+"\"]}");
	});
	// Sort it to make it look nicer
	currencies.sort(function(a,b) {
	    var a1 = jQuery.parseJSON(a).name.toLowerCase().split(' ').join('');
	    var b1 = jQuery.parseJSON(b).name.toLowerCase().split(' ').join('');
	    return a1 > b1 ? 1 : a1 < b1 ? -1 : 0;
	});
	for (var i = 0; i < currencies.length; i++) {
	    var c = jQuery.parseJSON(currencies[i]);
	    listRate(c);
	}
    });

    // Bind the elements to respond to click events
    bindClicks();   
});

/**
 * This is a function which transforms the name of the country that was received into a name 
 * with the first letter capitalized and the others to lowercase (except for some special 
 * exception). Instead of taking the time to edit the XML file so that everything would parse 
 * nicely, I decided to use regex instead to transform it
 * @param country - the country whose name will be changed
 */
function capitalise(country) {
    var ret = country.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    if(ret.match(/^Brunei.*$/)) {
	ret = 'Brunei';
    }
    else if(ret.match(/^.*bissau$/)) {
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

/**
 * This function parses the XML list of countries and makes it an "option"
 * @param xml - the xml data that was fetched
 */
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

/**
 * This function lists the possible currencies as "options"
 * @param currency - the name of the currency which is being made a conversion "option"
 */
function listRate(currency) {
    var cur1 = $("#currFrom");
    var cur2 = $("#currTo");
    cur1.append("<option label=\""+currency.name+"\">"+currency.abv+"</option><br>");
    cur2.append("<option label=\""+currency.name+"\">"+currency.abv+"</option><br>");
}

/**
 * This function covers the app with the login/create account screen
 */
function cover() {
    $("div#cover").css("display","block");
    // Have to adjust the height this way because it is screwy if it's 
    // set to 100% in the CSS
    $("div#cover").height($(document).height())+20;
}

/**
 * This function binds tags to their functionality on click events
 */
function bindClicks() {
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
		    $("span#dest").html("");
		    var currency = findCurrencyForCountry($("#c_list").val());
		    textForCurrency(currency);
		    $("span#dest").show();
		    $("span#geo").css("background-color","royalblue");
		    $("span#gov").css("background-color","");
		    $("span#stats").css("background-color","");
		    $("div#stats").hide();
		    $("iframe#cframe").show();
		    // Add this to the custom "button"
		    $("a#dest").html($("#c_list").val()).show().append("<span>!</span>");
		    $("span#result").hide();
		    frame = 'geo';
		    found = true;
		    break;
		}
	    }
	}
    });

    // This is the functionality to add a country that you want to visit
    $("a#dest").click(function() {
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
		if ($("span#stats").is(":visible")) {
		    // Simulate a click to refresh the tables
		    $("span#stats").click();
		}
		$("span#result").html(res.Success);
		$("span#result").css("background-color","springgreen");
	    }
	    // Fade out in 2 seconds
	    $("span#result").fadeOut(2000);
	});
	$("a#dest").hide();
	$("span#dest").hide();
    });

    // These are the "tabs" that will switch between iframes and statistics
    $("span#geo").click(function() {
	if ($("select#c_list").val() === "" && $("iframe#cframe").attr('src') === '') {
	    $("iframe#cframe").hide();
	}
	else if (frame === 'geo') {
	    return;
	}
	else {
	    $("div#stats").hide();
	    $("iframe#gov_frame").hide();
	    $("iframe#geo_frame").show();
	    $("span#geo").css("background-color","royalblue");
	    $("span#gov").css("background-color","");
	    $("span#stats").css("background-color","");
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
	    $("span#geo").css("background-color","");
	    $("span#gov").css("background-color","royalblue");
	    $("span#stats").css("background-color","");
	    frame = 'gov';
	}
    });
    $("span#stats").click(function(){
	listPopular();
	listMyCountries();
	// Resize the user's countries table
	$("table#my_countries").css("width",$("table#stats").width());
	$("table#my_countries").css("width",$("table#stats").width());
        if (frame === 'stats') {
            return;
        }
        else {
            $("iframe#geo_frame").hide();
            $("iframe#gov_frame").hide();
	    $("table#my_countries").css("margin-left",$("table#stats").width());
            $("div#stats").show();
	    $("span#geo").css("background-color","");
	    $("span#gov").css("background-color","");
	    $("span#stats").css("background-color","royalblue");
            frame = 'stats';
        }
    });

    // Make an ajax call to log the user out
    $("input#logout").click(function() {
	$.ajax({
            type: "POST",
            url: "/logout",
	});
	location.reload();
    });

    // Bind the remove account button to remove account
    $("input#remove_account").click(function() {
	// For something cooler, could've used jQuery's .dialog() function
	var yes = confirm("Are You Sure You Want To Delete Your Account?\n(Can't Be Undone)");
	if (yes) {
	    removeAccount();
	    user = '';
	    cover();
	}
    });

    // This is for password verification, so a new user knows when the first password does not
    // equal the second password
    $(".upass2").eq(1).keyup(function() {
        var p1 = $(".upass2").eq(0).val();
        var p2 = $(".upass2").eq(1).val();
        if (p1 !== p2) {
            $(".upass2").eq(1).css("background-color","red");
            $("span#no_match").show();
        }
        else {
            $(".upass2").eq(1).css("background-color","white");
            $("span#no_match").hide();
        }
    });

    // When the window's resized, make sure the divs remain in a relatively good position (to
    // make it look nice)
    $(window).resize(function () {
	var width = $(window).width();
	if (width >= 1270) {
	    if ($("br#special").exists()) {
		$("br#special").remove();
	    }
	}
	else {
	    if (!$("br#special").exists()) {
		$("label#cresult").before("<br id=\"special\">");
	    }
	}
	$("iframe#gov_frame").css("width",width-324);
	$("iframe#geo_frame").css("width",width-324);
	$("table#my_countries").css("margin-left",$("table#stats").width());
    });
}

/**
 * This function lists the most popular countries that users of this app want to visit
 */
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

/** 
 * A very similar function to listPopular that lists the countries a user wants to visit
 */
function listMyCountries() {
    var req = $.ajax({
        type: "GET",
        url: "/my_countries"
    });
    req.done(function(data) {
	$("table#my_countries tr").remove(); 
        $("table#my_countries thead").append("<tr><th class=\"theader\">Your Countries</th></tr><tr><th>Country</th></tr>");
        var table = $("table#my_countries tbody:last"); 
        for(var i = 0; i < data.length; i++) {
            table.after('<tr><td class="data" onclick=\"javascript:removeCountry(this.innerHTML);\"">'+data[i].destination+'</td>></tr>');
        }
    });
}

/**
 * A function to find a currency for a country
 * @param country - the country whose currency we want to find
 * @return - the currency name
 */ 
function findCurrencyForCountry(country) {
    var current = {};
    for (var i = 0; i < currencies.length; i++) {
	current = jQuery.parseJSON(currencies[i]);
	var c = current.countries;
	if (c !== undefined) {
	    for (var j in c.toString().split(',')) {
		if (country === c.toString().split(',')[j]) {
		    return current.name;
		}
	    }
	}
    }
}

/**
 * A helper function to remove a country
 * @param country - the country to be removed
 */
function removeCountry(country) {
    var result = $.ajax({
	type: "POST",
	url: "/remove",
	data: {"country":country}
    });
    result.done(function(res) {
	// Fade out in 2 seconds 
	$("span#result").show().fadeOut(2000);
	if (res.Error !== undefined) {
	    // There was an error, likely they already want to visit this country
	    $("span#result").html(res.Error);
	    $("span#result").css("background-color","crimson");
	}
	else {
	    $("span#result").html(res.Success);
	    $("span#result").css("background-color","springgreen");
	    // Simulate a click to refresh the tables
	    $("span#stats").click();
	}
    });
}

/**
 * Function to display the proper currency for the selected country
 * @param currency: the currency name to be displayed
 */
function textForCurrency(currency) {
    if ($("#c_list").val() === 'Chile') {
	// Chile's special and has 2 currencies...
	$("span#dest").append($("#c_list").val()+" uses the Chilean Unidad de Fomento AND the Chilean peso. I want to go to ");
    }
    else if ($("#c_list").val() === 'Western Sahara') {
	// Western Sahara uses a bunch of currencies
	$("span#dest").append($("#c_list").val()+" uses the Algerian dinar, Moroccan dirham, and the Mauritanian ouguiya. I definitely want to go to ");
    }
    else if ($("#c_list").val() === 'Palestinian Territory') {
	$("span#dest").append($("#c_list").val()+" uses the Egyptian pound, Israeli new sheqel, and the Jordanian dinar. I want to go to ");
    }
    else if (currency === undefined) {
	$("span#dest").append("Can't find the currency for "+$("#c_list").val()+", check the Geognos page. I still want to go to ");
    }
    else {
	$("span#dest").append($("#c_list").val()+" uses the \""+currency+"\". I want to go to ");
    }
}

/**
 * This is a function to remove the user's account
 */
function removeAccount() {
    $.ajax({
	type: "POST",
	url: "/remove_account"
    });
}

/**
 * Gives jQuery the ability to tell if an element "exists"
 * @return - does the element exist (i.e. length > 0)
 */
jQuery.fn.exists = function() {
    return this.length>0;
}