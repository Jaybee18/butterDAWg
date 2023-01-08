import { globals } from "./globals";

export abstract class CustomPlugin {

    protected name: string;
    protected audio_node: AudioNode;

    constructor() {
        globals.audiocontext.audioWorklet.addModule("./plugins/TestPlugin/plugin.js").then(() => {
            this.initialiseAudioNode();
            this.onAudioNodeLoaded();
            console.log("plugin loaded");
        });
    }

    abstract initialiseUI(): void;

    abstract onAudioNodeLoaded(): void;

    getName() {
        return this.name;
    }

    initialiseAudioNode(): void {
        this.audio_node = new AudioWorkletNode(globals.audiocontext, "my-custom-plugin");
    }

    getAudioNode(): AudioNode {
        return this.audio_node;
    }

    connect(destination: AudioNode): void {
        this.audio_node.connect(destination);
    }
}