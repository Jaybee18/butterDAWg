"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
var wavefile_1 = require("wavefile");
var globals_1 = require("./globals");
var fs_1 = require("fs");
/*
    This class is the barebone to any other class that uses audio data
    (imported from files) and provides those more high-level classes
    with data
*/
var Source = /** @class */ (function () {
    function Source(path) {
        // path to the source file
        this.path = path;
        this.filename = path.substring(path.lastIndexOf("/"));
        console.log(this.path, this.filename); // testing
        // WaveFile object of audio file
        this.wavefile = null;
        // audio buffer holding the files audio data
        this.audio_buffer = null;
        this.loadData();
    }
    Source.prototype.loadData = function () {
        // load the audio data from the given path into this object
        this.wavefile = new wavefile_1.WaveFile((0, fs_1.readFileSync)(this.path));
        // make sure all audio data fed into the program is the same format (float 32 bit)
        if (this.wavefile.bitDepth !== "32f") {
            this.wavefile.toBitDepth("32f");
        }
        // fill this objects audio buffer
        var tmp = Float32Array.from(this.wavefile.getSamples(true));
        this.audio_buffer = globals_1.globals.audiocontext.createBuffer(2, tmp.length, globals_1.globals.audiocontext.sampleRate * 2);
        this.audio_buffer.copyToChannel(tmp, 0);
        this.audio_buffer.copyToChannel(tmp, 1);
    };
    Source.prototype.getAudioBuffer = function () {
        return this.audio_buffer;
    };
    return Source;
}());
exports.Source = Source;
