import Arkham from "../../core/arkham";

let MastheadActions = {
  advanceImage: () => {
    Arkham.trigger("masthead.nextImage", {});
  },
  loopAround: () => {
    Arkham.trigger("masthead.loopAround", {});
  }
};

export default MastheadActions;
