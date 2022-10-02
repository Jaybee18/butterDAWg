var tracks = [];
var resizing_track = null;

var deactivate_space_to_play = false;

// current progression in the track in ms
var current_time = 0;

const sample_rate = 44100;
var xsnap = 20;
const bpm = 150;

const fs = require("fs");
const { WaveFile } = require("wavefile");
//const wavefile = require("wavefile");
//const Speaker = require("speaker");
//const stream = require("stream");
//var {Howl, Howler} = require("howler");
//const { WaveFile } = require("wavefile");

var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

// draggable class for objects that will be draggable
class Draggable {
    initializeDragListener() {
        this.element.addEventListener("mousedown", () => {
        current_drag_element = this;
        });
    }
  
    getDragElement() {
        throw "Abstract function of Draggable is not implemented";
    }
  }
    

// conversion functions
//var ms_to_pixels_factor = xsnap*4/8 / (1/(bpm/60000));
function pixels_to_ms(px) {return px / (xsnap*4/8 / (1/(bpm/60000)));}
/*
10 px = 1 beat
1 beat = 150/60000 = 0.0025 beats/ms
1 beat / 0.0025 beats/ms = 400 ms
10 px / 400 = 0.025 px/ms
=> 10 px / (1 beat / (150 beat/min / 60_000 ms)) = 0.025 px/ms
*/
function ms_to_pixels(ms) {return ms * (xsnap*4/8 / (1/(bpm/60000)));}