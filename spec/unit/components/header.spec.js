import $ from "jquery";
let Injector = require("inject!../../../src/components/header/header_component");

let showSearchCalled = 0;

let SearchMock = function() {};
SearchMock.prototype = { show: function() { ++showSearchCalled; } };

let Header = Injector({
  "../search": SearchMock,
  "../navigation": function() {}
});

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

    expect(header.$search.hasClass("header__search--fade")).to.be.ok();

    // Cleanup
    Header.prototype.isTooBig = isTooBig;
  });

  it("should show the search when clicked", () => {
    let $el = $(html);
    let header = new Header({ el: $el });

    $el.find(".js-lp-search").eq(0).trigger("click");

    expect(showSearchCalled).to.be(1);
  });
});
