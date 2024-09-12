import { readFileSync } from "fs";
import { globals } from "../globals";

export class Plugin {

    public name: string;
    public pluginPath: string;
    private audioNode: AudioWorkletNode;

    constructor(pluginPath: string) {
        this.pluginPath = pluginPath;
        this.name = this.getPluginNameFromPath(pluginPath);

        this.createAudioNode();
    }
    
    getAudioNode() {
        return this.audioNode;
    }
    
    private async createAudioNode() {
        // optimistically try loading the plugin, since the processor should already
        // be loaded from the index.ts
        // If it isn't, this catch block will register it
        try {
            this.audioNode = new AudioWorkletNode(globals.audiocontext, this.name);
        } catch {
            const plugin = this.pluginPath + "/plugin.js";
            const pluginContent = readFileSync(plugin, "utf-8");
        
            const blob = new Blob([pluginContent], {type: "application/javascript; charset=utf-8"});
            const workletUrl = window.URL.createObjectURL(blob);
            globals.audiocontext.audioWorklet.addModule(workletUrl);
            
            this.audioNode = new AudioWorkletNode(globals.audiocontext, this.name);
        }
    }

    private getPluginNameFromPath(pluginPath: string) {
        const folderName = pluginPath.split('\\').pop().split('/').pop();
        const pluginName = folderName.substring(0, folderName.lastIndexOf("."));
        return pluginName;
    }
}