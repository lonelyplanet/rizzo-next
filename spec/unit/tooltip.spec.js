import Tooltip from "../../../components/tooltip/tooltip";
var expect = require("expect.js");

describe("Tooltip", () => {
  it("should have a component", () => {
    expect(Tooltip).to.be.ok();
  });

  it("should be able to define a Tooltip", () => {
    expect(typeof Tooltip).to.be("function");
    expect(typeof Tooltip.prototype.render).to.be("function");
    expect(typeof Tooltip.prototype.toggle).to.be("function");
    expect(typeof Tooltip.prototype._cartEnter).to.be("function");
    expect(typeof Tooltip.prototype._cartLeave).to.be("function");
  });

  it("should have inheritable components", () => {
    expect(typeof Tooltip.prototype.render).to.be("function");
    expect(typeof Tooltip.prototype.build).to.be("function");
    expect(typeof Tooltip.prototype.getInitialState).to.be("function");
  });

  describe("async toggle", () => {
    let clock = null;

    before(function () { clock = sinon.useFakeTimers(); });
    after(function () { clock.restore(); });

    it("should be able to create instance", () => {
      var tooltipInstance = new Tooltip({content: "baz"});

      sinon.spy(tooltipInstance.$el, "find");

      tooltipInstance.toggle("close");
      clock.tick(199);

      expect(tooltipInstance.$el.find.calledOnce).to.not.be.ok();

      clock.tick(1);
      expect(tooltipInstance.$el.find.calledOnce).to.be.ok();

      tooltipInstance.$el.find.restore();
    });
  });

  it("should be able to create instance", () => {
    var tooltipInstance = new Tooltip({content: "baz"});
    expect(tooltipInstance.content).to.be("baz");
    expect(tooltipInstance.render()).to.be(tooltipInstance);
  });

});
