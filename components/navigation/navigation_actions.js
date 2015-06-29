import { Arkham } from "../../core/bane";

let NavigationActions = {
  hoverStart: (data) => {
    data.isOpen = true;
    Arkham.trigger("navigation.hover", data);
  },
  hoverEnd: (data) => {
    data.isOpen = false;
    Arkham.trigger("navigation.hover", data);
  },
  clickNav: (data) => {
    Arkham.trigger("navigation.click", data);
  }
};

export default NavigationActions;
