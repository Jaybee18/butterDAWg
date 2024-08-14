import { Sample } from "../../core/Sample";
import { addDragListener, cumulativeOffset, globals, ms_to_pixels, px_to_timestamp, React, snap, timestamp_to_px, pixels_to_ms } from "../../globals";
import { Item } from "../../PaletteItem";
import { TrackComponent } from "../../Track";
import { Color } from "../misc/Color";
import { toolbarButtonOptions, Window, WindowType } from "../misc/window";

export class PlaylistWindow extends Window {

	private scroll: number;
	private maxBeats: number;
	private zoom: number;
	private sampleCanvasBuffer: Map<Sample, HTMLCanvasElement>;
	private lastMousePos: {x: number, y: number};

	constructor() {
		super(false);
		this.scroll = 0;
		this.maxBeats = 100;
		this.zoom = 30;
		this.type = WindowType.Playlist;
		this.sampleCanvasBuffer = new Map();
		this.lastMousePos = {x: 0, y: 0};
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
								<img className="corner_svg" src="./graphics/corner.svg"></img>
								<img className="piano_svg" src="./graphics/piano.svg"></img>
								<img className="automation_svg" src="./graphics/automation.svg"></img>
								<img className="wave_svg" src="./graphics/wave.svg"></img>
							</div>
							<div id="tracks_top_bar_inner">
								<div className="tracks_top_bar_scrollbar">
									<div className="tracks_top_bar_scrollbar_left"><i className="fa-solid fa-chevron-left"></i></div>
									<div className="tracks_top_bar_scrollbar_rail">
										<div className="tracks_top_bar_scrollbar_handle" id="tracks_top_bar_scrollbar_handle"></div>
									</div>
									<div className="tracks_top_bar_scrollbar_right"><i className="fa-solid fa-chevron-right"></i></div>
								</div>
								<div className="tracks_top_bar_bars_wrapper">
									<div className="tracks_top_bar_bars">
										<canvas className="bars_canvas" width={200} height={100}></canvas>
										<img className="bars_cursor" id="bars_cursor" src="./graphics/cursor.svg"></img>
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

		// scroll listeners
		this.get(".tracks").addEventListener("wheel", (e: WheelEvent) => {
			if (e.ctrlKey) {
				e.preventDefault();
				let delta = e.deltaY / 100;

				globals.xsnap -= delta;

				const overflow = this.scroll + this.get(".tracks_canvas").clientWidth - (this.maxBeats - 1) * globals.xsnap;
				if (overflow > 0) {
					this.scrollTo(this.scroll - overflow);
				}

				this.update();

				// TODO definitely rework this bit ugh
				if (this.zoom > 1) {
					globals.xsnap += delta;
					this.update()
				}
			} else {
				this.scrollBy(e.deltaX, e.deltaY);
			}
		});

		// view drag listeners
		let touchdown = { x: 0, y: 0, scrollY: 0, scrollX: 0};
		const set_touchdown = (e: MouseEvent) => {
			touchdown.x = e.clientX;
			touchdown.y = e.clientY;
			touchdown.scrollY = this.get(".tracks").scrollTop;
			touchdown.scrollX = this.scroll;
		}
		this.get(".tracks").addEventListener("mousemove", (e: MouseEvent) => {
			this.lastMousePos = {x: e.clientX, y: e.clientY};
			if (e.buttons === 4) {
				this.scrollTo(touchdown.scrollX + (touchdown.x - e.clientX), touchdown.scrollY + (touchdown.y - e.clientY));
			}
		});
		this.element.addEventListener("mousedown", (e) => {
			e.preventDefault();
			set_touchdown(e);
		});

		// sample darg listeners
		let target;
		let current_drag_element: Sample = null;
		let drag_offset = 0;
		let base = cumulativeOffset(this.get(".tracks_canvas"));
		this.get(".tracks_canvas").addEventListener("mousemove", (e) => {
			base = cumulativeOffset(this.get(".tracks_canvas"))

			let track_index = 0;
			let sample_offset_top = (e.clientY - base.top + this.get(".tracks").scrollTop);
			for (; track_index < globals.tracks.length; track_index++) {
				sample_offset_top -= globals.tracks[track_index].getHeight();
				if (sample_offset_top <= 0) {
					break;
				}
			}

			if (globals.current_drag_element !== null) {
				// something is currently being dragged over the canvas
				if (globals.current_drag_element_preview === null) {
					// and it is not currently being previewed in the playlist canvas
					if (globals.current_drag_element instanceof Item) {
						// only display previews in the playlist of drag items that can
						// be dragged into the playlist (aka of type "Item" here)
						globals.current_drag_element_preview = new Sample(globals.current_drag_element);
					}
				}

				// set x pos of drag element
				(globals.current_drag_element_preview as Sample).setTimestamp(px_to_timestamp(snap(e.clientX - base.left + this.scroll)));
				
				// set y pos of drag element
				if (globals.playlist.getTracks()[track_index].getSamples().includes(globals.current_drag_element_preview)) {
					// everything is fine
				} else {
					// everything is not fine. the sample has been moved to another track
					globals.playlist.getTracks().forEach(track => {
						if (track.getSamples().includes(globals.current_drag_element_preview)) {
							track.removeSample(globals.current_drag_element_preview);
							console.log("probably here");
						}
					});
					if (globals.current_drag_element_preview === null || globals.current_drag_element_preview === undefined) {
						console.log("remove this print if you see it");
						return;
					}

					globals.playlist.getTracks()[track_index].addSample(globals.current_drag_element_preview);
				}
				this.updatePlaylist();
			} else if (current_drag_element && e.buttons === 1) {
				const s = current_drag_element as Sample;
				s.setTimestamp(px_to_timestamp(snap(e.clientX - base.left - drag_offset)));
				let sample_track = this.getTrackOfSample(s).filter(t => t !== null)[0];
				if (sample_track !== null) {
					let new_track = globals.playlist.getTracks()[track_index];
					if (sample_track !== new_track) {
						console.log("removing here");
						sample_track.removeSample(current_drag_element);
						new_track.addSample(current_drag_element);
					}
				}
				this.updatePlaylist();
			}
		});
		this.get(".tracks_canvas").addEventListener("mousedown", (e) => {
			// oh my god...
			if ((target = this.getCurrentHoverSample()) && e.buttons === 1) {
				current_drag_element = target as Sample;
				drag_offset = (e.clientX - base.left) - timestamp_to_px(current_drag_element.getTimestamp());
			}
		});
		document.addEventListener("mouseup", () => {
			current_drag_element = null;
		});

		// top scroll bar listener
		let bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
		let bars_scrollbar_rail = this.get(".tracks_top_bar_scrollbar_rail");
		addDragListener(bars_scrollbar_handle, (e: MouseEvent) => {
			if (e.button === 0) {
				const viewportWidth = this.get(".tracks_canvas").clientWidth;
				const playlistWidth = this.maxBeats * globals.xsnap;
				const scrollArea1 = playlistWidth - viewportWidth;

				const handleWidth = bars_scrollbar_handle.clientWidth;
				const railWidth = bars_scrollbar_rail.clientWidth;
				const scrollArea2 = railWidth - handleWidth;
				
				const delta = e.clientX - touchdown.x;
				const ratio = (scrollArea1 / scrollArea2);
				this.scrollTo(touchdown.scrollX + delta * ratio);
			}
		}, true);

		// key events handler
		let track_cursor = this.get(".bars_cursor");
		let cursor_anim: NodeJS.Timer = null;
		globals.cursor_pos = track_cursor.offsetLeft;
		const cursor_step = ms_to_pixels(globals.timeout);
		this.addEventListener("keypress", (e: Event) => {
			if ((e as KeyboardEvent).code === "Space") {
				e.preventDefault();
				if (!globals.is_playing) {
					globals.playlist.play();

					// play cursor animation
					cursor_anim = setInterval(() => {
						globals.cursor_pos += cursor_step;
						this.updateCursor();
						globals.current_time += globals.timeout;
					}, globals.timeout);

					console.log("playback started");
				} else {
					clearInterval(cursor_anim);

					globals.audiocontext.suspend();

					globals.playlist.stop();

					console.log("playback stopped");
				}

				globals.is_playing = !globals.is_playing;
			}
		});

		addDragListener(track_cursor, (e: MouseEvent) => {
			globals.cursor_pos += e.movementX;
			globals.cursor_pos = Math.max(globals.cursor_pos, 0);
			globals.current_time = pixels_to_ms(globals.cursor_pos);
			this.updateCursor();
		}, true);

		// add all tracks
		globals.playlist.getTracks().forEach(t => {
			this.get("#tracks").appendChild(new TrackComponent(t).getElement());
		});

		// the width of the corner svg is important for correct label positioning, but loads a bit slower
		this.get(".top_bar_corner_svg > .corner_svg").addEventListener("load", () => {
			this.updateBarLabels();
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

		this.update();

		this.setContentSize(1200, 700);
		this.setMinWindowSize(450, 100);
	}

	private getScrollPercent() {
		return this.scroll / ((this.maxBeats - 1) * globals.xsnap - this.get(".tracks_canvas").clientWidth);
	}

	scrollBy(x: number, y: number) {
		const max_scroll = (this.maxBeats - 1) * globals.xsnap;

		this.scroll += x;
		this.scroll = Math.max(Math.min(this.scroll, max_scroll - this.get(".tracks_canvas").clientWidth), 0);

		this.get(".tracks").scrollTo({ top: this.get(".tracks").scrollTop + y });
		
		this.update();
	}

	scrollTo(x: number = null, y: number = null) {
		if (x) {
			const max_scroll = (this.maxBeats - 1) * globals.xsnap;
			this.scroll = x;
			this.scroll = Math.max(Math.min(this.scroll, max_scroll - this.get(".tracks_canvas").clientWidth), 0);
		}

		if (y) {
			this.get(".tracks").scrollTo({ top: y });
		}
		this.update();
	}

	onResizeContent(newWidth: number, newHeight: number): void {
		this.update();
	}

	updateScrollBars() {
		let bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
		let bars_scrollbar_rail = this.get(".tracks_top_bar_scrollbar_rail");

		const viewportWidth = this.get(".tracks_canvas").clientWidth;
		const playlistWidth = this.maxBeats * globals.xsnap;
		const relativeViewportWidth = viewportWidth / playlistWidth;
		this.zoom = relativeViewportWidth;

		let handleWidth = bars_scrollbar_rail.clientWidth * relativeViewportWidth;
		handleWidth = Math.min(handleWidth, bars_scrollbar_rail.clientWidth);

		let handlePosition = ((bars_scrollbar_rail.clientWidth - handleWidth) * this.getScrollPercent());

		// when zooming at the far right of the playlist
		if (handlePosition + handleWidth > bars_scrollbar_rail.clientWidth) {
			handlePosition -= (handlePosition + handleWidth) - bars_scrollbar_rail.clientWidth;
		}

		bars_scrollbar_handle.style.width = handleWidth + "px";
		bars_scrollbar_handle.style.left = handlePosition + "px";
	}

	updateCursor() {
		let track_cursor = this.get(".bars_cursor");
		track_cursor.style.left = globals.cursor_pos - this.scroll + "px";
	}

	updateBarLabels() {
		let bars_canvas = this.get(".bars_canvas") as HTMLCanvasElement;
		bars_canvas.width = bars_canvas.clientWidth * 2;
		bars_canvas.height = bars_canvas.clientHeight;
		let ctx = bars_canvas.getContext("2d");

		ctx.fillStyle = "#d3d3d3";
		ctx.lineWidth = 1;
		for (let i = 0; i < this.maxBeats; i++) {
			if (i % 12 == 0 || i % 4 == 0) {
				ctx.font = (i % 12 == 0 ? "15pt" : "10pt") + " Calibri";
				ctx.fillText((i + 1).toString(), (i * globals.xsnap - this.scroll) * 2, bars_canvas.height - 3);
			}
		}
	}

	updatePlaylist() {
		let playlist = this.get(".tracks_canvas") as HTMLCanvasElement;
		let descriptions = this.get(".tracks_descriptions");
		playlist.width = playlist.clientWidth;
		playlist.height = descriptions.clientHeight;
		let ctx = playlist.getContext("2d", { alpha: false });
		ctx.imageSmoothingEnabled = false;
		ctx.translate(0.5, 0.5);

		// draw background
		ctx.fillStyle = "#34444e";
		ctx.fillRect(0, 0, playlist.width, playlist.height);

		const w = globals.xsnap;
		const o = this.scroll;

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
		let current_offset = 0;
		for (let i = 0; i < globals.tracks.length; i++) {
			ctx.moveTo(0, current_offset);
			ctx.lineTo(playlist.width, current_offset);
			current_offset += globals.tracks[i].getHeight();
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
		current_offset = 0;
		globals.playlist.getTracks().forEach((track, index) => {
			const trackSamples = track.getSamples();
			const trackHeight = globals.tracks[index].getHeight();
			for (let j = 0; j < trackSamples.length; j++) {
				const sample = trackSamples[j];

				if (!this.sampleCanvasBuffer.has(sample)) {
					this.sampleCanvasBuffer.set(sample, this.createCanvasForSample(sample, trackHeight));
				}

				// draw the frame of the sample
				const color = "#a34bf2"
				// const sampleX = sample.getTimestamp() - (sample.getTimestamp()%globals.xsnap) - o;
				const sampleX = timestamp_to_px(sample.getTimestamp()) - o;
				const sampleWidth = ms_to_pixels(sample.getDuration()*1000);
				ctx.strokeStyle = color + "b0";
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				//ctx.roundRect(sampleX, index*70, sampleWidth, h, 2);
				ctx.rect(sampleX, current_offset, sampleWidth, trackHeight);
				ctx.fillStyle = color + "30";
				ctx.fill();
				
				// draw the actual waveform
				ctx.drawImage(this.sampleCanvasBuffer.get(sample), sampleX, current_offset, sampleWidth, trackHeight);

				ctx.stroke();
			}
			current_offset += trackHeight;
		});

		ctx.translate(-0.5, -0.5);
	}

	private createCanvasForSample(sample: Sample, height: number) {
		let canvas = document.createElement("canvas");
		canvas.width = ms_to_pixels(sample.getDuration()*1000);
		canvas.height = height;
		let ctx = canvas.getContext("2d");
		ctx.translate(0.5, 0.5);
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.lineJoin = "bevel";
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 1.2;
		let step = sample.getData().length / canvas.width;
		ctx.moveTo(0, canvas.height * 1.5);
		for (let i = 0; i < sample.getData().length; i+=2) {
			ctx.lineTo(i / step, Math.sin(sample.getData()[i] * 100 * (Math.PI / 180)) * 30 + canvas.height / 2);
		}
		ctx.stroke();

		return canvas;
	}

	private point_in_rect(x:number, y:number, rectx:number, recty:number, rectw:number, recth:number) {
		return x > rectx && x < rectx+rectw && y > recty && y < recty+recth;
	}

	private getCurrentHoverSample() {
		const base = cumulativeOffset(this.get(".tracks_canvas"));
		let current_offset = 0;
		let targets = globals.playlist.getTracks().flatMap((track, index) => {
			const trackSamples = track.getSamples();
			const res = [];
			for (let i = 0; i < trackSamples.length; i++) {
				const sample = trackSamples[i];
				res.push([this.point_in_rect(this.lastMousePos.x - base.left + this.scroll, 
					this.lastMousePos.y - base.top, 
					timestamp_to_px(sample.getTimestamp()),
					current_offset - this.get(".tracks").scrollTop,
					ms_to_pixels(sample.getDuration()*1000),
					globals.tracks[index].getHeight()),
					sample]);
			}
			current_offset += globals.tracks[index].getHeight();
			return res;
		});
		console.log(targets)
		return targets.some(v => v[0]) ? targets[targets.findIndex(v => v[0])][1] : null;
	}

	private getTrackOfSample(sample: Sample) {
		let res = globals.playlist.getTracks().flatMap(track => {
			return track.getSamples().map(s => {
				return s === sample ? track : null;
			});
		});
		return res;
	}

	update() {
		this.updatePlaylist();
		this.updateBarLabels();
		this.updateScrollBars();
		this.updateCursor();
	}
}