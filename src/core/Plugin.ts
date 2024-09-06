import { globals } from "../globals";

export class Plugin {

    public name: string;
    private audioNode: AudioWorkletNode;

    constructor(name: string) {
        this.name = name;

        // load the given plugin
        globals.audiocontext.audioWorklet.addModule("/Users/jbes/GitHub/butterDAWg/plugins/" + name + "/plugin.js").then(() => {
            this.audioNode = new AudioWorkletNode(globals.audiocontext, name);
            console.log("plugin loaded: " + name);
        });
    }

    getAudioNode() {
        return this.audioNode;
    }
}