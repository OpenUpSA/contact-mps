var template = "Honourable Member {{{ recipient_name }}},\n\
\n\
I am a citizen from {{{ location }}}. I am {{{ concern }}} concerned about the levels of corruption in our country and I feel it is very important for my voice to be heard.\n\
In particular the upcoming vote of no confidence in parliament is something I feel I want to voice my opinion on. I would urge you {{{ action_request }}} the vote of no confidence.\n\
{{{ other_issues }}}\
\n\
As a member of parliament you represent all South Africans, including me. Please vote in favour of good governance - a governance that is best suited to realising my hopes for our future.\n\
\n\
Sincerely,\n\
{{{ sender_name }}}";

var reCaptchaValid = false;
var gReCaptchaValidated = function() {
  $("input[type=submit]").removeAttr('disabled');
  reCaptchaValid = true;
};

var gReCaptchaExpired = function() {
  $("input[type=submit]").attr('disabled','disabled');
  reCaptchaValid = false;
};

var recaptchaLoaded = function() {
  grecaptcha.render('recaptcha', {
    'sitekey': recaptchaKey,
    'callback': gReCaptchaValidated,
    'expired-callback': gReCaptchaExpired
  });
  if (typeof pymChild !== undefined) {
    pymChild.sendHeight();
  }
};

$(window).on('load', function() {
  if ($('.create-email-page').length > 0) {
    // load the data into the dropdown
    var mps = {};

    var data = persons.map(function(p) {
      mps[p.id] = p;

      return {
        id: p.id,
        text: p.name + (p.party ? (' - ' + p.party.name) : ''),
      };
    });
    data.sort(function(a, b) {
      return a.text.localeCompare(b.text);
    });

    $('select.use-select2').select2({
      data: data,
      placeholder: 'Choose an MP',
    });

    $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
  }
});

if ($('.create-email-page').length > 0) {
  $('select.choose-province').select2({
    placeholder: 'Where do you live?',
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

    if ($form.find('input[name=concern]:checked').length === 0) {
      alert("Please indicate how concerned you are with corruption in South africa");
      $form.find('input[name=concern]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('input[name=vote]:checked').length === 0) {
      alert("Please indicate whether you support the vote of no confidence");
      $form.find('input[name=vote]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('select[name=province]').val() === '') {
      alert("Please choose a province");
      $form.find('select[name=province]').focus();
      e.preventDefault();
      return;
    }

    if (!reCaptchaValid) {
      alert("Please prove you are human first");
      e.preventDefault();
      return;
    }

    updateBody($('form#email-form'));
    ga('send', 'event', 'submission');
  });

  var $form = $('form#email-form');
  $form.find('input, select, textarea').on('change', function(e) { updateBody($form); });
  updateBody($form);
}

function updateBody($form, recipientName) {
  var concern = $form.find('input[name=concern]:checked').val(),
      vote = $form.find('input[name=vote]:checked').val(),
      senderName = $form.find('input[name=name]').val();

  var issues = $form.find('[name=issues]').val();
  var otherIssues = "";

  if (issues) {
    otherIssues = "\nOther issues that I feel very strongly about are: \n" + issues + "\n";
  }

  var context = {
    'recipient_name': $(".recipient").first().text(),
    'concern': concern,
    'action_request': vote,
    'other_issues': otherIssues,
    'sender_name': senderName,
    'location': $form.find('select[name=province]').val()
  };
  var body = Mustache.render(template, context);
  $form.find('input[name=body]').val(body);
}

function chooseMP(mp) {
  // mark an MP as chosen
  $(".choose .single-mp").removeClass("selected");
  $('.single-mp[data-id=' + mp.id + ']').addClass('selected');
  // we pick up the MP name from here so fix message composition if you change this
  $(".recipient").text(mp.name);
  $(".selected-mp .mp-img-wrapper").css({"background-image": mp.portrait_url ? ('url(' + mp.portrait_url + ')') : ''});
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", mp.party ? mp.party.icon_url : '');
  $(".pa-link").attr("href", mp.pa_url);
  $("form input[name=person]").val(mp.id);

  updateBody($('form#email-form'));
  pymChild.sendHeight();
}

$(".choose .single-mp").click(function() {
  var selectedId = parseInt($(this).data('id'));
  chooseMP(mps[selectedId]);
});

$('#select-dropdown').on("change", function(e) {
  var selectedId = parseInt($(this).val());
  chooseMP(mps[selectedId]);
});

$(".choose .single-mp").first().click();
