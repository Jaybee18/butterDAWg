"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.currently_hovered_track = exports.insertAfter = exports.sidebar_folder_colors = exports.PassthroughNode = exports.createElement = exports.sleep = exports.ms_to_pixels = exports.pixels_to_ms = exports.Draggable = exports.cumulativeOffset = exports.globals = void 0;
var Globals = /** @class */ (function () {
    function Globals() {
        this.tracks = [];
        this.channels = [];
        this.context_menus = []; // all open context menus
        this.deactivate_space_to_play = false;
        // contains the currently dragged element
        this.current_drag_element = null;
        // current progression in the track in ms
        this.current_time = 0;
        this.sample_rate = 44100;
        this.xsnap = 20;
        this.bpm = 150;
        // audio stuff
        this.buffer_size = 44100;
        this.timeout = 10;
        this.audiocontext = new AudioContext({ sampleRate: this.sample_rate });
        this.header_help_text = document.getElementById("header_help_text");
        // description width (93px) + half of line cursor width (16px)
        this.line_cursor_offset = 93 - 6;
        this.palette_indent_width = 25;
        this.sidebar = document.getElementById("sidebar");
        // toggle button colors
        this.green = "rgb(50, 255, 32)"; // #32ff17
        this.grey = "rgb(126, 135, 125)"; // #7e877d
    }
    return Globals;
}());
exports.globals = new Globals();
var fs = require("fs");
var WaveFile = require("wavefile").WaveFile;
//const wavefile = require("wavefile");
//const Speaker = require("speaker");
//const stream = require("stream");
//var {Howl, Howler} = require("howler");
//const { WaveFile } = require("wavefile");
var cumulativeOffset = function (element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return {
        top: top,
        left: left
    };
};
exports.cumulativeOffset = cumulativeOffset;
// draggable class for objects that will be draggable
var Draggable = /** @class */ (function () {
    function Draggable() {
    }
    Draggable.prototype.initializeDragListener = function () {
        var _this = this;
        this.element.addEventListener("mousedown", function () {
            exports.globals.current_drag_element = _this;
        });
    };
    Draggable.prototype.getDragElement = function () {
        throw "Abstract function of Draggable is not implemented";
    };
    return Draggable;
}());
exports.Draggable = Draggable;
// conversion functions
//var ms_to_pixels_factor = xsnap*4/8 / (1/(bpm/60000));
function pixels_to_ms(px) { return px / (exports.globals.xsnap * 4 / 8 / (1 / (exports.globals.bpm / 60000))); }
exports.pixels_to_ms = pixels_to_ms;
/*
10 px = 1 beat
1 beat = 150/60000 = 0.0025 beats/ms
1 beat / 0.0025 beats/ms = 400 ms
10 px / 400 = 0.025 px/ms
=> 10 px / (1 beat / (150 beat/min / 60_000 ms)) = 0.025 px/ms
*/
function ms_to_pixels(ms) { return ms * (exports.globals.xsnap * 4 / 8 / (1 / (exports.globals.bpm / 60000))); }
exports.ms_to_pixels = ms_to_pixels;
// cheaty stuff
function sleep(milliseconds) {
    var date = Date.now();
    var currentDate = 0;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
exports.sleep = sleep;
function createElement(HTML) {
    var a = document.createElement("div");
    a.innerHTML = HTML;
    return a.firstChild;
}
exports.createElement = createElement;
// Audio stuff
exports.globals.audiocontext.audioWorklet.addModule("built/AudioNodes/passthrough.js").then(function () { console.log("loaded passthrough module"); });
//audiocontext.suspend();
// temp
var PassthroughNode = /** @class */ (function (_super) {
    __extends(PassthroughNode, _super);
    function PassthroughNode(context, options) {
        var _this = 
        // set options here
        _super.call(this, context, 'passthrough', options) || this;
        // configure port for communication with the audioprocessor
        _this.port.addEventListener("message", function (m) {
            options.callback(m.data.volume);
        });
        _this.port.start();
        return _this;
    }
    return PassthroughNode;
}(AudioWorkletNode));
exports.PassthroughNode = PassthroughNode;
exports.sidebar_folder_colors = {
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
function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
exports.insertAfter = insertAfter;
function currently_hovered_track() {
    var t = null;
    exports.globals.tracks.forEach(function (track) {
        if (track.element.matches(":hover")) {
            t = track;
        }
    });
    return t;
}
exports.currently_hovered_track = currently_hovered_track;
