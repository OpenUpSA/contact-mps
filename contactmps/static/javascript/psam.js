var template = "Honourable Member {{{ recipient_name }}},\n\
\n\
As an elected representative of the people you will soon be required to cast a vote in the Motion of No Confidence tabled against President Zuma.\n\
\n\
I have seen that Parliament has not always lived up to what the Constitution requires of it and has shown a weakness in holding the President and his Cabinet to account. It is worrying that this Parliament has failed to hold the President or his cabinet to account on the following issue(s) that are important to me:\n\
\n\
{{{ reasons }}}\n\
\n\
It is for these reasons that I do not have confidence in the President of the Republic and his cabinet.\n\
\n\
I trust that you will make my voice heard and vote to make sure the President and his Cabinet are held to account. I trust you will vote to represent the people, ensuring government by us under the Constitution.\n\
\n\
I hope that the vote that you cast will restore my trust in you, in Parliament and in government. I trust that your vote will be loyal to the Constitution, the Republic and its people.\n\
\n\
Sincerely,\n\
{{{ sender_name }}}\n\
{{{ location }}}";

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

$(function() {
  if ($('.create-email-page').length > 0) {
    $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
  }
});

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

    $(".choose .single-mp").click(function() {
      var selectedId = parseInt($(this).data('id'));
      chooseMP(mps[selectedId]);
    });

    $('#select-dropdown').on("change", function(e) {
      var selectedId = parseInt($(this).val());
      chooseMP(mps[selectedId]);
    });

    $(".choose .single-mp").first().click();

    $('select.use-select2').select2({
      data: data,
      placeholder: 'Choose an MP',
    });
  }
});

if ($('.create-email-page').length > 0) {
  $('select.choose-province').select2({
    placeholder: 'Your province',
  });

  $('form#email-form').on('submit', function(e) {
    var $form = $(this);

    if ($form.find('input[name=name]').val() === '') {
      alert("Please enter your name");
      $form.find('input[name=name]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('select[name=province]').val() === '') {
      alert("Please choose a province");
      $form.find('select[name=province]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('textarea[name=reasons]').val() === '') {
      alert("Please give your own reasons for sending this message.");
      $form.find('textarea[name=reasons]').focus();
      e.preventDefault();
      return;
    }

    if ($form.find('input[name=email]').val() === '') {
      $form.find('input[name=email]').val('noconfidence2017@gmail.com');
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
  var senderName = $form.find('input[name=name]').val();

  var context = {
    'recipient_name': $(".recipient").first().text(),
    'reasons': $form.find('textarea[name=reasons]').val(),
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
