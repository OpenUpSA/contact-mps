if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

var agent = navigator.userAgent.toLowerCase();
if (agent.includes("mobile") && agent.includes("android")) {
  // addEventListener only available in later chrome versions
  window.addEventListener("load",function(){
    document.getElementById("contactmps-embed-parent").children[0].setAttribute("height", "3000px");
  });
  document.write('<div id="contactmps-embed-parent" style="height: 3000px"></div>');
} else {
  document.write('<div id="contactmps-embed-parent"></div>');
}
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/newsmedia/', {});</script>");
