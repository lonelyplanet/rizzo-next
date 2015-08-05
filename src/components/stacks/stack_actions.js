import { Arkham } from "../../core/bane";

let StackActions = {
  getMore: () => {
    Arkham.trigger("stacks.fetch", {});

    // Simulate Ajax request
    setTimeout(() => {
      Arkham.trigger("stacks.fetched", {
        stacks: [ {
          name: "Spider Man"
        }, {
          name: "Captain America"
        }, {
          name: "Iron Man"
        } ]
      });
    }, 0);
  }
};

export default StackActions;
