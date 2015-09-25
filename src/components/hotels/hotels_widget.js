import { Component } from "../../core/bane";
import Arkham from "../../core/arkham";
import assign from "lodash/object/assign";
import "pickadate/lib/picker.date";
import HotelsEvents from "./hotels.events";
import publish from "../../core/decorators/publish";

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
  get booking() {
    let dates = this.$el.find("[type='date']"),
        guests = this.$el.find("#js-guests");

    return {
      startDate: new Date(this.startDate.pickadate("picker").get()),
      endDate: new Date(this.endDate.pickadate("picker").get()),
      guests: guests.val()
    }
  }
  initialize() {
    this.events = {
      "submit #hotel-search-form": "searchHotels"
    };

    let dates = this.$el.find("input[type='date']"),
        startDate = $(dates[0]),
        endDate = $(dates[1]),
        today = new Date();

    this.startDate = startDate.pickadate(assign({
      min: today,
    }, dateDefaults));

    this.endDate = endDate.pickadate(assign({
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
        "select": newMinimumEndDate
      });
    }
  }
  @publish(HotelsEvents.SEARCH)
  searchHotels({ target }) {
    let serialized = $(target).serialize();

    return {
      booking: this.booking
    };
  }
}

export default HotelsWidget;
