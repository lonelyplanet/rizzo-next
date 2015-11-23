import { Component } from "../../core/bane";
import $ from "jquery";
import urlencode from "urlencode";
import track from "../../core/decorators/track";
import "./action_sheet.scss";

class ActionSheetComponent extends Component {
  initialize() {
    this.isActionSheetMenuHidden = false;

    this.events = {
      "click .js-action-sheet-menu-control": "actionSheetMenuControlClicked",
      "click .js-action-sheet-share-control": "actionSheetShareControlClicked"
    };
  }

  @track("Share Menu Click");
  actionSheetMenuControlClicked(event) {
    let $el = $(event.currentTarget);
    let id = "#" + $el.attr("aria-owns"),
        $menu = $el.siblings(id);

    if (this.isActionSheetMenuHidden) {
      this._hideActionSheetMenu($menu);
      this.isActionSheetMenuHidden = false;
    } else {
      this._showActionSheetMenu($menu);
      this.isActionSheetMenuHidden = true;
    }

    event.preventDefault();
  }

  @track("Share Button Click");
  actionSheetShareControlClicked(event) {
    let $el = $(event.currentTarget);

    let width = 550,
        height = 420,
        winHeight = $(window).height(),
        winWidth = $(window).width(),
        left,
        top;

    let title = $el.closest(".article").find("meta[itemprop=\"headline\"]")[0].content,
        url = window.location.href,
        network = $el.data("network");

    let tweet = `${urlencode(title)} ${urlencode(url)} via @lonelyplanet`;

    left = Math.round((winWidth / 2) - (width / 2));
    top = 0;

    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    let windowOptions = "toolbar=no,menubar=no,location=yes,resizable=no,scrollbars=yes",
        windowSize = `width=${width},height=${height},left=${left},left=${top}`;

    if (network === "twitter") {
      window.open("https://twitter.com/intent/tweet?text=" + tweet, "share", windowOptions + "," + windowSize);
    }

    if (network === "facebook") {
      window.open("https://www.facebook.com/sharer/sharer.php?u=" + url, "share", windowOptions + "," + windowSize);
    }
  }

  _showActionSheetMenu($menu) {
    $menu
      .addClass("is-open")
      .prop("hidden", false)
      .attr("aria-hidden", "false");
  }

  _hideActionSheetMenu($menu) {
    $menu
      .removeClass("is-open")
      .prop("hidden", true)
      .attr("aria-hidden", "true");
  }
}

export default ActionSheetComponent;
