import { Connectable, globals } from "../globals";
import { Plugin } from "./Plugin";

export class Channel implements Connectable {
    private input: AudioNode;
    private plugins: Array<Plugin>;
    private panning_node: PannerNode;
    private gain_node: GainNode;
    private output: AnalyserNode;
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
        this.plugins = Array.from({ length: 10 }, () => null);

        // the effect stack for default effects like panning and gain
        // that can be natively applied in the mixer
        this.panning_node = new PannerNode(globals.audiocontext);
        this.gain_node = new GainNode(globals.audiocontext);

        // the output node is an audio analyser to display the decibel level
        // in the mixer view after all plugins have been applied
        this.output = new AnalyserNode(globals.audiocontext);

        // since there are no audio nodes in the beginning, we directly
        // connect the input to the effect stack
        this.input.connect(this.panning_node);
        this.panning_node.connect(this.gain_node);
        this.gain_node.connect(this.output);
        this.output.connect(globals.audiocontext.destination);

        this.volume = 1;
        this.panning = 1;
        this.enabled = true;

        this.name = "";
    }

    setVolume(v: number) {
        this.volume = v;
        this.gain_node.gain.value = v;
    }

    getVolume() {
        return this.volume;
    }

    getPanning() {
        return this.panning;
    }

    setPanning(p: number) {
        this.panning = p;
        this.panning_node.positionX.value = (p - 1) * 2;
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
        return this.input;
    }

    getPlugins() {
        return this.plugins;
    }

    addPlugin(plugin: Plugin, index?: number) {
        // calculate the next possible empty slot index
        // if the index parameter wasn't provided
        if (index === undefined) {
            index = this.plugins.findIndex((v) => v === null);
        }

        // no suitable index was found, because all plugin slots are full
        if (index === -1) {
            alert("all plugin slots are full");
            return;
        }

        // TODO this has to go at some point
        if (this.plugins[index] !== null) {
            alert("there is already a plugin in slot " + index);
            return;
        }
        this.plugins[index] = plugin;

        console.log(
            'adding plugin "' +
                plugin.name +
                '" to channel "' +
                this.name +
                '" at index ' +
                index,
        );
        /*if (this.plugins.length === 0) {
            this.disconnectInput();
            this.plugins.push(plugin);
            this.input.connect(plugin.getAudioNode());
            plugin.getAudioNode().connect(this.panning_node);
            return;
        }*/
        let preceeding = this.plugins.findIndex(
            (v, i) => i < index && v !== null,
        );
        let succeeding = this.plugins.findIndex(
            (v, i) => i > index && v !== null,
        );

        // // disconnect and reconnect the preceeding audio node
        if (preceeding === -1) {
            this.input.disconnect();
            this.input.connect(plugin.getAudioNode());
        } else {
            this.plugins[preceeding].getAudioNode().disconnect();
            this.plugins[preceeding]
                .getAudioNode()
                .connect(plugin.getAudioNode());
        }

        // connect the new plugin
        if (succeeding === -1) {
            plugin.getAudioNode().connect(this.panning_node);
        } else {
            plugin
                .getAudioNode()
                .connect(this.plugins[succeeding].getAudioNode());
        }
    }

    getFloatTimeDomainData(): Float32Array {
        let buffer = new Float32Array(this.output.frequencyBinCount);
        this.output.getFloatTimeDomainData(buffer);
        return buffer;
    }
}
