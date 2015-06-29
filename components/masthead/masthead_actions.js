import { Arkham } from "../../core/bane";

var MastheadActions = {
  advanceImage: () => {
    Arkham.trigger("masthead.nextImage", {});
  },
  loopAround: () => {
    Arkham.trigger("masthead.loopAround", {});
  }
};

export default MastheadActions;
