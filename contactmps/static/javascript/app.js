var gReCaptchaValidated = function() {
  $("input[type=submit]").removeAttr('disabled');
};

var gReCaptchaExpired = function() {
  $("input[type=submit]").attr('disabled','disabled');
};

var recaptchaLoaded = function() {
  grecaptcha.render('recaptcha', {
    'sitekey': recaptchaKey,
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

  $('select.choose-province').select2({
    placeholder: 'Choose your province',
  });

  $('form#email-form').on('submit', function(e) {
    var $form = $(this);

    if ($form.find('input[name=name]').val() === '') {
      alert("Please enter your name");
      $form.find('input[name=name]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('input[name=email]').val() === '') {
      alert("Please enter your email");
      $form.find('input[name=email]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('textarea[name=reasons]').val() === '') {
      alert("Please tell us why this is important to you");
      $form.find('textarea[name=reasons]').focus();
      e.preventDefault();
      return;
    }
  });
}

function chooseMP(mp) {
  // mark an MP as chosen
  $(".choose .single-mp").removeClass("selected");
  $('.single-mp[data-id=' + mp.id + ']').addClass('selected');

  $("#recipient").text(mp.name);
  $(".selected-mp .mp-img-wrapper").css({"background-image": mp.portrait_url ? ('url(' + mp.portrait_url + ')') : ''});
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", mp.party ? mp.party.icon_url : '');
  $(".pa-link").attr("href", mp.pa_url);
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
