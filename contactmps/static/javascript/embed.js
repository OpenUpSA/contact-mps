if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

var agent = navigator.userAgent.toLowerCase();
if (agent.includes("mobile") && agent.includes("android")) {
  // addEventListener only available in later chrome versions
  window.addEventListener("load",function(){
    window.addEventListener('error', function(e) {
      ga('send', 'event', 'JavaScript Error Parent', e.filename + ':  ' + e.lineno, e.message);
    });

  });
  // Don't initialise pymParent! we iframe it ourselves!
  document.write('<div id="contactmps-embed-parent" style="height: 3000px"><iframe src="' + baseurl + '/campaign/newsmedia/" width="100%" scrolling="no" marginheight="0" frameborder="0" height="3000px" style="height: 3000px"></script></div>');
} else {
  document.write('<div id="contactmps-embed-parent"></div>');
  document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js" crossorigin="anonymous"></script>');
  document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/newsmedia/', {});</script>");
}
