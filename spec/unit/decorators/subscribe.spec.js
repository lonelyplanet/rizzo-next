import subscribe from "../../../src/core/decorators/subscribe";
import channel from "../../../src/core/decorators/channel";
import postal from "postal/lib/postal.lodash";

let expect = require("expect.js");

describe("subscribe decorator", () => {
  it("should be a decorator", () => {
    expect(subscribe).to.be.ok();
  });

  it("should subscribe to a topic", () => {
    let callCount = 0;
    class Foo {
      constructor() {
        this.subscribe();
      }
      @subscribe("my.message", "foo")
      myMessage(data, env, sub) {
        expect(data.foo).to.be("bar");
        callCount++;
        sub.unsubscribe();
      }
    }
    
    new Foo();

    postal.channel("foo").publish("my.message", { foo: "bar" });
    
    expect(callCount).to.be(1);
  });

  it("should subscribe to a topic with the channel set", () => {
    let callCount = 0;
    
    class Foo {
      constructor() {
        this.number = 2;
        this.subscribe();
      }
      @subscribe("my.other.message")
      @channel("foobar")
      myOtherMessage(data, env, sub) {
        this.number++;
        expect(data.foo).to.be("bazinga");
        callCount++;
        sub.unsubscribe();
      }
      @subscribe("my.other.message.2")
      myOtherMessage2(data, env, sub) {
        this.number++;
        expect(data.foo).to.be("bazinga");
        callCount++;
        sub.unsubscribe();
      }
      @subscribe("my.other.message.3")
      @channel("foobazinga")
      myOtherMessage3(data, env, sub) {
        this.number++;
        expect(data.foo).to.be("bazinga");
        callCount++;
        sub.unsubscribe();
      }
    }
    let foo = new Foo();
    
    postal.channel("foobar").publish("my.other.message", { foo: "bazinga" });
    postal.channel("foobar").publish("my.other.message.2", { foo: "bazinga" });
    postal.channel("foobazinga").publish("my.other.message.3", { foo: "bazinga" });
    
    expect(callCount).to.be(3);
    expect(foo.number).to.be(5);
  });
});
