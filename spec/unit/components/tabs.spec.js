import Tabs from "../../../src/components/tabs/tabs_component";
import $ from "jquery";

let expect = require("expect.js");

let fixture = `
<div class="tabs">
  <ul class="tabs__links">
    <li class="tabs__item"><a class="tabs__link js-tabs-link" href="#tab1">Tab 1</a></li>
    <li class="tabs__item"><a class="tabs__link js-tabs-link" href="#tab2">Tab 2</a></li>
  </ul>
  <div class="tabs__content js-tabs-content" id="tab1">
    Tab 1 Content
  </div>
  <div class="tabs__content js-tabs-content" id="tab2">
    Tab 2 Content
  </div>
</div>
`;


describe("tabs component", () => {
  it("should have a constructor", () => {
    expect(Tabs).to.be.ok();
  });

  describe("api", () => {
    let $el, tabs;

    beforeEach(() => {
      $el = $(fixture)

      tabs = new Tabs({
        el: $el
      });
    });

    it("should have an active tab", function() {
      expect(tabs.active.$tab[0].id).to.be("tab1");
    });

    it("should set tabs as active when clicking a link", function() {
      $el.find("[href='#tab2']").click();

      expect($el.find("[href='#tab1']").hasClass("is-active")).to.not.be.ok();
      expect(tabs.active.$tab[0].id).to.be("tab2");
    });
  })
});
