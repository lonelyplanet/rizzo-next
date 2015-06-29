let highlight = (node, re, nodeName, className) => {
  if (node.nodeType === 3) {
    let match = node.data.match(re);

    if (match) {
      let highlight = document.createElement(nodeName || "span");
      highlight.className = className || "highlight";

      let wordNode = node.splitText(match.index);
      wordNode.splitText(match[0].length);

      let wordClone = wordNode.cloneNode(true);
      highlight.appendChild(wordClone);
      wordNode.parentNode.replaceChild(highlight, wordNode);

      return 1; //skip added node in parent
    }
  } else if ((node.nodeType === 1 && node.childNodes) &&
             !/(script|style)/i.test(node.tagName) &&
             !(node.tagName === nodeName.toUpperCase() && node.className === className)) {
    for (let i = 0; i < node.childNodes.length; i++) {
      i += highlight(node.childNodes[i], re, nodeName, className);
    }
  }
  return 0;
};

export default function(el, words, options) {
  let settings = {
    className: "is-highlight",
    element: "span",
    caseSensitive: false,
    wordsOnly: false
  };

  $.extend(settings, options);

  if (words.constructor === String) {
    words = [ words ];
  }

  words = $.grep(words, function(word) {
    return word !== "";
  });
  words = $.map(words, function(word) {
    return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  });

  if (words.length === 0) {
    return el;
  }

  let flag = settings.caseSensitive ? "" : "i",
      pattern = "(" + words.join("|") + ")";

  if (settings.wordsOnly) {
    pattern = "\\b" + pattern + "\\b";
  }

  let re = new RegExp(pattern, flag);

  return $(el).each((index, el) => {
    highlight(el, re, settings.element, settings.className);
  });
}
