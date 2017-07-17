// This is gonna be a doozy
let Injector = require("inject-loader!../../../src/components/map/map_component");

let pushState = sinon.stub();

let MapComponent = Injector({
  "react": {
    render: function() {},
    createElement: function() {}
  },
  "./views/main.jsx": function() {},
  "history/createBrowserHistory": function() {
    return {
      push: pushState
    };
  },
  "./map_api": {
    fetch: () => {
      return {
        done: sinon.spy()
      };
    }
  }
}).default;

let $ = require("jquery");

window.lp = {
  place: {
    slug: "/foo"
  }
};

describe("map component", () => {
  it("should open, close and adjust the url", () => {
    let map = new MapComponent();

    sinon.stub(map, "isOnMap")
      .returns(false);

    map.open();

    expect(pushState.calledOnce).to.be.ok();
    expect(pushState.getCall(0).args[0].pathname.indexOf("/map")).to.not.be(-1);

    map.close();

    expect(pushState.getCall(1).args[0].pathname.indexOf("/map")).to.be(-1);

    pushState.reset();
  });
});
