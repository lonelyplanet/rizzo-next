import { Component } from "../../core/bane";
import assign from "lodash/object/assign";
import "pickadate/lib/picker.date";

const dateDefaults = {
  format: "mm/d/yyyy",
  formatSubmit: "dd/mm/yyyy",
  hiddenName: true,
  labelMonthNext: "Go to the next month",
  labelMonthPrev: "Go to the previous month",
  labelMonthSelect: "Pick a month from the dropdown",
  labelYearSelect: "Pick a year from the dropdown"
};

class HotelsWidget extends Component {
  initialize() {
    this.events = {
      "submit #hotel-search-form": "searchHotels"
    };

    let dates = this.$el.find("input[type='date']"),
        startDate = $(dates[0]),
        endDate = $(dates[1]),
        today = new Date();

    startDate.pickadate(assign({
      min: today,
    }, dateDefaults));

    endDate.pickadate(assign({
      min: this.nextDate(today)
    }, dateDefaults));

    startDate.change(() => this.changeDate(endDate, startDate));
  }
  nextDate(date) {
    let tmpDate = new Date(date);
    tmpDate.setDate(date.getDate() + 1);
    return tmpDate;
  }
  changeDate (endDate, startDate){
    let existingEndDate = new Date(endDate.pickadate("picker").get()),
        newStartDate = new Date(startDate.pickadate("picker").get());
   
    if (existingEndDate.toString() === "Invalid Date" || newStartDate > existingEndDate) {
      let newMinimumEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
      endDate.pickadate("picker").set({
        "min": newMinimumEndDate,
        "select": newMinimumEndDate});
    }
  }
  searchHotels(event) {
    let serialized = $(event.target).serialize();

    window.lp.analytics.api.trackEvent({ 
      category: "Partner Click",
      action: `partner=booking&${serialized}`
    });
  }
}

export default HotelsWidget;
