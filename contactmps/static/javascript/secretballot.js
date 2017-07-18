console.log("Well hello there!");

var daysRemaining=(function(){ 
    var oneDay = 24*60*60*1000;
    var decision = new Date(2017, 6, 25, 23, 59);
    return Math.round(Math.abs((Date.now() - decision.getTime())/(oneDay)));
})();

console.log("days remaining: " + daysRemaining);

$("#secret-ballot-preview-message").hide();

var senderName = $(".name-input").val();
var senderEmail = $(".email-input").val();
var emailContent = $("#comment").val(); // two id="comment" on the page

$("#previewEmail").click(function(e) {
    e.preventDefault();
    $("#name").val(senderName);
    $("#email").val(senderEmail);
    $("#comment").val(emailContent);
    $("#secret-ballot-build-message").hide();
    $("#secret-ballot-preview-message").show();
});

var submitForm = function() {
  jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: 7720,
      name: senderName,
      email: senderEmail,
      body: 'Dear Baleka, stuff.',
      subject: 'Re: Secret Ballot in Vote of No Confidence in Jacob Zuma as President of the Republic',
      gRecaptchaResponse: '2398f49f293fjfj20fj'
    },
    success: function(data) {
      console.info("success", data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });
};