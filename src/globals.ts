import { Channel } from "./ui/Components/Channel";
import { Track } from "./Track";
import { ContextMenu } from "./ui/Components/ContextMenu"
import { readdirSync } from "fs"
import { Window } from "./window";
import { CustomPlugin } from "./CustomPlugin";
import { Mixer } from "./core/Mixer";
import { Playlist } from "./core/Playlist";


class Globals {
	mixer: Mixer;
	playlist: Playlist;

	tracks: Array<Track> = [];
	channels: Array<Channel> = [];
	context_menus: Array<ContextMenu> = []; // all open context menus
	windows: Array<Window> = [];
	//audio_graph_nodes: Array<AudioGraphNode> = [];
	plugins: Array<CustomPlugin> = [];

	deactivate_space_to_play: boolean = false;

	// contains the currently dragged element
	current_drag_element: Draggable | null = null;
	// contains the preview object for the drag element
	// without clearing the drag element holder variable
	current_drag_element_preview: any = null;

	// the track that the current context menu, if any,
	// was opened on
	current_context_track: Track;

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

	onDragEnd() {

	}
}

var drag_container = document.getElementById("drag_container");
document.addEventListener("mouseup", () => {
	if (globals.current_drag_element !== null) {
		globals.current_drag_element.onDragEnd();
		drag_container.style.display = "none";
		drag_container.firstChild.remove();
		globals.current_drag_element = null;
		globals.current_drag_element_preview = null;
	}
});


// cheaty hacky stuff for using tsx
// (tsc compiles the tsx code to js by replacing every html element with Reacts
//  createElement function, but i don't use React. So i have to emulate the React
//  module with this class and give it a (!) createElement method)
class ReactSubstitution {
	createElement(tagName: any, attrs = {}, ...children: any) {
		const elem = Object.assign(document.createElement(tagName), attrs)
		for (const child of children) {
			if (Array.isArray(child)) elem.append(...child)
			else elem.append(child)
		}
		return elem
	}
}
export const React = new ReactSubstitution();

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

export function timestamp_to_px(timestamp: number) {return ms_to_pixels(timestamp*1000);}

export function px_to_timestamp(px: number) {return pixels_to_ms(px)/1000;}

export function snap(x: number) {return x - (x%globals.xsnap);}

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

export function setPixel(imageData: ImageData, x:number, y:number, r:number, g:number, b:number, a:number) {
    var index = 4 * (x + y * imageData.width);
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
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
	var light = <HTMLElement>btn.querySelector(".radio_btn_green");
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

export interface Connectable {
	// return the audio node !preceeding! Audio objects should connect to
    getAudioNode(): AudioNode;
}