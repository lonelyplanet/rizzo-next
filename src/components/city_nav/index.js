require("./_city_nav.scss");

let debounce = require("lodash/function/debounce"),
    $cityNav = $(".js-city-nav");

if ($cityNav.length) {
  let cityNavTop = $cityNav.offset().top,
      firstTrigger = true,
      $window = $(window),
      fixedState, fixedCityNav;

  $(document).on("click", ".js-city-nav-lnk", function(e) {
    let target = this.hash;
    let $target = $(target);
    let navHeight = $cityNav.height();

    if($target.parents(".segment").length > 0) {
      $target = $target.parents(".segment");
    }

    $("html, body").stop().animate({
      scrollTop: $target.offset().top - navHeight
    }, 500, "swing");

    e.preventDefault();
  });

  $window.scroll(debounce(() => {
    if (firstTrigger) {
      fixedCityNav = $cityNav
        .clone(true)
        .addClass("city-nav--fixed");

      firstTrigger = false;
    }

    if ($window.scrollTop() > cityNavTop){
      if(!fixedState){
        fixedCityNav.appendTo( "body" );
        fixedState = true;
      }
    } else if (fixedState) {
        fixedCityNav.detach();
        fixedState = false;
    }

  }, 10));

  $window.resize(debounce(() => {
    cityNavTop = $cityNav.offset().top;
  }, 10));
}
