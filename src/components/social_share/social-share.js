import { Component } from "../../core/bane";
import $ from "jquery";
import urlencode from "urlencode";

class SocialShareComponent extends Component {
  initialize() {
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
        title,
        tweet,
        msg = $el.data("msg"),
        url = $el.data("url") || window.location.href,
        network = $el.data("network");

    if ($title) {
      title = $title;
      tweet = `${urlencode(title)} ${urlencode(url)} @lonelyplanet`;
    } else if (msg) {
      tweet = `${urlencode(msg)}`;
    }



    left = Math.round((winWidth / 2) - (width / 2));
    top = winHeight > height ? Math.round((winHeight / 2) - (height / 2)) : 0;

    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    let windowOptions = "toolbar=no,menubar=no,location=yes,resizable=no,scrollbars=yes",
        windowSize = `width=${width},height=${height},left=${left},left=${top}`;

    if (network === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "share", `${windowOptions},${windowSize}`);

      return "twitter";
    }

    if (network === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "share", `${windowOptions},${windowSize}`);

      return "facebook";
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
