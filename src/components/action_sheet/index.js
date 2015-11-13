import { Component } from "../../core/bane";
import $ from "jquery";
import urlencode from "urlencode";
import "./action_sheet.scss";

class ActionSheetComponent extends Component {
  initialize() {
    let self = this;
    self.isActionSheetMenuHidden = false;

    self.$el.find(".js-action-sheet-item").each(function(index, el) {
      $(el).find(".js-action-sheet-control").on("click", function(event) {
        let id = "#" + $(this).attr("aria-owns"),
            $menu = $(this).siblings(id);

        if (self.isActionSheetMenuHidden) {
          self._hideActionSheetMenu($menu);
          self.isActionSheetMenuHidden = false;
        } else {
          self._showActionSheetMenu($menu);
          self.isActionSheetMenuHidden = true;
        }

        event.preventDefault();
      });
    });

    this._share();
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

  _share() {
    let width = 550,
        height = 420,
        winHeight = $(window).height(),
        winWidth = $(window).width(),
        left,
        top;

    $(".action-sheet-menu").find(".action-sheet-control").each((index, el) => {
      $(el).on("click", function() {
        let title = $(this).parents(".article").find("meta[itemprop=\"headline\"]")[0].content,
            url = window.location.href,
            network = $(this).data("network");

        let tweet = urlencode(title) + " " + urlencode(url) + " via @lonelyplanet"

        left = Math.round((winWidth / 2) - (width / 2));
        top = 0;

        if (winHeight > height) {
          top = Math.round((winHeight / 2) - (height / 2));
        }

        let windowOptions = "toolbar=no,menubar=no,location=yes,resizable=no,scrollbars=yes",
            windowSize = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;

        if (network === "twitter") {
          window.open("https://twitter.com/intent/tweet?text=" + tweet, "share", windowOptions + "," + windowSize);
        }

        if (network === "facebook") {
          window.open("https://www.facebook.com/sharer/sharer.php?u=" + url, "share", windowOptions + "," + windowSize);
        }
      });
    });
  }
}

export default ActionSheetComponent;
