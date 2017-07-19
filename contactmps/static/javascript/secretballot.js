var daysRemaining=(function(){ 
    var oneDay = 24*60*60*1000;
    var decision = new Date(2017, 6, 25, 23, 59);
    return Math.floor(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();

$(".days-remaining-number").text(daysRemaining + " days");

$(".toggle-button-question .toggle-select").click(function() {
  $(".toggle-button-question .toggle-select").removeClass("selected");
  $(this).addClass("selected");
  $("#previewEmail").removeClass("disabled");
});

$(".protest-march-answer-box .toggle-select-protest").click(function() {
  $(".protest-march-answer-box .toggle-select-protest").removeClass("selected");
  $(this).addClass("selected");
});

// $("#secret-ballot-preview-message").hide();
// $("#secret-ballot-sent").hide();

$("#previewEmail").click(function(e) {
  e.preventDefault();
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  if ($("#comment").val() != "") {
    var emailContent = "<p>Other issues that concern me about the future of South Africa are:</p><p>" + ($("#comment").val().replace(/\n/g, '<br>'))
  } else {
    var emailContent = "";
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

  $("#comment-preview").html("<p>Dear Madam Speaker,</p><p>I am a citizen of South Africa and I want to let you know that <b>" + emailSubject + " in President Jacob Zuma</b>.</p>" + emailContent + "</p><p>You represent all South Africans, including me. Please choose in favour of good governance - a governance that is best suited to realising my hopes for our future.</p><p>Yours sincerely,</p><p>" + senderName + "</p>");
  // $("#secret-ballot-build-message").hide();
  $("#secret-ballot-preview-message").show();
  location.hash = "#secret-ballot-preview-message";
});

$("#editEmail").click(function(e) {
  e.preventDefault();
  $("#secret-ballot-build-message").show();
  // $("#secret-ballot-preview-message").hide();
  location.hash = "#email-secret";
});

function submitForm() {
  var senderName = $(".name-input").val();
  var senderEmail = $(".email-input").val();
  var emailSubject = $("#email-title").text();
  var emailContent = $("#comment-preview").html();

  jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: 7720,
      name: senderName,
      email: senderEmail,
      body: emailContent,
      subject: emailSubject,
      // gRecaptchaResponse: grecaptcha.getResponse();,
    },
    success: function(data) {
      console.info("success", data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });
};
