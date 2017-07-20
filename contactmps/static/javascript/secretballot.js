$(window).on('load', function() {
    $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
});

var daysRemaining=(function(){
    var oneDay = 24*60*60*1000;
    var decision = new Date(2017, 7, 8, 23, 59);
    return Math.floor(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();

$(".days-remaining-number").text(daysRemaining + " days");


/* useful vars */
var supportsSecret = null;
var emailTxt = ""; // global for preview and then send
var emailData = {}; // literally whatever data we want to store along with the email
var submissionDeferred;

$(".toggle-button-question .toggle-select").click(function() {
  var $this = $(this);

  $(".toggle-button-question .toggle-select").removeClass("selected");
  $this.addClass("selected");
  $("#previewEmail").prop("disabled", false);

  supportsSecret = $this.attr('id') == "yes";
  emailData.supportsSecret = supportsSecret;
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
  ga('send', 'event', 'secret-ballot-email', 'sent');

  // prep follow up questions
  var questions = [
    {
      q: "Have you ever participated in a protest march?",
      a: ["YES, I have", "NO, I have not"],
    }, {
      q: "Is this your first time emailing a Member of Parliament?",
      a: ["YES, it is", "NO, it is not"],
    }, {
      q: "Do you know that all MPs are assigned a constituency, and represent those who live in it?",
      a: ["YES, I know about that", "NO, I did not know"],
    },
  ];
  var q = questions[getRandomInt(0, questions.length)];

  ga('send', 'event', 'follow-up', 'asked', q.q);
  $('.follow-up-question p').text(q.q);
  $('#follow-up-answer-1').text(q.a[0]);
  $('#follow-up-answer-2').text(q.a[1]);

  // prep sharing
  var msg = supportsSecret ? 'I support' : 'I do not support';
  $('.twitter-share').data('message', 'I just emailed Baleka Mbete saying ' + msg + ' a secret ballot. Send an email and make your voice heard. @MbeteBaleka');
  $('.fb-share').data('message', 'I just emailed Baleka Mbete saying ' + msg + ' a secret ballot. Send an email and make your voice heard.');

  $("#secret-ballot-preview-message").hide();
  $("#secret-ballot-sent").show();
  pymChild.scrollParentTo('contactmps-embed-parent');
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

$("#secret-ballot-preview-message").hide();
$("#secret-ballot-build-message").hide();

$("#previewEmail").click(function(e) {
  e.preventDefault();
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  emailData.senderName = senderName;
  emailData.senderEmail = senderEmail;
  emailData.age = $('.question-age li.active').text();

  if (senderName === '') {
    alert('Please enter your name');
    $('.name-input').focus();
    return;
  }

  if (senderEmail === '') {
    alert('Please enter your email');
    $('.email-input').focus();
    return;
  }

  if ($("#comment").val() != "") {
    var otherIssues = $("#comment").val();
    emailData['otherIssues'] = otherIssues.trim();
    otherIssues = "\n\nOther issues that concern me about the future of South Africa are:\n\n" + (otherIssues);
  } else {
    var otherIssues = "";
  };
  if ($(".toggle-select.selected").attr("id") == "no") {
    var emailSubject = "I do not support a secret ballot in the vote of no confidence";
  }
  else if ($(".toggle-select.selected").attr("id") == "yes") {
    var emailSubject = "I support a secret ballot in the vote of no confidence";
  };
  $("#name").text(senderName);
  $("#email").text(senderEmail);
  $("#email-title").text(emailSubject);

  emailTxt = "Dear Madam Speaker,\n\nI am a citizen of South Africa and I want to let you know that " + emailSubject + " in President Jacob Zuma." + otherIssues + "\n\nYou represent all South Africans, including me. Please choose in favour of good governance - a governance that is best suited to realising my hopes for our future.\n\nYours sincerely,\n\n" + senderName;
  emailHtml = emailTxt.replace(/\n/g, '<br/>');

  $("#comment-preview").html(emailHtml);
  $("#secret-ballot-build-message").hide();
  $("#secret-ballot-preview-message").show();
  location.hash = "#secret-ballot-preview-message";

  pymChild.scrollParentTo('contactmps-embed-parent');
});

$("#editEmail").click(function(e) {
  e.preventDefault();
  $("#secret-ballot-build-message").show();
  $("#secret-ballot-preview-message").hide();
  location.hash = "#email-secret";
  pymChild.scrollParentTo('contactmps-embed-parent');
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

$('#email-secret').on('submit', submitForm);

function triggerSubmit() {
  $('#email-secret').submit();
}

function submitForm(e) {
  e.preventDefault();

  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = $("#email-title").text();

  submissionDeferred = jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: recipient.id,
      name: senderName,
      email: senderEmail,
      body: emailTxt,
      subject: emailSubject,
      anyData: JSON.stringify(emailData),
      gRecaptchaResponse: grecaptcha.getResponse(),
    },
    success: function(data) {
      console.info("success", data);

      senderSecret = data.sender_secret;
      emailId = data.secure_id;
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
