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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
var window_1 = require("./window");
var globals_1 = require("./globals");
var Track_1 = require("./Track");
var Color_1 = require("./Color");
var fs_1 = require("fs");
var Palette_1 = require("./Palette");
var PaletteItem_1 = require("./PaletteItem");
var TrackItem = /** @class */ (function () {
    function TrackItem(item) {
        this.item = item;
        this.position = { x: 0, y: 0 }; // offset from the left in px
        this.track = globals_1.globals.tracks[0];
        this.canvas = document.createElement("canvas");
        // create an offscreen canvas template to render this sample to the main canvas
        this.canvas.width = 20 * 12;
        this.canvas.height = 70;
        // load audio data for playback
        this.data = this.item.getData();
        this.buffer = globals_1.globals.audiocontext.createBuffer(2, this.data.length, globals_1.globals.audiocontext.sampleRate * 2);
        this.buffer.copyToChannel(Float32Array.from(this.data), 0);
        this.buffer.copyToChannel(Float32Array.from(this.data), 1);
        this.setWidth((0, globals_1.ms_to_pixels)(item.getDuration() * 1000));
        this.updateCanvas();
    }
    TrackItem.prototype.updateCanvas = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.translate(0.5, 0.5);
        // draw the actual waveform into the frame
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "bevel";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.2;
        var step = this.data.length / this.canvas.width;
        ctx.moveTo(0, this.canvas.height * 1.5);
        for (var i = 0; i < this.data.length; i += 2) {
            ctx.lineTo(i / step, Math.sin(this.data[i] * 100 * (Math.PI / 180)) * 30 + this.canvas.height / 2);
        }
        ctx.stroke();
    };
    TrackItem.prototype.move = function (deltaX, deltaY) {
        this.position.x += deltaX;
        this.position.y += deltaY;
    };
    TrackItem.prototype.getPosition = function () {
        return this.position;
    };
    TrackItem.prototype.getSnappedPosition = function () {
        return { x: this.position.x - (this.position.x % globals_1.globals.xsnap), y: this.position.y - (this.position.y % 70) };
    };
    TrackItem.prototype.setPosition = function (newPos) {
        this.position = newPos;
        this.track = globals_1.globals.tracks[Math.floor(this.position.y / 70)];
    };
    TrackItem.prototype.setWidth = function (width) {
        this.width = width;
        this.canvas.width = this.width;
        this.updateCanvas();
    };
    TrackItem.prototype.scaleTo = function (width, height) {
        this.width = width;
    };
    TrackItem.prototype.expand = function (delta) {
        this.width += delta;
    };
    TrackItem.prototype.getWidth = function () {
        return this.width;
    };
    TrackItem.prototype.getItem = function () {
        return this.item;
    };
    TrackItem.prototype.play = function () {
        this.source = new AudioBufferSourceNode(globals_1.globals.audiocontext, { buffer: this.buffer });
        this.source.connect(this.track.audio_node);
        // TODO there is also a offset parameter in .start() -> use that when the cursor is somewhere
        // in the middle of the sample
        var timestamp = globals_1.globals.audiocontext.currentTime + ((0, globals_1.pixels_to_ms)(this.getSnappedPosition().x) / 1000 - globals_1.globals.current_time / 1000);
        if (timestamp >= globals_1.globals.audiocontext.currentTime) {
            this.source.start(timestamp);
        }
        else if (timestamp + this.width >= globals_1.globals.audiocontext.currentTime) {
            this.source.start(globals_1.globals.audiocontext.currentTime, globals_1.globals.audiocontext.currentTime - timestamp);
        }
    };
    TrackItem.prototype.stop = function () {
        this.source.stop();
    };
    return TrackItem;
}());
var Playlist = /** @class */ (function (_super) {
    __extends(Playlist, _super);
    function Playlist() {
        var _this = _super.call(this) || this;
        _this.tracks = [];
        _this.samples = [];
        _this.scroll = 0;
        return _this;
    }
    Playlist.prototype.initialiseContent = function () {
        var _this = this;
        this.get(".content").appendChild(globals_1.React.createElement("div", { className: "tracks_wrapper" },
            globals_1.React.createElement("div", { className: "tracks_palette_wrapper" },
                globals_1.React.createElement("div", { className: "tracks_palette" },
                    globals_1.React.createElement("div", { className: "palette_scope" },
                        globals_1.React.createElement("div", { className: "tool_button" },
                            globals_1.React.createElement("img", { className: "piano_svg", src: "./graphics/piano.svg" })),
                        globals_1.React.createElement("div", { className: "tool_button" },
                            globals_1.React.createElement("img", { className: "wave_svg", src: "./graphics/wave.svg" })),
                        globals_1.React.createElement("div", { className: "tool_button" },
                            globals_1.React.createElement("img", { className: "automation_svg", src: "./graphics/automation.svg" }))),
                    globals_1.React.createElement("div", { className: "palette_wrapper" },
                        globals_1.React.createElement("div", { className: "palette" }),
                        globals_1.React.createElement("div", { className: "palette_scrollbar" },
                            globals_1.React.createElement("div", { className: "palette_scrollbar_top" }),
                            globals_1.React.createElement("div", { className: "palette_scrollbar_handle" }),
                            globals_1.React.createElement("div", { className: "palette_scrollbar_bottom" })))),
                globals_1.React.createElement("div", { className: "tracks_wrapper_wrapper" },
                    globals_1.React.createElement("div", { className: "tracks_top_bar" },
                        globals_1.React.createElement("div", { className: "top_bar_corner_svg" },
                            globals_1.React.createElement("img", { src: "./graphics/corner.svg" }),
                            globals_1.React.createElement("img", { className: "piano_svg", src: "./graphics/piano.svg" }),
                            globals_1.React.createElement("img", { className: "automation_svg", src: "./graphics/automation.svg" }),
                            globals_1.React.createElement("img", { className: "wave_svg", src: "./graphics/wave.svg" })),
                        globals_1.React.createElement("div", { id: "tracks_top_bar_inner" },
                            globals_1.React.createElement("div", { className: "tracks_top_bar_scrollbar" },
                                globals_1.React.createElement("div", { className: "tracks_top_bar_scrollbar_left" },
                                    globals_1.React.createElement("i", { className: "fa-solid fa-chevron-left" })),
                                globals_1.React.createElement("div", { className: "tracks_top_bar_scrollbar_handle", id: "tracks_top_bar_scrollbar_handle" }),
                                globals_1.React.createElement("div", { className: "tracks_top_bar_scrollbar_right" },
                                    globals_1.React.createElement("i", { className: "fa-solid fa-chevron-right" }))),
                            globals_1.React.createElement("div", { className: "tracks_top_bar_bars_wrapper" },
                                globals_1.React.createElement("div", { className: "tracks_top_bar_bars" },
                                    globals_1.React.createElement("img", { className: "bars_cursor", id: "bars_cursor", src: "./graphics/cursor.svg" }),
                                    globals_1.React.createElement("canvas", { className: "bars_canvas", width: 200, height: 100 }))))),
                    globals_1.React.createElement("div", { className: "tracks" },
                        globals_1.React.createElement("div", { className: "line_cursor" }),
                        globals_1.React.createElement("div", { className: "tracks_content_wrapper" },
                            globals_1.React.createElement("div", { id: "tracks", className: "tracks_descriptions" }),
                            globals_1.React.createElement("canvas", { className: "tracks_canvas" })))))));
        // first load all possible audio plugins, then initialise the tracks so the
        // tracks can be sure that every module is loaded and they don't have to
        // import any
        var plugin_promises = (0, fs_1.readdirSync)("AudioNodes").map(function (v) {
            return globals_1.globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
        });
        Promise.allSettled(plugin_promises).then(function () {
            for (var i = 0; i < 15; i++) {
                _this.tracks.push(new Track_1.Track());
            }
        });
        // add mouse wheel dragging
        var drag_mouse_down_pos_x = 0;
        var drag_mouse_down_pos_y = 0;
        var delta_delta_x = 0;
        var delta_delta_y = 0;
        var wheel_down = false;
        this.get(".tracks").addEventListener("mousedown", function (e) {
            e.preventDefault();
            if (e.button === 1) {
                drag_mouse_down_pos_x = e.clientX;
                drag_mouse_down_pos_y = e.clientY;
                wheel_down = true;
            }
        });
        // scroll listeners
        var last_scroll_event_timestamp = null;
        var refreshTimer = null;
        this.get(".tracks").addEventListener("wheel", function (e) {
            e.preventDefault();
            if (globals_1.globals.control_down) {
                var delta = e.deltaY / 100;
                var ratio_1 = (globals_1.globals.xsnap - delta) / globals_1.globals.xsnap;
                var temp_timestamp = Date.now();
                var time_since_last_scroll_event_1 = last_scroll_event_timestamp === null ? 0 : temp_timestamp - last_scroll_event_timestamp;
                last_scroll_event_timestamp = temp_timestamp;
                _this.samples.forEach(function (s) {
                    s.setPosition({ x: s.getPosition().x * ratio_1, y: s.getPosition().y });
                    if (time_since_last_scroll_event_1 > 300) {
                        s.setWidth(s.getWidth() * ratio_1);
                    }
                    else {
                        s.scaleTo(s.getWidth() * ratio_1, 1);
                        clearTimeout(refreshTimer);
                    }
                });
                refreshTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.samples.forEach(function (s) {
                            s.setWidth(s.getWidth());
                        });
                        this.updatePlaylist();
                        last_scroll_event_timestamp = null;
                        return [2 /*return*/];
                    });
                }); }, 500);
                globals_1.globals.xsnap -= delta;
            }
            _this.updateBarLabels();
            _this.updatePlaylist();
        });
        document.addEventListener("mouseup", function () {
            wheel_down = false;
            delta_delta_x = 0;
            delta_delta_y = 0;
        });
        var bars = this.get(".tracks_top_bar_bars_wrapper");
        var bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
        var bars_scrollbar_wrapper = this.get(".tracks_top_bar_scrollbar");
        var maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
        var temp_this = this;
        function _tracks_scroll_by_px(pixelX, pixelY) {
            var track_width = globals_1.globals.tracks[0].content.querySelector(".track_background").clientWidth - globals_1.globals.tracks[0].content.clientWidth;
            globals_1.globals.tracks.forEach(function (t) {
                t.content.scrollBy({ left: pixelX });
            });
            var percent = globals_1.globals.tracks[0].content.scrollLeft / track_width;
            bars_scrollbar_handle.style.left = (20 + maxX * percent) + "px";
            bars.scrollBy({ left: pixelX });
            bars.scrollLeft = Math.min(bars.scrollLeft, track_width);
            temp_this.get(".tracks").scrollBy({ top: pixelY });
            temp_this.tracks.forEach(function (t) { t.scrollBy(pixelX); });
        }
        function tracks_scroll_by_px(px, py) {
            temp_this.scroll += px;
            temp_this.scroll = Math.max(temp_this.scroll, 0);
            bars_scrollbar_handle.style.left = (20 + maxX * 0.5) + "px";
            temp_this.get(".tracks").scrollBy({ top: py });
            temp_this.updatePlaylist();
            temp_this.updateBarLabels();
        }
        function point_in_rect(x, y, rectx, recty, rectw, recth) {
            return x > rectx && x < rectx + rectw && y > recty && y < recty + recth;
        }
        this.get(".tracks").addEventListener("mousemove", function (e) {
            // mouse cursor offset for correct coordinate mapping
            var base = (0, globals_1.cumulativeOffset)(_this.get(".tracks_canvas"));
            if (globals_1.globals.current_drag_element !== null) {
                // let the canvas move listener handle sample imports
                return;
            }
            else if (wheel_down) {
                var deltaX = drag_mouse_down_pos_x - e.clientX;
                var deltaY = drag_mouse_down_pos_y - e.clientY;
                tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
                delta_delta_x = deltaX;
                delta_delta_y = deltaY;
            }
            else if (e.buttons === 1 && _this.currentHoverSample !== null) {
                _this.currentHoverSample.setPosition({ x: _this.currentHoverSample.getPosition().x + e.movementX, y: e.clientY - (0, globals_1.cumulativeOffset)(_this.get(".tracks_canvas")).top });
                _this.updatePlaylist();
            }
            else {
                // if for any sample the current mouse position is within its
                // frame bounds, show a move cursor, else default cursor
                var c = _this.samples.map(function (sample) {
                    return point_in_rect(e.clientX - base.left + _this.scroll, e.clientY - base.top, sample.getSnappedPosition().x, sample.getSnappedPosition().y, sample.getWidth(), 70);
                });
                if (c.some(function (v) { return v; })) {
                    _this.currentHoverSample = _this.samples[c.indexOf(true)];
                    // display a resize cursor at the edge of the sample
                    if (e.clientX - base.left + _this.scroll > _this.currentHoverSample.getSnappedPosition().x + _this.scroll + _this.currentHoverSample.getWidth() - 5) {
                        _this.get(".tracks_canvas").style.cursor = "e-resize";
                    }
                    else {
                        _this.get(".tracks_canvas").style.cursor = "move";
                    }
                }
                else {
                    _this.get(".tracks_canvas").style.cursor = "default";
                    _this.currentHoverSample = null;
                }
            }
        });
        this.get(".tracks_canvas").addEventListener("mousemove", function (e) {
            var base = (0, globals_1.cumulativeOffset)(_this.get(".tracks_canvas"));
            if (globals_1.globals.current_drag_element !== null) {
                if (globals_1.globals.current_drag_element_preview === null) {
                    // create a preview of the currently dragged sample
                    if (globals_1.globals.current_drag_element instanceof PaletteItem_1.Item) {
                        globals_1.globals.current_drag_element_preview = new TrackItem(globals_1.globals.current_drag_element);
                        _this.samples.push(globals_1.globals.current_drag_element_preview);
                    }
                }
                globals_1.globals.current_drag_element_preview.setPosition({ x: e.clientX - base.left, y: e.clientY - base.top });
                _this.updatePlaylist();
            }
        });
        // play listener
        var track_cursor = this.get(".bars_cursor");
        var cursor_anim = null;
        globals_1.globals.cursor_pos = track_cursor.offsetLeft;
        var interval_time = 10;
        var cursor_step = (0, globals_1.ms_to_pixels)(interval_time);
        document.addEventListener("keypress", function (e) {
            if (e.code === "Space" && !globals_1.globals.deactivate_space_to_play) {
                e.preventDefault();
                if (!globals_1.globals.is_playing) {
                    // resume the suspended audiocontext
                    globals_1.globals.audiocontext.resume().then(function () {
                        // put all samples in the queue of the audiocontext
                        _this.play();
                    });
                    // animate the play cursor
                    cursor_anim = setInterval(function () {
                        globals_1.globals.cursor_pos += cursor_step;
                        track_cursor.style.left = globals_1.globals.cursor_pos + "px";
                        globals_1.globals.current_time += 10;
                    }, interval_time);
                    // some logs
                    console.log("playback started");
                }
                else {
                    // stop the cursor animation
                    clearInterval(cursor_anim);
                    // stop the audiocontext and clear the audio queue
                    globals_1.globals.audiocontext.suspend();
                    _this.samples.forEach(function (s) { return s.stop(); });
                    // some logs
                    console.log("playback stopped");
                }
                globals_1.globals.is_playing = !globals_1.globals.is_playing;
            }
        });
        // the playlist slider at the top of the widget
        var initial_handle_offset = 0;
        var tracks_scroll_percent = 0;
        var current_track_scroll_percent = 0;
        var track_width = 0;
        function tracks_scroll_to(percentX, percentY) {
            current_track_scroll_percent = percentX;
            track_width = globals_1.globals.tracks[0].content.querySelector(".track_background").clientWidth - globals_1.globals.tracks[0].content.clientWidth;
            maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
            globals_1.globals.tracks.forEach(function (t) {
                t.content.scrollTo({ top: percentY, left: percentX * track_width });
            });
            bars.scrollTo({ left: percentX * track_width });
            bars_scrollbar_handle.style.left = (20 + maxX * percentX) + "px";
        }
        function bars_scrollbar_handle_listener(e) {
            var newX = e.clientX - (0, globals_1.cumulativeOffset)(bars_scrollbar_wrapper).left - initial_handle_offset - 20;
            newX = Math.min(Math.max(newX, 0), maxX);
            tracks_scroll_percent = newX / maxX;
            tracks_scroll_to(tracks_scroll_percent, 0);
        }
        bars_scrollbar_handle.addEventListener("mousedown", function (e) {
            initial_handle_offset = e.clientX - (0, globals_1.cumulativeOffset)(bars_scrollbar_handle).left;
            bars_scrollbar_handle.style.left = (e.clientX - (0, globals_1.cumulativeOffset)(bars_scrollbar_wrapper).left - initial_handle_offset) + "px";
            document.addEventListener("mousemove", bars_scrollbar_handle_listener);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", bars_scrollbar_handle_listener);
        });
        // play indicator drag listener
        var top_bar = this.get("#tracks_top_bar_inner");
        var top_bar_bars = this.get(".tracks_top_bar_bars");
        var cursor = this.get("#bars_cursor");
        var track_bar_cursor = this.get(".line_cursor");
        var sidebar = this.get(".tracks_palette");
        function bars_cursor_move_listener(e) {
            if (e.clientX - (0, globals_1.cumulativeOffset)(top_bar).left <= 0) {
                cursor.style.left = "-10px";
                return;
            }
            var newX = e.clientX - (0, globals_1.cumulativeOffset)(top_bar).left - 10 + bars.scrollLeft;
            cursor.style.left = newX + "px";
            globals_1.globals.cursor_pos = newX;
            globals_1.globals.current_time = (0, globals_1.pixels_to_ms)(newX);
            track_bar_cursor.style.left = (0, globals_1.cumulativeOffset)(cursor.parentElement).left - sidebar.clientWidth - 6.5 + globals_1.globals.cursor_pos + bars.scrollLeft + 97 + "px"; // TODO HARDCORDED OFFSETTT 111111!!!!1!!!
        }
        top_bar_bars.addEventListener("mousedown", function (e) {
            cursor.style.left = (e.clientX - (0, globals_1.cumulativeOffset)(top_bar).left - 10 + bars.scrollLeft).toString() + "px";
            document.addEventListener("mousemove", bars_cursor_move_listener);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", bars_cursor_move_listener);
            _this.currentHoverSample = null;
        });
        // tool buttons
        this.addToolbarButton("fa-solid fa-magnet", new Color_1.Color("#7eefa9"), function () { }, {
            customCss: "transform: rotate(180deg) translate(0.5px, 1px);",
            customParentCss: "margin-right: 17px;"
        });
        this.addToolbarButton("fa-solid fa-pencil", new Color_1.Color("#fcba40"), function () { });
        this.addToolbarButton("fa-solid fa-brush", new Color_1.Color("#7bcefd"), function () { }, {
            customCss: "transform: translate(1px, 0.5px) rotate(-45deg);"
        });
        this.addToolbarButton("fa-solid fa-ban", new Color_1.Color("#ff5b53"), function () { });
        this.addToolbarButton("fa-solid fa-volume-xmark", new Color_1.Color("#ff54b0"), function () { });
        this.addToolbarButton("fa-solid fa-arrows-left-right", new Color_1.Color("#ffa64a"), function () { });
        this.addToolbarButton("fa-solid fa-spoon", new Color_1.Color("#85b3ff"), function () { });
        this.addToolbarButton("fa-solid fa-expand", new Color_1.Color("#ffab60"), function () { });
        this.addToolbarButton("fa-solid fa-magnifying-glass", new Color_1.Color("#85b3ff"), function () { });
        this.addToolbarButton("fa-solid fa-volume-high", new Color_1.Color("#ffa64a"), function () { }, {
            customCss: "transform: scale(0.9);"
        });
        // generate bar labels
        this.updateBarLabels();
        // generate playlist
        this.updatePlaylist();
        (0, Palette_1.setupPalette)();
        this.setContentSize(1200, 700);
    };
    Playlist.prototype.onResizeContent = function (newWidth, newHeight) {
        this.tracks.forEach(function (t) { return t.updateCanvas(); });
        this.updateBarLabels();
        this.updatePlaylist();
    };
    Playlist.prototype.updateBarLabels = function () {
        var bars_canvas = this.get(".bars_canvas");
        bars_canvas.width = bars_canvas.clientWidth * 2;
        bars_canvas.height = bars_canvas.clientHeight;
        var ctx = bars_canvas.getContext("2d");
        ctx.fillStyle = "#d3d3d3";
        ctx.lineWidth = 1;
        for (var i = 0; i < bars_canvas.clientWidth * 2 / globals_1.globals.xsnap; i++) {
            if (i % 12 == 0 || i % 4 == 0) {
                ctx.font = (i % 12 == 0 ? "15pt" : "10pt") + " Calibri";
                ctx.fillText((i + 1).toString(), (i * globals_1.globals.xsnap - this.scroll) * 2, bars_canvas.height - 3);
            }
        }
    };
    Playlist.prototype.updatePlaylist = function () {
        if (this.tracks === undefined) {
            return;
        }
        var playlist = this.get(".tracks_canvas");
        playlist.width = playlist.clientWidth;
        playlist.height = playlist.clientHeight;
        var ctx = playlist.getContext("2d", { alpha: false });
        ctx.imageSmoothingEnabled = false;
        ctx.translate(0.5, 0.5);
        // draw background
        ctx.fillStyle = "#34444e";
        ctx.fillRect(0, 0, playlist.width, playlist.height);
        var w = globals_1.globals.xsnap;
        var o = this.scroll;
        var h = 70; // TODO idk for some fucking reason a track is exactly 70 px high
        // draw slightly darker background
        ctx.fillStyle = "#2e3e48";
        for (var i = 0; i < (playlist.width + o) / w; i++) {
            if (i % (12 * 8) == 0) {
                ctx.fillRect(i * w + (w * 12 * 4) - o, 0, w * 12 * 4, playlist.height);
            }
        }
        // draw vertical seperators
        ctx.strokeStyle = "#182832";
        ctx.lineWidth = 1;
        for (var i = 0; i < this.tracks.length; i++) {
            ctx.moveTo(0, i * 70);
            ctx.lineTo(playlist.width, i * 70);
        }
        ctx.stroke();
        // draw vertical lines
        ctx.strokeStyle = "10202a";
        ctx.lineWidth = 0.4;
        for (var i = 0; i < (playlist.width + o) / w; i++) {
            ctx.beginPath();
            if (i % 12 == 0) {
                ctx.lineWidth = 0.5;
            }
            else {
                ctx.lineWidth = 0.3;
            }
            ctx.moveTo(i * w - o, 0);
            ctx.lineTo(i * w - o, playlist.height);
            ctx.stroke();
        }
        // draw samples
        this.samples.forEach(function (sample) {
            var p = sample.getSnappedPosition();
            ctx.drawImage(sample.canvas, p.x - o, p.y, sample.getWidth(), 70);
            // draw the frame of the sample
            var color = "#a34bf2";
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
    };
    Playlist.prototype.addSample = function (s) {
        this.samples.push(new TrackItem(s));
        //this.samples[this.samples.length - 1].setWidth(ms_to_pixels(s.getDuration()*1000)); // TODO temp!
        this.updatePlaylist();
    };
    Playlist.prototype.play = function () {
        this.samples.forEach(function (s) { return s.play(); });
    };
    return Playlist;
}(window_1.Window));
exports.Playlist = Playlist;
