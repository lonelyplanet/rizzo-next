/**
 * Preload images with jQuery
 * @example
 *   <img data-preload src="foo.jpg" />
 * @example
 *   <div data-preload="foo.jpg" style="background-image: url(foo.jpg)"></div>
 */
class $ImagePreloader {
  constructor({ el }) {
    let url = $(el).data("preload") || el.src;

    if (url) {
      new Image().src = url;
    }
  }
}

$("[data-preload]").each((i, el) => new $ImagePreloader({ el }));
