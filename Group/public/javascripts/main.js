var currencies = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHF","CLF","CLP","CNY","COP","CRC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","IEP","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","STD","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VEF","VND","VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMK","ZWL"]

var countries = []; // The list of countries
var geo = ''; // The last Geognos link
var frame = 'gov'; // Tells what the current frame is for 'frame'

$(document).ready(function() {
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
		    $("iframe#frame").attr('src', 'http://www.geognos.com/geo/en/cc/'+i.toLowerCase()+'.html');
		    geo = 'http://www.geognos.com/geo/en/cc/'+i.toLowerCase()+'.html';
		    frame = 'geo';
		    found = true;
		    break;
		}
	    }
	}
    });

    $("#geo").click(function(){
	if (geo === '' || frame === 'geo') {
	    return;
	}
	else {
	    $("iframe#frame").attr('src', geo);
	    frame = 'geo';
	}
    });
    $("#gov").click(function(){
	if (frame === 'gov') {
	    return;
	}
	else {
            $("iframe#frame").attr('src', 'http://travel.state.gov/travel');
	    frame = 'gov';
	}
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