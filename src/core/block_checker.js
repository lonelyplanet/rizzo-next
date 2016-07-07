import $ from "jquery";
import trackEvent from "../core/events/track_event";

export default function() {
  window.lp.isAdblockActive = !!($(".ads.adpartner") && $(".ads.adpartner").is(":hidden"));

  if (window.lp.isAdblockActive) {

    trackEvent({ name: "loaded-with-adblock", data: { category: "advertising", label: window.location.pathname }});

  } else {

    trackEvent({ name: "loaded-without-adblock", data: { category: "advertising", label: window.location.pathname }});
  }
}
