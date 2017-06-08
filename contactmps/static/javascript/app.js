$('select.selectpicker').on('rendered.bs.select', function (e) {
  pymChild.sendHeight();
});

$(".choose .single-mp").click(function() {
  $(".choose .single-mp").removeClass("selected");
  $(this).addClass("selected");
  $(".send-block").removeClass("hidden");
  var selectedMember = $(".mp-name", this).text();
  $("#recipient").text(selectedMember);
  var selectedImage = $(".mp-img-wrapper", this).css("background-image");
  $(".selected-mp .mp-img-wrapper").css({"background-image": selectedImage});
  var selectedParty = $(".mp-img-wrapper .party-logo", this).attr("src");
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", selectedParty);
  pymChild.sendHeight();
});

var d = new Date();
var month = d.getMonth()+1;
var day = d.getDate();
var today = 
    ((''+day).length<2 ? '0' : '') + day + '-' +
    ((''+month).length<2 ? '0' : '') + month + '-' +
    d.getFullYear();
$("#current-date").text(today);
