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

$('select.use-select2').select2();

$('select.selectpicker').on('rendered.bs.select', function (e) {
  pymChild.sendHeight();
});

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

$('#select-dropdown').on("select2:select", function(e) { 
  var selectedMember = $('option:selected', this).attr('name');
  console.log(selectedMember);
  var selectedImage = $('option:selected', this).attr('image');
  console.log(selectedImage);
  var selectedParty = $('option:selected', this).attr('party');
  console.log(selectedParty);
  var selectedPartyLogo = $('option:selected', this).attr('partyImage');
  console.log(selectedPartyLogo);

  $(".choose .single-mp").removeClass("selected");
  $("#recipient").text(selectedMember);
  $(".selected-mp .mp-img-wrapper").css({"background-image": "url(" + selectedImage + ")"});
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", selectedPartyLogo);
  pymChild.sendHeight();
});