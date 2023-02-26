import { Connectable, globals } from "../globals";
import { Item } from "../PaletteItem";

export class Sample {

    private timestamp: number;
    private data: Float64Array;
    private duration: number;
    private buffer: AudioBuffer;
    private source: AudioBufferSourceNode;
    private connections: Array<Connectable>;

    constructor(item: Item) {
        this.timestamp = 0;
        this.data = item.getData();
        this.duration = item.getDuration();

        this.connections = [];

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
        this.connections.forEach(conn => this.source.connect(conn.getAudioNode()));
        return this.source;
    }

    stop() {
        this.source.stop();
    }

    connect(object: Connectable) {
        // samples cannot store their connections by just connecting the audio node,
        // because AudioBufferSourceNodes are one-time-use only and have to be reconnected
        // every time they are used
        this.connections.push(object);
    }

    disconnect(object: Connectable) {
        this.connections.splice(this.connections.indexOf(object), 1);
    }
}