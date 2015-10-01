import publish from "../../../src/core/decorators/publish";
import postal from "postal/lib/postal.lodash";

let expect = require("expect.js");

describe("publish decorator", () => {
  it("should be a decorator", () => {
    expect(publish).to.be.ok();
  });

  it("should publish a message", () => {
    let definition = postal.channel("/").subscribe("my.message", (data) => {
      expect(data.foo).to.be("bar");
    });

    class Foo {
      @publish("my.message")
      myMessage() {
        return {
          foo: "bar"
        };
      }
    }

    let foo = new Foo();

    foo.myMessage();
    definition.unsubscribe();
  });

  it("should publish a message on a custom channel", () => {
    let definition = postal.channel("custom").subscribe("my.message", (data) => {
      expect(data.foo).to.be("bazinga");
    });

    class Foo {
      @publish("my.message", "custom")
      myMessage() {
        return {
          foo: "bazinga"
        };
      }
    }

    let foo = new Foo();

    let result = foo.myMessage();
    definition.unsubscribe();
    expect(result.foo).to.be("bazinga");
  });
});
