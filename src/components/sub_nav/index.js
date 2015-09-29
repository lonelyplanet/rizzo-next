require("./_sub_nav.scss");

export default class SubNav {
  constructor() {
    let debounce = require("lodash/function/debounce"),
        $subNav = $(".js-sub-nav");

    if ($subNav.length) {
      let subNavTop = $subNav.offset().top,
          firstTrigger = true,
          $window = $(window),
          fixedState, fixedSubNav;

      $(document).on("click", ".js-sub-nav-link", function(e) {
        let target = this.hash;
        let $target = $(target);
        let navHeight = $subNav.height();

        e.preventDefault();

        if($target.parents(".segment").length > 0) {
          $target = $target.parents(".segment");
        }

        $("html, body").stop().animate({
          scrollTop: $target.offset().top - navHeight
        }, 500, "swing", () => {
          window.location.hash = target;
        });
      });

      if (window.location.hash) {
        $subNav.find(`[href="${window.location.hash}"]`).trigger("click");
      }

      let $links = $(".js-sub-nav-link"),
          $components = $links.map((i, el) => {
            console.log(document.getElementById(el.href.split("#")[1]));
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
  }
}
