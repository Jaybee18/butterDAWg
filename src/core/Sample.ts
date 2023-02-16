import { globals } from "../globals";
import { Item } from "../PaletteItem";

export class Sample {

    private timestamp: number;
    private data: Float64Array;
    private duration: number;
    private buffer: AudioBuffer;
    private source: AudioBufferSourceNode;

    constructor(item: Item) {
        this.timestamp = 0;
        this.data = item.getData();
        this.duration = item.getDuration();

        this.loadAudio();
    }

    getTimestamp() {
        return this.timestamp;
    }

    setTimestamp(timestamp: number) {
        this.timestamp = timestamp;
    }

    getData() {
        return this.data;
    }

    getDuration() {
        return this.duration;
    }

    async loadAudio() {
		this.buffer = globals.audiocontext.createBuffer(2, this.data.length, globals.audiocontext.sampleRate * 2);
		this.buffer.copyToChannel(Float32Array.from(this.data), 0);
		this.buffer.copyToChannel(Float32Array.from(this.data), 1);
    }

    getAudioNode() {
        this.source = new AudioBufferSourceNode(globals.audiocontext, {buffer: this.buffer});
        return this.source;
    }

    stop() {
        this.source.stop();
    }
}