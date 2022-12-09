import { Channel } from "./Channel";
import { Track } from "./Track";
import { ContextMenu } from "./ContextMenu"
import { readdirSync } from "fs"


class Globals {
	tracks: Array<Track> = [];
	channels: Array<Channel> = [];
	context_menus: Array<ContextMenu> = []; // all open context menus
	//audio_graph_nodes: Array<AudioGraphNode> = [];

	deactivate_space_to_play: boolean = false;

	// contains the currently dragged element
	current_drag_element: Draggable | null = null;

	// current progression in the track in ms
	current_time: number = 0;
	cursor_pos: number = 0; // in px

	sample_rate: number = 44100;
	xsnap: number = 20;
	bpm: number = 150;

	// audio stuff
	buffer_size: number = 44100;
	timeout: number = 10;
	is_playing: boolean = false;
	audiocontext: AudioContext = new AudioContext({ sampleRate: this.sample_rate });

	header_help_text: HTMLElement = document.getElementById("header_help_text");

	// description width (93px) + half of line cursor width (16px)
	line_cursor_offset: number = 93 - 6;

	palette_indent_width: number = 25;
	sidebar: HTMLElement = document.getElementById("sidebar");

	// toggle button colors
	green: string = "rgb(50, 255, 32)"; // #32ff17
	grey: string = "rgb(126, 135, 125)"; // #7e877d

	// keybinds
	control_down: boolean = false;
	alt_down: boolean = false;
}

export var globals = new Globals();

const { WaveFile } = require("wavefile");
//const wavefile = require("wavefile");
//const Speaker = require("speaker");
//const stream = require("stream");
//var {Howl, Howler} = require("howler");
//const { WaveFile } = require("wavefile");

export var cumulativeOffset = function (element: HTMLElement) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = <HTMLElement>element.offsetParent;
	} while (element);

	return {
		top: top,
		left: left
	};
};

// draggable class for objects that will be draggable
export class Draggable {

	element: HTMLElement;

	initializeDragListener() {
		this.element.addEventListener("mousedown", () => {
			globals.current_drag_element = this;
		});
	}

	getDragElement() {
		throw "Abstract function of Draggable is not implemented";
	}
}


// conversion functions
//var ms_to_pixels_factor = xsnap*4/8 / (1/(bpm/60000));
export function pixels_to_ms(px: number) { return px / (globals.xsnap * 4 / 8 / (1 / (globals.bpm / 60000))); }
/*
10 px = 1 beat
1 beat = 150/60000 = 0.0025 beats/ms
1 beat / 0.0025 beats/ms = 400 ms
10 px / 400 = 0.025 px/ms
=> 10 px / (1 beat / (150 beat/min / 60_000 ms)) = 0.025 px/ms
*/
export function ms_to_pixels(ms: number) { return ms * (globals.xsnap * 4 / 8 / (1 / (globals.bpm / 60000))); }

function pixels_to_frames(px: number) { return (44100 * (60 / globals.bpm)) / (globals.xsnap * 4 / 8) * px; }

// cheaty stuff
export function sleep(milliseconds: number) {
	const date = Date.now();
	let currentDate = 0;
	do {
		currentDate = Date.now();
	} while (currentDate! - date < milliseconds);
}

export function createElement(HTML: string) {
	let a = document.createElement("div");
	a.innerHTML = HTML;
	return <HTMLElement>a.firstChild;
}


// Audio stuff
//globals.audiocontext.audioWorklet.addModule("built/AudioNodes/passthrough.js").then(() => { console.log("loaded passthrough module"); });
//audiocontext.suspend();
/*const plugin_src_folder = "./AudioNodes";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
readdirSync(plugin_src_folder, {withFileTypes: true}).forEach((file) => {
	console.log(plugin_src_folder + "/" + file.name)
	globals.audiocontext.audioWorklet.addModule(plugin_src_folder + "/" + file.name).then(() => {
		console.log("successfully loaded " + file.name.split(".")[0] + "-plugin");
	});
});*/

// temp
/*export class PassthroughNode extends AudioWorkletNode {
	constructor(context: BaseAudioContext, options: AudioWorkletNodeOptions, callback: Function) {
		// set options here
		super(context, 'passthrough', options);

		// configure port for communication with the audioprocessor
		this.port.addEventListener("message", (m) => {
			callback(m.data.volume);
		});
		this.port.start();
	}
}*/

export var sidebar_folder_colors: { [name: string]: string } = {
	"0Current project": "#aa8070",
	"1Recent files": "#7ca366",
	"2Plugin database": "#6781a4",
	"3Plugin presets": "#8f6080",
	"4Channel presets": "#8f6080",
	"5Mixer presets": "#8f6080",
	"6Scores": "#8f6080",
	"Backup": "#7ca366",
	"Clipboard files": "#6b818d",
	"Demo projects": "#689880",
	"Envelopes": "#6b818d",
	"IL shared data": "#689880",
	"Impulses": "#6b818d",
	"Misc": "#6b818d",
	"My projects": "#689880",
	"Packs": "#6781a4",
	"Project bones": "#aa8070",
	"Recorded": "#6b818d",
	"Rendered": "#6b818d",
	"Sliced audio": "#6b818d",
	"Soundfonts": "#6b818d",
	"Speech": "#689880",
	"Templates": "#689880"
};

export function insertAfter(newNode: Node, existingNode: Node) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function currently_hovered_track() {
	let t: Track = null;
	globals.tracks.forEach(track => {
		if (track.element.matches(":hover")) {
			t = track;
		}
	});
	return t;
}

// add event listeners to all toggle buttons
export function addRadioEventListener(btn: HTMLElement, track: Track) {
	var light = <HTMLElement> btn.querySelector(".radio_btn_green");
	btn.addEventListener("click", (e) => {
		e.preventDefault();
		if (e.button === 0) {
			var bg = light.style.backgroundColor;
			// the 'or' is bc the property is "" at first, but since the button
			// gets initialized with a green background, it gets treated as "green"
			(bg === globals.green || bg === "") ? track.disable() : track.enable();
		}
	});
	btn.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		var all_tracks_disabled = true;
		globals.tracks.forEach(element => {
			if (element.enabled && element !== track) { all_tracks_disabled = false; }
		});

		if (all_tracks_disabled && track.enabled) {
			for (let i = 0; i < globals.tracks.length; i++) {
				globals.tracks[i].enable();
			}
		} else {
			for (let i = 0; i < globals.tracks.length; i++) {
				(globals.tracks[i] !== track) ? globals.tracks[i].disable() : globals.tracks[i].enable();
			}
		}
	});
}