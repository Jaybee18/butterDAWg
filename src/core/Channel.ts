import { Connectable, globals } from "../globals";

export class Channel implements Connectable {

    private input: AudioNode;
    private plugins: Array<AudioNode>;
    private output: AudioNode;
    private volume: number;
    private panning: number;
    private enabled: boolean;
    private name: string;

    constructor() {
        // with a merger node as the audio input, any number
        // of other channels can be routed as an input to this channel
        this.input = new AnalyserNode(globals.audiocontext);

        // the plugins array holds the plugins configured for this channel
        // their order and connection is manged by the channel they're attached to
        this.plugins = [];

        // the output node is an audio analyser to display the decibel level
        // in the mixer view after all plugins have been applied
        this.output = new AnalyserNode(globals.audiocontext);

        // since there are no audio nodes in the beginning, we directly
        // connect the input to the output node
        this.input.connect(this.output);
        this.output.connect(globals.audiocontext.destination);

        this.volume = 1;
        this.panning = 1;
        this.enabled = true;

        this.name = "";
    }

    setVolume(v: number) {
        this.volume = v;
    }

    getVolume() {
        return this.volume;
    }

    getPanning() {
        return this.panning;
    }

    setPanning(p: number) {
        this.panning = p;
    }

    setActive(active: boolean) {
        this.enabled = active;
    }

    isActive() {
        return this.enabled;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    getAudioNode(): AudioNode {
        console.log("audio node of channel \"" + this.name + "\" got");
        return this.input;
    }

    getPlugins() {
        return this.plugins;
    }
}