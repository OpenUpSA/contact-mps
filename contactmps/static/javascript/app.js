var gReCaptchaValidated = function() {
  $("input[type=submit]").removeAttr('disabled');
};

var gReCaptchaExpired = function() {
  $("input[type=submit]").attr('disabled','disabled');
};
