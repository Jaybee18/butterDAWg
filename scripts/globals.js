var tracks = [];
var resizing_track = null;

var deactivate_space_to_play = false;

// current progression in the track in ms
var current_time = 0;

const fs = require("fs");
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

// conversion functions
/*
1 beat = 20 px
1 px = 0.05 beats

60 000 ms = 150 beats
20 ms = 0.05 beats

1 px = 20 ms
*/
function pixels_to_ms(px) {return 60000/(bpm/(1/(xsnap/2))) * px;}
function ms_to_pixels(ms) {return xsnap*4/8*(bpm/60000*ms);}