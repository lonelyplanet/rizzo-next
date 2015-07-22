import { Component } from "../../core/bane";
import StackActions from "./stack_actions";
import StackState from "./stack_state";
import assign from "lodash/object/assign";

// # Stack
// Renders stack widgets
class Stack extends Component {
  initialize() {
    this.name = "stacks";
    
    this.events = {
      "click .button": "getMore"
    };
    
    this.template = require("components/stacks/_stacks.html.hbs");
    this.listenTo(StackState, "changed", this.render);

    StackState.setInitialState(this.getInitialState());
  }
  render(data) {
    var templateData = assign({}, StackState.getState(), data);

    this.build(templateData);
  }
  getMore() {
    StackActions.getMore();
  }
}

export default Stack;
