import User from "../../../src/components/login/user";

let Injector = require("inject!../../../src/components/login/login_manager");

let doneSpy = sinon.spy();
let failSpy = sinon.spy();

let ajaxMock = sinon.stub()
  .returns({
    done: doneSpy,
    fail: failSpy
  });

let LoginManager = Injector({
  "jquery": {
    ajax: ajaxMock
  }
});


describe("login manager", () => {
  it("should be a class", () => {
    expect(typeof LoginManager === "function").to.be.ok();
  });

  it("should check for statuses", () => {
    let login = new LoginManager();

    expect(ajaxMock.calledOnce).to.be.ok();

    ajaxMock.reset();
  });

  it("should update the user's status and get notifications if the user is logged in", () => {
    let login = new LoginManager();

    login.statusFetched({ id: 1 });
    
    // Called twice because of checkStatus, and getNotifications
    expect(ajaxMock.calledOnce).to.be.ok();

    ajaxMock.reset();
  });

  it("should update the user's status when not logged in", () => {
    let login = new LoginManager();

    login.statusFetched({ id: null });

    expect(ajaxMock.calledOnce).to.be.ok();

    ajaxMock.reset();
  });
});
