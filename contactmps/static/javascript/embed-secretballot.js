
if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

function doError(e) {
  try {
    var strValues = "errMsg=" + escape(msg);
    strValues += "&errLine=" + ln;
    strValues += "&queryString=" + escape(location.search);
    strValues += "&Url=" + escape(location.pathname);
    strValues += "&HTTPRef=" + escape(document.referrer);

    var objSave = new XMLHttpRequest();
    objSave.open("GET", baseurl + "/errorSave/?" + strValues, false);
    objSave.send("");
  } catch (er) {}
}

var agent = navigator.userAgent.toLowerCase();
console.log("agent");
console.log(document.referrer);
if (agent.includes("mobile") && agent.includes("android") && document.referrer.includes("local.app")) {
  // addEventListener only available in later chrome versions
  window.addEventListener('error', doError);
  console.log("here");
}

document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/secretballot/', {});</script>");
