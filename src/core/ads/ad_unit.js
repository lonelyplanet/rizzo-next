export default class AdUnit {
  constructor($target) {
    this.$target = $target;
    this.$iframe = $target.find("iframe");
    this.initialize();
  }

  initialize() {
    if (this.isEmpty()) {
      this.$target.trigger(":ads/hidden");
      return;
    }

    this.$target.closest(".is-closed").removeClass("is-closed");
    this.$target.trigger(":ads/visible");

    let extension = this.$target.data("extension");

    if (extension && this.extensions[extension]) {
      this.extensions[extension].call(this);
    }
  }

  isEmpty() {
    if (this.$target.css("display") === "none") {
      return true;
    }

    // Sometimes DFP will return useless 1x1 blank images
    // so we must check for them.
    return this.$iframe.contents().find("img").width() === 1;
  }

  getType() {
    let patterns = /(leaderboard|leaderboar\-responsive|mpu-bottomboard|mpu|trafficDriver|adSense|sponsorTile)/,
        matches = this.$target.attr("class").match(patterns);

    return matches ? matches[1] : null;
  }

  refresh(newConfig) {
    let slot = this.$target.data("googleAdUnit");

    if (newConfig) {
      this.clearConfig(slot);
      this.setNewConfig(slot, newConfig);
    }

    window.googletag.pubads().refresh([ slot ]);
  }

  setNewConfig(slot, newConfig) {
    for (let param in newConfig) {
      slot.setTargeting(param, newConfig[param]);
    }
  }

  clearConfig(slot) {
    slot.clearTargeting();
  }

  get extensions() {
    return {
      stackMPU: () => {
        let $container = this.$target.closest(".js-card-sponsored");

        if (this.$iframe.height() > $container.outerHeight()) {
          $container.addClass("card--sponsored--double-mpu");
        }
      }
    };
  }
}
