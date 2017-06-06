if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://contactmps.openup.org.za";
}
document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');
// Forward slash is necessary for HTTPS because django redirect to url/ uses HTTP
document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/noconfidence/', {});</script>");
