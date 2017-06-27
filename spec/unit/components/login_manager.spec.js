import User from "../../../src/components/login/user";

let Injector = require("inject-loader!../../../src/components/login/login_manager");

let doneSpy = sinon.spy();
let failSpy = sinon.spy();
let thenSpy = sinon.spy();

let ajaxMock = sinon.stub()
  .returns({
    done: doneSpy,
    fail: failSpy,
    then: thenSpy,
  });

let LoginManager = Injector({
  "jquery": {
    ajax: ajaxMock,
    when: function(...args) {

      return {
        done: thenSpy,
      };
    }
  }
}).default;


describe("login manager", () => {
  it("should be a class", () => {
    expect(typeof LoginManager === "function").to.be.ok();
  });

  it("should check for statuses", () => {
    let login = new LoginManager();

    expect(ajaxMock.calledTwice).to.be.ok();

    ajaxMock.reset();
  });

  it("should update the user's status and get notifications if the user is logged in", () => {
    let login = new LoginManager();

    login.statusFetched({ id: 1 });

    // Called twice because of checkStatus, and getNotifications
    expect(ajaxMock.calledTwice).to.be.ok();

    ajaxMock.reset();
  });

  it("should update the user's status when not logged in", () => {
    let login = new LoginManager();

    login.statusFetched({ id: null });

    expect(ajaxMock.calledTwice).to.be.ok();

    ajaxMock.reset();
  });
});
