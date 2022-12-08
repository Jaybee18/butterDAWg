"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
var globals_1 = require("./globals");
var current_selected_channel = null;
var channel_element = ' <div class="channel">\
                            <div class="index_indicator">\
                              <p>20</p>\
                            </div>\
                            <div class="channel_label">\
                              <p>Insert 20</p>\
                            </div>\
                            <div class="channel_volume">\
                              <div class="channel_volume_indicator">\
                                <div class="selection_indicator"></div>\
                                <div class="indicator_top"></div>\
                                <div class="indicator_bottom"></div>\
                              </div>\
                              <div class="channel_toggle">\
                                <div class="channel_toggle_green"></div>\
                              </div>\
                              <div class="channel_pan">\
                                <div class="channel_pan_knob"></div>\
                              </div>\
                            </div>\
                            <div class="channel_volume_slider">\
                              <div class="channel_volume_knob">\
                                <div class="channel_volume_knob_peak"></div>\
                              </div>\
                              <div class="channel_volume_background"></div>\
                            </div>\
                            <div class="channel_links"></div>\
                          </div>';
var Channel = /** @class */ (function () {
    function Channel(index) {
        this.element = null;
        this.index = index;
        this.enabled = true;
        this.pan = 1; // 0 to 1.0
        this.volume = 100; // in percent
        this.max_volume = 125; // in percent
        this.id = Math.round(Date.now() * Math.random());
        this.merger_node = null;
        this.analyzer_node = null;
        this.audionodes = [];
        this.level_indicator = null;
        // construct element
        this.createElement();
        this.addToMixer();
        // initialize audio nodes
        this.initializeAudio();
        this.initializeEventListeners();
        this.toggle();
    }
    Channel.prototype.createElement = function () {
        var a = document.createElement("div");
        a.innerHTML = channel_element;
        var b = a.firstElementChild;
        b.querySelector(".index_indicator > p").innerHTML = this.index.toString();
        b.querySelector(".channel_label > p").innerHTML = "Insert " + this.index;
        var c = b.querySelector(".channel_volume_knob");
        c.style.top = "11.4px";
        this.level_indicator = b.querySelector(".indicator_top");
        this.element = b;
    };
    Channel.prototype.addToMixer = function () {
        var mixer = document.querySelector(".mixer_channels_wrapper");
        mixer.appendChild(this.element);
    };
    Channel.prototype.initializeAudio = function () {
        this.merger_node = new ChannelMergerNode(globals_1.globals.audiocontext);
        this.analyzer_node = new AnalyserNode(globals_1.globals.audiocontext);
        this.merger_node.connect(this.analyzer_node);
        this.analyzer_node.connect(globals_1.globals.audiocontext.destination);
    };
    Channel.prototype.getFirstAudioNode = function () {
        // return the first node of this channels audio pipeline
        return this.merger_node;
    };
    Channel.prototype.initializeEventListeners = function () {
        var _this = this;
        var temp_this = this;
        var volume_slider = this.element.querySelector(".channel_volume_knob");
        var slider_height = this.element.querySelector(".channel_volume_slider").clientHeight;
        var toggle_button = this.element.querySelector(".channel_toggle");
        var pan_knob = this.element.querySelector(".channel_pan");
        var knob_height = volume_slider.clientHeight;
        function slider_move(e) {
            temp_this.volume =
                Math.round((1 - (volume_slider.offsetTop + 6) / (100 - 13)) * 100) *
                    1.25;
            globals_1.globals.header_help_text.innerHTML = "Volume: " + temp_this.volume + "%";
            volume_slider.style.top =
                Math.min(Math.max(volume_slider.offsetTop + e.movementY, 4 - knob_height / 2), slider_height - knob_height / 2 - 4) + "px";
        }
        volume_slider.addEventListener("mousedown", function () {
            document.addEventListener("mousemove", slider_move);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", slider_move);
            volume_slider.style.top =
                (volume_slider.offsetTop / slider_height) * 100 + "%";
        });
        volume_slider.addEventListener("mouseenter", function () {
            globals_1.globals.header_help_text.innerHTML = "Volume: " + _this.volume + "%";
        });
        toggle_button.addEventListener("click", function () {
            _this.toggle();
        });
        var volume = this.element.querySelector(".channel_volume_indicator");
        this.element.addEventListener("mousedown", function (e) {
            _this.select(true);
        });
        function pan_move(e) {
            temp_this.pan -= e.movementY / 100;
            temp_this.pan = Math.max(Math.min(temp_this.pan, 1.5), 0.5);
            if (temp_this.pan < 1) {
                pan_knob.style["background"] =
                    "#374045 conic-gradient(from 0deg at 50% 50%, #00000000 0%, #00000000 " +
                        temp_this.pan * 100 +
                        "%, #5cff5c " +
                        temp_this.pan * 100 +
                        "%, #5cff5c 100%)";
            }
            else {
                pan_knob.style["background"] =
                    "#374045 conic-gradient(from 0deg at 50% 50%, #5cff5c 0%, #5cff5c " +
                        (temp_this.pan - 1) * 100 +
                        "%, #00000000 " +
                        (temp_this.pan - 1) * 100 +
                        "%, #00000000 100%)";
            }
            if (Math.round(temp_this.pan * 100) === 100) {
                globals_1.globals.header_help_text.innerHTML = "Panning: Centered";
            }
            else {
                globals_1.globals.header_help_text.innerHTML =
                    "Panning: " +
                        Math.abs(Math.round(((temp_this.pan - 1) / 0.5) * 100)) +
                        "%" +
                        (temp_this.pan < 1 ? " left" : " right");
            }
        }
        pan_knob.addEventListener("mousedown", function () {
            document.addEventListener("mousemove", pan_move);
        });
        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", pan_move);
        });
        pan_knob.addEventListener("mouseenter", function () {
            if (Math.round(_this.pan * 100) === 100) {
                globals_1.globals.header_help_text.innerHTML = "Panning: Centered";
            }
            else {
                globals_1.globals.header_help_text.innerHTML =
                    "Panning: " +
                        Math.abs(Math.round(((_this.pan - 1) / 0.5) * 100)) +
                        "%" +
                        (_this.pan < 1 ? " left" : " right");
            }
        });
    };
    Channel.prototype.toggle = function () {
        this.enabled = !this.enabled;
        this.element.querySelector(".channel_toggle_green").style.backgroundColor =
            this.enabled ? "#5cff5c" : "#1a501a";
        if (this.enabled)
            this.draw();
    };
    Channel.prototype.select = function (selected) {
        var volume_wrapper2 = this.element.querySelector(".channel_volume_indicator");
        var volume = this.element.querySelector(".selection_indicator");
        var volume_wrapper = this.element.querySelector(".channel_volume");
        var indicator = this.element.querySelector(".index_indicator");
        var indicator_text = indicator.querySelector("p");
        if (selected) {
            if (current_selected_channel !== null) {
                current_selected_channel.select(false);
            }
            current_selected_channel = this;
            volume_wrapper2.classList.add("channel_volume_select2");
            volume.classList.add("channel_volume_select");
            this.element.style.backgroundColor = "#3d474c";
            this.element.style.borderColor = "#3c464c";
            indicator.style.background =
                "repeating-linear-gradient(45deg, transparent, transparent 2px, #0000000a 2px, #0000000a 4px) #636c71";
            indicator_text.style.color = "var(--text-color)";
            volume_wrapper.style.background =
                "linear-gradient(#3d474c, var(--bg-dark))";
        }
        else {
            volume_wrapper2.classList.remove("channel_volume_select2");
            volume.classList.remove("channel_volume_select");
            this.element.style.backgroundColor = "#374045";
            this.element.style.borderColor = "#313a40";
            indicator.style.background = "#636c71";
            indicator_text.style.color = "var(--bg-darker)";
            volume_wrapper.style.background =
                "linear-gradient(#374045, var(--bg-dark))";
        }
    };
    Channel.prototype.draw = function () {
        var _this = this;
        // function to draw the current peak volume in the analyzer
        if (this.enabled) {
            requestAnimationFrame(function () {
                _this.draw();
            });
        }
        var buffer = new Float32Array(this.analyzer_node.frequencyBinCount);
        this.analyzer_node.getFloatTimeDomainData(buffer);
        var max = buffer.reduce(function (prev, current) {
            return current > prev ? current : prev;
        });
        this.level_indicator.style.height = (1 - max) * 100 + "%";
    };
    return Channel;
}());
exports.Channel = Channel;
// repeat channels
for (var i = 0; i < 60; i++) {
    var a = new Channel(i);
    a.addToMixer();
    globals_1.globals.channels.push(a);
}
