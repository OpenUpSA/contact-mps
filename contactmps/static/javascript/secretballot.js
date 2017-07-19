var daysRemaining=(function(){ 
    var oneDay = 24*60*60*1000;
    var decision = new Date(2017, 6, 25, 23, 59);
    return Math.floor(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();

$("#days-remaining").text(daysRemaining);

$(".toggle-button-question .toggle-select").click(function() {
    $(".toggle-button-question .toggle-select").removeClass("selected");
    $(this).addClass("selected");
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
    var emailContent = $("#comment").val().replace(/\n/g, '<br>');
    if ($(".toggle-select.selected").attr("id") == "no") {
        var emailSubject = "I don't want a secret ballot in the vote of no confidence";
    }
    else if ($(".toggle-select.selected").attr("id") == "yes") {
        var emailSubject = "I want a secret ballot in the vote of no confidence";
    };
    $("#name").text(senderName);
    $("#email").text(senderEmail);
    $("#email-title").text(emailSubject);
    $("#comment-preview").html("Dear Mrs. Mbete,<br>" + emailContent);
    // $("#secret-ballot-build-message").hide();
    $("#secret-ballot-preview-message").show();
    location.hash = "#secret-ballot-preview-message";
});

$("#editEmail").click(function(e) {
    e.preventDefault();
    $("#secret-ballot-build-message").show();
    // $("#secret-ballot-preview-message").hide();
});

$("#sendEmail").click(function(e) {
    e.preventDefault();

    var senderName = $(".name-input").val();
    var senderEmail = $(".email-input").val();
    var emailSubject = $("#email-title").text();
    var emailContent = $("#comment").val().replace(/\n/g, '<br>');
    // var gRecaptchaResponse = return grecaptcha.getResponse()

    // $("#secret-ballot-preview-message").hide();
    // $("#secret-ballot-sent").show();

    location.hash = "#secret-ballot-sent";
});

function submitForm() {
  jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: 7720,
      name: senderName,
      email: senderEmail,
      body: 'Dear Baleka, this is my message: ' + emailContent,
      subject: emailSubject,
      gRecaptchaResponse: gRecaptchaResponse,
    },
    success: function(data) {
      console.info("success", data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });
};
