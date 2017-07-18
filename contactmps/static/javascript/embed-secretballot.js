if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://representme.co.za";
}
document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/secretballot/', {});</script>");
