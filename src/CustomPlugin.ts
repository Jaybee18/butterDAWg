import { globals } from "./globals";

export abstract class CustomPlugin {

    protected name: string;
    protected audio_node: AudioNode;
    protected pluginpath: string;

    constructor(pluginpath: string) {
        // "./plugins/TestPlugin/plugin.js"
        this.pluginpath = pluginpath;
        globals.audiocontext.audioWorklet.addModule(pluginpath + "/plugin.js").then(() => {
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
        // TODO this only works because of the async loading above!! fix this!!!
        this.audio_node = new AudioWorkletNode(globals.audiocontext, this.getName());
        console.log(this.audio_node);
    }

    getAudioNode(): AudioNode {
        return this.audio_node;
    }

    connect(destination: AudioNode): void {
        this.audio_node.connect(destination);
    }

    getPluginPath(): string {
        return this.pluginpath;
    }
}