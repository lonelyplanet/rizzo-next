import { Component } from "../../core/bane";
import pickadate from "pickadate/lib/picker.date";
import $ from "jquery";

class HotelsWidget extends Component {
  initialize() {
    // this.events = {
    // };

    let dates = this.$el.find("input[type='date']"),
        checkInDate = dates[0],
        checkOutDate = dates[1],
        today = new Date(),
        startDate = $(checkInDate),
        endDate = $(checkOutDate),

        nextDate = (date) => {
          let tmpDate = new Date(date);
          tmpDate.setDate(date.getDate() + 1);
          return tmpDate;
        },

        changeDate = () => {
          let existingEndDate = new Date(endDate.pickadate("picker").get()),
                newStartDate = new Date(startDate.pickadate("picker").get());
           if (existingEndDate.toString() === "Invalid Date" || newStartDate > existingEndDate) {
              let newMinimumEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
              endDate.pickadate("picker").set({
                "min": newMinimumEndDate,
                "select": newMinimumEndDate});
            }
        };

      startDate.pickadate({
          min: today,
          format: 'mm/d/yyyy',
          labelMonthNext: 'Go to the next month',
          labelMonthPrev: 'Go to the previous month',
          labelMonthSelect: 'Pick a month from the dropdown',
          labelYearSelect: 'Pick a year from the dropdown'

        }),

        endDate.pickadate({
          min: nextDate(today),
          format: 'mm/d/yyyy',
          labelMonthNext: 'Go to the next month',
          labelMonthPrev: 'Go to the previous month',
          labelMonthSelect: 'Pick a month from the dropdown',
          labelYearSelect: 'Pick a year from the dropdown'
        });

        startDate.change(changeDate.bind(this));

  }
}

export default HotelsWidget;
