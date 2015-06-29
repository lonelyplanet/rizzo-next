const onTransitionEndEventNames = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';
const onAnimationEndEventName = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

var waitForTransition = function($el, { fallbackTime = 10000 } = {}){
  return new Promise((resolve, reject) => {
    var done = function(e){
      //if(e)
      //	console.log(e.target, $el.get(0), e.type, e.propertyName, e.elapsedTime, e.pseudoElement);

      if(e && e.target !== $el.get(0)) {
        return;
      }

      resolve();

      $el.off(onTransitionEndEventNames, done);
      clearTimeout(fallBackTimer);
    };
    var fallBackTimer = setTimeout(done, fallbackTime);

    $el.on(onTransitionEndEventNames, done);
  });
};

module.exports = waitForTransition;