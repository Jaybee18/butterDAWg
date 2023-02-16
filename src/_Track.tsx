//
// tracks scrolling

import { TrackSample } from "./TrackSample";
import { Color } from "./ui/misc/Color";
import { Channel } from "./ui/Components/Channel";
import { React, globals, pixels_to_ms, cumulativeOffset, addRadioEventListener } from "./globals";
import { ContextMenu } from "./ContextMenu";
import { color_picker } from "./ColorPicker";
import { Item } from "./PaletteItem";

//
var bars = document.querySelector(".tracks_top_bar_bars_wrapper");
var track_view = document.getElementById("tracks");

/*var drag_mouse_down_pos_x = 0;
var drag_mouse_down_pos_y = 0;
var wheel_down = false;
var delta_delta_x = 0;
var delta_delta_y = 0;
track_view.addEventListener("mousedown", (e) => {
	e.preventDefault();
	if (e.button === 1) {
		drag_mouse_down_pos_x = e.clientX;
		drag_mouse_down_pos_y = e.clientY;
		wheel_down = true;
	}
});*/
/*document.addEventListener("mouseup", () => { wheel_down = false; delta_delta_x = 0; delta_delta_y = 0; });
track_view.addEventListener("mousemove", (e) => {
	if (wheel_down) {
		var deltaX = drag_mouse_down_pos_x - e.clientX;
		var deltaY = drag_mouse_down_pos_y - e.clientY;
		console.log("removed method")
		//tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
		delta_delta_x = deltaX;
		delta_delta_y = deltaY;
	}
});*/

/*
*     ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗    ███╗   ███╗███████╗███╗   ██╗██╗   ██╗
*    ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝    ████╗ ████║██╔════╝████╗  ██║██║   ██║
*    ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║       ██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║
*    ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║       ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║
*    ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║       ██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝
*     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ 
*  
*    hide/show the context menu
*    listeners
*    etc.
*/
let track_config_menu = document.getElementById("track_config_menu");
let track_config_xoffset = 0;
let track_config_yoffset = 0;
function track_config_movement(e: MouseEvent) {
	track_config_menu.style.left = e.clientX - track_config_xoffset + "px";
	track_config_menu.style.top = e.clientY - track_config_yoffset + "px";
}
track_config_menu.addEventListener("mousedown", (e) => {
	if (e.target != track_config_menu) return;
	track_config_xoffset = e.clientX - track_config_menu.offsetLeft;
	track_config_yoffset = e.clientY - track_config_menu.offsetTop;
	document.addEventListener("mousemove", track_config_movement);
});
document.addEventListener("mouseup", () => {
	document.removeEventListener("mousemove", track_config_movement);
});
track_config_menu.querySelector("#conf_check").addEventListener("click", () => {
	globals.current_context_track.setTitle((track_config_menu.querySelector("#conf_name_input") as HTMLInputElement).value);
	track_config_menu.style.display = "none";
	globals.deactivate_space_to_play = false;
});
track_config_menu.querySelector("#conf_xmark").addEventListener("click", () => {
	track_config_menu.style.display = "none";
	globals.deactivate_space_to_play = false;
});
function showTrackConfig(e: MouseEvent) {
	(track_config_menu.querySelector("#conf_bottom p") as HTMLElement).innerText = globals.current_context_track.title;

	track_config_menu.style.left = e.clientX + "px";
	track_config_menu.style.top = e.clientY + "px";
	track_config_menu.style.display = "flex";

	globals.deactivate_space_to_play = true;
	(track_config_menu.querySelector("#conf_name_input") as HTMLInputElement).value = globals.current_context_track.title;
}


// track context menu channel link menu
let context_channel_items = globals.channels.map((v, i) => { return "Insert " + i; });
let context_channel_listeners = globals.channels.map((v, i) => {
	return () => {
		// connect the current track to the selected channel and close the context menu
		globals.current_context_track.connect(v);
		return true;
	};
});
let channel_context = new ContextMenu(context_channel_items, context_channel_listeners);

