import { Sample } from "../../core/Sample";
import { cumulativeOffset, globals, ms_to_pixels, px_to_timestamp, React, snap, timestamp_to_px } from "../../globals";
import { Item } from "../../PaletteItem";
import { TrackComponent } from "../../Track";
import { Window } from "../../window";

export class PlaylistWindow extends Window {

	private scroll: number;
	private sampleCanvasBuffer: Map<Sample, HTMLCanvasElement>;
	private lastMousePos: {x: number, y: number};

	constructor() {
		super(false);
		this.scroll = 0;
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

		// scroll listeners
		this.get(".tracks").addEventListener("wheel", (e) => {
			if (e.ctrlKey) {
				let delta = e.deltaY / 100;

				globals.xsnap -= delta;
			}
			this.updateBarLabels();
			this.updatePlaylist();
		});

		// view drag listeners
		let touchdown = { x: 0, y: 0, scrollY: 0, scrollX };
		this.get(".tracks").addEventListener("mousemove", (e: MouseEvent) => {
			this.lastMousePos = {x: e.clientX, y: e.clientY};
			if (e.buttons === 4) {
				this.scroll = Math.max(touchdown.scrollX + (touchdown.x - e.clientX), 0);
				this.get(".tracks").scrollTo({ top: touchdown.scrollY + (touchdown.y - e.clientY) });
				this.updateBarLabels();
				this.updatePlaylist();
			}
		});
		this.get(".tracks").addEventListener("mousedown", (e) => {
			e.preventDefault();
			touchdown.x = e.clientX;
			touchdown.y = e.clientY;
			touchdown.scrollY = this.get(".tracks").scrollTop;
			touchdown.scrollX = this.scroll;
		});

		// sample darg listeners
		let target;
		let current_drag_element: Sample = null;
		let drag_offset = 0;
		let base = cumulativeOffset(this.get(".tracks_canvas"));
		this.get(".tracks_canvas").addEventListener("mousemove", (e) => {
			base = cumulativeOffset(this.get(".tracks_canvas"))
			let track_index = Math.floor((e.clientY - base.top + this.get(".tracks").scrollTop) / 70);
			if (globals.current_drag_element !== null) {
				if (globals.current_drag_element_preview === null) {
					if (globals.current_drag_element instanceof Item) {
						globals.current_drag_element_preview = new Sample(globals.current_drag_element);
					}
				}

				// set x pos of drag element
				(globals.current_drag_element_preview as Sample).setTimestamp(px_to_timestamp(snap(e.clientX - base.left)))
				
				// set y pos of drag element
				if (globals.playlist.getTracks()[track_index].getSamples().includes(globals.current_drag_element_preview)) {
					// everything is fine
				} else {
					// everything is not fine. the sample has been moved
					globals.playlist.getTracks().forEach(track => {
						if (track.getSamples().includes(globals.current_drag_element_preview)) {
							track.removeSample(globals.current_drag_element_preview);
						}
					});
					if (globals.current_drag_element_preview === null || globals.current_drag_element_preview === undefined) {
						console.log("test");
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
						sample_track.removeSample(current_drag_element);
						new_track.addSample(current_drag_element);
					}
				} else {
					console.log(current_drag_element, this.getTrackOfSample(s));
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
						track_cursor.style.left = globals.cursor_pos + "px";
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

		// add all tracks
		globals.playlist.getTracks().forEach(t => {
			this.get("#tracks").appendChild(new TrackComponent(t).getElement());
		});

		this.updateBarLabels();
		this.updatePlaylist();

		this.setContentSize(1200, 700);
		this.setMinWindowSize(450, 100);
	}

	onResizeContent(newWidth: number, newHeight: number): void {
		this.updatePlaylist();
		this.updateBarLabels();
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
		for (let i = 0; i < globals.playlist.getTrackCount(); i++) {
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
		globals.playlist.getTracks().forEach((track, index) => {
			track.getSamples().forEach(sample => {
				if (!this.sampleCanvasBuffer.has(sample)) {
					this.sampleCanvasBuffer.set(sample, this.createCanvasForSample(sample));
				}

				// draw the frame of the sample
				const color = "#a34bf2"
				// const sampleX = sample.getTimestamp() - (sample.getTimestamp()%globals.xsnap) - o;
				const sampleX = timestamp_to_px(sample.getTimestamp()) - o;
				const sampleWidth = ms_to_pixels(sample.getDuration()*1000);
				ctx.strokeStyle = color + "b0";
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.roundRect(sampleX, index*70, sampleWidth, h, 2);
				ctx.fillStyle = color + "30";
				ctx.fill();
				
				// draw the actual waveform
				ctx.drawImage(this.sampleCanvasBuffer.get(sample), sampleX, index*70, sampleWidth, 70);

				ctx.stroke();
			});
		});

		ctx.translate(-0.5, -0.5);
	}

	private createCanvasForSample(sample: Sample) {
		let canvas = document.createElement("canvas");
		canvas.width = ms_to_pixels(sample.getDuration()*1000);
		canvas.height = 70;
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
		let targets = globals.playlist.getTracks().flatMap((track, index) => {
			return track.getSamples().map(sample => {
				return [this.point_in_rect(this.lastMousePos.x - base.left + this.scroll, 
					this.lastMousePos.y - base.top, 
					timestamp_to_px(sample.getTimestamp()),
					index*70 - this.get(".tracks").scrollTop,
					ms_to_pixels(sample.getDuration()*1000),
					70),
					sample];
			});
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
}