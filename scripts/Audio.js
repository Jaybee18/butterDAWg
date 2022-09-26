const buffer_size = 44100;
const timeout = 100;

const int16max = 32767;

const audiocontext = new AudioContext({sample_rate});
audiocontext.suspend();

let cursor_anim = null;
function play() {
    if (is_playing) {
        // stop
        audiocontext.suspend();
        clearInterval(cursor_anim);
        console.log("stopped");
    } else {
        // start
        audiocontext.resume();
        let start = Date.now();
        cursor_anim = setInterval(() => {
            cursor_pos += ms_to_pixels(10);
            cursor.style.left = cursor_pos - (cursor.clientWidth/2) + "px";

            tracks.forEach(track => {
                track.play();
            });

            current_time += 10;
            console.log(Date.now() - start);
        }, 10);
        console.log("started");
    }
    is_playing = !is_playing;
}