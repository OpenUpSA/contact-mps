if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

var initContactMPsPymParent = function() {
  var pymParent = new pym.Parent('contactmps-embed-parent', baseurl + '/campaign/newsmedia/', {});
};


document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js" crossorigin="anonymous" async defer onload="initContactMPsPymParent()"></script>');
