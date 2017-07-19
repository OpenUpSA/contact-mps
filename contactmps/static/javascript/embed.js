if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://noconfidencevote.openup.org.za";
}

var initContactMPsPymParent = function() {
  var pymParent = new pym.Parent('contactmps-embed-parent', baseurl + '/campaign/newsmedia/', {});
};

var agent = navigator.userAgent.toLowerCase();
if (agent.includes("mobile") && agent.includes("android")) {
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
  // Don't initialise pymParent! we iframe it ourselves!
  document.write('<div id="contactmps-embed-parent-nonpym" style="height: 2500px; background: url(https://noconfidencevote.openup.org.za/static/images/background.svg); background-repeat: no-repeat"><iframe src="' + baseurl + '/campaign/newsmedia/" width="100%" scrolling="no" marginheight="0" frameborder="0" height="2500px" style="height: 2500px">Loading...</iframe></div>');

  document.write('<div id="contactmps-embed-parent"></div>');
  document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js" crossorigin="anonymous" async defer onload="initContactMPsPymParent()"></script>');

  // test new app below
  document.write('<script type="text/javascript" src="https://noconfidencevote.openup.org.za/static/javascript/embed-secretballot.js"> </script>');
} else {
  document.write('<div id="contactmps-embed-parent"></div>');
  document.write('<script type="text/javascript" src="' + baseurl + '/static/javascript/pym.v1.min.js" crossorigin="anonymous" async defer onload="initContactMPsPymParent()"></script>');
}
