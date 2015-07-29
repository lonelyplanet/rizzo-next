let getScrollbarWidth = function(){
  let html = document.getElementsByTagName("html")[0];
  let body = document.body;

  let withScroll = body.offsetWidth;
  let scrollWidth;

  let getWidth = function(){
    return new Promise((resolve) => {
      setTimeout(() => {
        html.style.overflowY = "scroll";
      }, 1);

      setTimeout(() => {
        html.style.overflowY = "hidden";

        scrollWidth = body.offsetWidth - withScroll;

        resolve(scrollWidth);
      }, 2);

      setTimeout(() => {
        html.style.overflowY = "";
      }, 3);
    });
  };

  return function(){
    return new Promise((resolve) => {
      withScroll = body.offsetWidth;

      if(scrollWidth){
        setTimeout(() => {
          resolve(scrollWidth);
        }, 1);
      } else {
        getWidth()
          .then((width) => {
            resolve(width);
          });
      }
    });
  };
}();

export default getScrollbarWidth;
