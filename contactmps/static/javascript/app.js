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
  data = _.sortBy(data, 'text');

  $('select.use-select2').select2({
    data: data,
    placeholder: 'Choose an MP',
  });

  $('form#email-form').on('submit', function(e) {
    // XXX: correctly build the email body
    var $form = $(this),
        text = $form.find('.email-textarea').text();
    $(this).find('input[name=body]').val(text);
  });
}

function chooseMP(mp) {
  // mark an MP as chosen
  $(".choose .single-mp").removeClass("selected");
  $('.single-mp[data-id=' + mp.id + ']').addClass('selected');

  $("#recipient").text(mp.name);
  $(".selected-mp .mp-img-wrapper").css({"background-image": mp.portrait_url ? ('url(' + mp.portrait_url + ')') : ''});
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", mp.party ? mp.party.icon_url : '');
  $("form input[name=person]").val(mp.id);

  pymChild.sendHeight();
}

$(".choose .single-mp").click(function() {
  var selectedId = parseInt($(this).data('id')),
      mp = _.find(persons, function(p) { return p.id == selectedId;});
  chooseMP(mp);
});

$('#select-dropdown').on("change", function(e) { 
  var selectedId = parseInt($(this).val()),
      mp = _.find(persons, function(p) { return p.id == selectedId; });
  chooseMP(mp);
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
