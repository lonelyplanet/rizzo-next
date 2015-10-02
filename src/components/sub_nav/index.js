import { Component } from "../../core/bane";
require("./_sub_nav.scss");

export default class SubNav extends Component {
  initialize() {
    let debounce = require("lodash/function/debounce"),
        $subNav = $(".js-sub-nav"),
        $window = $(window);

    /**
     * Checks to see if a given element has been scrolled into view
     * @param  {Object}  element Element to check
     * @return {Boolean}         Is the element in view or not?
     */
    let isScrolledIntoView = (element) => {
      let $element = $(element),
          windowTop = $window.scrollTop(),
          elementTop = $element.offset().top,
          viewportTop = windowTop + ($subNav.height() * 2);

      return elementTop <= viewportTop;
    };

    if ($subNav.length) {
      let subNavTop = $subNav.offset().top,
          firstTrigger = true,
          fixedState,
          fixedSubNav;

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

        if ($window.scrollTop() > subNavTop) {
          if(!fixedState) {
            fixedSubNav.appendTo("body");
            fixedState = true;
          }
        } else if (fixedState) {
          fixedSubNav.detach();
          fixedState = false;
        }

        let $current = $components.map((i, el) => {
          if (isScrolledIntoView(el)) {
            return el;
          }
        });

        if ($current.length) {
          fixedSubNav.find("a").removeClass("sub-nav__link--active");

          fixedSubNav
            .find(`a[href*="#${$current[$current.length - 1].id}"]`)
              .addClass("sub-nav__link--active");

        } else {
          fixedSubNav.find("a").removeClass("sub-nav__link--active");

        }

      }, 10));

      $window.resize(debounce(() => {
        subNavTop = $subNav.offset().top;
      }, 10));
    }
  }
}
