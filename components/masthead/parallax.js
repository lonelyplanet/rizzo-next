import { Component } from "../../core/bane";

class Parallax extends Component {
  initialize(options) {
    this.breakPoint = options.breakPoint || 717;
    this.window = $(window);

    if (this.window.width() >= this.breakPoint) {
      this.fadeChildren = options.fadeChildren;
      this.offsetPadding = options.offsetPadding || 35;
      this.cutoffOffset = options.cutoff.offset().top - this.offsetPadding;
      this.children = this.$el.children();

      $(window).on("scroll", () => window.requestAnimationFrame(this.parallax.bind(this)));
    }
  }
  parallax() {
    let winScrollTop = this.window[0].scrollY,
        translateY = Math.round(winScrollTop / 2);

    this.$el[0].style.transform = `translate3d(0, ${translateY}px, 0)`;
    this.$el[0].style.webkitTransform = `translate3d(0, ${translateY}px, 0)`;

    if (this.fadeChildren) {
      this.children.each((index, childEl) => {
        this.fadeChild($(childEl));
      });
    }
  }
  fadeChild($childEl) {
    let offsetDifference = this.cutoffOffset - $childEl.offset().top,
        opacity = offsetDifference / 100,
        newOpacity = offsetDifference < 100 ? opacity : 1,
        cssProps = { opacity: newOpacity };

    if (newOpacity < 0) {
      cssProps.zIndex = -1;
    } else {
      cssProps.zIndex = "auto";
    }

    $childEl.css(cssProps);
  }
}

export default Parallax;
