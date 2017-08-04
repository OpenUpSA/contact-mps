/* useful vars */
var selectedMP = null;
var supportsSecret = null;
var emailTxt = ""; // global for preview and then send
// literally whatever data we want to store along with the email
var emailData = {
  allowPublicListing: true // It's an open letter in this campaign
};
var submissionDeferred;

if (!getParameterByName("embedded")) {
  $('#title').show();
  $('#intro').show();
}

$(window).on('load', function() {
  // load the data into the dropdown
  var mps = {};

  var data = persons.map(function(p) {
    mps[p.id] = p;

    return {
      id: p.id,
      text: p.name + (p.party ? (' - ' + p.party.abbr) : ''),
    };
  });

  data.sort(function(a, b) {
    return a.text.localeCompare(b.text);
  });

  $(".choose-mp .single-mp").click(function() {
    var selectedId = parseInt($(this).data('id'));
    chooseMP(mps[selectedId]);
  });

  $(".neglected-mps .single-mp").first().click();

  $('#select-dropdown').on("change", function(e) {
    var selectedId = parseInt($(this).val());
    chooseMP(mps[selectedId]);
  });

  $('select.use-select2').select2({
    data: data,
    placeholder: 'Choose an MP',
  });

  $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
});

$("#previewEmail").prop("disabled", false);

$(".multiple-choice .option").click(function() {
  var $this = $(this);

  $this.siblings(".multiple-choice .option").removeClass("selected");
  $this.addClass("selected");
  $("#previewEmail").prop("disabled", false);
});

$(".checkbox .option").click(function() {
  var $this = $(this);

  $this.toggleClass("selected");
});

$(".choose-one li").on('click', function(e) {
  var $this = $(this);
  $this.siblings().removeClass('active');
  $this.addClass('active');
});


/* follow-up questions */
var senderSecret = null,
    emailId = null;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function emailSent() {
  ga('send', 'event', 'representation-email', 'sent');

  // prep follow up questions
  var questions = [
    {
      q: "Would you like to get updates about tools such as this?",
      a: ["Yes, please", "No, thanks"],
    },
  ];
  var q = questions[getRandomInt(0, questions.length)];

  ga('send', 'event', 'follow-up', 'asked', q.q);
  $('.follow-up-question p').text(q.q);
  $('#follow-up-answer-1').text(q.a[0]);
  $('#follow-up-answer-2').text(q.a[1]);

  // prep sharing
  $('.twitter-share').data('message', 'I wrote an open letter to ' + selectedMP.name + ' about being heard in Parliament. Join me.');
  $('.fb-share').data('message', 'I wrote an open letter to ' + selectedMP.name + ' about being heard in Parliament, you should too.');

  $("#preview-message").hide();
  $("#message-sent").show();
  pymChild.scrollParentTo('contactmps-embed-parent');
  pymChild.sendHeight();
}

$(".follow-up-question-box .toggle-select-follow-up").click(function() {
  var $this = $(this);

  $(".follow-up-question-box .toggle-select-follow-up").removeClass("selected");
  $this.addClass("selected");

  var q = $('.follow-up-question').text().trim();
  var a = $this.text().trim();

  $('.follow-up-question p').text('Thanks!');
  $('.follow-up-answer-box').hide();

  // submit to server
  submissionDeferred.done(function() {
    jQuery.ajax('/api/v1/email/' + emailId + '/qa/', {
      type: 'POST',
      data: {
        question: q,
        answer: a,
        sender_secret: senderSecret,
      },
    });
  });

  ga('send', 'event', 'follow-up', 'answered', q);
});

$("#preview-message").hide();
$("#message-sent").hide();
pymChild.sendHeight();

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function error(message, id) {
  id = id || '#preview-error';
  $(id).text(message).show();
}

