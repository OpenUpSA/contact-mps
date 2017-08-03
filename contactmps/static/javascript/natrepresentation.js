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

var daysRemaining=(function(){
    var oneDay = 24*60*60*1000;
    var decision = new Date(2017, 7, 8, 23, 59);
    return Math.floor(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();

$(".days-remaining-number").text(daysRemaining + " days");


/* useful vars */
var selectedMP = null;
var supportsSecret = null;
var emailTxt = ""; // global for preview and then send
// literally whatever data we want to store along with the email
var emailData = {
  allowPublicListing: true // It's an open letter in this campaign
};
var submissionDeferred;

$("#previewEmail").prop("disabled", false);


$(".multiple-choice .option").click(function() {
  var $this = $(this);

  $this.siblings(".multiple-choice .option").removeClass("selected");
  $this.addClass("selected");
  $("#previewEmail").prop("disabled", false);

  supportsSecret = $this.attr('id') == "yes";
  emailData.supportsSecret = supportsSecret;
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
  ga('send', 'event', 'secret-ballot-email', 'sent');

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
  var msg = supportsSecret ? 'I support' : 'I do not support';
  $('.twitter-share').data('message', 'I emailed Baleka Mbete saying ' + msg + ' a secret ballot. Make your voice heard too @MbeteBaleka');
  $('.fb-share').data('message', 'I emailed Baleka Mbete saying ' + msg + ' a secret ballot. Send her an email and make your voice heard too.');

  $("#preview-message").hide();
  $("#message-sent").show();
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

$("#preview-message").hide();
$("#message-sent").hide();

$("#previewEmail").click(function(e) {
  e.preventDefault();
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = "Representation of the public in the national assembly";
  var letterContent = $(".letter-content").val();

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

  if (letterContent === '') {
    alert('Please write your letter');
    $('.letter-content').focus();
    return;
  }

  $("#name").text(senderName);
  $("#email").text(senderEmail);
  $("#email-title").text(emailSubject);
  $("#letter-preview").text("Dear so and so" + letterContent + "With kind regards, " + senderName);

  $("#build-message").hide();
  $("#preview-message").show();
  location.hash = "#preview-message";

  emailTxt = "Dear MP,\n\nThis is my message:" + letterContent  + "With kind regards, " + senderName;
  emailHtml = emailTxt.replace(/\n/g, '<br/>');

  pymChild.scrollParentTo('contactmps-embed-parent');
});

$("#editMessage").click(function(e) {
  e.preventDefault();
  $("#build-message").show();
  $("#preview-message").hide();
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

$('#representation').on('submit', submitForm);

function triggerSubmit() {
  $('#representation').submit();
}

function submitForm(e) {
  e.preventDefault();

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

var template = "Honourable Member {{{ recipient_name }}},\n\n{{{ content }}}\n{{{ other_issues }}}\
\nAs a member of parliament you represent all South Africans, including me. Please vote in favour of good governance - a governance that is best suited to realising my hopes for our future.\n\nSincerely,\n{{{ sender_name }}}";

function updateBody($form, recipientName) {
  var senderName = $form.find('input[name=name]').val();
  var letterContent = $form.find('[name=letter-content]').val();

  var context = {
    'recipient_name': "Piet Keizer",
    'content': letterContent,
    'other_issues': " other issues we might include ",
    'sender_name': senderName,
  };
  var body = Mustache.render(template, context);
  $form.find('input[name=body]').val(body);
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

  updateBody($('form#email-form'));
  pymChild.sendHeight();
}
