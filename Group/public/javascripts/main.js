var currencies = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHF","CLF","CLP","CNY","COP","CRC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","IEP","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","STD","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VEF","VND","VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMK","ZWL"]

var countries = [];

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
		    found = true;
		    break;
		}
	    }
	}
    });
});

function capitalise(string) {
     return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function parseXml(xml) {
    //find every tip and print it
    $("#c_list").append("<option></option><br>"); // add a blank
    $(xml).find("List").each(function() {
	    $(this).find("Entry").each( function() {
		var c = capitalise($(this).find("Name").text().toLowerCase());
		$("#c_list").append("<option>"+c+"</option><br>");
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