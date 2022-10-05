let track_bar_cursor = document.querySelector(".line_cursor");
let line_cursor_offset = 93 - 6; // description width (93px) + half of line cursor width (16px)

let cursor_anim = null;
function play() {
    if (is_playing) {
        // stop
        audiocontext.suspend();
        clearInterval(cursor_anim);
        track_bar_cursor.style.display = "none";
        console.log("stopped");
    } else {
        // start
        audiocontext.resume();
        cursor_anim = setInterval(() => {
            cursor_pos += ms_to_pixels(10);
            track_bar_cursor.style.left = cursor_pos + line_cursor_offset + "px";
            cursor.style.left = cursor_pos - (cursor.clientWidth/2) + "px";

            tracks.forEach(track => {
                track.play();
            });

            current_time += 10;
        }, 10);
        //track_bar_cursor.style.display = "block";
        console.log("started");
    }
    is_playing = !is_playing;
}