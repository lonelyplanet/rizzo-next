import { Component } from "../../core/bane";
import assign from "lodash/object/assign";
import "pickadate/lib/picker.date";
import HotelsEvents from "./hotels.events";
import publish from "../../core/decorators/publish";
import $ from "jquery";
let _ = { assign };

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
    let guests = this.$el.find("#js-guests");

    return {
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      guests: parseInt(guests.val(), 10)
    }
  }
  get startDate() {
    return this.$startDate.pickadate("picker").get();
  }
  get endDate() {
    return this.$endDate.pickadate("picker").get();
  }
  initialize() {
    this.events = {
      "submit #hotel-search-form": "searchHotels"
    };

    let dates = this.$el.find("input[type='date']"),
        startDate = $(dates[0]),
        endDate = $(dates[1]),
        today = new Date();

    this.$startDate = startDate.pickadate(_.assign({
      min: today,
    }, dateDefaults));

    this.$endDate = endDate.pickadate(_.assign({
      min: this.nextDate(today)
    }, dateDefaults));

    startDate.change(() => this.changeDate(this.endDate, this.startDate));
  }
  nextDate(date) {
    let tmpDate = new Date(date);
    tmpDate.setDate(date.getDate() + 1);
    return tmpDate;
  }
  changeDate (endDate, startDate){
    let existingEndDate = new Date(endDate),
        newStartDate = new Date(startDate);
    
    if (existingEndDate.toString() === "Invalid Date" || newStartDate > existingEndDate) {
      let newMinimumEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
      this.updateEndDate(newMinimumEndDate);
      return newMinimumEndDate;
    }
  }
  updateEndDate(date) {
    this.$endDate.pickadate("picker").set({
      "min": date,
      "select": date
    });
  }
  @publish(HotelsEvents.SEARCH)
  searchHotels() {
    return {
      booking: this.booking
    };
  }
}

export default HotelsWidget;
