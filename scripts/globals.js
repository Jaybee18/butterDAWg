var tracks = [];
var channels = [];
var context_menus = []; // all open context menus
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


// cheaty stuff
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function createElement(HTML) {
  let a = document.createElement("div");
  a.innerHTML = HTML;
  return a.firstElementChild;
}


// Audio stuff
const buffer_size = 44100;
const timeout = 10; 
const audiocontext = new AudioContext({sample_rate});
audiocontext.audioWorklet.addModule("scripts/AudioNodes/passthrough.js").then(() => {console.log("loaded passthrough module");});
audiocontext.suspend();


// temp
class PassthroughNode extends AudioWorkletNode {
  constructor(context, options) {
    // set options here
    super(context, 'passthrough', options);
    
    // configure port for communication with the audioprocessor
    this.port.addEventListener("message", (m) => {
      options.callback(m.data.volume);
    });
    this.port.start();
  }
}