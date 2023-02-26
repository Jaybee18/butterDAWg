import { Window, toolbarButtonOptions } from "./window";
import { cumulativeOffset, globals, ms_to_pixels, pixels_to_ms, React, setPixel } from "./globals";
import { Track } from "./Track";
import { BrowserWindow } from "electron";
import { Color } from "./ui/misc/Color";
import { readdirSync } from "fs";
import { AudioGraph } from "./AudioGraphWindow";
import { setupPalette } from "./Palette";
import { Item } from "./PaletteItem";

class TrackItem {

	private item: Item;
	private position: {x: number, y: number};
	private width: number;
	public canvas: HTMLCanvasElement;

	private buffer: AudioBuffer;
	private source: AudioBufferSourceNode;
	private data: Float64Array;

	private track: Track;

	constructor(item: Item) {
		this.item = item;
		this.position = {x: 0, y: 0}; // offset from the left in px
		this.track = globals.tracks[0];
		this.canvas = document.createElement("canvas");
		
		// create an offscreen canvas template to render this sample to the main canvas
		this.canvas.width = 20 * 12;
		this.canvas.height = 70;
		
		// load audio data for playback
		this.data = this.item.getData();
		this.buffer = globals.audiocontext.createBuffer(2, this.data.length, globals.audiocontext.sampleRate * 2);
		this.buffer.copyToChannel(Float32Array.from(this.data), 0);
		this.buffer.copyToChannel(Float32Array.from(this.data), 1);
		
		this.setWidth(ms_to_pixels(item.getDuration()*1000));

		this.updateCanvas();
	}

	updateCanvas() {
		let ctx = this.canvas.getContext("2d");
		ctx.translate(0.5, 0.5);

		// draw the actual waveform into the frame
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.lineJoin = "bevel";
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 1.2;
		const step = this.data.length / this.canvas.width;
		ctx.moveTo(0, this.canvas.height * 1.5);
		for (let i = 0; i < this.data.length; i+=2) {
			ctx.lineTo(i / step, Math.sin(this.data[i] * 100 * (Math.PI / 180)) * 30 + this.canvas.height / 2);
		}
		ctx.stroke();

	}

	move(deltaX: number, deltaY: number) {
		this.position.x += deltaX;
		this.position.y += deltaY;
	}

	getPosition() {
		return this.position;
	}

	getSnappedPosition() {
		return {x: this.position.x - (this.position.x%globals.xsnap), y: this.position.y - (this.position.y%70)};
	}

	setPosition(newPos: {x: number, y: number}) {
		this.position = newPos;
		this.track = globals.tracks[Math.floor(this.position.y / 70)];
	}

	setWidth(width: number) {
		this.width = width;
		this.canvas.width = this.width;
		this.updateCanvas();
	}

	scaleTo(width: number, height: number) {
		this.width = width;
	}

	expand(delta: number) {
		this.width += delta;
	}

	getWidth() {
		return this.width;
	}

	getItem() {
		return this.item;
	}

	play() {
		this.source = new AudioBufferSourceNode(globals.audiocontext, {buffer: this.buffer} as AudioBufferSourceOptions);
		this.source.connect(this.track.audio_node);
		
		// TODO there is also a offset parameter in .start() -> use that when the cursor is somewhere
		// in the middle of the sample
		const timestamp = globals.audiocontext.currentTime + (pixels_to_ms(this.getSnappedPosition().x)/1000 - globals.current_time/1000);
		if (timestamp >= globals.audiocontext.currentTime) {
			this.source.start(timestamp);
		} else if (timestamp + this.width >= globals.audiocontext.currentTime) {
			this.source.start(globals.audiocontext.currentTime, globals.audiocontext.currentTime - timestamp);
		}
	}

	stop() {
		this.source.stop();
	}
}

export class Playlist extends Window {

	tracks: Array<Track>;
	private samples: Array<TrackItem>;
	private scroll: number;
	private currentHoverSample: TrackItem;

