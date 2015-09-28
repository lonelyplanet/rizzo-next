import CookieUtil from "../../../src/core/cookie_util";

let expect = require("expect.js");

describe("cookie util", () => {
  let cookie = null;
  before(() => {
    cookie = new CookieUtil({
      cookies: ""
    })
  });

  it("should set a cookie", () => {
    cookie.setCookie("testKey", "testValue");

    expect(cookie.cookies).to.be("testKey=testValue;path=/");
  });

  it("should set a cookie that expires", () => {
    cookie.setCookie("testKey", "testValue", 14);

    expect(/expires=/.test(cookie.cookies)).to.be(true);
  });
});
