const onTransitionEndEventNames = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
// const onAnimationEndEventName = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

var waitForTransition = function($el, { fallbackTime = 10000 } = {}){
  return new Promise((resolve) => {

    var done = function(e){
      /*eslint no-use-before-define:0*/
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
