import { Component } from "../../core/bane";
import VideoOverlay from "../video_overlay";

/**
 * Video Poster Button Component
*/
export default class VideoPosterButtonComponent extends Component {
    initialize () {

        // Temporary: querystring parameter video=true needs to be
        // used to get the poster button to appear.
        if (window.location.href.indexOf("video=true") == -1) {
            return;
        }

        this.overlay = new VideoOverlay({el: ".video-overlay"});

        this.events = {
            "click .video-poster-button__inner": "onClick"
        };

        this.listenTo(this.overlay, "video.loaded", this.onVideoLoaded);
    }

    render () {
        let title = "";
        let image = null;

        try {
            let mediainfo = this.overlay.player.player.mediainfo;
            title = mediainfo.name;
            image = mediainfo.poster;
        }
        catch (e) {
        }

        if (!image) {
            this.$el.removeClass("video-poster-button--visible");
        }

        let imageEl = this.$el.find(".video-poster-button__poster")[0];
        imageEl.onload = () => {
            this.$el.addClass("video-poster-button--visible");
        };
        imageEl.src = image;

        this.$el.find(".video-poster-button__title").text(title);

        return this;
    }

    onClick (e) {
        e.preventDefault();
        this.overlay.show();
    }

    onVideoLoaded () {
        this.render();
    }
}