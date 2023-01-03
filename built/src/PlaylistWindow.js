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
exports.Playlist = void 0;
var window_1 = require("./window");
var globals_1 = require("./globals");
var Track_1 = require("./Track");
var Color_1 = require("./Color");
var fs_1 = require("fs");
var Palette_1 = require("./Palette");
var TrackItem = /** @class */ (function () {
    function TrackItem(item) {
        this.item = item;
        this.position = { x: 0, y: 0 }; // offset from the left in px
        this.width = 0;
        this.canvas = document.createElement("canvas");
        // create an offscreen canvas template to render this sample to the main canvas
        this.canvas.width = 20 * 12;
        this.canvas.height = 70;
        // load audio data for playback
        var data = this.item.getData();
        this.buffer = globals_1.globals.audiocontext.createBuffer(2, data.length, globals_1.globals.audiocontext.sampleRate * 2);
        this.buffer.copyToChannel(Float32Array.from(data), 0);
        this.buffer.copyToChannel(Float32Array.from(data), 1);
        this.updateCanvas();
    }
    TrackItem.prototype.updateCanvas = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.translate(0.5, 0.5);
        // draw the actual waveform into the frame
        var data = this.item.getData();
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "bevel";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        var step = data.length / this.canvas.width;
        ctx.moveTo(0, this.canvas.height * 1.5);
        for (var i = 0; i < data.length; i++) {
            ctx.lineTo(i / step, Math.sin(data[i] * 100 * (Math.PI / 180)) * 30 + this.canvas.height / 2);
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
    };
    TrackItem.prototype.setWidth = function (width) {
        this.width = width;
        this.canvas.width = this.width;
        this.updateCanvas();
    };
    TrackItem.prototype.getTrackIndex = function () {
        return this.trackIndex;
    };
    TrackItem.prototype.setTrackIndex = function (index) {
        this.trackIndex = index;
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
        var source = new AudioBufferSourceNode(globals_1.globals.audiocontext, { buffer: this.buffer });
        source.connect(globals_1.globals.audiocontext.destination);
        source.start(globals_1.globals.audiocontext.currentTime + (0, globals_1.pixels_to_ms)(this.position.x) / 1000);
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
                                    globals_1.React.createElement("img", { id: "bars_cursor", src: "./graphics/cursor.svg" }),
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
        this.get(".tracks").addEventListener("wheel", function (e) {
            if (globals_1.globals.control_down) {
                globals_1.globals.xsnap -= e.deltaY / 100;
            }
            _this.updateBarLabels();
            _this.updatePlaylist();
        });
        document.addEventListener("mouseup", function () { wheel_down = false; delta_delta_x = 0; delta_delta_y = 0; });
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
            if (wheel_down) {
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
                    if (e.clientX - base.left + _this.scroll > _this.currentHoverSample.getPosition().x + _this.currentHoverSample.getWidth() - 5) {
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
        // play listener
        document.addEventListener("keypress", function (e) {
            if (e.code === "Space" && !globals_1.globals.deactivate_space_to_play) {
                e.preventDefault();
                _this.play();
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
            ctx.drawImage(sample.canvas, p.x - o, p.y);
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
        this.samples[this.samples.length - 1].setWidth((0, globals_1.ms_to_pixels)(s.getDuration() * 1000)); // TODO temp!
        this.samples[this.samples.length - 1].setTrackIndex(1);
        this.updatePlaylist();
    };
    Playlist.prototype.play = function () {
        this.samples.forEach(function (s) { return s.play(); });
    };
    return Playlist;
}(window_1.Window));
exports.Playlist = Playlist;
