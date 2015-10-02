import ComponentRegistry from "../../../src/core/component_registry";
import { Component } from "../../../src/core/bane";

/** @test {ComponentRegistry} */
describe("ComponentRegistry", () => {
  it("should register compnents", () => {
    let registry = new ComponentRegistry();

    class FooComponent extends Component {}

    registry.register(FooComponent);

    expect(registry.components.size).to.be(1);
  });

  it("should add instances", () => {
    let registry = new ComponentRegistry();

    class FooComponent extends Component {}

    registry.register(FooComponent);

    expect(registry.components.size).to.be(1);

    registry.createInstanceOf(FooComponent);

    expect(registry.getInstancesOf(FooComponent).length).to.be(1);
    expect(registry.getInstancesOf("FooComponent").length).to.be(1);
  });
});
