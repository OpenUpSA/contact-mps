
if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

function logError(e) {
  try {
    var strValues = "errMsg=" + escape(msg);
    strValues += "&errLine=" + ln;
    strValues += "&queryString=" + escape(location.search);
    strValues += "&Url=" + escape(location.pathname);
    strValues += "&HTTPRef=" + escape(document.referrer);

    var objSave = new XMLHttpRequest();
    objSave.open("GET", baseurl + "/errorSave/?" + strValues, false);
    objSave.send("");
  } catch (er) {
    // Do absolutely nothing to avoid error loop
  }
}

var agent = navigator.userAgent.toLowerCase();
if (agent.includes("mobile") && agent.includes("android") && window.location.href.includes("local.app")) {
  // addEventListener only available in later chrome versions
  if ('addEventListener' in window) {
    window.addEventListener('error', logError);
  }
}

document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/secretballot/', {});</script>");

throw {
    name:        "TestError",
    level:       "Benign",
    message:     "Test error thrown",
    htmlMessage: "<b>Test</b> error thrown",
    toString:    function(){return this.name + ": " + this.message;}
};
