import { Component } from "../../core/bane";
import MobilUtil from "../../core/mobile_util";
import $ from "jquery";
import urlencode from "urlencode";

class SocialShareComponent extends Component {
  initialize() {
    this.isMobile = MobilUtil.isMobile();
    this.isSocialShareMenuHidden = false;

    this.events = {
      "click .js-action-sheet-menu-control": "socialShareMenuControlClicked",
      "click .js-action-sheet-share-control": "socialShareControlClicked"
    };
  }

  socialShareMenuControlClicked(event) {
    let $el = $(event.currentTarget);
    let id = "#" + $el.attr("aria-owns"),
        $menu = $el.siblings(id);

    if (this.isSocialShareMenuHidden) {
      this.makeSocialShareMenuVisible($menu);
    } else {
      this.makeSocialShareMenuHidden($menu);
    }

    event.preventDefault();
  }

  makeSocialShareMenuVisible($menu) {
    this._hideSocialShareMenu($menu);
    this.isSocialShareMenuHidden = false;
  }


  makeSocialShareMenuHidden($menu) {
    this._showSocialShareMenu($menu);
    this.isSocialShareMenuHidden = true;

    return window.location.pathname;
  }

  socialShareControlClicked(event) {
    let $el = $(event.currentTarget);

    let width = 550,
        height = 420,
        winHeight = $(window).height(),
        winWidth = $(window).width(),
        left,
        top;

    let $title = $el.closest(".article").data("title"),
        $images = $el.closest(".article").find("img"),
        imageUrl = $($images).attr("src"),
        title,
        shareMsg,
        msg = $el.data("msg"),
        url = $el.data("url") || window.location.href,
        network = $el.data("network"),
        facebookAppId = "111537044496";

    if ($title) {
      title = $title;
      shareMsg = `${urlencode(title)} ${urlencode(url)}`;
    } else if (msg) {
      shareMsg = `${urlencode(msg)}`;
    }

    left = Math.round((winWidth / 2) - (width / 2));
    top = winHeight > height ? Math.round((winHeight / 2) - (height / 2)) : 0;

    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    let windowOptions = "toolbar=no,menubar=no,location=yes,resizable=no,scrollbars=yes",
        windowSize = `width=${width},height=${height},left=${left},left=${top}`;

    if (network === "twitter") {
      const tweet = `${shareMsg} @lonelyplanet`;
      window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "share", `${windowOptions},${windowSize}`);

      return "twitter";
    }

    if (network === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "share", `${windowOptions},${windowSize}`);

      return "facebook";
    }

    if (network === "pinterest") {
      window.open(`https://www.pinterest.com/pin/create/button/?url=${url}&media=${imageUrl}&description=${shareMsg}`, "share", `${windowOptions},${windowSize}`);

      return "pinterest";
    }

    if (network === "facebook-messenger") {
      window.open(`fb-messenger://share/?link=${url}&app_id=${facebookAppId}`, "share", `${windowOptions},${windowSize}`);

      return "facebook";
    }

    if (network === "whatsapp") {
      const url = this.isMobile ? `whatsapp://send?text=${shareMsg}` : `https://api.whatsapp.com/send?text=${shareMsg}`;
      window.open(url, "share", `${windowOptions},${windowSize}`);

      return "whatsapp";
    }

    if (network === "email") {
      window.location = `mailto:?body=${msg}`;

      return "email";
    }
  }

  _showSocialShareMenu($menu) {
    $menu
      .addClass("is-open")
      .prop("hidden", false)
      .attr("aria-hidden", "false");
  }

  _hideSocialShareMenu($menu) {
    $menu
      .removeClass("is-open")
      .prop("hidden", true)
      .attr("aria-hidden", "true");
  }
}

export default SocialShareComponent;
