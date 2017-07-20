$(window).on('error', function(e) {
  e = e.originalEvent;
  ga('send', 'exception', {
    'exDescription': e.message + ' @ ' + e.filename + ': ' + e.lineno,
    'exFatal': true,
  });
});

var pymChild = new pym.Child({
  id: "contactmps-embed-parent"
});

$(window).on('load', function() {
  pymChild.sendHeight();
});

// social-sharing
$('.fb-share').on('click', function(e) {
  e.preventDefault();
  var $this = $(this),
      url = encodeURIComponent($this.data('url')),
      msg = encodeURIComponent($this.data('message') || '');

  window.open("https://www.facebook.com/sharer/sharer.php?u=" + url + "&quote=" + msg, "share", "width=600, height=400, scrollbars=no");
  ga('send', 'social', 'facebook', 'share', url);
});

$('.twitter-share').on('click', function(e) {
  e.preventDefault();

  var $this = $(this),
      url = encodeURIComponent($this.data('url')),
      hashtag = encodeURIComponent($this.data('hashtag').replace('#', '')),
      msg = encodeURIComponent($this.data('message') || '');

  window.open("https://twitter.com/intent/tweet?&url=" + url + "&hashtags=" + hashtag + "&text=" + msg, "share", "width=600, height=400, scrollbars=no");
  ga('send', 'social', 'twitter', 'share', url);
});

// track outbound links
$(function() {
  $('a[href^=http]').on('click', function(e) {
    ga('send', 'event', 'outbound-click', 'click', this.getAttribute('href'));
  });
});
