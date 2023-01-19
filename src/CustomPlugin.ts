import { globals } from "./globals";

export abstract class CustomPlugin {

    protected name: string;
    protected audio_node: AudioNode;

    constructor(pluginpath: string) {
        // "./plugins/TestPlugin/plugin.js"
        globals.audiocontext.audioWorklet.addModule(pluginpath).then(() => {
            this.initialiseAudioNode();
            this.onAudioNodeLoaded();
            console.log("plugin loaded: " + pluginpath);
        });
    }

    abstract initialiseUI(): void;

    abstract onAudioNodeLoaded(): void;

    getName() {
        return this.name;
    }

    initialiseAudioNode(): void {
        this.audio_node = new AudioWorkletNode(globals.audiocontext, "my-custom-plugin");
        console.log(this.audio_node);
    }

    getAudioNode(): AudioNode {
        return this.audio_node;
    }

    connect(destination: AudioNode): void {
        this.audio_node.connect(destination);
    }
}