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
var window_1 = require("./window");
var globals_1 = require("./globals");
var Track_1 = require("./Track");
var Color_1 = require("./Color");
var fs_1 = require("fs");
var Palette_1 = require("./Palette");
var Playlist = /** @class */ (function (_super) {
    __extends(Playlist, _super);
    function Playlist() {
        var _this = _super.call(this) || this;
        _this.tracks = [];
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
                    globals_1.React.createElement("div", { className: "tracks", id: "tracks" },
                        globals_1.React.createElement("div", { className: "line_cursor" }))))));
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
        document.addEventListener("mouseup", function () { wheel_down = false; delta_delta_x = 0; delta_delta_y = 0; });
        var bars = this.get(".tracks_top_bar_bars_wrapper");
        var bars_scrollbar_handle = this.get(".tracks_top_bar_scrollbar_handle");
        var bars_scrollbar_wrapper = this.get(".tracks_top_bar_scrollbar");
        var maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
        var temp_this = this;
        function tracks_scroll_by_px(pixelX, pixelY) {
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
        this.get(".tracks").addEventListener("mousemove", function (e) {
            if (wheel_down) {
                var deltaX = drag_mouse_down_pos_x - e.clientX;
                var deltaY = drag_mouse_down_pos_y - e.clientY;
                tracks_scroll_by_px(deltaX - delta_delta_x, deltaY - delta_delta_y);
                delta_delta_x = deltaX;
                delta_delta_y = deltaY;
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
        (0, Palette_1.setupPalette)();
        this.setContentSize(1200, 700);
    };
    Playlist.prototype.onResizeContent = function (newWidth, newHeight) {
        this.tracks.forEach(function (t) { return t.updateCanvas(); });
        this.updateBarLabels();
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
                ctx.fillText((i + 1).toString(), i * globals_1.globals.xsnap, bars_canvas.height - 3);
            }
        }
    };
    return Playlist;
}(window_1.Window));
var playlist = new Playlist();
