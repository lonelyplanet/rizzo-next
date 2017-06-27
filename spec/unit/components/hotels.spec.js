let Injector = require("inject-loader!../../../src/components/hotels/hotels_widget");
import $ from "jquery";

let HotelsWidget = Injector({
  "../../core/decorators/track": function() { return function() {}; },
  "../../core/decorators/publish": function() { return function() {}; }
}).default;

let hotelsTemplate = require("../../../src/components/hotels/hotels.hbs");

let html = hotelsTemplate({
  lodgings: true
});


/** @test {HotelsWidget} */
describe("hotels widget", () => {
  it("should add 1 day to a date", () => {
    let date = HotelsWidget.prototype.nextDate(new Date("January 1, 2015 00:00:00"));

    // 5 would be because January 1 was a Wednesday(4), so + 1 is Thursday(5)
    expect(date.getDay()).to.be(5);
  });

  it("should change the endDate if the startDate gets changed to after the end date", () => {
    sinon.stub(HotelsWidget.prototype, "updateEndDate");

    let date = HotelsWidget.prototype.changeDate(
      new Date("January 5, 2015 00:00:00"),
      new Date("January 10, 2015 00:00:00")
    );

    expect(date.toString()).to.be(new Date("January 11, 2015 00:00:00").toString());
    expect(HotelsWidget.prototype.updateEndDate.callCount).to.be(1);

    HotelsWidget.prototype.updateEndDate.restore();
  });

  it("should create a booking", () => {
    // TODO: figure out why changing the date isn't reflecting
    let widget = new HotelsWidget({ el: $(html) });

    widget.$startDate.val(new Date("January 5, 2015 00:00:00"));
    widget.$endDate.val(new Date("January 10, 2015 00:00:00"));
    widget.$el.find("#js-guests").val(4);

    let booking = widget.searchHotels();
    expect(booking.booking.guests).to.be(4);
    expect(booking.booking.startDate.getMonth()).to.be(0);
  });
});
