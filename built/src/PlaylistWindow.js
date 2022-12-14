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
var Playlist = /** @class */ (function (_super) {
    __extends(Playlist, _super);
    function Playlist() {
        return _super.call(this) || this;
    }
    Playlist.prototype.initialiseContent = function () {
        this.get(".content").innerHTML = "\n        <div class=\"tracks_wrapper\">\n        <div class=\"tracks_palette_wrapper\">\n            <div class=\"tracks_palette\">\n              <div class=\"palette_scope\">\n                <div class=\"tool_button\">\n                  <svg width=\"25\" height=\"20\" viewportWidth=\"25 20\" class=\"piano_svg\">\n                    <path d=\"M 0 0 H 25 V 20 H 0 V 0 Z M 10 0 H 5 V 15 H 10 V 0 Z M 15 0 V 15 H 20 V 0 H 15 Z\"></path>\n                  </svg>\n                </div>\n                <div class=\"tool_button\">\n                  <svg width=\"25\" height=\"24\" viewportWidth=\"25 24\" class=\"wave_svg\">\n                    <path d=\"M 0 12 C 3 5 4 5 7 12 C 12 28 13 28 18 12 C 21 5 22 5 25 12 C 22 19 21 19 18 12 C 13 -4 12 -4 7 12 C 4 19 3 19 0 12 Z\"></path>\n                  </svg>\n                </div>\n                <div class=\"tool_button\">\n                  <svg width=\"6\" height=\"23\" class=\"automation_svg\">\n                    <path d=\"M 3 20.5 A 0.5 0.5 90 0 0 3 17.5 A 0.5 0.5 90 0 0 3 20.5 Z M 3 16 A 0.5 0.5 90 0 1 3 22 A 0.5 0.5 90 0 1 3 16 Z Z M 3 19 L 3 3 M 3 1.5 A 0.5 0.5 90 0 1 3 4.5 A 0.5 0.5 90 0 1 3 1.5 M 3 0 A 0.5 0.5 90 0 0 3 6 A 0.5 0.5 90 0 0 3 0 Z M 2 15 L 2 7 L 4 7 L 4 15 Z\"></path>\n                  </svg>\n                </div>\n              </div>\n              <div style=\"display: flex; height: inherit; width: 200px;\">\n                <div class=\"palette\">\n                  <!-- will be filled by the code later -->\n                </div>\n                <div class=\"palette_scrollbar\">\n                  <div class=\"palette_scrollbar_top\"></div>\n                  <div class=\"palette_scrollbar_handle\"></div>\n                  <div class=\"palette_scrollbar_bottom\"></div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"tracks_wrapper_wrapper\">\n              <div class=\"tracks_top_bar\">\n                <div style=\"position: relative;\">\n                  <svg width=\"104\" height=\"42\" style=\"margin-left: 0px; flex-shrink: 0;\">\n                    <path fill=\"#50595e\" stroke-width=\"1\" stroke=\"#000000aa\" d=\"m 1 41 l 0 0 c 0 -8 0 -8 12 -20 l 8 -8 c 12 -12 12 -12 28 -12 l 54 0 l 0 40 z\" />\n                    <path fill=\"none\" stroke-width=\"1\" stroke=\"#5c656a\" d=\"m 2 40 l 0 0 c 0 -7 0 -7 12 -19 l 8 -8 c 11 -11 11 -11 27 -11 l 53 0 l 0 38 z\" />\n                  </svg>\n                  <svg width=\"25\" height=\"20\" viewportWidth=\"25 20\" fill=\"#8f979b\" class=\"piano_svg\">\n                    <path d=\"M 0 0 H 25 V 20 H 0 V 0 Z M 10 0 H 5 V 15 H 10 V 0 Z M 15 0 V 15 H 20 V 0 H 15 Z\"></path>\n                  </svg>\n                  <svg width=\"6\" height=\"23\" fill=\"#8f979b\" class=\"automation_svg\">\n                    <path d=\"M 3 20.5 A 0.5 0.5 90 0 0 3 17.5 A 0.5 0.5 90 0 0 3 20.5 Z M 3 16 A 0.5 0.5 90 0 1 3 22 A 0.5 0.5 90 0 1 3 16 Z Z M 3 19 L 3 3 M 3 1.5 A 0.5 0.5 90 0 1 3 4.5 A 0.5 0.5 90 0 1 3 1.5 M 3 0 A 0.5 0.5 90 0 0 3 6 A 0.5 0.5 90 0 0 3 0 Z M 2 15 L 2 7 L 4 7 L 4 15 Z\"></path>\n                  </svg>\n                  <svg width=\"25\" height=\"24\" fill=\"#8f979b\" viewportWidth=\"25 24\" class=\"wave_svg\">\n                    <path d=\"M 0 12 C 3 5 4 5 7 12 C 12 28 13 28 18 12 C 21 5 22 5 25 12 C 22 19 21 19 18 12 C 13 -4 12 -4 7 12 C 4 19 3 19 0 12 Z\"></path>\n                  </svg>\n                </div>\n                <div id=\"tracks_top_bar_inner\" style=\"overflow: hidden;\">\n                  <div class=\"tracks_top_bar_scrollbar\">\n                    <div class=\"tracks_top_bar_scrollbar_left\" style=\"float: left;\"><i class=\"fa-solid fa-chevron-left\"></i></div>\n                    <div class=\"tracks_top_bar_scrollbar_handle\" id=\"tracks_top_bar_scrollbar_handle\"></div>\n                    <div class=\"tracks_top_bar_scrollbar_right\" style=\"float: right;\"><i class=\"fa-solid fa-chevron-right\"></i></div>\n                  </div>\n                  <div class=\"tracks_top_bar_bars_wrapper\">\n                    <div class=\"tracks_top_bar_bars\">\n                      <svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" id=\"bars_cursor\">\n                        <filter id='inset-shadow'>\n                          <!-- Shadow offset -->\n                          <feOffset\n                                  dx='0'\n                                  dy='2'\n                                />\n                          <!-- Shadow blur -->\n                        <feGaussianBlur\n                                  stdDeviation='2'\n                                  result='offset-blur'\n                                />\n                          <!-- Invert drop shadow to make an inset shadow-->\n                          <feComposite\n                                  operator='out'\n                                  in='SourceGraphic'\n                                  in2='offset-blur'\n                                  result='inverse'\n                                />\n                          <!-- Cut colour inside shadow -->\n                          <feFlood\n                                  flood-color='#ffffffaa'\n                                  flood-opacity='.35'\n                                  result='color'\n                                />\n                          <feComposite\n                                  operator='in'\n                                  in='color'\n                                  in2='inverse'\n                                  result='shadow'\n                                />\n                          <!-- Placing shadow over element -->\n                          <feComposite\n                                  operator='over'\n                                  in='shadow'\n                                  in2='SourceGraphic'\n                                /> \n                        </filter>\n                        <path fill=\"#b9ea70\" d=\"M 0 0 L 0 3 L 10 13 L 20 3 L 20 0 Z\" filter=\"url(#inset-shadow)\"></path>\n                      </svg>\n                      <!-- will be filled with bar text objects -->\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div class=\"tracks\" id=\"tracks\">\n                <div class=\"line_cursor\"></div>\n              <!-- track template -->\n                <template id=\"track_template\">\n                  <div class=\"track\" id=\"replace_this_id\">\n                    <div id=\"track_wrap\">\n                      <div class=\"description\">\n                        <p style=\"margin: 0px;\" id=\"track_title\">track_name</p>\n                          <i class=\"fa-solid fa-ellipsis\"></i>\n                          <div class=\"radio_btn\"><div class=\"radio_btn_green\"></div></div>\n                          <div id=\"track_resize\"></div>\n                      </div>\n                      <div class=\"track_play_indicator\"></div>\n                      <div class=\"track_content\">\n                        <div class=\"track_background\">\n                          <!--<canvas id=\"track_canvas\" width=\"10000\" height=\"500\"></canvas>-->\n                          <!-- the tile_divs will be spawned here -->\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        ";
        // first load all possible audio plugins, then initialise the tracks so the
        // tracks can be sure that every module is loaded and they don't have to
        // import any
        var plugin_promises = (0, fs_1.readdirSync)("AudioNodes").map(function (v) {
            return globals_1.globals.audiocontext.audioWorklet.addModule("AudioNodes/" + v);
        });
        Promise.allSettled(plugin_promises).then(function () {
            for (var i = 0; i < 10; i++) {
                new Track_1.Track();
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
        var options = { customCss: "transform: scale(0.8);" };
        this.addToolbarButton("fa-solid fa-magnet", new Color_1.Color("#7eefa9"), function () { }, {
            customCss: "transform: scale(0.8) rotate(180deg) translate(-1px, 1px);"
        });
        this.addToolbarButton("fa-solid fa-pencil", new Color_1.Color("#fcba40"), function () { }, {
            customCss: "transform: scale(0.8) translate(1px, 0px);"
        });
        this.addToolbarButton("fa-solid fa-brush", new Color_1.Color("#7bcefd"), function () { }, options);
        this.addToolbarButton("fa-solid fa-ban", new Color_1.Color("#ff5b53"), function () { }, {
            customCss: "transform: scale(0.9) translate(1px, 0px);"
        });
        this.addToolbarButton("fa-solid fa-volume-xmark", new Color_1.Color("#ff54b0"), function () { }, options);
        this.addToolbarButton("fa-solid fa-arrows-left-right", new Color_1.Color("#ffa64a"), function () { }, options);
        this.addToolbarButton("fa-solid fa-spoon", new Color_1.Color("#85b3ff"), function () { }, options);
        this.addToolbarButton("fa-solid fa-expand", new Color_1.Color("#ffab60"), function () { }, options);
        this.addToolbarButton("fa-solid fa-magnifying-glass", new Color_1.Color("#85b3ff"), function () { }, options);
        this.addToolbarButton("fa-solid fa-volume-high", new Color_1.Color("#ffa64a"), function () { }, options);
        this.setContentSize(1200, 700);
    };
    return Playlist;
}(window_1.Window));
new Playlist();
