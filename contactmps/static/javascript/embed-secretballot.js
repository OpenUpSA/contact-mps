// addEventListener only available in later chrome versions
window.addEventListener("load",function(){
  function doError(msg, url, ln) {
    var strValues = "errMsg=" + escape(msg);
    strValues += "&errLine=" + ln;
    strValues += "&queryString=" + escape(location.search);
    strValues += "&Url=" + escape(location.pathname);
    strValues += "&HTTPRef=" + escape(document.referrer);

    if (typeof XMLHttpRequest != "object") {
      function XMLHttpRequest() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    var objSave = new XMLHttpRequest();
    objSave.open("GET", baseurl + "/errorSave/?" + strValues, false);
    objSave.send("");
  }
  window.addEventListener('error', function(e) {
    try {    window.onerror = doError;}catch(er) {}
  });
});


if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}
document.write('<div id="contactmps-embed-parent"></div>');
document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js"></script>');

document.write("<script>var pymParent = new pym.Parent('contactmps-embed-parent', '" + baseurl + "/campaign/secretballot/', {});</script>");