	constructor() {
		super(false);
		this.tracks = [];
		this.samples = [];
		this.scroll = 0;

		this.initialiseContent();
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
										<img className="bars_cursor" id="bars_cursor" src="./graphics/cursor.svg"></img>
										<canvas className="bars_canvas" width={200} height={100}></canvas>
									</div>
								</div>
							</div>
						</div>
						<div className="tracks">
							<div className="line_cursor"></div>
							<div className="tracks_content_wrapper">
								<div id="tracks" className="tracks_descriptions"></div>
								<canvas className="tracks_canvas"></canvas>
							</div>
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

		// scroll listeners
		let last_scroll_event_timestamp: number = null;
		let refreshTimer: NodeJS.Timeout = null;
		this.get(".tracks").addEventListener("wheel", (e) => {
			e.preventDefault();
			if (globals.control_down) {
				let delta = e.deltaY / 100;
				let ratio = (globals.xsnap-delta)/globals.xsnap;

				let temp_timestamp = Date.now();
				let time_since_last_scroll_event = last_scroll_event_timestamp === null ? 0 : temp_timestamp - last_scroll_event_timestamp;
				last_scroll_event_timestamp = temp_timestamp;
				
				this.samples.forEach(s => {
					s.setPosition({x: s.getPosition().x*ratio, y: s.getPosition().y});
					if (time_since_last_scroll_event > 300) {
						s.setWidth(s.getWidth()*ratio);
					} else {
						s.scaleTo(s.getWidth()*ratio, 1);
						clearTimeout(refreshTimer);
					}
				});

				refreshTimer = setTimeout(async () => {
					this.samples.forEach(s => {
						s.setWidth(s.getWidth()); 
					});
					this.updatePlaylist();
					last_scroll_event_timestamp = null;
				}, 500);

				globals.xsnap -= delta;
			}
			this.updateBarLabels();
			this.updatePlaylist();
		});

		document.addEventListener("mouseup", () => {
			wheel_down = false; 
			delta_delta_x = 0; 
			delta_delta_y = 0;
		});
		let bars = this.get(".tracks_top_bar_bars_wrapper");
		let bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
		let bars_scrollbar_wrapper = this.get(".tracks_top_bar_scrollbar");
		let maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
		let temp_this = this;
		function _tracks_scroll_by_px(pixelX: number, pixelY: number) {
			let track_width = globals.tracks[0].content.querySelector(".track_background").clientWidth - globals.tracks[0].content.clientWidth;
			globals.tracks.forEach((t: Track) => {
				t.content.scrollBy({ left: pixelX });
			});
			var percent = globals.tracks[0].content.scrollLeft / track_width;
			bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";

			bars.scrollBy({ left: pixelX });
			bars.scrollLeft = Math.min(bars.scrollLeft, track_width);
			temp_this.get(".tracks").scrollBy({ top: pixelY });
			temp_this.tracks.forEach(t => { t.scrollBy(pixelX) });
		}
		function tracks_scroll_by_px(px: number, py: number) {
			temp_this.scroll += px;
			temp_this.scroll = Math.max(temp_this.scroll, 0);
			bars_scrollbar_handle.style.left = (20 + maxX * 0.5) + "px";
			temp_this.get(".tracks").scrollBy({ top: py });
			temp_this.updatePlaylist();
			temp_this.updateBarLabels();
		}
		function point_in_rect(x:number, y:number, rectx:number, recty:number, rectw:number, recth:number) {
			return x > rectx && x < rectx+rectw && y > recty && y < recty+recth;
		}
		this.get(".tracks").addEventListener("mousemove", (e) => {
			// mouse cursor offset for correct coordinate mapping
			let base = cumulativeOffset(this.get(".tracks_canvas"));
			if (globals.current_drag_element !== null) {
				// let the canvas move listener handle sample imports
				return;
			} else if (wheel_down) {
				var deltaX = drag_mouse_down_pos_x - e.clientX;
				var deltaY = drag_mouse_down_pos_y - e.clientY;
				tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
				delta_delta_x = deltaX;
				delta_delta_y = deltaY;
			} else if (e.buttons === 1 && this.currentHoverSample !== null) {
				this.currentHoverSample.setPosition({x: this.currentHoverSample.getPosition().x + e.movementX, y: e.clientY - cumulativeOffset(this.get(".tracks_canvas")).top});
				this.updatePlaylist();
			} else {
				// if for any sample the current mouse position is within its
				// frame bounds, show a move cursor, else default cursor
				let c = this.samples.map(sample => {
					return point_in_rect(e.clientX - base.left + this.scroll, e.clientY - base.top, sample.getSnappedPosition().x, sample.getSnappedPosition().y, sample.getWidth(), 70);
				});
				if (c.some(v => v)) {
					this.currentHoverSample = this.samples[c.indexOf(true)];

					// display a resize cursor at the edge of the sample
					if (e.clientX - base.left + this.scroll > this.currentHoverSample.getSnappedPosition().x + this.scroll + this.currentHoverSample.getWidth() - 5) {
						this.get(".tracks_canvas").style.cursor = "e-resize";
					} else {
						this.get(".tracks_canvas").style.cursor = "move";
					}
				} else {
					this.get(".tracks_canvas").style.cursor = "default";
					this.currentHoverSample = null;
				}
			}
		});
		this.get(".tracks_canvas").addEventListener("mousemove", (e) => {
			let base = cumulativeOffset(this.get(".tracks_canvas"));
			if (globals.current_drag_element !== null) {
				if (globals.current_drag_element_preview === null) {
					// create a preview of the currently dragged sample
					if (globals.current_drag_element instanceof Item) {
						globals.current_drag_element_preview = new TrackItem(globals.current_drag_element);
						this.samples.push(globals.current_drag_element_preview);
					}
				}

				(globals.current_drag_element_preview as TrackItem).setPosition({x: e.clientX - base.left, y: e.clientY - base.top});
				this.updatePlaylist();
			}
		});

		// play listener
		let track_cursor = this.get(".bars_cursor");
		let cursor_anim: NodeJS.Timer = null;
		globals.cursor_pos = track_cursor.offsetLeft;
		const interval_time = 10;
		const cursor_step = ms_to_pixels(interval_time);
		document.addEventListener("keypress", (e) => {
			if (e.code === "Space" && !globals.deactivate_space_to_play) {
				e.preventDefault();

				if (!globals.is_playing) {
					// resume the suspended audiocontext
					globals.audiocontext.resume().then(() => {
						// put all samples in the queue of the audiocontext
						this.play();
					});

					// animate the play cursor
					cursor_anim = setInterval(() => {
						globals.cursor_pos += cursor_step;
						track_cursor.style.left = globals.cursor_pos + "px";
						globals.current_time += 10;
					}, interval_time);

					// some logs
					console.log("playback started");
				} else {
					// stop the cursor animation
					clearInterval(cursor_anim);

					// stop the audiocontext and clear the audio queue
					globals.audiocontext.suspend();
					this.samples.forEach(s => s.stop());

					// some logs
					console.log("playback stopped");
				}

				globals.is_playing = !globals.is_playing;
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
			this.currentHoverSample = null;
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

		// generate playlist
		this.updatePlaylist();

		setupPalette();

		this.setContentSize(1200, 700);
	}

	onResizeContent(newWidth: number, newHeight: number): void {
		this.tracks.forEach(t => t.updateCanvas());
		this.updateBarLabels();
		this.updatePlaylist();
	}

	updateBarLabels() {
		let bars_canvas = this.get(".bars_canvas") as HTMLCanvasElement;
		bars_canvas.width = bars_canvas.clientWidth * 2;
		bars_canvas.height = bars_canvas.clientHeight;
		let ctx = bars_canvas.getContext("2d");

		ctx.fillStyle = "#d3d3d3";
		ctx.lineWidth = 1;
		for (let i = 0; i < bars_canvas.clientWidth * 2 / globals.xsnap; i++) {
			if (i % 12 == 0 || i % 4 == 0) {
				ctx.font = (i % 12 == 0 ? "15pt" : "10pt") + " Calibri";
				ctx.fillText((i + 1).toString(), (i * globals.xsnap - this.scroll) * 2, bars_canvas.height - 3);
			}
		}
	}

	updatePlaylist() {
		if (this.tracks === undefined) { return; }
		let playlist = this.get(".tracks_canvas") as HTMLCanvasElement;
		playlist.width = playlist.clientWidth;
		playlist.height = playlist.clientHeight;
		let ctx = playlist.getContext("2d", { alpha: false });
		ctx.imageSmoothingEnabled = false;
		ctx.translate(0.5, 0.5);

		// draw background
		ctx.fillStyle = "#34444e";
		ctx.fillRect(0, 0, playlist.width, playlist.height);

		const w = globals.xsnap;
		const o = this.scroll;
		const h = 70; // TODO idk for some fucking reason a track is exactly 70 px high

		// draw slightly darker background
		ctx.fillStyle = "#2e3e48";
		for (let i = 0; i < (playlist.width + o) / w; i++) {
			if (i % (12 * 8) == 0) {
				ctx.fillRect(i * w + (w * 12 * 4) - o, 0, w * 12 * 4, playlist.height);
			}
		}

		// draw vertical seperators
		ctx.strokeStyle = "#182832";
		ctx.lineWidth = 1;
		for (let i = 0; i < this.tracks.length; i++) {
			ctx.moveTo(0, i * 70);
			ctx.lineTo(playlist.width, i * 70);
		}
		ctx.stroke();

		// draw vertical lines
		ctx.strokeStyle = "10202a";
		ctx.lineWidth = 0.4;
		for (let i = 0; i < (playlist.width + o) / w; i++) {
			ctx.beginPath();
			if (i % 12 == 0) {
				ctx.lineWidth = 0.5;
			} else {
				ctx.lineWidth = 0.3;
			}
			ctx.moveTo(i * w - o, 0);
			ctx.lineTo(i * w - o, playlist.height);
			ctx.stroke();
		}

		// draw samples
		this.samples.forEach(sample => {
			const p = sample.getSnappedPosition();
			ctx.drawImage(sample.canvas, p.x - o, p.y, sample.getWidth(), 70);

			// draw the frame of the sample
			const color = "#a34bf2"
			ctx.strokeStyle = color + "b0";
			//ctx.lineWidth = sample === this.currentHoverSample ? 2 : 1.2;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.roundRect(p.x - o, p.y, sample.getWidth(), h, 2);
			ctx.fillStyle = color + "30";
			ctx.fill();
			ctx.stroke();

			// draw the actual waveform into the frame
			/*let data = sample.getItem().getData();
			ctx.beginPath();
			ctx.lineCap = "round";
			ctx.lineJoin = "bevel";
			ctx.lineWidth = 1.5;
			ctx.moveTo(sample.getPosition()+sample.getWidth(), h*1.5);
			for (let i = 0; i < data.length; i++) {
				ctx.lineTo(sample.getWidth()+sample.getPosition()+i/(data.length/sample.getWidth()), h*1.5 + Math.sin(data[i]*100*(Math.PI/180))*30);
			}
			ctx.stroke();*/
		});

		ctx.translate(-0.5, -0.5);
	}

	addSample(s: Item) {
		this.samples.push(new TrackItem(s));
		//this.samples[this.samples.length - 1].setWidth(ms_to_pixels(s.getDuration()*1000)); // TODO temp!
		this.updatePlaylist();
	}

	play() {
		this.samples.forEach(s => s.play());
	}
}
