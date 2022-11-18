import { globals, ms_to_pixels } from "./globals";

let track_bar_cursor = <HTMLElement> document.querySelector(".line_cursor");
let cursor = <HTMLElement> document.getElementById("bars_cursor");

let cursor_anim: NodeJS.Timer = null;
export function play() {
    if (globals.is_playing) {
        // stop
        globals.audiocontext.suspend();
        clearInterval(cursor_anim);
        track_bar_cursor.style.display = "none";
        console.log("stopped");
    } else {
        // start
        globals.audiocontext.resume();
        cursor_anim = setInterval(() => {
            globals.cursor_pos += ms_to_pixels(10);
            track_bar_cursor.style.left = globals.cursor_pos + globals.line_cursor_offset + "px";
            cursor.style.left = globals.cursor_pos - (cursor.clientWidth/2) + "px";

            globals.tracks.forEach(track => {
                track.play();
            });

            globals.current_time += 10;
        }, 10);
        //track_bar_cursor.style.display = "block";
        console.log("started");
    }
    globals.is_playing = !globals.is_playing;
}