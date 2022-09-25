import FreeQueue from './free-queue.js';

const sample_rate = 44100;
const buffer_size = 44100;
const timeout = 100;

const int16max = 32767;

const audiocontext = new AudioContext({sample_rate});

audiocontext.audioWorklet.addModule("./scripts/test.js");
let loadedstuff = false;


function getBuffer() {
    let a = tracks[0].getFrames(buffer_size * (timeout/1000));
    let b = [];
    a.forEach(e => {
        b.push(e/int16max);
    });
    return Float32Array.from(b);
}

function ms_to_pixels(ms) {return xsnap*4/8*(bpm/60000*ms);}

let audio_buffer = null;
let source = audiocontext.createBufferSource();
source.connect(audiocontext.destination);

let interval = null;
let cursor_anim = null;
function play() {
    console.log(is_playing?"stopping":"playing");
    if (!loadedstuff) {
        const randnode = new AudioWorkletNode(audiocontext, "random-noise-processor");
        randnode.connect(audiocontext.destination);
        loadedstuff = true;
    }
    if (is_playing) {
        // sug ma nuds
        clearInterval(interval);
        clearInterval(cursor_anim);
    } else {
        interval = setInterval(() => {
            //audio_buffer = audiocontext.createBuffer(1, audiocontext.sampleRate, audiocontext.sampleRate*2);
            //audio_buffer.copyToChannel(getBuffer(), 0);
            //var test = audiocontext.createBufferSource().connect(audiocontext.destination);
            //source.buffer = audio_buffer;
            //source.start();



        }, timeout);

        cursor_anim = setInterval(() => {
            /*
            1 m = 150 beats
            60 000 ms = 150 beats
            1 ms = 0.0025 beats => 150 / 60 000

            8 beats = 80 px
            1 beat = 10 px => (xsnap*4) / 8

            10 ms = 0.025 beats => (150/60 000) * 10
            0.025 beats = 0.25 px => (xsnap*4/8) * (150/60 000*10)
            */
            cursor_pos += ms_to_pixels(10);
            cursor.style.left = cursor_pos - (cursor.clientWidth/2) + "px";
        }, 10);
    }
    is_playing = !is_playing;
}