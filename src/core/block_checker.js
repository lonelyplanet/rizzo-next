import $ from "jquery";

export default function() {
  window.lp.isAdblockActive = !!($(".ads.adpartner") && $(".ads.adpartner").is(":hidden"));

  window.lp.analytics.dataLayer = window.lp.analytics.dataLayer || {};
  window.lp.analytics.dataLayer.events = window.lp.analytics.dataLayer.events || [];

  if (window.lp.isAdblockActive) {
    window.lp.analytics.dataLayer.events.push({ category: "advertising", action: "loaded-with-adblock" });
  } else {
    window.lp.analytics.dataLayer.events.push({ category: "advertising", action: "loaded-without-adblock" });
  }
}
