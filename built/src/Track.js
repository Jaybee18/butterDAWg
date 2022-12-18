"use strict";
//
// tracks scrolling
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
var TrackSample_1 = require("./TrackSample");
var Color_1 = require("./Color");
var globals_1 = require("./globals");
var ContextMenu_1 = require("./ContextMenu");
var ColorPicker_1 = require("./ColorPicker");
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
var track_config_menu = document.getElementById("track_config_menu");
var track_config_xoffset = 0;
var track_config_yoffset = 0;
function track_config_movement(e) {
    track_config_menu.style.left = e.clientX - track_config_xoffset + "px";
    track_config_menu.style.top = e.clientY - track_config_yoffset + "px";
}
track_config_menu.addEventListener("mousedown", function (e) {
    if (e.target != track_config_menu)
        return;
    track_config_xoffset = e.clientX - track_config_menu.offsetLeft;
    track_config_yoffset = e.clientY - track_config_menu.offsetTop;
    document.addEventListener("mousemove", track_config_movement);
});
document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", track_config_movement);
});
track_config_menu.querySelector("#conf_check").addEventListener("click", function () {
    globals_1.globals.current_context_track.setTitle(track_config_menu.querySelector("#conf_name_input").value);
    track_config_menu.style.display = "none";
    globals_1.globals.deactivate_space_to_play = false;
});
track_config_menu.querySelector("#conf_xmark").addEventListener("click", function () {
    track_config_menu.style.display = "none";
    globals_1.globals.deactivate_space_to_play = false;
});
function showTrackConfig(e) {
    track_config_menu.querySelector("#conf_bottom p").innerText = globals_1.globals.current_context_track.title;
    track_config_menu.style.left = e.clientX + "px";
    track_config_menu.style.top = e.clientY + "px";
    track_config_menu.style.display = "flex";
    globals_1.globals.deactivate_space_to_play = true;
    track_config_menu.querySelector("#conf_name_input").value = globals_1.globals.current_context_track.title;
}
// track context menu channel link menu
var context_channel_items = globals_1.globals.channels.map(function (v, i) { return "Insert " + i; });
var context_channel_listeners = globals_1.globals.channels.map(function (v, i) {
    return function () {
        // connect the current track to the selected channel and close the context menu
        globals_1.globals.current_context_track.connect(v);
        return true;
    };
});
var channel_context = new ContextMenu_1.ContextMenu(context_channel_items, context_channel_listeners);
// track context menu
var context_event_listeners = [
    function (e) {
        showTrackConfig(e);
        return true;
    },
    function () {
        ColorPicker_1.color_picker.style.display = "block";
        return true;
    },
    null,
    null,
    null,
    function (e) {
        channel_context.toggle(e);
        return false;
    },
    null,
    null,
    function () {
        globals_1.globals.current_context_track.resize_locked = !globals_1.globals.current_context_track.resize_locked;
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
    function () {
        var a = globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track);
        var b = globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track) - 1;
        if (b < 0) {
            return;
        }
        // swap HTML elements
        track_view.insertBefore(globals_1.globals.current_context_track.element, globals_1.globals.tracks[globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track) - 1].element);
        // swap tracks-array entries
        var tmp = globals_1.globals.tracks[a];
        globals_1.globals.tracks[a] = globals_1.globals.tracks[b];
        globals_1.globals.tracks[b] = tmp;
        return true;
    },
    function () {
        var a = globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track);
        var b = globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track) + 1;
        if (b === globals_1.globals.tracks.length) {
            return;
        }
        // swap HTML elements
        track_view.insertBefore(globals_1.globals.current_context_track.element, globals_1.globals.tracks[globals_1.globals.tracks.indexOf(globals_1.globals.current_context_track) + 2].element);
        // swap tracks-array entries
        var tmp = globals_1.globals.tracks[a];
        globals_1.globals.tracks[a] = globals_1.globals.tracks[b];
        globals_1.globals.tracks[b] = tmp;
        return true;
    }
];
var context_items = [
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
var new_context_menu = new ContextMenu_1.ContextMenu(context_items, context_event_listeners);
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
var Track = /** @class */ (function () {
    //passthrough_node: PassthroughNode;
    function Track() {
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
        this.id = Date.now().toString();
        this.samples = [];
        this.hover_buffer = null;
        this.color = null;
        this.play_indicator_color = new Color_1.Color(51, 63, 70);
        this.title = "";
        this.enabled = true;
        this.resize_locked = false;
        this.channel = null;
        // all audio modules should've been loaded in the Playlist Window class
        // so they can be used without checking if they have been imported first
        this.audio_node = new AudioWorkletNode(globals_1.globals.audiocontext, "passthrough");
        this.audio_node.connect(globals_1.globals.audiocontext.destination);
        // construct own element
        this.element =
            globals_1.React.createElement("div", { className: "track", id: "replace_this_id" },
                globals_1.React.createElement("div", { id: "track_wrap" },
                    globals_1.React.createElement("div", { className: "description" },
                        globals_1.React.createElement("p", { id: "track_title" }, "track_name"),
                        globals_1.React.createElement("i", { className: "fa-solid fa-ellipsis" }),
                        globals_1.React.createElement("div", { className: "radio_btn" },
                            globals_1.React.createElement("div", { className: "radio_btn_green" })),
                        globals_1.React.createElement("div", { id: "track_resize" })),
                    globals_1.React.createElement("div", { className: "track_play_indicator" }),
                    globals_1.React.createElement("div", { className: "track_content" },
                        globals_1.React.createElement("div", { className: "track_background" }))));
        // add self to track view
        var track_view = document.getElementById("tracks");
        track_view.appendChild(this.element);
        this.id = Date.now().toString();
        this.element.id = this.id;
        this.content = this.element.querySelector(".track_content");
        this.description = this.element.querySelector(".description");
        this.sound_indicator = this.element.querySelector(".track_play_indicator");
        this.radio_btn = this.description.querySelector(".radio_btn");
        // add self to track-list
        globals_1.globals.tracks.push(this);
        this.setTitle("Track " + globals_1.globals.tracks.length);
        this.setColor(new Color_1.Color("#646e73")); // #646e73 #485155
        this.updateCanvas();
        this.initializeResizing();
        this.initializeEventListeners();
    }
    Track.prototype.getFrames = function (size) {
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
    };
    Track.prototype.play = function () {
        // play method gets called every 10? ms
        // search for any samples that are registered at that current
        // timestamp, those have to be played in the current audio context
        // immediatly
        this.samples.forEach(function (sample) {
            if ((0, globals_1.pixels_to_ms)(sample.x) === globals_1.globals.current_time) {
                sample.play();
            }
        });
    };
    Track.prototype.connect = function (channel) {
        this.channel = channel;
        // connect the track to the first element of the 
        // channel audio node pipeline
        //this.passthrough_node.connect(channel.getFirstAudioNode());
        // finally enable the channel
        this.channel.toggle();
    };
    Track.prototype.setPlayIndicator = function (percent) {
        // set the intensity (in %) of the play indicator
        // to the right of the description
        /* neutral color is rgb(51, 63, 70) */
        this.element.querySelector(".track_play_indicator").style.backgroundColor = this.play_indicator_color.lerp(new Color_1.Color("#ffffff"), Math.min(1.0, percent * 2));
    };
    Track.prototype.enable = function () {
        this.enabled = true;
        this.radio_btn.firstElementChild.style.backgroundColor = globals_1.globals.green;
        this.description.style.backgroundColor = this.color.color;
        this.description.style.color = "";
        this.description.style.borderRightColor = this.color.lighten(10);
        this.description.style.background = this.color.color;
    };
    Track.prototype.disable = function () {
        this.enabled = false;
        this.radio_btn.firstElementChild.style.backgroundColor = globals_1.globals.grey;
        this.description.style.backgroundColor = this.color.darken(20);
        this.description.style.color = "#ffffff45";
        this.description.style.borderRightColor = this.color.darken(20);
        this.description.style.borderLeftColor = this.color.darken(20);
        this.description.style.background = "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) " + this.color.darken(20);
    };
    Track.prototype.updateData = function () {
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
    };
    Track.prototype.updateCanvas = function () {
        var background = this.content.querySelector(".track_background");
        var tiles = "";
        for (var i = 0; i < 500; i++) {
            tiles += '<div class="tile" style="background-color:' + (i % 32 < 16 ? "rgb(52, 68, 78)" : "rgb(46, 62, 72)") + ';' + (i % 4 == 0 ? "border-width: 1px 1px 1px 1.5px" : "") + '" ></div>';
        }
        background.innerHTML = tiles;
    };
    Track.prototype._updateCanvas = function () {
        var c = this.element.querySelector("#track_canvas");
        var ctx = c.getContext("2d");
        for (var i = 0; i < 1000; i += 32) {
            ctx.fillStyle = 'rgb(52, 68, 78)';
            ctx.fillRect(i * globals_1.globals.xsnap, 0, globals_1.globals.xsnap * 16, 500);
            ctx.fillStyle = 'rgb(46, 62, 72)';
            ctx.fillRect(globals_1.globals.xsnap * 16 + i * globals_1.globals.xsnap, 0, globals_1.globals.xsnap * 16, 500);
        }
        ctx.strokeStyle = 'rgb(24, 40, 50)';
        ctx.lineWidth = 10;
        ctx.moveTo(0, 5);
        ctx.lineTo(globals_1.globals.xsnap * 1000, 5);
        ctx.stroke();
        //ctx.strokeStyle = 'rgb(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (var i = 0; i < 1000; i++) {
            ctx.moveTo(i * 20, 0);
            ctx.lineTo(i * 20, 500);
        }
        ctx.stroke();
    };
    Track.prototype.initializeResizing = function () {
        // TODO maybe optimize this
        var resize_handle = this.element.querySelector("#track_resize");
        var resizing_track = null;
        var l = this.element;
        var temp_this = this;
        function movefunc(e) {
            if (resizing_track === null || temp_this.resize_locked) {
                return false;
            }
            var new_height = e.clientY - (0, globals_1.cumulativeOffset)(resizing_track).top; //resizing_track.offsetTop;
            resizing_track.style.height = new_height + "px";
        }
        resize_handle.onmousedown = function () {
            document.addEventListener("mousemove", movefunc);
            if (temp_this.resize_locked) {
                return false;
            }
            resizing_track = l;
            return false;
        };
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", movefunc);
        });
    };
    Track.prototype.resizeBackground = function (event) {
        var background = this.content.querySelector(".track_background");
        background.style.width = background.clientWidth - event.deltaY * 5 + "px";
        for (var i = 0; i < this.samples.length; i++) {
            this.samples[i].resize();
            var previousXsnap = globals_1.globals.xsnap + event.deltaY / 100; // as of the formula below
            this.samples[i].move(this.samples[i].element.offsetLeft / previousXsnap * (-event.deltaY / 100), 0);
        }
    };
    Track.prototype.resizeHeight = function (delta) {
        if (this.resize_locked) {
            return;
        }
        this.element.style.height = this.element.clientHeight - delta + "px";
    };
    Track.prototype.initializeEventListeners = function () {
        var _this = this;
        this.element.addEventListener("mouseenter", function () {
            // help
            globals_1.globals.header_help_text.innerHTML = _this.title;
        });
        var drag_container = document.getElementById("drag_container");
        var bars_scrollbar_handle = document.getElementById("tracks_top_bar_scrollbar_handle");
        var bars_scrollbar_wrapper = document.querySelector(".tracks_top_bar_scrollbar");
        var maxX = bars_scrollbar_wrapper.clientWidth - bars_scrollbar_handle.clientWidth - 40;
        this.content.addEventListener("wheel", function (e) {
            if (e.shiftKey) {
                e.preventDefault();
                // idk how else to do it, this just transfers the scroll event
                // to the scrollbar_handle
                var currentOffset = (bars_scrollbar_handle.offsetLeft - 20) / maxX;
                var newOffset = currentOffset + (e.deltaY / 100) / 50;
                newOffset = Math.min(Math.max(newOffset, 0), 1);
                console.log("remove method");
                //tracks_scroll_to(newOffset, 0);
            }
            else if (globals_1.globals.control_down) {
                // delta = x*100
                if (globals_1.globals.xsnap - e.deltaY / 100 < 6) {
                    return;
                } // TODO this may cause some issues in the future, but idc
                globals_1.globals.xsnap -= e.deltaY / 100;
                var bars = document.querySelectorAll(".tracks_top_bar_bars > p");
                for (var i = 0; i < bars.length; i++) {
                    bars[i].style.width = globals_1.globals.xsnap * 4 + "px";
                }
                for (var i = 0; i < globals_1.globals.tracks.length; i++) {
                    globals_1.globals.tracks[i].resizeBackground(e);
                }
            }
            else if (globals_1.globals.alt_down) {
                e.preventDefault();
                for (var i = 0; i < globals_1.globals.tracks.length; i++) {
                    globals_1.globals.tracks[i].resizeHeight(e.deltaY / 10);
                }
            }
        });
        this.element.addEventListener("mouseleave", function () {
            if (_this.hover_buffer !== null) {
                _this.hover_buffer.element.remove();
                _this.hover_buffer = null;
                drag_container.style.display = "block";
            }
        });
        this.content.addEventListener("mousemove", function () {
            // sample preview
            if (globals_1.globals.current_drag_element !== null) {
                _this.sampleHover(globals_1.globals.current_drag_element);
                drag_container.style.display = "none";
            }
        });
        this.element.addEventListener("mousemove", function (e) {
            if (_this.hover_buffer !== null) {
                var newX = e.clientX - (0, globals_1.cumulativeOffset)(_this.hover_buffer.element.parentElement).left - _this.hover_buffer.element.clientWidth / 2;
                newX = Math.min(Math.max(newX, 0), _this.content.clientWidth) + _this.content.scrollLeft;
                var newnewX = newX - newX % globals_1.globals.xsnap;
                _this.hover_buffer.element.style["left"] = newnewX + "px";
                _this.hover_buffer.x = newnewX;
            }
        });
        this.element.addEventListener("mouseup", function () {
            // if a sample was dragged, add it to this track
            if (globals_1.globals.current_drag_element !== null) {
                _this.addSample(_this.hover_buffer);
                _this.hover_buffer = null;
            }
        });
        // radio button on click
        (0, globals_1.addRadioEventListener)(this.element.querySelector(".radio_btn"), this);
        // context menu
        this.description.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            globals_1.globals.current_context_track = _this;
            new_context_menu.toggle(e);
            //toggle_track_context_menu(e, this);
        });
    };
    Track.prototype.setTitle = function (title) {
        this.element.querySelector("#track_title").innerHTML = title;
        this.title = title;
    };
    Track.prototype.setColor = function (color) {
        this.color = color;
        this.description.style.background = this.color.color;
        this.description.style.borderColor = this.color.darken(8) + " " + this.color.lighten(10);
        this.samples.forEach(function (s) {
            s.setColor(color);
        });
    };
    Track.prototype.addSample = function (sample) {
        // parameter is of type TrackSample
        //sample.x = sample.element.offsetLeft;
        this.content.appendChild(sample.element);
        this.samples.push(sample);
        this.updateData();
    };
    Track.prototype.sampleHover = function (item) {
        // call this function of a track, when currently dragging a sample
        // from the sidebar, to display a track_sample representation of
        // the sample on the track at the current position of the mouse
        if (this.hover_buffer !== null) {
            return;
        }
        var t = new TrackSample_1.TrackSample(item, this);
        t.setColor(this.color);
        this.content.appendChild(t.element);
        //t.move(this.content.scrollLeft, 0);
        this.hover_buffer = t;
    };
    return Track;
}());
exports.Track = Track;
// add track-button functionality
// document.getElementById("track_add_label").addEventListener('click', () => {new Track();});
//document.querySelectorAll(".radio_btn").forEach(btn => addRadioEventListener(btn)); // probably works, but idk
