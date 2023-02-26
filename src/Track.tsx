import { Track } from "./core/Track";
import { globals, React } from "./globals";
import { ContextMenu, CONTEXT_MENU_SPACER } from "./ui/Components/ContextMenu";
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

        let channel_context = new ContextMenu(
            globals.mixer.getChannels().map(channel => channel.getName()),
            globals.mixer.getChannels().map(channel => () => {
                this.track.connect(channel);
                console.log("track \"" + this.track.getTitle() + "\" connected to channel \"" + channel.getName() + "\"");
                return true;
            })
        );

        let context_menu = new ContextMenu([
            "Rename, color and icon...",
            "Change color...",
            "Change icon...",
            "Auto name",
            "Auto name clips",
            CONTEXT_MENU_SPACER,
            "Track mode",
            "Performance settings",
            CONTEXT_MENU_SPACER,
            "Size",
            "Lock to this size",
            "[spacer]",
            "Group with above track",
            "Auto color group",
            CONTEXT_MENU_SPACER,
            "Current clip source",
            "Lock to content",
            "Merge pattern clips",
            "Consolidate this clip",
            "Mute all clips",
            CONTEXT_MENU_SPACER,
            "Insert one",
            "Delete one",
            CONTEXT_MENU_SPACER,
            "Move up",
            "Move down"
        ],[
            (e: MouseEvent) => {
                //showTrackConfig(e);
                return true;
            },
            () => {
                //color_picker.style.display = "block";
                return true;
            },
            null,
            null,
            null,
            (e: MouseEvent) => {
                channel_context.toggle(e);
                return false;
            },
            null,
            null,
            () => {
                globals.current_context_track.resize_locked = !globals.current_context_track.resize_locked;
                return true;
            },
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ]);

        this.element.querySelector(".description").addEventListener("contextmenu", (e: any) => {
            e.preventDefault();
            context_menu.toggle(e);
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