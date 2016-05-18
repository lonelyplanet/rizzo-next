import Component from "../../src/core/component";
import Arkham from "../../src/core/arkham"

var expect = require("expect.js");

/** @test {Component} */
describe("bane core", () => {
  it("should have a component", () => {
    expect(Component).to.be.ok();
  });

  it("should be able to define a component", () => {
    class FooComponent extends Component{
      initialize() {
        this.bar = "baz";
      }
      foo() {}
    }

    expect(typeof FooComponent).to.be("function");
    expect(new FooComponent().bar).to.be("baz");
  });

  it("should have inheritable components", () => {
    class BaseComponent extends Component {
      initialize() {
        this.bar = "baz";
      }
      foo() {}
    }

    class ThingsToDo extends BaseComponent{
      bar() {}
    }

    expect(typeof ThingsToDo.prototype.bar).to.be("function");
    expect(new ThingsToDo().bar).to.be("baz");
  });

  describe("core events", () => {
    expect(Arkham.on).to.be.ok();
  });

  describe("component events", () => {
    it("should be observable", () => {
      class BaseComponent extends Component {

      }

      var base = new BaseComponent();

      var callCount = 0;
      var callback = function() { callCount++; };

      base.on("component.rendered", callback);

      expect(typeof base.on).to.be("function");
      expect(callCount).to.be(0);

      base.trigger("component.rendered");
      expect(callCount).to.be(1);
    });

    it("should be able to listen to arkham events", () => {
      var callCount = 0;

      class BaseComponent extends Component {
        initialize() {
          this.listenTo(Arkham, "app.ready", this.render);
        }
        render() {
          callCount++;
        }
      }

      new BaseComponent();
      Arkham.trigger("app.ready");

      expect(callCount).to.be(1);
    });
  });

  describe("getInitialState", () => {
    it("should parse an element", () => {
      class BaseComponent extends Component {

      }

      let base = new BaseComponent();
      base.$el.data("lpInitialFoo", { bar: "baz" });

      let state = base.getInitialState();

      expect(state.foo.bar).to.be("baz");
    });
  });
});
