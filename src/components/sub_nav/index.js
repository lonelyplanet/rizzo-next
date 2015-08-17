require("./_sub_nav.scss");

let debounce = require("lodash/function/debounce"),
    $subNav = $(".js-sub-nav");

if ($subNav.length) {
  let subNavTop = $subNav.offset().top,
      firstTrigger = true,
      $window = $(window),
      fixedState, fixedSubNav;

  $(document).on("click", ".js-sub-nav-lnk", function(e) {
    let target = this.hash;
    let $target = $(target);
    let navHeight = $subNav.height();

    if($target.parents(".segment").length > 0) {
      $target = $target.parents(".segment");
    }

    $("html, body").stop().animate({
      scrollTop: $target.offset().top - navHeight
    }, 500, "swing");

    e.preventDefault();
  });

  let $links = $(".js-sub-nav-lnk"),
      $components = $links.map((i, el) => {
        return document.getElementById(el.href.split("#")[1]);
      });
  let $last;

  $window.scroll(debounce(() => {
    if (firstTrigger) {
      fixedSubNav = $subNav
        .clone(true)
        .addClass("sub-nav--fixed");

      firstTrigger = false;
    }

    if ($window.scrollTop() > subNavTop){
      if(!fixedState){
        fixedSubNav.appendTo( "body" );
        fixedState = true;
      }
    } else if (fixedState) {
        fixedSubNav.detach();
        fixedState = false;
    }

    let scrollTop = $(window).scrollTop() + $subNav.height();

    let $current = $components.map((i, el) => {
      if (el.offsetTop < scrollTop) {
        return el;
      }
    });

    if ($current.length) {
      fixedSubNav.find("a").removeClass("sub-nav__link--active");

      fixedSubNav
        .find(`a[href*="#${$current[$current.length - 1].id}"]`)
          .addClass("sub-nav__link--active");
    }

  }, 10));

  $window.resize(debounce(() => {
    subNavTop = $subNav.offset().top;
  }, 10));
}
