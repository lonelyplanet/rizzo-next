import Arkham from "../../core/arkham";

let NavigationActions = {
  clickNav: (data) => {
    Arkham.trigger("navigation.click", data);
  },
};

export default NavigationActions;
