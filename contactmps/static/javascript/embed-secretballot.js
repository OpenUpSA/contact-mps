
if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

function logError(e) {
  try {
    var strValues = "description=" + escape(e.message);
    strValues += "&errLine=" + e.lineno;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', baseurl + "/errorSave/?" + strValues, false);
    xhr.send();
    document.write(".");
    return xhr;
  } catch (er) {
    // Do absolutely nothing to avoid error loop
  }
}

var agent = navigator.userAgent.toLowerCase();
var isAndroidApp = agent.includes("android") && window.location.href.includes("local.app");
if (isAndroidApp) {
  // addEventListener only available in later chrome versions
  if ('addEventListener' in window) {
    window.addEventListener('error', logError);
  } else {
    alert("no addEventListener");
  }
}

document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/secretballot/', {});</script>");

if (!isAndroidApp) {
  document.write('...');
}

document.write('<span style="font-size: xx-small">' + agent + '</span>');
document.write('<span style="font-size: xx-small">' + window.location.href + '</span>');

throw {
    name:        "TestError",
    level:       "Benign",
    message:     "Test error thrown",
    htmlMessage: "<b>Test</b> error thrown",
    toString:    function(){return this.name + ": " + this.message;}
};
