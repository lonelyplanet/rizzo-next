import $ from "jquery";
let Injector = require("inject-loader!../../../src/components/header/header_component");

let Header = Injector({
  "../navigation": function() {}
}).default;

let headerTemplate = require("../../../src/components/header/header.hbs");

let html = headerTemplate({
  type: "city",
  images: []
});

/** @test {Header} */
describe("header", () => {
  it("should render", () => {
    let { isTooBig } = Header.prototype;

    // Mock this method
    Header.prototype.isTooBig = () => true;
    let header = new Header({ el: $(html) });

    expect(header.$search.hasClass("lp-global-header__search--fade")).to.be.ok();

    // Cleanup
    Header.prototype.isTooBig = isTooBig;
  });
});
