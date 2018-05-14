$(window).on('load', function() {
    $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
});

$(".lazy-question .toggle-select").click(function () {
  pymChild.scrollParentToChildEl("email-landexpropriation");
  var lazyChoice = $(this).attr("id");
  $(".toggle-button-question.support .toggle-select[id='" + lazyChoice + "']").click();
});

var daysRemaining=(function(){
    var oneDay = 24*60*60*1000;
    var decision = new Date(2018, 5, 15, 23, 59);
    return Math.floor(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();


$(".days-remaining-number").text(daysRemaining + " days");

/* useful vars */
var supportsMotion = null;
var emailTxt = ""; // global for preview and then send
var emailData = {}; // literally whatever data we want to store along with the email
var submissionDeferred;

$(".support.toggle-button-question .toggle-select").click(function() {
  var $this = $(this);

  $(".support.toggle-button-question .toggle-select").removeClass("selected");
  $this.addClass("selected");

  supportsMotion = $this.attr('id') == "yes";
  emailData.supportsMotion = supportsMotion;
});

$(".appear.toggle-button-question .toggle-select").click(function() {
  var $this = $(this);

  $(".appear.toggle-button-question .toggle-select").removeClass("selected");
  $this.addClass("selected");

  appearCommittee = $this.attr('id') == "yes";
  emailData.appearCommittee = appearCommittee;
});

/* follow-up questions */
var senderSecret = null,
    emailId = null;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// follow up questions
var questions = [
  {
    q: "Which party do you plan to vote for in the 2019 general elections?",
    a: ["ANC", "DA", "EFF", "Other"],
  }, {
    q: "Which province do you live in?",
    a: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
  }, {
    q: "Do you live in a rural or urban area?",
    a: ["Rural", "Urban"],
  }, {
    q: "What is your race?",
    a: ["Black African", "Coloured", "White", "Asian or Indian", "Other"],
  }, {
    q: "How old are you?",
    a: ["Under 20", "20 - 29", "30 - 39", "40 or older"],
  },
];

function followUpQuestion() {
  var questionsLeft = questions.length;
  var randomNumber = getRandomInt(0, questionsLeft);
  var q = questions[randomNumber];

  ga('send', 'event', 'follow-up', 'asked', q.q);
  $('.follow-up-question p').text(q.q);
  $(".toggle-select-follow-up").remove();
  $.each(q.a, function(index, value) {
    $(".follow-up-answer-box").append("<span id='follow-up-answer-" + index + "' class='toggle-select-follow-up'>" + value + "</span>")
  });

  $(".toggle-select-follow-up").on('click', function () {
    var $this = $(this);
    var q = $('.follow-up-question').text().trim();
    var a = $this.text().trim();

    submit to server
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


    if (questionsLeft > 1) {
      questions.splice(randomNumber, 1);
      followUpQuestion();
    } else {
      $(".toggle-select-follow-up").remove();
      $(".follow-up-question p").text("Thank you!");
    }
  });
};

function emailSent() {
  ga('send', 'event', 'landexpropriation-email', 'sent');

  followUpQuestion();

  // prep sharing
  var msg = supportsMotion ? 'I support' : 'I do not support';
  $(".twitter-share, .fb-share").data("message", "I emailed Parliament's Constitutional Review Committee saying " + msg + " the motion on land expropriation without compensation. Send them an email and make your voice heard too.");

  $("#landexpropriation-preview-message").hide();
  $("#landexpropriation-sent").show();
  pymChild.scrollParentTo('contactmps-embed-parent');
}

$("#landexpropriation-preview-message").hide();
$("#landexpropriation-sent").hide();

$("#previewEmail").click(function(e) {
  e.preventDefault();
  var commentPersonal = $("#comment-personal").val()
  var commentSA = $("#comment-sa").val()
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  emailData.senderName = senderName;
  emailData.senderEmail = senderEmail;
  emailData.age = $('.question-age li.active').text();

  if (commentPersonal === '') {
    alert('Please explain how this motion affects you');
    $('#comment-personal').focus();
    return;
  };

  if (commentSA === '') {
    alert('Please explain how this motion affects South Africa');
    $('#comment-sa').focus();
    return;
  };

  if (senderName === '') {
    alert('Please enter your name');
    $('.name-input').focus();
    return;
  };

  if (senderEmail === '') {
    alert('Please enter your email');
    $('.email-input').focus();
    return;
  };

  if ($("#comment-personal").val() != "") {
    var commentPersonal = $("#comment-personal").val();
    emailData['otherIssues'] = commentPersonal.trim();
    commentPersonal = "\n\n" + (commentPersonal);
  } else {
    var commentPersonal = "";
  };

  if ($("#comment-sa").val() != "") {
    var commentSA = $("#comment-sa").val();
    emailData['otherIssues'] = commentSA.trim();
    commentSA = "\n\n" + (commentSA);
  } else {
    var commentSA = "";
  };

  if ($(".support .toggle-select.selected").attr("id") == "no") {
    var emailSubject = "I do not support the motion on land expropriation without compensation";
  }
  else if ($(".support .toggle-select.selected").attr("id") == "yes") {
    var emailSubject = "I support the motion on land expropriation without compensation";
  };

  if ($(".appear .toggle-select.selected").attr("id") == "no") {
    var senderAppear = "\n\nI do not want to appear before the committee for an oral presentation.";
  }
  else if ($(".appear .toggle-select.selected").attr("id") == "yes") {
    var senderAppear = "\n\nI would like to appear before the committee to give an oral presentation.";
  };

  $("#name").text(senderName);
  $("#email").text(senderEmail);
  $("#email-title").text(emailSubject);

  emailTxt = "Dear Pat Jayiya,\n\nI want to let you know that " + emailSubject + "." + commentPersonal + commentSA + senderAppear + "\n\nYou requested submissions on the review of section 25 of the Constitution. Please take my opinion into consideration.\n\nKind regards,\n" + senderName;
  emailHtml = emailTxt.replace(/\n/g, '<br/>');

  $("#comment-preview").html(emailHtml);
  $("#landexpropriation-build-message").hide();
  $("#landexpropriation-preview-message").show();
  location.hash = "#landexpropriation-preview-message";

  pymChild.scrollParentTo('contactmps-embed-parent');
});

$("#editEmail").click(function(e) {
  e.preventDefault();
  $("#landexpropriation-build-message").show();
  $("#landexpropriation-preview-message").hide();
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
      campaign_slug: 'landexpropriation',
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