// track context menu
let context_event_listeners = [
	(e: MouseEvent) => {
		showTrackConfig(e);
		return true;
	},
	() => {
		color_picker.style.display = "block";
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
	() => {
		let a = globals.tracks.indexOf(globals.current_context_track);
		let b = globals.tracks.indexOf(globals.current_context_track) - 1;
		if (b < 0) { return; }
		// swap HTML elements
		track_view.insertBefore(globals.current_context_track.element, globals.tracks[globals.tracks.indexOf(globals.current_context_track) - 1].element);
		// swap tracks-array entries
		let tmp = globals.tracks[a];
		globals.tracks[a] = globals.tracks[b];
		globals.tracks[b] = tmp;
		return true;
	},
	() => {
		let a = globals.tracks.indexOf(globals.current_context_track);
		let b = globals.tracks.indexOf(globals.current_context_track) + 1;
		if (b === globals.tracks.length) { return; }
		// swap HTML elements
		track_view.insertBefore(globals.current_context_track.element, globals.tracks[globals.tracks.indexOf(globals.current_context_track) + 2].element);
		// swap tracks-array entries
		let tmp = globals.tracks[a];
		globals.tracks[a] = globals.tracks[b];
		globals.tracks[b] = tmp;
		return true;
	}
];

let context_items = [
	"Rename, color and icon...",
	"Change color...",
	"Change icon...",
	"Auto name",
	"Auto name clips",
	"[spacer]",
	"Track mode",
	"Performance settings",
	"[spacer]",
	"Size",
	"Lock to this size",
	"[spacer]",
	"Group with above track",
	"Auto color group",
	"[spacer]",
	"Current clip source",
	"Lock to content",
	"Merge pattern clips",
	"Consolidate this clip",
	"Mute all clips",
	"[spacer]",
	"Insert one",
	"Delete one",
	"[spacer]",
	"Move up",
	"Move down"
];

let new_context_menu = new ContextMenu(context_items, context_event_listeners);

/*
 *    ████████╗██████╗  █████╗  ██████╗██╗  ██╗
 *    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
 *       ██║   ██████╔╝███████║██║     █████╔╝ 
 *       ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
 *       ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
 *       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 * 
 *    class definition
 */
/*
	audio setup:
	|
	| input
	|
audio_node
	|
	| output
	|

	output can then be connected to a channel
*/
export class Track {

	element: any;
	title: string = "";
	id: string = Date.now().toString();
	color: Color | null = null;

	samples: Array<TrackSample> = [];
	hover_buffer: TrackSample | null = null;
	play_indicator_color: Color = new Color(51, 63, 70);
	enabled: boolean = true;
	resize_locked: boolean = false
	//channel: Channel | null = null;
	content: HTMLElement;
	description: HTMLElement;
	sound_indicator: HTMLElement;
	radio_btn: HTMLElement;
	scroll: number;

	audio_node: AudioNode;

	constructor() {
		this.scroll = 0;
		/*globals.audiocontext.audioWorklet.addModule("scripts/AudioNodes/passthrough.js").then(() => {
			//this.audio_node = new AudioWorkletNode(audiocontext, "passthrough", {'c': () => {console.log("success");}});
			this.audio_node = new AnalyserNode(globals.audiocontext);
			this.passthrough_node = new PassthroughNode(globals.audiocontext, {}, 
				(volume: number) => {
					this.setPlayIndicator(volume);
				}
			);
			this.audio_node.connect(this.passthrough_node);
			this.passthrough_node.connect(globals.audiocontext.destination);
		});*/

		// all audio modules should've been loaded in the Playlist Window class
		// so they can be used without checking if they have been imported first
		this.audio_node = new AudioWorkletNode(globals.audiocontext, "track");
		//this.audio_node.connect(globals.temptemp.getAudioNode());
		//globals.temptemp.connect(globals.audiocontext.destination);

		// construct own element
		/*this.element = 
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
			<div className="track_content">
				<div className="track_background"></div>
				<canvas className="track_canvas"></canvas>
			</div>
			</div>
		</div>;*/
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
			</div>;

		// add self to track view
		var track_view = document.getElementById("tracks")!;
		track_view.appendChild(this.element);
		this.id = Date.now().toString();
		this.element.id = this.id;

		this.content = this.element.querySelector(".track_content")!;
		this.description = this.element.querySelector(".description")!;
		this.sound_indicator = this.element.querySelector(".track_play_indicator")!;
		this.radio_btn = this.description.querySelector(".radio_btn")!;

		// add self to track-list
		globals.tracks.push(this);

		this.setTitle("Track " + globals.tracks.length);
		this.setColor(new Color("#646e73")); // #646e73 #485155
		this.updateCanvas();
		this.initializeResizing();
		this.initializeEventListeners();
	}

	getFrames(size: number) {
		return;
		// == process audio with plugins etc. ==
		/*
		if sum(buffer) > 0:
		  this.play_indicator.style.background = white
		*/
		/*this.buffer_position += size;
		console.log(this.buffer_position);
		console.log(this.data.slice(this.buffer_position - size, this.buffer_position));
		return this.data.slice(this.buffer_position - size, this.buffer_position);*/
	}

	play() {
		// play method gets called every 10? ms
		// search for any samples that are registered at that current
		// timestamp, those have to be played in the current audio context
		// immediatly
		this.samples.forEach(sample => {
			if (pixels_to_ms(sample.x) === globals.current_time) {
				sample.play();
			}
		});
	}

	connect(channel: Channel) {
		//this.channel = channel;

		// connect the track to the first element of the 
		// channel audio node pipeline
		//this.passthrough_node.connect(channel.getFirstAudioNode());

		// finally enable the channel
		//this.channel.toggle();

		this.audio_node.connect(channel.getFirstAudioNode());
	}

	setPlayIndicator(percent: number) {
		// set the intensity (in %) of the play indicator
		// to the right of the description
		/* neutral color is rgb(51, 63, 70) */
		(this.element.querySelector(".track_play_indicator") as HTMLElement).style.backgroundColor = this.play_indicator_color.lerp(new Color("#ffffff"), Math.min(1.0, percent * 2));
	}

	enable() {
		this.enabled = true;
		(this.radio_btn.firstElementChild as HTMLElement).style.backgroundColor = globals.green;
		this.description.style.backgroundColor = this.color.color;
		this.description.style.color = "";
		this.description.style.borderRightColor = this.color.lighten(10);
		this.description.style.background = this.color.color;
	}

	disable() {
		this.enabled = false;
		(this.radio_btn.firstElementChild as HTMLElement).style.backgroundColor = globals.grey;
		this.description.style.backgroundColor = this.color.darken(20);
		this.description.style.color = "#ffffff45";
		this.description.style.borderRightColor = this.color.darken(20);
		this.description.style.borderLeftColor = this.color.darken(20);
		this.description.style.background = "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) " + this.color.darken(20);
	}

	updateData() {
		return;
		// function that writes the frame data to the track's audio array
		/*for (let i = 0; i < this.samples.length; i++) {
		  let s = this.samples[i];
		  let d = s.data;
		  let offset = pixels_to_frames(s.x);
		  for (let j = 0; j < d.length; j++) {
			this.data[j+offset] = d[j];
		  }
		}*/
	}

	updateCanvas() {
		return;
		/*var background = this.content.querySelector(".track_background");
		var tiles = "";
		for (let i = 0; i < 500; i++) {
			tiles += '<div class="tile" style="background-color:' + (i % 32 < 16 ? "rgb(52, 68, 78)" : "rgb(46, 62, 72)") + ';' + (i % 4 == 0 ? "border-width: 1px 1px 1px 1.5px" : "") + '" ></div>';
		}
		background.innerHTML = tiles;
		*/
		let canvas = this.element.querySelector(".track_canvas") as HTMLCanvasElement;
		let ctx = canvas.getContext("2d");
		canvas.style.width = canvas.parentElement.clientWidth + "px";
		canvas.style.height = canvas.parentElement.clientHeight + "px";
		canvas.width = canvas.clientWidth * 2;
		canvas.height = canvas.clientHeight;
		ctx.translate(-0.5, -0.5)

		const w = globals.xsnap;
		const xoffset = this.scroll;

		// draw base background
		ctx.fillStyle = "#34444e";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.stroke();

		// draw darker grey areas
		ctx.fillStyle = "#2e3e48";
		for (let i = 0; i < canvas.width/w; i++) {
			if (i%(12*8)==0) {
				ctx.fillRect(i*w+(w*12*4) + xoffset, 0, w*12*4, canvas.height);
			}
		}

		// draw vertical seperator
		ctx.strokeStyle = "#182832";
		ctx.lineWidth = 1;
		ctx.moveTo(xoffset, 0);
		ctx.lineTo(canvas.width, 0);
		ctx.moveTo(0, canvas.height);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.stroke();

		ctx.lineWidth = 1;
		for (let i = 0; i < canvas.width/w; i++) {
			ctx.beginPath();
			if (i%12==0) {
				ctx.strokeStyle = "#10202a";
			} else {
				ctx.strokeStyle = "#2a3a44";
			}
			ctx.moveTo(i*w+xoffset, 0);
			ctx.lineTo(i*w+xoffset, canvas.height);
			ctx.stroke();
		}

		ctx.translate(0.5, 0.5);
	}

	_updateCanvas() {
		return;
		var c = this.element.querySelector("#track_canvas") as HTMLCanvasElement;
		var ctx = c.getContext("2d");
		for (let i = 0; i < 1000; i += 32) {
			ctx.fillStyle = 'rgb(52, 68, 78)';
			ctx.fillRect(i * globals.xsnap, 0, globals.xsnap * 16, 500);
			ctx.fillStyle = 'rgb(46, 62, 72)';
			ctx.fillRect(globals.xsnap * 16 + i * globals.xsnap, 0, globals.xsnap * 16, 500);
		}

		ctx.strokeStyle = 'rgb(24, 40, 50)';
		ctx.lineWidth = 10;
		ctx.moveTo(0, 5);
		ctx.lineTo(globals.xsnap * 1000, 5);
		ctx.stroke();

		//ctx.strokeStyle = 'rgb(0, 0, 0, 0.3)';
		ctx.lineWidth = 1;
		for (let i = 0; i < 1000; i++) {
			ctx.moveTo(i * 20, 0);
			ctx.lineTo(i * 20, 500);
		}
		ctx.stroke();
	}

	initializeResizing() {
		// TODO maybe optimize this
		let resize_handle = this.element.querySelector("#track_resize") as HTMLElement;
		let resizing_track: HTMLElement = null;
		let l = this.element;
		let temp_this = this;
		function movefunc(e: MouseEvent) {
			if (resizing_track === null || temp_this.resize_locked) {
				return false;
			}

			var new_height = e.clientY - cumulativeOffset(resizing_track).top; //resizing_track.offsetTop;
			resizing_track.style.height = new_height + "px";
		}
		resize_handle.onmousedown = function () {
			document.addEventListener("mousemove", movefunc);
			if (temp_this.resize_locked) { return false; }
			resizing_track = l;
			return false;
		};
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", movefunc);
		});
	}

	resizeBackground(event: any) {
		return;
		var background = this.content.querySelector(".track_background") as HTMLElement;
		background.style.width = background.clientWidth - event.deltaY * 5 + "px";
		for (let i = 0; i < this.samples.length; i++) {
			this.samples[i].resize();
			var previousXsnap = globals.xsnap + event.deltaY / 100; // as of the formula below
			this.samples[i].move(this.samples[i].element.offsetLeft / previousXsnap * (-event.deltaY / 100), 0);
		}
	}

	resizeHeight(delta: number) {
		if (this.resize_locked) { return; }
		this.element.style.height = this.element.clientHeight - delta + "px";
	}

	initializeEventListeners() {
		this.element.addEventListener("mouseenter", () => {
			// help
			globals.header_help_text.innerHTML = this.title;
		});

		let drag_container = document.getElementById("drag_container");
		//let bars_scrollbar_handle = document.getElementById("tracks_top_bar_scrollbar_handle");
		//let bars_scrollbar_wrapper = document.querySelector(".tracks_top_bar_scrollbar");
		//let maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
		/*this.content.addEventListener("wheel", (e) => {
			if (e.shiftKey) {
				e.preventDefault();
				// idk how else to do it, this just transfers the scroll event
				// to the scrollbar_handle
				var currentOffset = (bars_scrollbar_handle.offsetLeft - 20) / maxX;
				var newOffset = currentOffset + (e.deltaY / 100) / 50;
				newOffset = Math.min(Math.max(newOffset, 0), 1);
				console.log("remove method")
				//tracks_scroll_to(newOffset, 0);
			} else if (globals.control_down) {
				// delta = x*100
				if (globals.xsnap - e.deltaY / 100 < 6) { return; } // TODO this may cause some issues in the future, but idc
				globals.xsnap -= e.deltaY / 100;
				var bars = document.querySelectorAll(".tracks_top_bar_bars > p") as any;
				for (let i = 0; i < bars.length; i++) {
					bars[i].style.width = globals.xsnap * 4 + "px";
				}
				for (let i = 0; i < globals.tracks.length; i++) {
					globals.tracks[i].resizeBackground(e);
				}
			} else if (globals.alt_down) {
				e.preventDefault();
				for (let i = 0; i < globals.tracks.length; i++) {
					globals.tracks[i].resizeHeight(e.deltaY / 10);
				}
			}
		});*/

		this.element.addEventListener("mouseleave", () => {
			if (this.hover_buffer !== null) {
				this.hover_buffer.element.remove();
				this.hover_buffer = null;
				drag_container.style.display = "block";
			}
		});

		/*this.content.addEventListener("mousemove", () => {
			// sample preview
			if (globals.current_drag_element !== null) {
				this.sampleHover(globals.current_drag_element as Item);
				drag_container.style.display = "none";
			}
		});*/

		this.element.addEventListener("mousemove", (e: MouseEvent) => {
			if (this.hover_buffer !== null) {
				var newX = e.clientX - cumulativeOffset(this.hover_buffer.element.parentElement).left - this.hover_buffer.element.clientWidth / 2;
				newX = Math.min(Math.max(newX, 0), this.content.clientWidth) + this.content.scrollLeft;
				let newnewX = newX - newX % globals.xsnap;
				this.hover_buffer.element.style["left"] = newnewX + "px";
				this.hover_buffer.x = newnewX;
			}
		});

		this.element.addEventListener("mouseup", () => {
			// if a sample was dragged, add it to this track
			if (globals.current_drag_element !== null) {
				this.addSample(this.hover_buffer);
				this.hover_buffer = null;
			}
		});

		// radio button on click
		addRadioEventListener(this.element.querySelector(".radio_btn"), this);

		// context menu
		this.description.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			globals.current_context_track = this;
			new_context_menu.toggle(e);
			//toggle_track_context_menu(e, this);
		});
	}

	setTitle(title: string) {
		this.element.querySelector("#track_title").innerHTML = title;
		this.title = title;
	}

	setColor(color: Color) {
		this.color = color;
		this.description.style.background = this.color.color;
		this.description.style.borderColor = this.color.darken(8) + " " + this.color.lighten(10);
		this.samples.forEach(s => {
			s.setColor(color);
		});
	}

	addSample(sample: TrackSample) {
		// parameter is of type TrackSample
		//sample.x = sample.element.offsetLeft;
		this.content.appendChild(sample.element);
		this.samples.push(sample);
		this.updateData();
	}

	sampleHover(item: Item) {
		// call this function of a track, when currently dragging a sample
		// from the sidebar, to display a track_sample representation of
		// the sample on the track at the current position of the mouse
		if (this.hover_buffer !== null) { return; }
		var t = new TrackSample(item, this);
		t.setColor(this.color);
		this.content.appendChild(t.element);
		//t.move(this.content.scrollLeft, 0);
		this.hover_buffer = t;
	}

	scrollBy(delta: number) {
		this.scroll += delta;
		this.updateCanvas();
	}
}

// add track-button functionality
// document.getElementById("track_add_label").addEventListener('click', () => {new Track();});

//document.querySelectorAll(".radio_btn").forEach(btn => addRadioEventListener(btn)); // probably works, but idk
