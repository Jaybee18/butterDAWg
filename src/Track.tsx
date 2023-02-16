import { Track } from "./core/Track";
import { addRadioEventListener, React } from "./globals";
export class TrackComponent {

    private element: HTMLElement;
    private track: Track;

    constructor(track: Track) {
        this.track = track;

        this.createElement();
    }

    createElement() {
        this.element = 
        <div className="track" id="replace_this_id">
            <div id="track_wrap">
            <div className="description">
                <p id="track_title">track_name</p>
                <i className="fa-solid fa-ellipsis"></i>
                <div className="radio_btn">
                <div className="radio_btn_green"></div>
                </div>
                <div id="track_resize"></div>
            </div>
            <div className="track_play_indicator"></div>
            </div>
        </div> as any;

        this.element.querySelector("#track_title").innerHTML = this.track.getTitle();

        this.element.querySelector(".description").addEventListener("contextmenu", (e) => {
            e.preventDefault();
            alert("contextmenu for track " + this.track.getTitle());
        });

        this.element.querySelector(".radio_btn").addEventListener("click", () => {
            this.track.setActive(!this.track.isActive());
            alert("track " + this.track.getTitle() + " is now " + (this.track.isActive()?"active":"inactive"));
        });
    }

    getElement() {
        return this.element;
    }
}