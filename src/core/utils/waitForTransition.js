const onTransitionEndEventNames = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
// const onAnimationEndEventName = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

let waitForTransition = function($el, { fallbackTime = 10000 } = {}){
  return new Promise((resolve) => {

    let done = function(e){
      /*eslint no-use-before-define:0*/
      if(e && e.target !== $el.get(0)) {
        return;
      }

      resolve();

      $el.off(onTransitionEndEventNames, done);
      clearTimeout(fallBackTimer);
    };
    let fallBackTimer = setTimeout(done, fallbackTime);

    $el.on(onTransitionEndEventNames, done);
  });
};

module.exports = waitForTransition;
