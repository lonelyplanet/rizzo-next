import debounce from "lodash/debounce";

let getWordCount = (string) => {
  return string.match(/(\w+)/g).length;
};

let setFontSize = ($el, textWidth, settings) => {
  let compressor = textWidth / $el.width();
  $el.css("font-size", Math.floor(settings.minFontSize / compressor));
};

let unSetFontSize = ($el) => {
  $el.removeAttr("style");
};

let resizeFont = ($el, textWidth, settings) => {
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
 * Options
 *
 * fontSizes   {Array}  An array of font sizes that the text uses; if the font size
 *                      changes at different breakpoints, each font size should be
 *                      added to the array; the values are used to recalculate
 *                      the text width at each font size; each font size should
 *                      be a {Number}
 * minFontSize {Number} The minimum font size desired; this value is used to
 *                      create the `compressor`, or ratio for sizing; the
 *                      default is 30
 *
 * @param  {jQuery Object} $el     The element where the text will be scaled
 * @param  {Object}        options An array of options
 * @example
 * fitText(this.$el.find(".js-masthead-title"), {
 *   fontSizes: [40, 56, 80, 120],
 *   minFontSize: 56
 * });
 *
 */
export default function fitText($el, options) {
  let wordCount = getWordCount($el.text());

  let settings = {
    fontSizes: [],
    minFontSize: 30
  };

  $.extend(settings, options);

  if (wordCount === 1) {
    if (!$el.find("span").length) {
      $el.wrapInner("<span />");
    }

    let textWidth = $el.find("span").width();

    // Call once to set
    resizeFont($el, textWidth, settings);

    // Call on resize
    $(window).on("resize.fitText orientationchange.fitText", debounce(() => {
      if(settings.fontSizes.indexOf(parseInt($el.css("fontSize").replace("px", ""), 10)) !== -1) {
        textWidth = $el.find("span").width();
      }

      resizeFont($el, textWidth, settings);
    }, 10));
  }
};
