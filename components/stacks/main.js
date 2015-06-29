import Stack from "./stack_component";

require("./stacks.scss");

export default (function() {
  return $(".articles").each(function() {
    var stack = new Stack({
      el: this
    });

    $(this).data("lpStack", stack);
  });
}());
