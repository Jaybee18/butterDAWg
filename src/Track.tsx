import { Track } from "./core/Track";
import { cumulativeOffset, globals, React } from "./globals";
import { ContextMenu, CONTEXT_MENU_SPACER } from "./ui/Components/ContextMenu";
import { Color } from "./ui/misc/Color";
import { WindowType } from "./ui/misc/window";
import { ColorPicker } from "./ui/windows/ColorPicker";
import { PlaylistWindow } from "./ui/windows/PlaylistWindow";
import { windowTypeOpen } from "./util/Header";

export class TrackComponent {

	private element: HTMLElement;
	private track: Track;
	private resize_locked: boolean = false

	constructor(track: Track) {
		this.track = track;
		
		this.createElement();
		
        globals.tracks.push(this);
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

		this.element.querySelector("#track_title").innerHTML = this.track.title;

		let channel_context = new ContextMenu(
			globals.mixer.getChannels().map(channel => channel.getName()),
			globals.mixer.getChannels().map(channel => () => {
				this.track.connect(channel);
				console.log("track \"" + this.track.title + "\" connected to channel \"" + channel.getName() + "\"");
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
		], [
			(e: MouseEvent) => {
				//showTrackConfig(e);
				return true;
			},
			() => {
				new ColorPicker(this.track.color, (result: Color) => {
					// TODO border still not right color
					(this.element.querySelector(".description") as HTMLElement).style.background = result.color;
					this.track.color = result;
				}).toFront();
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
				this.resize_locked = !this.resize_locked;
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
			if (e.target === this.element.querySelector(".description")) {
				context_menu.toggle(e);
			}
		});

		this.element.querySelector(".description").addEventListener("mouseenter", () => {
			globals.header_help_text.innerHTML = this.track.title;
		});

		(this.element.querySelector(".radio_btn") as HTMLElement).addEventListener("click", (e: MouseEvent) => {
			e.preventDefault();
			var light = this.element.querySelector(".radio_btn_green") as HTMLElement;
			if (e.button === 0) {
				// the 'or' is bc the property is "" at first, but since the button
				// gets initialized with a green background, it gets treated as "green"
				var bg = light.style.backgroundColor;
				(bg === globals.green || bg === "") ? this.disable() : this.enable();
				// alert("track " + this.track.getTitle() + " is now " + (this.track.isActive() ? "active" : "inactive"));
			}
		});

		(this.element.querySelector(".radio_btn") as HTMLElement).addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			const tracks = globals.tracks;
			let all_tracks_disabled = true;
			tracks.forEach(track => {
				if (track.isEnabled() && track !== this) {
					all_tracks_disabled = false;
				}
			});
			
			if (all_tracks_disabled && this.isEnabled()) {
				for (let i = 0; i < tracks.length; i++) {
					tracks[i].enable();
				}
			} else {
				for (let i = 0; i < globals.tracks.length; i++) {
					(tracks[i] !== this) ? tracks[i].disable() : tracks[i].enable();
				}
			}
		});

		this.initializeResizing();
	}

	getElement() {
		return this.element;
	}

	lockResize() {
		this.resize_locked = true;
	}

	unlockResize() {
		this.resize_locked = false;
	}

	getHeight() {
		return this.element.clientHeight;
	}

	disable() {
		this.track.setActive(false);
		
		const radio_btn = this.element.querySelector(".radio_btn");
		(radio_btn.firstElementChild as HTMLElement).style.backgroundColor = globals.grey;

		const description = this.element.querySelector(".description") as HTMLElement;
		description.style.backgroundColor = this.track.color.darken(20);
		description.style.color = "#ffffff45";
		description.style.borderRightColor = this.track.color.darken(20);
		description.style.borderLeftColor = this.track.color.darken(20);
		description.style.background = "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) " + this.track.color.darken(20);
	}

	enable() {
		this.track.setActive(true);
		
		const radio_btn = this.element.querySelector(".radio_btn");
		(radio_btn.firstElementChild as HTMLElement).style.backgroundColor = globals.green;
		
		const description = this.element.querySelector(".description") as HTMLElement;
		description.style.backgroundColor = this.track.color.color;
		description.style.color = "";
		description.style.borderRightColor = this.track.color.lighten(10);
		description.style.background = this.track.color.color;
	}

	isEnabled() {
		return this.track.isActive()
	}

	private initializeResizing() {
		let resize_handle = this.element.querySelector("#track_resize") as HTMLElement;
		let resizing_track: HTMLElement = null;
		let temp_this = this;
		let mouse_down_y = 0;
		let mouse_down_height = 0;
		function movefunc(e: MouseEvent) {
			if (resizing_track === null || temp_this.resize_locked) {
				return false;
			}
			const new_height = mouse_down_height + e.clientY - mouse_down_y;
			resizing_track.style.height = new_height + "px";

			// notify the playlist canvas about the new track size
			if (windowTypeOpen(WindowType.Playlist)) {
				const playlist = globals.windows.find(window => window.getType() === WindowType.Playlist);
				if (playlist instanceof PlaylistWindow) {
					playlist.updatePlaylist();
				}
			}
		}
		resize_handle.onmousedown = function (e) {
			document.addEventListener("mousemove", movefunc);
			if (temp_this.resize_locked) { return false; }
			resizing_track = temp_this.getElement();
			mouse_down_y = e.clientY;
			mouse_down_height = resizing_track.clientHeight;
			return false;
		};
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", movefunc);
		});
	}
}