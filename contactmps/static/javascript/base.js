var pymChild = new pym.Child({
  id: "contactmps-embed-parent"
});

window.onload = ((function() {
  pymChild.sendHeight();
  console.info("contactmps child loaded");
}))();
