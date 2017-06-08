var pymChild = new pym.Child({
  id: "contactmps-embed-parent"
});

$(function() {
  pymChild.sendHeight();
  console.info("contactmps loaded");
});

var gReCaptchaValidated = function() {
  $("input[type=submit]").removeAttr('disabled');
};

var gReCaptchaExpired = function() {
  $("input[type=submit]").attr('disabled','disabled');
};

var recaptchaLoaded = function() {
  grecaptcha.render('recaptcha', {
    'sitekey': '{{ recaptcha_key }}',
    'callback': gReCaptchaValidated,
    'expired-callback': gReCaptchaExpired
  });
  console.info("recaptcha rendered");
  pymChild.sendHeight();
};

if ($('.create-email-page').length > 0) {
  // load the data into the dropdown
  var data = _.map(persons, function(p) {
    return {
      id: p.id,
      text: p.name + (p.party ? (' - ' + p.party.name) : ''),
    };
  });

  $('select.use-select2').select2({
    data: data,
    placeholder: 'Choose an MP',
  });
}

$(".choose .single-mp").click(function() {
  $(".choose .single-mp").removeClass("selected");
  $(this).addClass("selected");
  var selectedMember = $(".mp-name", this).text();
  $("#recipient").text(selectedMember);
  var selectedImage = $(".mp-img-wrapper", this).css("background-image");
  console.log(selectedImage);
  $(".selected-mp .mp-img-wrapper").css({"background-image": selectedImage});
  var selectedParty = $(".mp-img-wrapper .party-logo", this).attr("src");
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", selectedParty);
  pymChild.sendHeight();
});

$(".choose .single-mp").first().click();

var d = new Date();
var month = d.getMonth()+1;
var day = d.getDate();
var today = 
    ((''+day).length<2 ? '0' : '') + day + '-' +
    ((''+month).length<2 ? '0' : '') + month + '-' +
    d.getFullYear();
$("#current-date").text(today);

$('#select-dropdown').on("change", function(e) { 
  var selectedId = parseInt($(this).val());
  var mp = _.find(persons, function(p) { return p.id == selectedId; });

  $(".choose .single-mp").removeClass("selected");
  $("#recipient").text(mp.name);
  $(".selected-mp .mp-img-wrapper").css({"background-image": "url(" + mp.portrait_url + ")"});
  if (mp.party) $(".selected-mp .mp-img-wrapper .party-logo").attr("src", mp.party.icon_url);

  pymChild.sendHeight();
});
