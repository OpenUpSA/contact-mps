$(window).on('load', function() {
    $('body').append($("<script src='https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit' async defer></script>"));
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

  $(".toggle-button-question.support").removeClass("unanswered");

  $(".support.toggle-button-question .toggle-select").removeClass("selected");
  $this.addClass("selected");

  supportsMotion = $this.attr('id') == "yes";
  emailData.supportsMotion = supportsMotion;
});

$(".barrier.toggle-button-question .toggle-select").click(function() {
  var $this = $(this);

  $(".toggle-button-question.barrier").removeClass("unanswered");

  $(".barrier.toggle-button-question .toggle-select").removeClass("selected");
  $this.addClass("selected");

  sectionBarrier = $this.attr('id') == "yes";
  emailData.sectionBarrier = sectionBarrier;

  $(".barrier-text textarea").removeAttr("disabled");

  if ( $(this).hasClass("true") ) {
    $(".barrier-text .question").text("How can section 25 be changed to overcome its limitations?")
  } else {
    $(".barrier-text .question").text("What solutions are there to fast track land reform?")
  }
});

$(".appear.toggle-button-question .toggle-select").click(function() {
  var $this = $(this);

  $(".toggle-button-question.appear").removeClass("unanswered");

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
    q: "Are you willing to be contacted by a journalist to elaborate on your answers?",
    a: ["Yes", "No"],
  },
  {
    q: "Which province do you live in?",
    a: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
  }, {
    q: "Do you live in a rural or urban area?",
    a: ["Rural", "Urban"],
  }, {
    q: "How old are you?",
    a: ["Under 20", "20 - 29", "30 - 39", "40 or older"],
  },
];

function followUpQuestion() {
  var questionsLeft = questions.length;
  var q = questions[0];

  ga('send', 'event', 'follow-up', 'asked', q.q);
  $('.follow-up-question p').text(q.q);
  $(".toggle-select-follow-up").remove();
  $.each(q.a, function(index, value) {
    $(".follow-up-answer-box").append("<span id='follow-up-answer-" + index + "' class='toggle-select-follow-up'>" + value + "</span>")
  });

  $(".toggle-select-follow-up").on('click', function(e) {
    e.preventDefault();

    var $this = $(this);
    var q = $('.follow-up-question').text().trim();
    var a = $this.text().trim();

    jQuery.ajax('/api/v1/email/' + emailId + '/qa/', {
      type: 'POST',
    	data: {
      	sender_secret: senderSecret,
        question: q,
        answer: a,
      },
      success: function(data) {
        console.info(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
      }
    });

    ga('send', 'event', 'follow-up', 'answered', q);

    if (questionsLeft > 1) {
      questions.splice(0, 1);
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
  var changesSolutions = $("#changes-solutions").val()
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  emailData.senderName = senderName;
  emailData.senderEmail = senderEmail;

  if ( $(".toggle-button-question.support").hasClass("unanswered") ) {
    alert('Please indicate if you support the motion or not');
    $('.toggle-button-question support').focus();
    return;
  }

  if (commentPersonal === '') {
    alert('Please explain how the law would affect you');
    $('#comment-personal').focus();
    return;
  };

  if ( $(".toggle-button-question.barrier").hasClass("unanswered") ) {
    alert('Please indicate if you see section 25 as a barrier to transforming apartheid land inequality');
    $('.toggle-button-question barrier').focus();
    return;
  }

  if (changesSolutions === '') {
    alert('Please answer question 4');
    $('#changes-solutions').focus();
    return;
  };

  if ( $(".toggle-button-question.appear").hasClass("unanswered") ) {
    alert('Please indicate if you are willing to appear before the committee to give an oral presentation');
    $('.toggle-button-question appear').focus();
    return;
  }

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

  var commentPersonal = $("#comment-personal").val();
  emailData['affectPersonal'] = commentPersonal.trim();
  commentPersonal = "\n" + (commentPersonal);

  var changesSolutions = $("#changes-solutions").val();
  emailData['changesSolutions'] = changesSolutions.trim();
  changesSolutions = "\n" + (changesSolutions);

  if ($(".support .toggle-select.selected").attr("id") == "no") {
    var emailSubject = "I do not support the motion on land expropriation without compensation";
  }
  else if ($(".support .toggle-select.selected").attr("id") == "yes") {
    var emailSubject = "I support the motion on land expropriation without compensation";
  };

  if ($(".barrier .toggle-select.selected").attr("id") == "no") {
    var section25Barrier = "\n\n<h4>I do not think section 25 is a barrier to transforming apartheid land inequality</h4>";
  }
  else if ($(".barrier .toggle-select.selected").attr("id") == "yes") {
    var section25Barrier = "\n\n<h4>I think section 25 is a barrier to transforming apartheid land inequality</h4>";
  };

  if ($(".barrier .toggle-select.selected").attr("id") == "no") {
    var suggestions = "\n<b>Solutions to fast track land reform</b>";
  }
  else if ($(".barrier .toggle-select.selected").attr("id") == "yes") {
    var suggestions = "\n<b>How section 25 should be changed</b>";
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

  emailTxt = "Dear Chairperson,\n\nI want to let you know that " + emailSubject + "." + "\n\n<b>How the law would affect me</b>" + commentPersonal + section25Barrier + suggestions + changesSolutions + senderAppear + "\n\nYou requested submissions on the review of section 25 of the Constitution. Please take my opinion into consideration.\n\nKind regards,\n" + senderName;
  emailHtml = emailTxt.replace(/\n/g, '<br/>');

  $("#comment-preview").html(emailHtml);

  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  if ( isEmail(senderEmail) == true ) {
    $("#landexpropriation-build-message").hide();
    $("#landexpropriation-preview-message").show();
    location.hash = "#landexpropriation-preview-message";
    pymChild.scrollParentTo('contactmps-embed-parent');
  } else {
    alert("Please enter a valid email address");
  }
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
  $("input[type=submit]").removeClass('disabled');
  reCaptchaValid = true;
};

var gReCaptchaExpired = function() {
  $("input[type=submit]").attr('disabled','disabled');
  $("input[type=submit]").addClass('disabled');
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

$('#email-landexpropriation').on('submit', submitForm);

function triggerSubmit() {
  if (reCaptchaValid == true) {
    $('#email-landexpropriation').submit();
  }
}

function submitForm(e) {
  e.preventDefault();

  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = $("#email-title").text();

  submissionDeferred = jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      recipient_entity: recipient.id,
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
