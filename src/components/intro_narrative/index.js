require("./_intro_narrative.scss");

$("a.intro-narrative__more").click(function() {
  $(".intro-narrative__expanded")[0].style.display = "block";
  $(".intro-narrative__more")[0].style.display = "none";
});

$("a.intro-narrative__less").click(function() {
  $(".intro-narrative__expanded")[0].style.display = "none";
  $(".intro-narrative__more")[0].style.display = "inline";

  $("#introduction").get(0).scrollIntoView();
});
