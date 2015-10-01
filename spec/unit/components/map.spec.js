// This is gonna be a doozy
let Injector = require("inject!../../../src/components/map/map_component");

let pushState = sinon.stub();

let MapComponent = Injector({
  "react": {
    render: function() {},
    createElement: function() {}
  },
  "./views/main.jsx": function() {},
  "history": {
    createHistory: function() {
      return {
        pushState: pushState
      }
    }
  }
});

let $ = require("jquery");

describe("map component", () => {
  it("should open, close and adjust the url", () => {
    let map = new MapComponent();
    
    sinon.stub(map, "isOnMap")
      .returns(false)

    map.open();

    expect(pushState.calledOnce).to.be.ok();
    expect(pushState.getCall(0).args[1].indexOf("/map")).to.not.be(-1);

    map.close();

    expect(pushState.getCall(1).args[1].indexOf("/map")).to.be(-1);

    pushState.reset();
  });
});
