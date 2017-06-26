import Injector from "Inject-loader!../../../src/components/articles/";
let clampCalls = 0, clampCalledWith;
let ArticlesComponent = Injector({
  "clamp-js/clamp.js": function(el, options) {
    ++clampCalls;
    clampCalledWith = options;
  },
  "Tabs": function() {}
}).default;
let $ = require("jquery");
let fixture = `
<article class="article">
  <div class="article__info">
    <a class="article__info__link" href="http://www.lonelyplanet.com/travel-tips-and-articles/where-and-how-to-watch-sport-like-a-local">
      <h2 class="article__info__title">Where and how to watch sport like a local</h2>
      <p class="article__info__teaser">There are few better ways into a place’s soul than through its sports teams. Step into the febrile atmosphere of a stadium or arena mid-match and you’ll find usually relaxed locals in a state of agitation or elation, depending on the scoreline.</p>
      <p class="article__info__blurb" style="overflow: hidden; text-overflow: ellipsis; -webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: 1;">Head to one of these sporting destinations and we promise you’ll see a side of town that’s impossible to find on the streets.</p>
    </a>

    <a class="article__info__author" href="https://auth.lonelyplanet.com/profiles/ddabdbb0-66a8-46e0-9e17-d95b14ad38cb">

        <img class="article__info__author__image" src="https://auth.lonelyplanet.com/profiles/ddabdbb0-66a8-46e0-9e17-d95b14ad38cb/image">

      <div class="article__info__author__creds">
        <div class="article__info__author__creds__name">Joe Minihane</div>
        <div class="article__info__author__creds__title">Lonely Planet Writer</div>
      </div>
    </a>
  </div>

    <a class="article__imagery" href="http://www.lonelyplanet.com/travel-tips-and-articles/where-and-how-to-watch-sport-like-a-local" tabindex="-1">
      <div class="article__imagery__image" aria-label="Image for Where and how to watch sport like a local" style="background-image: url(https://lonelyplanetwp.imgix.net/2015/08/bombonera_cs.jpg?w=748)"></div>
    </a>

</article>
`;
/** @test {ArticlesComponent} */
describe("articles component", () => {
  it("should detect mobile", () => {
    let el = $("<div />");
    let component = new ArticlesComponent({ el });

    component.widthWindow = () => 320;
    expect(component._detectScreen()).to.be("mobile");

    component.widthWindow = () => 1024;

    expect(component._detectScreen()).to.be("desktop");
  });

  it("should clamp lines", () => {
    let el = $("<div />").append(fixture);
    let component = new ArticlesComponent({ el });

    expect(clampCalls).to.be(1);
    expect(clampCalledWith.clamp).to.be(6);

    clampCalls = 0;
    clampCalledWith = null;

    component._findElements = () => {
      return { titleLines: 2, teaserLines: 5, teaser: $("<p />"), blurb: $("<p />") };
    };

    component._clampText();
    expect(clampCalledWith.clamp).to.be(4);
  });
});
