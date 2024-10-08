import { WaveFile } from "wavefile";
import { globals } from "../globals";
import { readFileSync } from "fs"

/*
    This class is the barebone to any other class that uses audio data
    (imported from files) and provides those more high-level classes
    with data
*/

export class Source {

    private path: string;
    private filename: string;
    private wavefile: WaveFile;
    private audio_buffer: AudioBuffer;
    private channels: number;

    constructor(path: string) {
        // path to the source file
        this.path = path;
        this.filename = path.substring(path.lastIndexOf("/")+1)
        console.log(this.path, this.filename) // testing

        // WaveFile object of audio file
        this.wavefile = null;

        // audio buffer holding the files' audio data
        this.audio_buffer = null;

        // for this type of Source, always 2
        this.channels = 2;

        this.loadData();
    }

    loadData() {
        // load the audio data from the given path into this object
        this.wavefile = new WaveFile(readFileSync(this.path));

        // make sure all audio data fed into the program is the same format (float 32 bit)
        if (this.wavefile.bitDepth !== "32f") {
            this.wavefile.toBitDepth("32f");
        }

        // fill this objects audio buffer
        let tmp = Float32Array.from(this.wavefile.getSamples(true));
        this.audio_buffer = globals.audiocontext.createBuffer(2, tmp.length, globals.audiocontext.sampleRate*2);
        this.audio_buffer.copyToChannel(tmp, 0);
        this.audio_buffer.copyToChannel(tmp, 1);
    }

    getName() {
        return this.filename.substring(0, this.filename.lastIndexOf("."));
    }

    getChannels() {
        return this.channels;
    }

    getChannel(index: number) {
        return this.audio_buffer.getChannelData(index);
    }

    getAudioBuffer() {
        return this.audio_buffer;
    }

    getLength() {
        // length = # samples / framerate = samples / samples/s = s
        let sample_count = this.wavefile.getSamples(true).length
        return sample_count / globals.sample_rate;
    }
}