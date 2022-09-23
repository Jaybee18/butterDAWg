const sample_rate = 44100;
const buffer_size = 44100;

const int16max = 32767;

const audiocontext = new AudioContext({sample_rate});
const audio_buffer = audiocontext.createBuffer(1, 44100, 88200);

function getBuffer() {
    let a = tracks[0].getFrames(buffer_size*3);
    let b = [];
    a.forEach(e => {
        b.push(e/int16max);
    });
    return Float32Array.from(b);
}

let interval = null;
function play() {
    console.log(is_playing?"stopping":"playing");
    if (is_playing) {
        // sug ma nuds
        clearInterval(interval);
    } else {
        interval = setInterval(() => {
            audio_buffer.copyToChannel(getBuffer(), 0);
            const source = audiocontext.createBufferSource();
            source.connect(audiocontext.destination);
            source.buffer = audio_buffer;
            source.start();
        }, 1000);
    }
    is_playing = !is_playing;
}