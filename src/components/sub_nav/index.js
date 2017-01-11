import { Component } from "../../core/bane";
import RizzoEvents from "../../core/rizzo_events";
import subscribe from "../../core/decorators/subscribe";
import debounce from "lodash/debounce";
require("./_sub_nav.scss");

export default class SubNav extends Component {
  initialize() {
    let $subNav = $(".js-sub-nav"),
        $subNavPlaceholder = $(".js-sub-nav-placeholder"),
        $window = $(window);

    this.contentHeight = 0;
    this.$subNavList = this.$el.find(".js-sub-nav-list");

    this.subNavItem = require("./sub_nav_item.hbs");

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
          firstTrigger = true;

      this.subscribe();
      this.addClientSideComponents();

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

      $window.on("scroll", debounce(() => {
        if (firstTrigger) {
          firstTrigger = false;
        }

        let isFixed = ($window.scrollTop() >= subNavTop) && ($window.scrollTop() <= this.contentHeight),
            isBottom = ($window.scrollTop() >= subNavTop) && ($window.scrollTop() >= this.contentHeight);

        if (isFixed) {
          $subNav
            .addClass("is-fixed")
            .removeClass("is-bottom");

          $subNavPlaceholder
            .addClass("is-fixed");

        } else if (isBottom) {
          $subNav
            .addClass("is-bottom");

          $subNavPlaceholder
            .addClass("is-fixed");

        } else {
          $subNav
            .removeClass("is-fixed is-bottom");

          $subNavPlaceholder
            .removeClass("is-fixed");

        }

        let $current = $components.map((i, el) => {
          if (isScrolledIntoView(el)) {
            return el;
          }
        });

        if ($current.length) {
          $subNav.find("a").removeClass("sub-nav__link--active");

          $subNav
            .find(`a[href*="#${$current[$current.length - 1].id}"]`)
              .addClass("sub-nav__link--active");

        } else {
          $subNav.find("a").removeClass("sub-nav__link--active");

        }

      }, 10));

      $window.on("resize", debounce(() => {
        this.updateContentHeight();
      }, 10));
    }
  }
  addClientSideComponents() {
    $(this.subNavItem({
      id: "experiences",
      title: "Experiences"
    })).prependTo(this.$subNavList);
  }
  @subscribe(RizzoEvents.LOAD_BELOW, "events");
  updateContentHeight() {
    this.contentHeight = $(".navigation-wrapper").outerHeight();
  }
  /**
   * If a component is removed from the DOM, this will remove its subnav element
   */
  @subscribe("*.removed", "components");
  removeSubNav(data, envelope) {
    let component = envelope.topic.split(".")[0];

    this.$el.find(`.sub-nav__item--${component}`).remove();
  }
  @subscribe("experiences.removed", "components");
  addSights() {
    if ($(".sights").length) {
      $(this.subNavItem({
        id: "sights",
        title: "Sights"
      })).prependTo(this.$subNavList);
    } else {
      $("#sights").closest(".segment").remove();
    }
  }
}
