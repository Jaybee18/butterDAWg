import { Window, toolbarButtonOptions } from "./window";
import { cumulativeOffset, globals, pixels_to_ms, React, setPixel } from "./globals";
import { Track } from "./Track";
import { BrowserWindow } from "electron";
import { Color } from "./Color";
import { readdirSync } from "fs";
import { AudioGraph } from "./AudioGraphWindow";
import { setupPalette } from "./Palette";

class Playlist extends Window {

	private tracks: Array<Track>;

	constructor() {
		super();
		this.tracks = [];
	}

	initialiseContent(): void {
		this.get(".content").appendChild(
			<div className="tracks_wrapper">
				<div className="tracks_palette_wrapper">
					<div className="tracks_palette">
						<div className="palette_scope">
							<div className="tool_button">
								<img className="piano_svg" src="./graphics/piano.svg"></img>
							</div>
							<div className="tool_button">
								<img className="wave_svg" src="./graphics/wave.svg"></img>
							</div>
							<div className="tool_button">
								<img className="automation_svg" src="./graphics/automation.svg"></img>
							</div>
						</div>
						<div className="palette_wrapper">
							<div className="palette"></div>
							<div className="palette_scrollbar">
								<div className="palette_scrollbar_top"></div>
								<div className="palette_scrollbar_handle"></div>
								<div className="palette_scrollbar_bottom"></div>
							</div>
						</div>
					</div>

					<div className="tracks_wrapper_wrapper">
						<div className="tracks_top_bar">
							<div className="top_bar_corner_svg">
								<img src="./graphics/corner.svg"></img>
								<img className="piano_svg" src="./graphics/piano.svg"></img>
								<img className="automation_svg" src="./graphics/automation.svg"></img>
								<img className="wave_svg" src="./graphics/wave.svg"></img>
							</div>
							<div id="tracks_top_bar_inner">
								<div className="tracks_top_bar_scrollbar">
									<div className="tracks_top_bar_scrollbar_left"><i className="fa-solid fa-chevron-left"></i></div>
									<div className="tracks_top_bar_scrollbar_handle" id="tracks_top_bar_scrollbar_handle"></div>
									<div className="tracks_top_bar_scrollbar_right"><i className="fa-solid fa-chevron-right"></i></div>
								</div>
								<div className="tracks_top_bar_bars_wrapper">
									<div className="tracks_top_bar_bars">
										<img id="bars_cursor" src="./graphics/cursor.svg"></img>
										<canvas className="bars_canvas" width={200} height={100}></canvas>
									</div>
								</div>
							</div>
						</div>
						<div className="tracks" id="tracks">
							<div className="line_cursor"></div>
						</div>
					</div>
				</div>
			</div> as any);

		// first load all possible audio plugins, then initialise the tracks so the
		// tracks can be sure that every module is loaded and they don't have to
		// import any
		let plugin_promises = readdirSync("AudioNodes").map((v) => {
			return globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
		});
		Promise.allSettled(plugin_promises).then(() => {
			for (let i = 0; i < 15; i++) {
				this.tracks.push(new Track());
			}
		});

		// add mouse wheel dragging
		let drag_mouse_down_pos_x = 0;
		let drag_mouse_down_pos_y = 0;
		let delta_delta_x = 0;
		let delta_delta_y = 0;
		let wheel_down = false;
		this.get(".tracks").addEventListener("mousedown", (e) => {
			e.preventDefault();
			if (e.button === 1) {
				drag_mouse_down_pos_x = e.clientX;
				drag_mouse_down_pos_y = e.clientY;
				wheel_down = true;
			}
		});
		document.addEventListener("mouseup", () => { wheel_down = false; delta_delta_x = 0; delta_delta_y = 0; });
		let bars = this.get(".tracks_top_bar_bars_wrapper");
		let bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
		let bars_scrollbar_wrapper = this.get(".tracks_top_bar_scrollbar");
		let maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
		let temp_this = this;
		function tracks_scroll_by_px(pixelX: number, pixelY: number) {
			let track_width = globals.tracks[0].content.querySelector(".track_background").clientWidth - globals.tracks[0].content.clientWidth;
			globals.tracks.forEach((t: Track) => {
				t.content.scrollBy({ left: pixelX });
			});
			var percent = globals.tracks[0].content.scrollLeft / track_width;
			bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";

			bars.scrollBy({ left: pixelX });
			bars.scrollLeft = Math.min(bars.scrollLeft, track_width);
			temp_this.get(".tracks").scrollBy({ top: pixelY });
			temp_this.tracks.forEach(t => {t.scrollBy(pixelX)});
		}
		this.get(".tracks").addEventListener("mousemove", (e) => {
			if (wheel_down) {
				var deltaX = drag_mouse_down_pos_x - e.clientX;
				var deltaY = drag_mouse_down_pos_y - e.clientY;
				tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
				delta_delta_x = deltaX;
				delta_delta_y = deltaY;
			}
		});

		// the playlist slider at the top of the widget
		let initial_handle_offset = 0;
		let tracks_scroll_percent = 0;
		let current_track_scroll_percent = 0;
		let track_width = 0;
		function tracks_scroll_to(percentX: number, percentY: number) {
			current_track_scroll_percent = percentX;
			track_width = globals.tracks[0].content.querySelector(".track_background").clientWidth - globals.tracks[0].content.clientWidth;
			maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
			globals.tracks.forEach(t => {
				t.content.scrollTo({ top: percentY, left: percentX * track_width });
			});
			bars.scrollTo({ left: percentX * track_width });
			bars_scrollbar_handle.style.left = (20 + maxX * percentX) + "px";
		}
		function bars_scrollbar_handle_listener(e: MouseEvent) {
			var newX = e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset - 20;
			newX = Math.min(Math.max(newX, 0), maxX);
			tracks_scroll_percent = newX / maxX;
			tracks_scroll_to(tracks_scroll_percent, 0);
		}
		bars_scrollbar_handle.addEventListener("mousedown", (e) => {
			initial_handle_offset = e.clientX - cumulativeOffset(bars_scrollbar_handle).left;
			bars_scrollbar_handle.style.left = (e.clientX - cumulativeOffset(bars_scrollbar_wrapper).left - initial_handle_offset) + "px";
			document.addEventListener("mousemove", bars_scrollbar_handle_listener);
		});
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", bars_scrollbar_handle_listener);
		});

		// play indicator drag listener
		let top_bar = this.get("#tracks_top_bar_inner");
		let top_bar_bars = this.get(".tracks_top_bar_bars");
		let cursor = this.get("#bars_cursor");
		let track_bar_cursor = this.get(".line_cursor");
		let sidebar = this.get(".tracks_palette");
		function bars_cursor_move_listener(e: MouseEvent) {
			if (e.clientX - cumulativeOffset(top_bar).left <= 0) { cursor.style.left = "-10px"; return; }
			var newX = e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft;
			cursor.style.left = newX + "px";
			globals.cursor_pos = newX;
			globals.current_time = pixels_to_ms(newX);
			track_bar_cursor.style.left = cumulativeOffset(cursor.parentElement).left - sidebar.clientWidth - 6.5 + globals.cursor_pos + bars.scrollLeft + 97 + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
		}
		top_bar_bars.addEventListener("mousedown", (e) => {
			cursor.style.left = (e.clientX - cumulativeOffset(top_bar).left - 10 + bars.scrollLeft).toString() + "px";
			document.addEventListener("mousemove", bars_cursor_move_listener);
		});
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", bars_cursor_move_listener);
		});

		// tool buttons
		this.addToolbarButton("fa-solid fa-magnet", new Color("#7eefa9"), () => { }, {
			customCss: "transform: rotate(180deg) translate(0.5px, 1px);",
			customParentCss: "margin-right: 17px;"
		} as toolbarButtonOptions);
		this.addToolbarButton("fa-solid fa-pencil", new Color("#fcba40"), () => { });
		this.addToolbarButton("fa-solid fa-brush", new Color("#7bcefd"), () => { }, {
			customCss: "transform: translate(1px, 0.5px) rotate(-45deg);"
		} as toolbarButtonOptions);
		this.addToolbarButton("fa-solid fa-ban", new Color("#ff5b53"), () => { });
		this.addToolbarButton("fa-solid fa-volume-xmark", new Color("#ff54b0"), () => { });
		this.addToolbarButton("fa-solid fa-arrows-left-right", new Color("#ffa64a"), () => { });
		this.addToolbarButton("fa-solid fa-spoon", new Color("#85b3ff"), () => { });
		this.addToolbarButton("fa-solid fa-expand", new Color("#ffab60"), () => { });
		this.addToolbarButton("fa-solid fa-magnifying-glass", new Color("#85b3ff"), () => { });
		this.addToolbarButton("fa-solid fa-volume-high", new Color("#ffa64a"), () => { }, {
			customCss: "transform: scale(0.9);"
		} as toolbarButtonOptions);

		// generate bar labels
		this.updateBarLabels();

		setupPalette();

		this.setContentSize(1200, 700);
	}

	onResizeContent(newWidth: number, newHeight: number): void {
		this.tracks.forEach(t => t.updateCanvas());
		this.updateBarLabels();
	}

	updateBarLabels() {
		let bars_canvas = this.get(".bars_canvas") as HTMLCanvasElement;
		bars_canvas.width = bars_canvas.clientWidth*2;
		bars_canvas.height = bars_canvas.clientHeight;
		let ctx = bars_canvas.getContext("2d");

		ctx.fillStyle = "#d3d3d3";
		ctx.lineWidth = 1;
		for (let i = 0; i < bars_canvas.clientWidth*2/globals.xsnap; i++) {
			if (i%12==0 || i%4==0) {
				ctx.font = (i%12==0? "15pt" : "10pt") + " Calibri";
				ctx.fillText((i+1).toString(), i*globals.xsnap, bars_canvas.height - 3);
			}
		}
	}
}

let playlist = new Playlist();
