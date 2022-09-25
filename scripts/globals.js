var tracks = [];
var resizing_track = null;

var deactivate_space_to_play = false;

const fs = require("fs");
const wavefile = require("wavefile");
const stream = require("stream");
const { WaveFile } = require("wavefile");

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