$("#previewEmail").click(function(e) {
  $('#preview-error').hide();

  e.preventDefault();
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = "Representation of the public in Parliament";
  var sufficientlyRepresentedOptions = $('#sufficiently-represented .option.selected');
  var howShouldVoiceHeard = $('#how-should-voice-heard textarea').val();
  var concerns = $('#concerns textarea').val();
  var province = $('select[name=province]').val();

  /** VALIDATION **/

  if (senderName === '') {
    error('Please enter your name');
    $('.name-input').focus();
    return;
  }

  if (senderEmail === '' || !validateEmail(senderEmail)) {
    error('Please enter a valid email address');
    $('.email-input').focus();
    return;
  }

  if (province === null) {
    error('Please select your province');
    $('select[name=province]').focus();
    return;
  }

  if (sufficientlyRepresentedOptions.length !== 1) {
    error('Please indicate whether you feel sufficiently-represented');
    pymChild.scrollParentToChildEl('sufficiently-represented');
    return;
  }

  if (howShouldVoiceHeard === '') {
    error('Please indicate how you\'d like to make your voice heard');
    $('#how-should-voice-heard').focus();
    return;
  }

  emailTxt = composeMessage();
  emailHtml = emailTxt.replace(/\n/g, '<br/>');

  $("#name").text(senderName);
  $("#email").text(senderEmail);
  $("#email-title").text(emailSubject);
  $("#letter-preview").html(emailHtml);

  $("#build-message").hide();
  $("#preview-message").show();
  location.hash = "#preview-message";

  pymChild.scrollParentTo('contactmps-embed-parent');
  pymChild.sendHeight();
});

$("#editMessage").click(function(e) {
  e.preventDefault();
  $("#build-message").show();
  $("#preview-message").hide();
  location.hash = "#email-secret";
  pymChild.scrollParentTo('contactmps-embed-parent');
  pymChild.sendHeight();
});

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

$('#representation').on('submit', submitForm);

function triggerSubmit() {
  $('#representation').submit();
}

function submitForm(e) {
  e.preventDefault();

  if (!reCaptchaValid) {
    error("Please prove you are human first", "#submit-error");
    pymChild.scrollParentToChildEl('recaptcha');
    return;
  }

  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = $("#email-title").text();

  submissionDeferred = jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: selectedMP.id,
      name: senderName,
      email: senderEmail,
      body: emailTxt,
      subject: emailSubject,
      anyData: JSON.stringify(emailData),
      gRecaptchaResponse: grecaptcha.getResponse(),
      campaign_slug: 'natrepresentation',
    },
    success: function(data) {
      console.info("success", data);

      senderSecret = data.sender_secret;
      emailId = data.secure_id;
      emailDetailUrl = 'https://noconfidencevote.openup.org.za/email/' + emailId + '/'
      $('.twitter-share').data('url', emailDetailUrl);
      $('.facebook-share').data('url', emailDetailUrl);
      $("#view-letter-link").attr("href", "/email/" + emailId);
      $("#email-detail-link").html("<br>Or <a href=\"" + emailDetailUrl + "\">copy this link to share elsewhere</a><br>");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });

  emailSent();
}

// https://stackoverflow.com/a/901144/1305080
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getParentUrl() {
  return getParameterByName('parentUrl');
}

$(function() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'environment',
    eventAction: 'loaded-by-parent-url',
    eventLabel: getParentUrl()
  });
});

var template = "Hon. {{{ recipient_name }}},\n\nAs a democratically elected member of Parliament, you represent me, my concerns and my hopes for the future of South Africa.\n\nI {{{ sufficiently_represented }}}that members of Parliament represent me sufficiently as a citizen, in the National Assembly.\n\n{{{ how_voice_heard }}}.\n\nI would like to be able to raise my concerns about issues of national government with you by {{{ how_should_voice_heard }}}.\n\n{{{ concerns }}}I believe it is important that I and other South Africans can have our concerns heard by national Government. I hope that we can work together to find effective ways of being heard.\n\nSincerely,\n{{{ sender_name }}}\n{{{ province }}}\n";

