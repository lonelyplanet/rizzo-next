import $ from "jquery";
let Injector = require("Inject-loader!../../../src/components/header/header_component");

let showSearchCalled = 0;

let SearchMock = function() {};
SearchMock.prototype = { show: function() { ++showSearchCalled; } };

let Header = Injector({
  "../search": SearchMock,
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

  it("should show the search when clicked", () => {
    let $el = $(html);
    let header = new Header({ el: $el });

    $el.find(".js-lp-global-header-search").eq(0).trigger("click");

    expect(showSearchCalled).to.be(1);
  });
});
