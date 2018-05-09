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
  $('.twitter-share').data('message', 'I wrote an open letter to about being heard in Parliament. Join me.');
  $('.fb-share').data('message', 'I wrote an open letter to about being heard in Parliament, you should too.');

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
  ga('send', 'event', 'click', 'preview');

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

  ga('send', 'event', 'screen', 'shown', 'preview');
  $("#build-message").hide();
  $("#preview-message").show();
  location.hash = "#preview-message";

  pymChild.scrollParentTo('contactmps-embed-parent');
  pymChild.sendHeight();
});

$("#editMessage").click(function(e) {
  e.preventDefault();
  ga('send', 'event', 'click', 'edit-message');
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
      $("#email-detail-link").html("<br>Or <a href=\"" + emailDetailUrl + "\">copy this link to share elsewhere</a><br><br>");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      ga('send', 'event', 'error', 'submit', textStatus + "\n" + jqXHR.responseText);
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