function composeMessage() {
  var sufficientlyRepresentedOption = $('#sufficiently-represented .option.selected').data('value');
  var howVoiceHeardOptions = $('#how-voice-heard .option.selected').map(
    function() { return $(this).data('value'); }).get(); // This get() is Reeeeeeally important
  //   ... because without it we have a jQuery collection which doesn't have
  //   ... join and causes cross-site request issues.
  var howElseVoiceHeard = $('#how-else-voice-heard textarea').val();
  var voiceHeardOutcome = $('#voice-heard-outcome .option.selected').data('value');
  var howShouldVoiceHeard = $('#how-should-voice-heard textarea').val();
  var concernsAnswer = $('#concerns textarea').val();
  var senderName = $('input[name=input-name]').val();
  var province = $('select[name=province]').val();
  var sufficientlyRepresented,
      howVoiceHeard,
      concerns;

  if (howElseVoiceHeard !== "")
    howVoiceHeardOptions.push(howElseVoiceHeard);

  if (sufficientlyRepresentedOption === "yes")
    sufficientlyRepresented = "feel ";
  else if (sufficientlyRepresentedOption === "no")
    sufficientlyRepresented = "do not feel ";
  else if (sufficientlyRepresentedOption === "unsure")
    sufficientlyRepresented = "am not sure ";

  var haveTried = "I've sought national representation by ";
  if (howVoiceHeardOptions.length === 0)
    howVoiceHeard = "I have not tried institutional mechanisms for seeking national representation"
  else if (howVoiceHeardOptions.length === 1)
    howVoiceHeard = haveTried + howVoiceHeardOptions[0];
  else if (howVoiceHeardOptions.length === 2)
    howVoiceHeard = haveTried + howVoiceHeardOptions[0] + " and " + howVoiceHeardOptions[1];
  else
    howVoiceHeard = haveTried + howVoiceHeardOptions.slice(0, -1).join(", ") + ", and " + howVoiceHeardOptions.slice(-1)[0];

  if (concernsAnswer !== '')
    concerns = "My biggest concerns about South Africa are " + concernsAnswer + ".\n\n";
  else
    concerns = ''

  var context = {
    'recipient_name': selectedMP.name,
    'sufficiently_represented': sufficientlyRepresented,
    'how_else_voice_heard': howElseVoiceHeard,
    'how_voice_heard': howVoiceHeard,
    'voice_heard_outcome': voiceHeardOutcome,
    'how_should_voice_heard': howShouldVoiceHeard,
    'concerns': concerns,
    'sender_name': senderName,
    'province': province
  };
  emailData.sufficientlyRepresentedOption = sufficientlyRepresentedOption;
  emailData.sufficientlyRepresented = sufficientlyRepresented;
  emailData.howVoiceHeardOptions = howVoiceHeardOptions;
  emailData.howVoiceHeard = howVoiceHeard;
  emailData.howElseVoiceHEard = howElseVoiceHeard;
  emailData.voiceHeardOutcome = voiceHeardOutcome;
  emailData.howShouldVoiceHeard = howShouldVoiceHeard;
  emailData.concernsAnswer = concernsAnswer;
  emailData.concerns = concerns;
  emailData.province = province;

  console.log(emailData);
  return Mustache.render(template, context);
}

function chooseMP(mp) {
  // mark an MP as chosen
  $(".choose-mp .single-mp").removeClass("selected");
  $(".selected-mp-wrap").removeClass("hidden");
  $('.single-mp[data-id=' + mp.id + ']').addClass('selected');
  // we pick up the MP name from here so fix message composition if you change this
  $(".recipient").text(mp.name);
  $(".selected-mp .mp-img-wrapper").css({"background-image": mp.local_portrait_url ? ('url(' + mp.local_portrait_url + ')') : ''});
  $(".selected-mp .mp-img-wrapper .party-logo").attr("src", mp.party ? mp.party.icon_url : '');
  $(".pa-link").attr("href", mp.pa_url);
  $("form input[name=person]").val(mp.id);
  selectedMP = mp;

  composeMessage();
  pymChild.sendHeight();
}
