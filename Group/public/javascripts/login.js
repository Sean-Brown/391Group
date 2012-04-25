$(document).ready(function() {
    // Set the height of cover
    var cover = $("div#cover");
    var height = $(window).height()+20;
    cover.css("height",height);

    // Tell the user if their second password doesn't match the first
    var p1 = $("input.upass2").attr("name","upass1");
    var p2 = $("input.upass2").attr("name","upass2");
    var no_match = $("span#no_match");
    p2.change(function() {
	if (p2.val() !== p1.val()) {
	    p2.css("background-color","crimson");
	    no_match.show();
	}
	else {
	    p2.css("background-color","springgreen");
	    no_match.hide();
	}
    });
});