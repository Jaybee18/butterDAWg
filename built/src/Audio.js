"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.play = void 0;
var globals_1 = require("./globals");
var track_bar_cursor = document.querySelector(".line_cursor");
var cursor = document.getElementById("bars_cursor");
var cursor_anim = null;
function play() {
    if (globals_1.globals.is_playing) {
        // stop
        globals_1.globals.audiocontext.suspend();
        clearInterval(cursor_anim);
        track_bar_cursor.style.display = "none";
        console.log("playback stopped");
    }
    else {
        // start
        globals_1.globals.audiocontext.resume();
        cursor_anim = setInterval(function () {
            globals_1.globals.cursor_pos += (0, globals_1.ms_to_pixels)(10);
            track_bar_cursor.style.left = globals_1.globals.cursor_pos + globals_1.globals.line_cursor_offset + "px";
            cursor.style.left = globals_1.globals.cursor_pos - (cursor.clientWidth / 2) + "px";
            globals_1.globals.tracks.forEach(function (track) {
                track.play();
            });
            globals_1.globals.current_time += 10;
        }, 10);
        //track_bar_cursor.style.display = "block";
        console.log("playback started");
    }
    globals_1.globals.is_playing = !globals_1.globals.is_playing;
}
exports.play = play;
