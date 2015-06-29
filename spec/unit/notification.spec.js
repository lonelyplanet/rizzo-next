import { Component } from "../../../core/bane";
import Notification from "../../../components/notification/notification";
var expect = require("expect.js");

describe("Notification", () => {
   it("should have a component", () => {
    expect(Notification).to.be.ok();
  });

  it("should be able to define a Notification", () => {
    expect(typeof Notification).to.be("function");
    expect(typeof Notification.prototype.render).to.be("function");
  });

 it("should have inheritable components", () => {
    expect(typeof Notification.prototype.getInitialState).to.be("function");
    expect(typeof Notification.prototype.build).to.be("function");
  });

  it("should be able to create instance", () => {
    var target = {append: sinon.spy()};
    var notificationInstance = new Notification({content: "baz", target: target});

    expect(notificationInstance.target.append.calledOnce).to.be.ok();
    expect(notificationInstance.content).to.be("baz");
    expect(notificationInstance.target).to.be(target);
    expect(notificationInstance.render()).to.be(notificationInstance);
  });

});
