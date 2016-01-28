import debounce from "lodash/function/debounce";

let setFontSize = ($el, textWidth, settings) => {
  let compressor = textWidth / $el.width();
  $el.css("font-size", Math.floor(settings.minFontSize / compressor));
};

let unSetFontSize = ($el) => {
  $el.removeAttr("style");
};

let initialize = ($el, textWidth, settings) => {
  if (textWidth > $el.width()) {
    setFontSize($el, textWidth, settings);
  } else {
    unSetFontSize($el);
  }
};

/**
 * Scales text to fit within a given area
 *
 * In order to scale the text, a `span` is wrapped around the `$el`'s text; this
 * allows for the width of the text to be calculated. The width of the `$el` is
 * also calculated and those two widths are used to create a ratio in which to
 * divide the `minFontSize` by.
 *
 * @param  {jQuery Object} $el     The element where the text will be scaled
 * @param  {Object}        options An array of options; currently `minFontSize` is the only accepted key
 * @example
 * fitText(this.$el.find(".js-masthead-title"), {
 *   minFontSize: 56
 * });
 *
 */
export default function fitText($el, options) {
  let settings = {
    minFontSize: 30
  };

  $.extend(settings, options);

  if (!$el.find("span").length) {
    $el.wrapInner("<span />");
  }

  let textWidth = $el.find("span").width();

  // Call once to set
  initialize($el, textWidth, settings);

  // Call on resize
  $(window).on("resize.fitText orientationchange.fitText", debounce(() => {
    initialize($el, textWidth, settings);
  }, 10));
};
